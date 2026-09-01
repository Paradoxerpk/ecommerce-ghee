import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth, API_BASE } from './AuthContext';
import { useModal } from './ModalContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const { showAlert } = useModal();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  // Synchronize cart with authentication status & user isolation
  useEffect(() => {
    const fetchServerCart = async () => {
      if (!isAuthenticated || !token) {
        // Clear state completely when unauthenticated or logged out
        setCartItems([]);
        localStorage.removeItem('saikrishnaghee_cart');
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/cart`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const dbCartItems = await res.json();
          setCartItems(dbCartItems.map(item => ({
            id: item.id,
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
        } else {
          setCartItems([]);
        }
      } catch (err) {
        console.error('Error fetching database cart:', err);
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServerCart();
  }, [isAuthenticated, token]);

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
    }
  };

  const addToCart = (product, variant, quantity = 1) => {
    // Require authentication
    if (!isAuthenticated) {
      showAlert({
        title: 'Authentication Required',
        message: 'Please log in to add items to your shopping cart.',
        type: 'warning',
        confirmText: 'Sign In Now',
        onConfirm: () => {
          window.location.href = '/login';
        }
      });
      return;
    }

    const existingIndex = cartItems.findIndex(
      item => item.variant_id === variant.id
    );

    let updatedCart = [...cartItems];

    if (existingIndex > -1) {
      const currentQty = updatedCart[existingIndex].quantity;
      const targetQty = currentQty + quantity;
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
    if (!isAuthenticated) return;
    const updatedCart = cartItems.filter(item => item.variant_id !== variantId);
    persistCart(updatedCart);
  };

  const updateQuantity = (variantId, quantity) => {
    if (!isAuthenticated) return;
    if (quantity <= 0) {
      removeFromCart(variantId);
      return;
    }

    const updatedCart = cartItems.map(item => {
      if (item.variant_id === variantId) {
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

  const getSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const applyCoupon = (code) => {
    const cleanCode = code.toUpperCase().trim();
    setCouponCode(cleanCode);

    const subtotal = getSubtotal();
    if (cleanCode === 'GHEE10') {
      setDiscountAmount(subtotal * 0.10);
      return { success: true, message: '10% discount applied successfully!' };
    } else if (cleanCode === 'FESTIVE50') {
      setDiscountAmount(50);
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
        cartItems: isAuthenticated ? cartItems : [],
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
        cartCount: isAuthenticated ? cartItems.reduce((count, item) => count + item.quantity, 0) : 0
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
