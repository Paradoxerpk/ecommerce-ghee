import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, Calendar, Phone, MapPin, ArrowRight } from 'lucide-react';
import { API_BASE } from '../context/AuthContext';

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const res = await fetch(`${API_BASE}/orders/${id}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        }
      } catch (err) {
        console.error('Error fetching success order details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 font-semibold min-h-[60vh]">
        Loading order receipt...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-16 text-center bg-[#FAF9F6] min-h-[60vh] flex items-center justify-center">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold font-serif text-slate-800 mb-2">Order Not Found</h2>
          <p className="text-slate-500 text-sm mb-6">We could not find details for the specified order reference.</p>
          <Link to="/shop" className="btn btn-primary px-6 py-2.5 text-sm">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-[#FAF9F6] min-h-screen">
      <div className="container mx-auto px-4 max-w-3xl">
        
        {/* Success Header Message */}
        <div className="text-center mb-10">
          <div className="inline-flex text-emerald-600 mb-4">
            <CheckCircle size={64} className="fill-emerald-100" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-serif text-slate-900 mb-2">Order Confirmed!</h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            Thank you for shopping with Sai Krishna Ghee. Your order has been registered successfully and is now being prepared for dispatch.
          </p>
        </div>

        {/* Info Grid summary */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          {/* Header block */}
          <div className="bg-[#FCFAF2] p-4 sm:p-5 border-b border-slate-200 flex flex-wrap justify-between items-center gap-4 text-xs sm:text-sm">
            <div>
              <span className="text-slate-400 block text-[10px] sm:text-xs font-bold uppercase">Order Reference ID</span>
              <strong className="text-[#0033B4] font-mono">{order.id}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] sm:text-xs font-bold uppercase">Date & Time Placed</span>
              <strong className="text-slate-800">{new Date(order.created_at).toLocaleString()}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] sm:text-xs font-bold uppercase">Status</span>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                order.status === 'paid' || order.status === 'processing' ? 'bg-emerald-100 text-emerald-800' : 'bg-[#0033B4]/10 text-[#0033B4]'
              }`}>
                {order.status}
              </span>
            </div>
          </div>

          <div className="p-5 sm:p-8">
            {/* 1. Itemized Receipt list */}
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Package size={18} className="text-[#0033B4]" /> Invoice Details
            </h3>

            <div className="space-y-3 mb-6 pb-6 border-b border-slate-100">
              {order.items && order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-xs sm:text-sm">
                  <div>
                    <span className="font-bold text-slate-900">{item.name}</span>
                    <span className="text-slate-400 text-xs ml-2">({item.weight_or_volume})</span>
                  </div>
                  <div className="text-slate-500">Qty: {item.quantity}</div>
                  <div className="font-bold text-slate-900">₹{(parseFloat(item.price_per_unit) * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="flex flex-col items-end space-y-2 text-sm pb-6 mb-6 border-b border-slate-100">
              <div className="flex justify-between w-48 text-slate-600">
                <span>Subtotal:</span>
                <span className="font-bold text-slate-900">₹{parseFloat(order.total_amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-48 text-slate-600">
                <span>Shipping:</span>
                <span className="text-emerald-600 font-bold">FREE</span>
              </div>
              <div className="flex justify-between w-48 text-base sm:text-lg font-extrabold text-slate-900 pt-2 border-t border-slate-100">
                <span>Amount Paid:</span>
                <span className="text-[#0033B4]">₹{parseFloat(order.total_amount).toFixed(2)}</span>
              </div>
            </div>

            {/* 2. Customer Contact details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <MapPin size={16} className="text-[#0033B4]" /> Delivery Address
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {order.shipping_address}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <Phone size={16} className="text-[#0033B4]" /> Contact Details
                </h4>
                <p className="text-xs sm:text-sm text-slate-600">
                  Name: <strong className="text-slate-800">{order.registered_name || order.guest_name || 'Guest'}</strong>
                </p>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Phone: {order.contact_number}
                </p>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Email: {order.registered_email || order.guest_email || 'N/A'}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/shop" className="btn btn-primary px-8 py-3 text-sm font-black">
            Order More Ghee <ArrowRight size={16} />
          </Link>
          <Link to="/" className="btn btn-outline px-6 py-3 text-sm font-bold">
            Go to Homepage
          </Link>
        </div>

      </div>
    </div>
  );
}
