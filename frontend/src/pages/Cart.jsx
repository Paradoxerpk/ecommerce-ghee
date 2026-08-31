import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, Plus, Minus, ArrowRight, Tag, X, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Cart() {
  const { isAuthenticated } = useAuth();
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    getSubtotal,
    applyCoupon,
    removeCoupon,
    couponCode,
    discountAmount,
    getOrderTotal,
    clearCart
  } = useCart();

  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState({ success: null, message: '' });

  if (!isAuthenticated) {
    return (
      <div className="section" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid var(--border-color)', maxWidth: '500px', boxShadow: 'var(--shadow-sm)' }}>
          <User size={48} style={{ color: 'var(--primary-color)', marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Login Required</h2>
          <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            Please log in to view and manage your shopping cart items.
          </p>
          <Link to="/login" className="btn btn-primary" style={{ padding: '0.65rem 1.75rem' }}>
            Log In Now <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponInput) return;

    const result = applyCoupon(couponInput);
    setCouponFeedback(result);
    if (result.success) {
      setCouponInput('');
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponFeedback({ success: null, message: '' });
  };

  const subtotal = getSubtotal();
  const total = getOrderTotal();

  if (cartItems.length === 0) {
    return (
      <div className="section" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--bg-cream)', color: 'var(--primary-color)', display: 'inline-flex', alignItems: 'center', justifyCenter: 'center', marginBottom: '1.5rem', display: 'inline-flex', justifyContent: 'center' }}>
            <ShoppingBag size={40} style={{ alignSelf: 'center' }} />
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Your Cart is Empty</h2>
          <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>Add some pure Sai Krishna Ghee products to begin your purchase journey!</p>
          <Link to="/shop" className="btn btn-primary">
            Browse Ghee Range <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="container">
        <h1 className="section-title" style={{ marginBottom: '2.5rem' }}>Shopping Cart</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '2.5rem' }} className="cart-layout">
          
          {/* 1. Left Column: Cart Items List */}
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {cartItems.map((item) => (
                <div 
                  key={item.variant_id} 
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    padding: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.25rem',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                  className="cart-item-card"
                >
                  {/* Mock small package representation */}
                  <div style={{
                    width: '60px',
                    height: '80px',
                    backgroundColor: 'var(--primary-color)',
                    color: '#fff',
                    borderRadius: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.55rem',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    padding: '0.25rem',
                    flexShrink: 0
                  }}>
                    <span style={{ fontSize: '0.6rem', color: 'var(--secondary-color)' }}>Sai Krishna</span>
                    <span>Ghee</span>
                    <span style={{ fontSize: '0.5rem', marginTop: '0.25rem' }}>{item.weight_or_volume}</span>
                  </div>

                  {/* Info details */}
                  <div style={{ flexGrow: 1 }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                      <Link to={`/product/${item.slug}`} style={{ color: 'inherit' }}>{item.name}</Link>
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '0.15rem' }}>
                      Weight: <strong>{item.weight_or_volume}</strong> | SKU: {item.sku}
                    </p>
                    <p style={{ fontSize: '0.95rem', color: 'var(--primary-color)', fontWeight: 700, marginTop: '0.5rem' }}>
                      ₹{item.price.toFixed(2)}
                    </p>
                  </div>

                  {/* Quantity Control Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '20px', overflow: 'hidden', height: '36px', backgroundColor: '#fff', flexShrink: 0 }}>
                    <button
                      onClick={() => updateQuantity(item.variant_id, item.quantity - 1)}
                      style={{ background: 'none', border: 'none', width: '30px', height: '100%', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      <Minus size={12} style={{ margin: '0 auto' }} />
                    </button>
                    <span style={{ width: '30px', textAlign: 'center', fontWeight: 600, fontSize: '0.9rem' }}>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.variant_id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      style={{ background: 'none', border: 'none', width: '30px', height: '100%', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      <Plus size={12} style={{ margin: '0 auto' }} />
                    </button>
                  </div>

                  {/* Item Total Price */}
                  <div style={{ minWidth: '80px', textAlign: 'right', fontWeight: 700, color: 'var(--text-dark)', fontSize: '1.05rem', flexShrink: 0 }}>
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => removeFromCart(item.variant_id)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#ff3b30'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-light)'}
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
              <Link to="/shop" className="btn btn-outline" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
                Continue Shopping
              </Link>
              <button 
                onClick={clearCart} 
                className="btn btn-text" 
                style={{ color: '#ff3b30', fontSize: '0.85rem', fontWeight: 600 }}
              >
                Clear Entire Cart
              </button>
            </div>
          </div>

          {/* 2. Right Column: Summary & Coupon */}
          <div>
            {/* Coupon Code Panel */}
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-sm)',
              marginBottom: '1.5rem'
            }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Tag size={16} /> Have a Promo Coupon?
              </h4>
              
              {!couponCode ? (
                <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter GHEE10 or FESTIVE50"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                  />
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', borderRadius: '8px' }}>
                    Apply
                  </button>
                </form>
              ) : (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: 'rgba(46, 125, 50, 0.05)',
                  border: '1px dashed #2e7d32',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '8px',
                  color: '#2e7d32',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}>
                  <span>Code: {couponCode} Applied</span>
                  <button 
                    onClick={handleRemoveCoupon}
                    style={{ background: 'none', border: 'none', color: '#ff3b30', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Feedback messages */}
              {couponFeedback.message && (
                <p style={{
                  fontSize: '0.8rem',
                  marginTop: '0.5rem',
                  fontWeight: 500,
                  color: couponFeedback.success ? '#2e7d32' : '#ff3b30'
                }}>
                  {couponFeedback.message}
                </p>
              )}

              <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.75rem' }}>
                * Try coupon <strong>GHEE10</strong> for 10% off or <strong>FESTIVE50</strong> for Rs. 50 flat off!
              </p>
            </div>

            {/* Order Total breakdown */}
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                Order Summary
              </h3>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                <span style={{ color: 'var(--text-light)' }}>Subtotal</span>
                <span style={{ fontWeight: 600 }}>₹{subtotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.95rem', color: '#2e7d32' }}>
                  <span>Applied Discount</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                <span style={{ color: 'var(--text-light)' }}>Shipping Fee</span>
                <span style={{ fontWeight: 600, color: '#2e7d32' }}>FREE</span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '2rem',
                borderTop: '1px solid var(--border-color)',
                paddingTop: '1rem'
              }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-dark)' }}>Order Total</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-color)' }}>
                  ₹{total.toFixed(2)}
                </span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="btn btn-secondary"
                style={{ width: '100%', padding: '0.85rem', borderRadius: '30px', fontSize: '1.05rem' }}
              >
                Proceed to Checkout <ArrowRight size={16} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
