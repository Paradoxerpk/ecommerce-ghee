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
      <div className="py-16 min-h-[60vh] flex items-center justify-center bg-[#FAF9F6]">
        <div className="text-center p-8 bg-white rounded-2xl border border-slate-200 max-w-md shadow-sm mx-4">
          <User size={48} className="text-[#0033B4] mx-auto mb-4" />
          <h2 className="text-2xl font-bold font-serif text-slate-900 mb-2">Login Required</h2>
          <p className="text-slate-500 text-sm mb-6">
            Please log in to view and manage your shopping cart items.
          </p>
          <Link to="/login" className="btn btn-primary px-6 py-2.5 text-sm">
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
      <div className="py-16 min-h-[60vh] flex items-center justify-center bg-[#FAF9F6]">
        <div className="text-center p-8">
          <div className="w-20 h-20 rounded-full bg-amber-100 text-[#0033B4] inline-flex items-center justify-center mb-6">
            <ShoppingBag size={40} />
          </div>
          <h2 className="text-3xl font-extrabold font-serif text-slate-900 mb-2">Your Cart is Empty</h2>
          <p className="text-slate-500 text-sm mb-6">Add some pure Sai Krishna Ghee products to begin your purchase journey!</p>
          <Link to="/shop" className="btn btn-primary px-8 py-3 text-sm">
            Browse Ghee Range <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 bg-[#FAF9F6] min-h-screen">
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="text-3xl font-black font-serif text-slate-900 mb-8 text-center sm:text-left">
          Shopping Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* 1. Left Column: Cart Items List */}
          <div className="lg:col-span-8">
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div 
                  key={item.variant_id} 
                  className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm"
                >
                  {/* Mock package icon badge */}
                  <div className="w-16 h-20 bg-[#0033B4] text-white rounded-xl flex flex-col items-center justify-center text-center p-1 shrink-0 font-bold">
                    <span className="text-[9px] text-[#F5C518]">Sai Krishna</span>
                    <span className="text-xs">Ghee</span>
                    <span className="text-[8px] mt-1 text-slate-200">{item.weight_or_volume}</span>
                  </div>

                  {/* Info details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-slate-900 truncate">
                      <Link to={`/product/${item.slug}`} className="hover:text-[#0033B4] transition-colors">{item.name}</Link>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Weight: <strong className="text-slate-700">{item.weight_or_volume}</strong> | SKU: {item.sku}
                    </p>
                    <p className="text-sm font-black text-[#0033B4] mt-1">
                      ₹{item.price.toFixed(2)}
                    </p>
                  </div>

                  {/* Quantity Control Buttons & Price */}
                  <div className="flex items-center justify-between w-full sm:w-auto gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="flex items-center border border-slate-200 rounded-full overflow-hidden h-9 bg-white">
                      <button
                        onClick={() => updateQuantity(item.variant_id, item.quantity - 1)}
                        className="w-8 h-full flex items-center justify-center text-slate-600 hover:text-slate-900 font-bold"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.variant_id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="w-8 h-full flex items-center justify-center text-slate-600 hover:text-slate-900 font-bold disabled:opacity-40"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <div className="text-right min-w-[70px]">
                      <span className="text-base font-black text-slate-900">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.variant_id)}
                      className="p-2 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mt-6 gap-4">
              <Link to="/shop" className="btn btn-outline px-5 py-2 text-xs sm:text-sm font-semibold">
                Continue Shopping
              </Link>
              <button 
                onClick={clearCart} 
                className="text-red-500 hover:underline text-xs sm:text-sm font-semibold cursor-pointer"
              >
                Clear Entire Cart
              </button>
            </div>
          </div>

          {/* 2. Right Column: Summary & Coupon */}
          <div className="lg:col-span-4 space-y-6">
            {/* Coupon Code Panel */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                <Tag size={16} className="text-[#0033B4]" /> Have a Promo Coupon?
              </h4>
              
              {!couponCode ? (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter GHEE10 or FESTIVE50"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="flex-1 p-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#0033B4]"
                  />
                  <button type="submit" className="btn btn-primary px-4 py-2.5 text-xs font-bold rounded-lg shrink-0">
                    Apply
                  </button>
                </form>
              ) : (
                <div className="flex justify-between items-center bg-emerald-50 border border-dashed border-emerald-500 p-3 rounded-lg text-emerald-700 font-bold text-xs">
                  <span>Code: {couponCode} Applied</span>
                  <button 
                    onClick={handleRemoveCoupon}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Feedback message */}
              {couponFeedback.message && (
                <p className={`text-xs mt-2 font-medium ${couponFeedback.success ? 'text-emerald-600' : 'text-red-500'}`}>
                  {couponFeedback.message}
                </p>
              )}

              <p className="text-[11px] text-slate-400 mt-3">
                * Try coupon <strong className="text-slate-700">GHEE10</strong> for 10% off or <strong className="text-slate-700">FESTIVE50</strong> for Rs. 50 flat off!
              </p>
            </div>

            {/* Order Total breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold font-serif text-slate-900 mb-4 pb-3 border-b border-slate-100">
                Order Summary
              </h3>

              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">₹{subtotal.toFixed(2)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Applied Discount</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Shipping Fee</span>
                  <span className="font-bold text-emerald-600">FREE</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100 mb-6">
                <span className="text-base font-bold text-slate-900">Order Total</span>
                <span className="text-2xl font-black text-[#0033B4]">
                  ₹{total.toFixed(2)}
                </span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="btn btn-secondary w-full py-3 text.base font-black shadow-lg"
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
