import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart, ArrowRight, User } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Wishlist() {
  const { isAuthenticated } = useAuth();
  const { wishlistItems, toggleWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (!isAuthenticated) {
    return (
      <div className="section" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid var(--border-color)', maxWidth: '500px', boxShadow: 'var(--shadow-sm)' }}>
          <User size={48} style={{ color: 'var(--primary-color)', marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Login Required</h2>
          <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            Please log in to view and manage your saved wishlist products.
          </p>
          <Link to="/login" className="btn btn-primary" style={{ padding: '0.65rem 1.75rem' }}>
            Log In Now <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = (product) => {
    if (product.variants && product.variants.length > 0) {
      const baseVariant = product.variants[0];
      if (baseVariant.stock > 0) {
        addToCart(product, baseVariant, 1);
        toggleWishlist(product);
      }
    }
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="section" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--bg-cream)', color: 'var(--primary-color)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <Heart size={40} style={{ alignSelf: 'center' }} />
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Your Wishlist is Empty</h2>
          <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>Browse our pure cow and buffalo ghee collection to save items for later purchase!</p>
          <Link to="/shop" className="btn btn-primary">
            Browse Ghee Catalog <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section" style={{ minHeight: '80vh', padding: '3rem 0' }}>
      <div className="container" style={{ maxWidth: '1200px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <h1 className="section-title" style={{ margin: 0, padding: 0 }}>My Wishlist</h1>
          <button onClick={clearWishlist} className="btn btn-text" style={{ color: '#ef4444', fontSize: '0.9rem', fontWeight: 700 }}>
            Clear Wishlist
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
          {wishlistItems.map((product) => {
            const baseVariant = product.variants && product.variants.length > 0
              ? product.variants[0]
              : { price: '0.00', weight_or_volume: '', stock: 0 };
            const isOutOfStock = baseVariant.stock <= 0;
            const mainImage = Array.isArray(product.images) && product.images.length > 0
              ? product.images[0]
              : '/images/cow_ghee_front.webp';

            return (
              <div key={product.id} className="card" style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ position: 'relative', width: '100%', height: '220px', backgroundColor: 'var(--bg-cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--border-color)' }}>
                  <button
                    className="wishlist-toggle active"
                    onClick={() => toggleWishlist(product)}
                    title="Remove from Wishlist"
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      backgroundColor: '#fff',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: '#ef4444',
                      zIndex: 2
                    }}
                  >
                    <Star size={18} fill="currentColor" />
                  </button>

                  <img
                    src={mainImage}
                    alt={product.name}
                    style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain' }}
                    onError={(e) => { e.target.src = '/images/cow_ghee_front.webp'; }}
                  />
                </div>

                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-dark)' }}>{product.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', lineHeight: '1.4', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {product.description}
                  </p>

                  <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Pack: {baseVariant.weight_or_volume}</span>
                      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-color)' }}>₹{parseFloat(baseVariant.price).toFixed(2)}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link to={`/product/${product.slug}`} className="btn btn-outline" style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem', borderRadius: '8px', textAlign: 'center' }}>
                        View Details
                      </Link>
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={isOutOfStock}
                        className="btn btn-primary"
                        style={{ flex: 1.2, padding: '0.5rem', fontSize: '0.8rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                      >
                        <ShoppingCart size={14} /> Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
