import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

export default function Wishlist() {
  const { wishlistItems, toggleWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (product) => {
    if (product.variants && product.variants.length > 0) {
      // Add first variant as default, check if stock exists
      const baseVariant = product.variants[0];
      if (baseVariant.stock > 0) {
        addToCart(product, baseVariant, 1);
        // Remove from wishlist upon adding to cart (standard user friendly behavior)
        toggleWishlist(product);
      }
    }
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="section" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--bg-cream)', color: 'var(--primary-color)', display: 'inline-flex', alignItems: 'center', justifyCenter: 'center', marginBottom: '1.5rem', display: 'inline-flex', justifyContent: 'center' }}>
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
    <div className="section">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <h1 className="section-title" style={{ margin: 0, padding: 0 }}>My Wishlist</h1>
          <button onClick={clearWishlist} className="btn btn-text" style={{ color: '#ff3b30', fontSize: '0.9rem', fontWeight: 600 }}>
            Clear Wishlist
          </button>
        </div>

        <div className="grid-3" style={{ gap: '2rem' }}>
          {wishlistItems.map((product) => {
            const baseVariant = product.variants[0] || { price: '0.00', weight_or_volume: '', stock: 0 };
            const isOutOfStock = baseVariant.stock <= 0;

            return (
              <div key={product.id} className="card">
                <div className="product-card-image-container">
                  <button
                    className="wishlist-toggle active"
                    onClick={() => toggleWishlist(product)}
                    title="Remove from Wishlist"
                  >
                    <Star size={18} fill="currentColor" />
                  </button>
                  
                  {/* Mock packet visualization */}
                  <div style={{
                    width: '80px',
                    height: '110px',
                    backgroundColor: 'var(--primary-color)',
                    color: '#fff',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.65rem',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    padding: '0.25rem',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--secondary-color)' }}>Sai Krishna</span>
                    <span style={{ fontSize: '0.55rem' }}>Ghee</span>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--secondary-color)', margin: '0.25rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '0.6rem' }}>
                      ★
                    </div>
                    <span style={{ fontSize: '0.5rem' }}>{baseVariant.weight_or_volume || 'Pure'}</span>
                  </div>
                </div>

                <div className="product-card-content">
                  <h3 className="product-card-title">{product.name}</h3>
                  <p className="product-card-desc">{product.description}</p>
                  
                  <div className="product-card-footer" style={{ borderTop: 'none', paddingTop: 0 }}>
                    <div className="product-card-price-container">
                      <span className="product-card-price-label">Pack size: {baseVariant.weight_or_volume}</span>
                      <span className="product-card-price" style={{ fontSize: '1.15rem' }}>₹{parseFloat(baseVariant.price).toFixed(2)}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                    <Link to={`/product/${product.slug}`} className="btn btn-outline" style={{ flexGrow: 1, padding: '0.5rem', fontSize: '0.8rem', borderRadius: '6px' }}>
                      View Details
                    </Link>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={isOutOfStock}
                      className="btn btn-primary"
                      style={{ flexGrow: 1.5, padding: '0.5rem', fontSize: '0.8rem', borderRadius: '6px' }}
                    >
                      <ShoppingCart size={14} /> Add to Cart
                    </button>
                  </div>
                  {isOutOfStock && (
                    <p style={{ color: '#ff3b30', fontSize: '0.75rem', textAlign: 'center', marginTop: '0.5rem', fontWeight: 600 }}>
                      Temporarily out of stock
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
