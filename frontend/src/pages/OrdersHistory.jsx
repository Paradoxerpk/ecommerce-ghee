import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, Package, RefreshCw, ShoppingCart, XCircle } from 'lucide-react';
import { useAuth, API_BASE } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useModal } from '../context/ModalContext';

export default function OrdersHistory() {
  const { token, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { showConfirm, showAlert } = useModal();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchOrderHistory = async () => {
      try {
        const res = await fetch(`${API_BASE}/orders/history`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (err) {
        console.error('Error fetching order history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderHistory();
  }, [isAuthenticated, token, navigate]);

  const handleReorder = async (orderItems) => {
    for (const item of orderItems) {
      try {
        const mockProduct = {
          id: item.product_id || 1,
          name: item.name,
          slug: item.slug || 'sai-krishna-pure-cow-ghee',
          images: ['/images/cow_ghee_front.webp']
        };

        const mockVariant = {
          id: item.variant_id || 1,
          weight_or_volume: item.weight_or_volume,
          price: parseFloat(item.price_per_unit),
          stock: 100
        };

        addToCart(mockProduct, mockVariant, item.quantity);
      } catch (e) {
        console.error('Error during reorder item addition:', e);
      }
    }

    navigate('/cart');
  };

  const handleCancelOrder = (orderId) => {
    showConfirm({
      title: 'Cancel Order',
      message: 'Are you sure you want to cancel this order? Purchased item quantities will be returned to product stock.',
      type: 'warning',
      confirmText: 'Yes, Cancel Order',
      cancelText: 'Keep Order',
      onConfirm: async () => {
        setCancellingId(orderId);
        try {
          const res = await fetch(`${API_BASE}/orders/${orderId}/cancel`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          const data = await res.json();
          if (res.ok) {
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
            showAlert({
              title: 'Order Cancelled',
              message: 'Your order has been cancelled successfully.',
              type: 'info'
            });
          } else {
            showAlert({
              title: 'Cancellation Error',
              message: data.message || 'Failed to cancel order.',
              type: 'danger'
            });
          }
        } catch (err) {
          showAlert({
            title: 'Error',
            message: 'Error cancelling order. Please try again.',
            type: 'danger'
          });
        } finally {
          setCancellingId(null);
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 font-semibold min-h-[60vh]">
        Loading order history...
      </div>
    );
  }

  return (
    <div className="py-10 sm:py-14 bg-[#FAF9F6] min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-black font-serif text-slate-900 mb-8 text-center sm:text-left">
          My Order History
        </h1>

        {orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <div 
                key={order.id} 
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                {/* Header card info */}
                <div className="bg-[#FCFAF2] p-4 sm:p-5 border-b border-slate-200 flex flex-wrap justify-between items-center gap-4 text-xs sm:text-sm">
                  <div className="flex gap-4 sm:gap-6 flex-wrap">
                    <div>
                      <span className="text-slate-400 block text-[10px] sm:text-xs font-bold uppercase">Date Placed</span>
                      <strong className="text-slate-900">{new Date(order.created_at).toLocaleDateString()}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] sm:text-xs font-bold uppercase">Total Amount</span>
                      <strong className="text-[#0033B4]">₹{parseFloat(order.total_amount).toFixed(2)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] sm:text-xs font-bold uppercase">Payment</span>
                      <strong className="text-slate-800 uppercase">{order.payment_method} ({order.payment_status})</strong>
                    </div>
                  </div>

                  <div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                      order.status === 'paid' || order.status === 'delivered' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : order.status === 'cancelled' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Card Body: Items List + Dedicated Footer Row for Action Buttons */}
                <div className="p-4 sm:p-6">
                  <div className="mb-5">
                    <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                      <Package size={16} className="text-[#0033B4]" /> Ordered Items
                    </h4>
                    <div className="space-y-2">
                      {order.items && order.items.map((item, idx) => (
                        <div key={idx} className="text-xs sm:text-sm text-slate-800 bg-[#FAF9F5] p-3 rounded-xl border border-slate-200">
                          <strong>{item.name}</strong> — {item.weight_or_volume} x {item.quantity} (₹{parseFloat(item.price_per_unit).toFixed(2)}/unit)
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Fixed Footer Row for Buttons */}
                  <div className="flex flex-wrap justify-end items-center gap-3 pt-4 border-t border-slate-100">
                    <Link
                      to={`/order-success/${order.id}`}
                      className="btn btn-outline px-4 py-2 text-xs rounded-lg font-bold"
                    >
                      Track Order
                    </Link>

                    {['pending', 'paid', 'processing'].includes(order.status) && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={cancellingId === order.id}
                        className="px-4 py-2 text-xs rounded-lg border border-red-200 bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <XCircle size={15} /> {cancellingId === order.id ? 'Cancelling...' : 'Cancel Order'}
                      </button>
                    )}

                    <button
                      onClick={() => handleReorder(order.items)}
                      className="btn btn-secondary px-4 py-2 text-xs rounded-lg font-black flex items-center gap-1"
                    >
                      <RefreshCw size={15} /> Reorder Ghee
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 text-slate-500 shadow-sm">
            <Package size={48} className="mx-auto opacity-40 mb-3" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">No Past Orders Found</h3>
            <p className="text-sm mb-6">You haven't placed any orders with this account yet.</p>
            <Link to="/shop" className="btn btn-primary px-6 py-2.5 text-sm">
              Explore Our Shop
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
