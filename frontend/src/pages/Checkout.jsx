import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth, API_BASE } from '../context/AuthContext';
import { CreditCard, Check, AlertTriangle, ShieldCheck, ShoppingCart } from 'lucide-react';

export default function Checkout() {
  const { cartItems, getSubtotal, discountAmount, getOrderTotal, clearCart } = useCart();
  const { isAuthenticated, user, token } = useAuth();
  const navigate = useNavigate();

  // Address and Contact State
  const [shippingAddress, setShippingAddress] = useState('');
  const [contactNumber, setContactNumber] = useState(user?.phone || '');
  const [deliveryPreference, setDeliveryPreference] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('upi'); // default upi

  // Guest Details if not logged in
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

  // Processing state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [createdOrder, setCreatedOrder] = useState(null);
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);

  if (cartItems.length === 0) {
    return (
      <div className="section" style={{ textAlign: 'center' }}>
        <div className="container">
          <h2>No items in cart to checkout</h2>
          <button onClick={() => navigate('/shop')} className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    // Validation
    if (!shippingAddress || !contactNumber) {
      setErrorMessage('Please fill in shipping address and contact number');
      setLoading(false);
      return;
    }

    if (!isAuthenticated) {
      if (!guestName || !guestEmail) {
        setErrorMessage('Please provide contact name and email for guest checkout');
        setLoading(false);
        return;
      }
    }

    const orderPayload = {
      items: cartItems.map(item => ({
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity
      })),
      shipping_address: shippingAddress,
      contact_number: contactNumber,
      delivery_preference: deliveryPreference,
      payment_method: paymentMethod,
      guest_name: isAuthenticated ? null : guestName,
      guest_email: isAuthenticated ? null : guestEmail,
      guest_phone: isAuthenticated ? null : (guestPhone || contactNumber)
    };

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (isAuthenticated && token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE}/orders/create`, {
        method: 'POST',
        headers,
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to place order');
      }

      const orderData = data.order;
      setCreatedOrder(orderData);

      if (paymentMethod === 'cod') {
        // Cash on Delivery proceeds directly to success page
        clearCart();
        navigate(`/order-success/${orderData.id}`);
      } else {
        // Open simulated Razorpay payment gateway
        setShowRazorpayModal(true);
      }

    } catch (err) {
      setErrorMessage(err.message || 'Error processing checkout. Please check stock levels.');
    } finally {
      setLoading(false);
    }
  };

  // Simulate payment processing (FR-5.2 / FR-5.3 integration)
  const handlePaymentSimulation = async (status) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/orders/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          order_id: createdOrder.id,
          payment_id: createdOrder.payment_id || `pay_sim_${Math.random().toString(36).substring(2, 9)}`,
          status: status // 'success' or 'failed'
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Payment simulation failed');
      }

      if (status === 'success') {
        clearCart();
        setShowRazorpayModal(false);
        navigate(`/order-success/${createdOrder.id}`);
      } else {
        setErrorMessage('UPI Payment simulation failed. Please try again or choose another payment method.');
        setShowRazorpayModal(false);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Payment verification failed');
      setShowRazorpayModal(false);
    } finally {
      setLoading(false);
    }
  };

  const subtotal = getSubtotal();
  const total = getOrderTotal();

  return (
    <div className="section" style={{ minHeight: '80vh' }}>
      <div className="container">
        <h1 className="section-title">Checkout</h1>

        {errorMessage && (
          <div style={{
            backgroundColor: 'rgba(255, 59, 48, 0.05)',
            border: '1px solid #ff3b30',
            color: '#ff3b30',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '2rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertTriangle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '3rem' }} className="checkout-layout">
          
          {/* 1. Form Section */}
          <form onSubmit={handlePlaceOrder}>
            {/* Customer Details Block */}
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '2rem', marginBottom: '2rem', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-color)', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                Contact Information
              </h3>

              {isAuthenticated ? (
                <div>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-dark)' }}>Logged In as: <strong>{user.name}</strong> ({user.email})</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>Registered members get complete order tracking history.</p>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '1rem' }}>
                    Checking out as <strong>Guest</strong>. Feel free to fill details below, or <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: 600, textDecoration: 'underline' }}>Login here</Link> first.
                  </p>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Full Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="John Doe"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Address *</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="john@example.com"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Mobile (For updates) *</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="e.g. 9876543210"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Shipping & Delivery Options Block */}
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '2rem', marginBottom: '2rem', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-color)', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                Shipping Address & Delivery
              </h3>

              <div className="form-group">
                <label className="form-label">Complete Shipping Address *</label>
                <textarea
                  rows="4"
                  className="form-control"
                  placeholder="House/Plot No, Street, Landmark, City, State, Pincode"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  required
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Contact Number (For Courier) *</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="Courier contact number"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Delivery Speed Preference</label>
                  <select
                    className="form-control"
                    value={deliveryPreference}
                    onChange={(e) => setDeliveryPreference(e.target.value)}
                  >
                    <option value="standard">Standard Delivery (3-5 Business Days) - FREE</option>
                    <option value="morning">Deliver only in morning hours</option>
                    <option value="evening">Deliver only in evening hours</option>
                    <option value="call">Call before delivery dispatch</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Payment Method Block */}
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-color)', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                Payment Selection
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1.25rem',
                  border: `2px solid ${paymentMethod === 'upi' ? 'var(--primary-color)' : 'var(--border-color)'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: paymentMethod === 'upi' ? 'rgba(0, 51, 180, 0.02)' : '#fff',
                  transition: 'all 0.2s'
                }}>
                  <input
                    type="radio"
                    name="payment"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={() => setPaymentMethod('upi')}
                  />
                  <div>
                    <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--text-dark)' }}>UPI Payment (Razorpay Sandbox)</strong>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Pay instantly via GooglePay, PhonePe, Paytm, or UPI ID.</span>
                  </div>
                </label>

                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1.25rem',
                  border: `2px solid ${paymentMethod === 'cod' ? 'var(--primary-color)' : 'var(--border-color)'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: paymentMethod === 'cod' ? 'rgba(0, 51, 180, 0.02)' : '#fff',
                  transition: 'all 0.2s'
                }}>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                  />
                  <div>
                    <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--text-dark)' }}>Cash on Delivery (COD)</strong>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Pay with cash when order is delivered at your doorstep.</span>
                  </div>
                </label>
              </div>
            </div>
          </form>

          {/* 2. Right Side: Order Summary Checklist */}
          <div>
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-sm)',
              position: 'sticky',
              top: '100px'
            }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                Review Items ({cartItems.length})
              </h3>

              {/* Items Summary list */}
              <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', paddingRight: '0.5rem' }}>
                {cartItems.map(item => (
                  <div key={item.variant_id} style={{ display: 'flex', justify: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-dark)', display: 'block', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name} <span style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}>({item.weight_or_volume})</span>
                    </span>
                    <span style={{ color: 'var(--text-light)' }}>Qty: {item.quantity}</span>
                    <span style={{ fontWeight: 600 }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Subtotal, discount, total */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.95rem' }}>
                <div style={{ display: 'flex', justify: 'space-between' }}>
                  <span style={{ color: 'var(--text-light)' }}>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div style={{ display: 'flex', justify: 'space-between', color: '#2e7d32' }}>
                    <span>Discount</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justify: 'space-between' }}>
                  <span style={{ color: 'var(--text-light)' }}>Shipping</span>
                  <span style={{ color: '#2e7d32', fontWeight: 600 }}>FREE</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '1rem',
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '1rem',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  color: 'var(--text-dark)'
                }}>
                  <span>Order Total</span>
                  <span style={{ fontSize: '1.4rem', color: 'var(--primary-color)', fontWeight: 800 }}>
                    ₹{total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Place Order CTA */}
              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="btn btn-secondary"
                style={{ width: '100%', padding: '0.85rem', borderRadius: '30px', marginTop: '2rem', fontSize: '1.05rem' }}
              >
                {loading ? 'Processing Checkout...' : paymentMethod === 'upi' ? 'Pay Now via UPI' : 'Confirm Cash Order'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', marginTop: '1.25rem', fontSize: '0.8rem', color: 'var(--text-light)', textAlign: 'center' }}>
                <ShieldCheck size={16} style={{ color: '#2e7d32' }} />
                <span>Secure SSL Checkout | 100% Secure Payments</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Simulated Razorpay UPI Payment Gateway Modal */}
      {showRazorpayModal && createdOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(18, 31, 62, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1.5rem'
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '16px',
            boxShadow: 'var(--shadow-lg)',
            width: '100%',
            maxWidth: '420px',
            overflow: 'hidden',
            border: '1px solid var(--border-color)'
          }}>
            {/* Header */}
            <div style={{
              backgroundColor: '#0a2540',
              color: '#fff',
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#00d4b2', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.05em' }}>Razorpay Secure</span>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0 }}>UPI Payment Interface</h4>
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--secondary-color)' }}>
                ₹{parseFloat(createdOrder.total_amount).toFixed(2)}
              </span>
            </div>

            {/* Content */}
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ width: '50px', height: '50px', backgroundColor: 'rgba(0, 51, 180, 0.05)', borderRadius: '50%', color: 'var(--primary-color)', display: 'inline-flex', alignItems: 'center', justifyCenter: 'center', marginBottom: '1.5rem', display: 'inline-flex', justifyContent: 'center' }}>
                <CreditCard size={28} style={{ alignSelf: 'center' }} />
              </div>
              
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', fontWeight: 700 }}>Simulate UPI Transaction</h3>
              <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                You are currently in **Sandbox Demonstration Mode**. Since keys are not active, you can test successful or failed transactions instantly.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => handlePaymentSimulation('success')}
                  className="btn btn-primary"
                  style={{
                    backgroundColor: '#2e7d32',
                    borderColor: '#2e7d32',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Check size={18} /> Simulate Successful Payment
                </button>

                <button
                  type="button"
                  onClick={() => handlePaymentSimulation('failed')}
                  className="btn btn-outline"
                  style={{
                    color: '#ff3b30',
                    borderColor: '#ff3b30',
                    padding: '0.75rem',
                    borderRadius: '8px'
                  }}
                >
                  Simulate Failed Transaction
                </button>

                <button
                  type="button"
                  onClick={() => setShowRazorpayModal(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-light)', fontSize: '0.85rem', cursor: 'pointer', marginTop: '0.5rem', textDecoration: 'underline' }}
                >
                  Cancel and go back
                </button>
              </div>
            </div>

            {/* Footer */}
            <div style={{ backgroundColor: '#faf9f6', padding: '1rem', fontSize: '0.75rem', color: 'var(--text-light)', textAlign: 'center', borderTop: '1px solid var(--border-color)' }}>
              Order Reference ID: {createdOrder.id?.substring(0, 18)}...
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
