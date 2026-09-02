import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth, API_BASE } from './AuthContext';
import { useModal } from './ModalContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const { showAlert } = useModal();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Synchronize wishlist with authentication status & user isolation
  useEffect(() => {
    const fetchUserWishlist = async () => {
      if (!isAuthenticated || !token) {
        // Reset state completely when unauthenticated or logged out
        setWishlistItems([]);
        localStorage.removeItem('saikrishnaghee_wishlist');
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/wishlist`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const dbItems = await res.json();
          setWishlistItems(dbItems.map(item => ({
            id: item.product_id,
            name: item.name,
            slug: item.slug,
            description: item.description,
            images: item.images,
            category_name: item.category_name,
            variants: item.variants || []
          })));
        } else {
          setWishlistItems([]);
        }
      } catch (err) {
        console.error('Error fetching database wishlist:', err);
        setWishlistItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserWishlist();
  }, [isAuthenticated, token]);

  const toggleWishlist = async (product) => {
    // Require authentication
    if (!isAuthenticated) {
      showAlert({
        title: 'Authentication Required',
        message: 'Please log in to manage your wishlist items.',
        type: 'warning',
        confirmText: 'Sign In Now',
        onConfirm: () => {
          window.location.href = '/login';
        }
      });
      return;
    }

    const exists = wishlistItems.some(item => item.id === product.id);
    let updatedWishlist = [];

    if (exists) {
      updatedWishlist = wishlistItems.filter(item => item.id !== product.id);
    } else {
      updatedWishlist = [...wishlistItems, {
        id: product.id,
        name: product.name,
        slug: product.slug,
        images: product.images,
        description: product.description,
        variants: product.variants || []
      }];
    }

    setWishlistItems(updatedWishlist);

    try {
      await fetch(`${API_BASE}/wishlist/updateWishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ product_id: product.id })
      });
    } catch (err) {
      console.error('Error toggling database wishlist:', err);
    }
  };

  const isInWishlist = (productId) => {
    if (!isAuthenticated) return false;
    return wishlistItems.some(item => item.id === productId);
  };

  const clearWishlist = () => {
    setWishlistItems([]);
    localStorage.removeItem('saikrishnaghee_wishlist');
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems: isAuthenticated ? wishlistItems : [],
        loading,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
        wishlistCount: isAuthenticated ? wishlistItems.length : 0
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
