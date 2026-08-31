import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, Package, RefreshCw, ShoppingCart } from 'lucide-react';
import { useAuth, API_BASE } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function OrdersHistory() {
  const { token, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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
    // Re-add items to cart
    for (const item of orderItems) {
      try {
        // Fetch product variant details to ensure accurate pricing/stock
        // To keep it simple and rapid for Phase 1 demo, we can search the shop/fallback inventory
        // and add item directly. Let's map properties correctly and add to cart.
        const mockProduct = {
          id: item.product_id || 1, // fallback
          name: item.name,
          slug: item.slug || 'sai-krishna-pure-cow-ghee',
          images: ['/images/cow_ghee_front.webp']
        };

        const mockVariant = {
          id: item.variant_id || 1,
          weight_or_volume: item.weight_or_volume,
          price: parseFloat(item.price_per_unit),
          stock: 100 // Assume stock is valid; CartContext caps if smaller
        };

        addToCart(mockProduct, mockVariant, item.quantity);
      } catch (e) {
        console.error('Error during reorder item addition:', e);
      }
    }

    // Redirect to cart
    navigate('/cart');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div>Loading order history...</div>
      </div>
    );
  }

  return (
    <div className="section" style={{ minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        <h1 className="section-title" style={{ marginBottom: '2.5rem' }}>My Order History</h1>

        {orders.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {orders.map((order) => (
              <div 
                key={order.id} 
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-sm)',
                  overflow: 'hidden'
                }}
              >
                {/* Header card info */}
                <div style={{
                  backgroundColor: 'var(--bg-cream)',
                  padding: '1rem 1.5rem',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  fontSize: '0.85rem'
                }}>
                  <div style={{ display: 'flex', gap: '2rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-light)', display: 'block' }}>Date Placed</span>
                      <strong>{new Date(order.created_at).toLocaleDateString()}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-light)', display: 'block' }}>Total Amount</span>
                      <strong>₹{parseFloat(order.total_amount).toFixed(2)}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-light)', display: 'block' }}>Payment Method</span>
                      <strong style={{ textTransform: 'uppercase' }}>{order.payment_method} ({order.payment_status})</strong>
                    </div>
                  </div>

                  <div>
                    <span style={{
                      backgroundColor: order.status === 'paid' || order.status === 'delivered' ? 'rgba(46,125,50,0.1)' : 'rgba(0,51,180,0.1)',
                      color: order.status === 'paid' || order.status === 'delivered' ? '#2e7d32' : 'var(--primary-color)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase'
                    }}>
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Items & Reorder action */}
                <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                  <div style={{ flexGrow: 1 }}>
                    <h4 style={{ fontSize: '0.95rem', color: 'var(--text-dark)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Package size={16} /> Ordered Items
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {order.items && order.items.map((item, idx) => (
                        <div key={idx} style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>
                          <strong>{item.name}</strong> - {item.weight_or_volume} x {item.quantity} (₹{parseFloat(item.price_per_unit).toFixed(2)}/unit)
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link to={`/order-success/${order.id}`} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', borderRadius: '6px' }}>
                      Track Order
                    </Link>
                    <button
                      onClick={() => handleReorder(order.items)}
                      className="btn btn-secondary"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', borderRadius: '6px', display: 'flex', gap: '0.35rem', alignItems: 'center' }}
                    >
                      <RefreshCw size={14} /> Reorder Ghee
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid var(--border-color)', color: 'var(--text-light)' }}>
            <Package size={48} style={{ opacity: 0.4, marginBottom: '1rem' }} />
            <h3>No Past Orders Found</h3>
            <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>You haven't placed any orders with this account yet.</p>
            <Link to="/shop" className="btn btn-primary">
              Explore Our Shop
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
