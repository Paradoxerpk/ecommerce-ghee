import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
      <div className="py-16 text-center bg-[#FAF9F6] min-h-[60vh] flex items-center justify-center">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold font-serif text-slate-800 mb-4">No items in cart to checkout</h2>
          <button onClick={() => navigate('/shop')} className="btn btn-primary px-6 py-2.5 text-sm">
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

      const res = await fetch(`${API_BASE}/orders/createOrder`, {
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
        clearCart();
        navigate(`/order-success/${orderData.id}`);
      } else {
        setShowRazorpayModal(true);
      }

    } catch (err) {
      setErrorMessage(err.message || 'Error processing checkout. Please check stock levels.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSimulation = async (status) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/orders/verifyPayment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          order_id: createdOrder.id,
          payment_id: createdOrder.payment_id || `pay_sim_${Math.random().toString(36).substring(2, 9)}`,
          status: status
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
    <div className="py-10 bg-[#FAF9F6] min-h-screen">
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="text-3xl font-black font-serif text-slate-900 mb-8 text-center sm:text-left">
          Checkout
        </h1>

        {errorMessage && (
          <div className="bg-red-50 border border-red-400 text-red-600 p-4 rounded-xl mb-6 font-bold text-sm flex items-center gap-2">
            <AlertTriangle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* 1. Form Section */}
          <form onSubmit={handlePlaceOrder} className="lg:col-span-8 space-y-6">
            {/* Customer Details Block */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <h3 className="text-lg font-bold font-serif text-[#0033B4] mb-4 pb-3 border-b border-slate-100">
                Contact Information
              </h3>

              {isAuthenticated ? (
                <div>
                  <p className="text-sm text-slate-800">Logged In as: <strong className="text-slate-900">{user.name}</strong> ({user.email})</p>
                  <p className="text-xs text-slate-400 mt-1">Registered members get complete order tracking history.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500">
                    Checking out as <strong>Guest</strong>. Feel free to fill details below, or <Link to="/login" className="text-[#0033B4] font-bold underline">Login here</Link> first.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        required
                        className="w-full p-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#0033B4]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                      <input
                        type="email"
                        placeholder="john@example.com"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        required
                        className="w-full p-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#0033B4]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Contact Mobile (For updates) *</label>
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#0033B4]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Shipping & Delivery Options Block */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
              <h3 className="text-lg font-bold font-serif text-[#0033B4] pb-3 border-b border-slate-100 m-0">
                Shipping Address & Delivery
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Complete Shipping Address *</label>
                <textarea
                  rows="3"
                  placeholder="House/Plot No, Street, Landmark, City, State, Pincode"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#0033B4]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Number (For Courier) *</label>
                  <input
                    type="tel"
                    placeholder="Courier contact number"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#0033B4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Speed Preference</label>
                  <select
                    value={deliveryPreference}
                    onChange={(e) => setDeliveryPreference(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-[#0033B4]"
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
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <h3 className="text-lg font-bold font-serif text-[#0033B4] mb-4 pb-3 border-b border-slate-100">
                Payment Selection
              </h3>

              <div className="space-y-3">
                <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'upi' ? 'border-[#0033B4] bg-[#0033B4]/5' : 'border-slate-200 bg-white'
                  }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={() => setPaymentMethod('upi')}
                    className="accent-[#0033B4]"
                  />
                  <div>
                    <strong className="block text-sm font-bold text-slate-900">UPI Payment (Razorpay Sandbox)</strong>
                    <span className="text-xs text-slate-500">Pay instantly via GooglePay, PhonePe, Paytm, or UPI ID.</span>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-[#0033B4] bg-[#0033B4]/5' : 'border-slate-200 bg-white'
                  }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="accent-[#0033B4]"
                  />
                  <div>
                    <strong className="block text-sm font-bold text-slate-900">Cash on Delivery (COD)</strong>
                    <span className="text-xs text-slate-500">Pay with cash when order is delivered at your doorstep.</span>
                  </div>
                </label>
              </div>
            </div>
          </form>

          {/* 2. Right Side: Order Summary Checklist */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-24">
              <h3 className="text-lg font-bold font-serif text-slate-900 mb-4 pb-3 border-b border-slate-100">
                Review Items ({cartItems.length})
              </h3>

              {/* Items Summary list */}
              <div className="max-h-48 overflow-y-auto space-y-3 mb-6 pr-1">
                {cartItems.map(item => (
                  <div key={item.variant_id} className="flex justify-between items-center text-xs">
                    <span className="text-slate-800 font-medium truncate max-w-[170px]">
                      {item.name} <span className="text-slate-400">({item.weight_or_volume})</span>
                    </span>
                    <span className="text-slate-400">Qty: {item.quantity}</span>
                    <span className="font-bold text-slate-900">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Subtotal, discount, total */}
              <div className="border-t border-slate-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-bold">FREE</span>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-100 font-bold text-slate-900">
                  <span>Order Total</span>
                  <span className="text-2xl font-black text-[#0033B4]">
                    ₹{total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Place Order CTA */}
              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="btn btn-secondary w-full py-3 text-base font-black shadow-lg mt-6"
              >
                {loading ? 'Processing Checkout...' : paymentMethod === 'upi' ? 'Pay Now via UPI' : 'Confirm Cash Order'}
              </button>

              <div className="flex items-center gap-1.5 justify-center mt-4 text-xs text-slate-400 text-center">
                <ShieldCheck size={16} className="text-emerald-600" />
                <span>Secure SSL Checkout | 100% Secure Payments</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Simulated Razorpay UPI Payment Gateway Modal */}
      {showRazorpayModal && createdOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-teal-400 uppercase font-extrabold tracking-widest">Razorpay Secure</span>
                <h4 className="text-base font-bold m-0">UPI Payment Interface</h4>
              </div>
              <span className="text-xl font-extrabold text-[#F5C518]">
                ₹{parseFloat(createdOrder.total_amount).toFixed(2)}
              </span>
            </div>

            {/* Content */}
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[#0033B4]/10 text-[#0033B4] inline-flex items-center justify-center mb-4">
                <CreditCard size={24} />
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-2">Simulate UPI Transaction</h3>
              <p className="text-slate-500 text-xs sm:text-sm mb-6 leading-relaxed">
                You are currently in **Sandbox Demonstration Mode**. Since real keys are not active, you can test successful or failed transactions instantly.
              </p>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => handlePaymentSimulation('success')}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <Check size={18} /> Simulate Successful Payment
                </button>

                <button
                  type="button"
                  onClick={() => handlePaymentSimulation('failed')}
                  className="w-full bg-white border border-red-500 text-red-500 hover:bg-red-50 py-3 px-4 rounded-xl font-bold text-sm transition-colors"
                >
                  Simulate Failed Transaction
                </button>

                <button
                  type="button"
                  onClick={() => setShowRazorpayModal(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 underline mt-2 block mx-auto"
                >
                  Cancel and go back
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 p-3 text-[10px] text-slate-400 text-center border-t border-slate-100">
              Order Reference ID: {createdOrder.id?.substring(0, 18)}...
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
