import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth, API_BASE } from './AuthContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Initial Load: Load from local storage
  useEffect(() => {
    const localWishlist = localStorage.getItem('saikrishnaghee_wishlist');
    if (localWishlist) {
      try {
        setWishlistItems(JSON.parse(localWishlist));
      } catch (e) {
        localStorage.removeItem('saikrishnaghee_wishlist');
      }
    }
  }, []);

  // 2. Fetch server wishlist when user logs in/authenticates
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!isAuthenticated || !token) return;

      setLoading(true);
      try {
        // Fetch database wishlist items
        const res = await fetch(`${API_BASE}/products`, {
          // In real setup, we could have a specific backend route /api/wishlist,
          // for simplicity we sync and store IDs locally, or load from DB if needed.
          // Let's implement local storage syncing which is highly reliable for Phase 1.
        });
      } catch (err) {
        console.error('Error fetching database wishlist:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [isAuthenticated, token]);

  const toggleWishlist = (product) => {
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
        // Save the first variant's details if variants exist
        variants: product.variants || []
      }];
    }

    setWishlistItems(updatedWishlist);
    localStorage.setItem('saikrishnaghee_wishlist', JSON.stringify(updatedWishlist));
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.id === productId);
  };

  const clearWishlist = () => {
    setWishlistItems([]);
    localStorage.removeItem('saikrishnaghee_wishlist');
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        loading,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
        wishlistCount: wishlistItems.length
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
