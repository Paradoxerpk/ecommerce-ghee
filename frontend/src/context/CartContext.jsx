import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth, API_BASE } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  // 1. Initial Load: Load from local storage first (immediate UI responsiveness)
  useEffect(() => {
    const localCart = localStorage.getItem('saikrishnaghee_cart');
    if (localCart) {
      try {
        setCartItems(JSON.parse(localCart));
      } catch (e) {
        localStorage.removeItem('saikrishnaghee_cart');
      }
    }
  }, []);

  // 2. Fetch server cart when user logs in/authenticates
  useEffect(() => {
    const fetchServerCart = async () => {
      if (!isAuthenticated || !token) return;

      setLoading(true);
      try {
        // Sync local guest cart items to database first
        const localCart = localStorage.getItem('saikrishnaghee_cart');
        const parsedLocalCart = localCart ? JSON.parse(localCart) : [];

        if (parsedLocalCart.length > 0) {
          // Merge local cart to database
          await fetch(`${API_BASE}/cart/sync`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              cartItems: parsedLocalCart.map(item => ({
                product_id: item.product_id,
                variant_id: item.variant_id,
                quantity: item.quantity
              }))
            })
          });
          // Remove local guest cart once synced
          localStorage.removeItem('saikrishnaghee_cart');
        }

        // Fetch the consolidated database cart
        const res = await fetch(`${API_BASE}/cart`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const dbCartItems = await res.json();
          // Map backend cart item values to expected UI structure
          setCartItems(dbCartItems.map(item => ({
            id: item.id, // Database cart_item id
            product_id: item.product_id,
            variant_id: item.variant_id,
            name: item.name,
            slug: item.slug,
            images: item.images,
            weight_or_volume: item.weight_or_volume,
            price: parseFloat(item.price),
            stock: item.stock,
            sku: item.sku,
            quantity: item.quantity
          })));
        }
      } catch (err) {
        console.error('Error fetching/syncing cart:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchServerCart();
  }, [isAuthenticated, token]);

  // 3. Persist cart changes locally or sync to server
  const persistCart = async (newCart) => {
    setCartItems(newCart);

    if (isAuthenticated && token) {
      try {
        await fetch(`${API_BASE}/cart/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            cartItems: newCart.map(item => ({
              product_id: item.product_id,
              variant_id: item.variant_id,
              quantity: item.quantity
            }))
          })
        });
      } catch (err) {
        console.error('Error syncing cart change to database:', err);
      }
    } else {
      localStorage.setItem('saikrishnaghee_cart', JSON.stringify(newCart));
    }
  };

  const addToCart = (product, variant, quantity = 1) => {
    const existingIndex = cartItems.findIndex(
      item => item.variant_id === variant.id
    );

    let updatedCart = [...cartItems];

    if (existingIndex > -1) {
      const currentQty = updatedCart[existingIndex].quantity;
      const targetQty = currentQty + quantity;
      // Cap at variant maximum stock
      updatedCart[existingIndex].quantity = Math.min(targetQty, variant.stock);
    } else {
      updatedCart.push({
        product_id: product.id,
        variant_id: variant.id,
        name: product.name,
        slug: product.slug,
        images: product.images,
        weight_or_volume: variant.weight_or_volume,
        price: parseFloat(variant.price),
        stock: variant.stock,
        sku: variant.sku,
        quantity: Math.min(quantity, variant.stock)
      });
    }

    persistCart(updatedCart);
  };

  const removeFromCart = (variantId) => {
    const updatedCart = cartItems.filter(item => item.variant_id !== variantId);
    persistCart(updatedCart);
  };

  const updateQuantity = (variantId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
      return;
    }

    const updatedCart = cartItems.map(item => {
      if (item.variant_id === variantId) {
        // Cap quantity at variant stock level
        return { ...item, quantity: Math.min(quantity, item.stock) };
      }
      return item;
    });

    persistCart(updatedCart);
  };

  const clearCart = () => {
    persistCart([]);
    setCouponCode('');
    setDiscountAmount(0);
  };

  // Subtotal calculations
  const getSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  // Mock coupon verification system (FR-4.4 support)
  const applyCoupon = (code) => {
    const cleanCode = code.toUpperCase().trim();
    setCouponCode(cleanCode);

    const subtotal = getSubtotal();
    if (cleanCode === 'GHEE10') {
      setDiscountAmount(subtotal * 0.10); // 10% off
      return { success: true, message: '10% discount applied successfully!' };
    } else if (cleanCode === 'FESTIVE50') {
      setDiscountAmount(50); // Flat Rs.50 off
      return { success: true, message: 'Rs. 50 flat discount applied!' };
    } else {
      setDiscountAmount(0);
      return { success: false, message: 'Invalid coupon code' };
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setDiscountAmount(0);
  };

  // Recalculate discount if cart changes
  useEffect(() => {
    if (couponCode) {
      applyCoupon(couponCode);
    }
  }, [cartItems]);

  const getOrderTotal = () => {
    const subtotal = getSubtotal();
    return Math.max(0, subtotal - discountAmount);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        couponCode,
        discountAmount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getSubtotal,
        applyCoupon,
        removeCoupon,
        getOrderTotal,
        cartCount: cartItems.reduce((count, item) => count + item.quantity, 0)
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
