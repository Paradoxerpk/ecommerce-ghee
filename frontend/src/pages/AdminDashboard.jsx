import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, ListOrdered, Inbox, Edit3, AlertOctagon, CheckSquare } from 'lucide-react';

export default function AdminDashboard() {
  const { token, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'inventory'
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!isAdmin) {
      navigate('/');
      return;
    }

    const fetchAdminData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Admin Orders Queue
        const ordersUrl = `${API_BASE}/orders/admin/queue?status=${statusFilter}`;
        const ordersRes = await fetch(ordersUrl, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(ordersData);
        }

        // 2. Fetch Products Inventory
        const prodRes = await fetch(`${API_BASE}/products`);
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          // Extract all variants as items
          const items = [];
          prodData.forEach(p => {
            p.variants.forEach(v => {
              items.push({
                product_id: p.id,
                product_name: p.name,
                variant_id: v.id,
                weight_or_volume: v.weight_or_volume,
                price: parseFloat(v.price),
                stock: v.stock,
                sku: v.sku,
                active: v.active
              });
            });
          });
          setInventory(items);
        }
      } catch (err) {
        console.error('Error fetching admin dashboard queue data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [isAuthenticated, isAdmin, statusFilter, token, navigate, activeTab]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`${API_BASE}/orders/admin/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        // Refresh local orders list state
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch (e) {
      console.error('Error updating order status:', e);
    } finally {
      setUpdatingId(null);
    }
  };

  const lowStockItems = inventory.filter(item => item.stock < 10);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div>Loading Admin Operations Portal...</div>
      </div>
    );
  }

  return (
    <div className="section" style={{ minHeight: '85vh', padding: '3rem 0' }}>
      <div className="container">
        
        {/* Header Title block */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
          <div style={{ color: 'var(--secondary-color)', backgroundColor: 'var(--primary-color)', padding: '0.5rem', borderRadius: '8px' }}>
            <Shield size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', margin: 0, fontFamily: 'var(--font-body)', fontWeight: 800 }}>Admin Business Control Panel</h1>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Phase - 1 Live Operational System</span>
          </div>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem', paddingBottom: '0.1rem' }}>
          <button
            onClick={() => setActiveTab('orders')}
            style={{
              padding: '0.5rem 1.5rem',
              background: 'none',
              border: 'none',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              color: activeTab === 'orders' ? 'var(--primary-color)' : 'var(--text-light)',
              borderBottom: activeTab === 'orders' ? '3px solid var(--secondary-color)' : 'none'
            }}
          >
            Live Order Queue
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            style={{
              padding: '0.5rem 1.5rem',
              background: 'none',
              border: 'none',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              color: activeTab === 'inventory' ? 'var(--primary-color)' : 'var(--text-light)',
              borderBottom: activeTab === 'inventory' ? '3px solid var(--secondary-color)' : 'none'
            }}
          >
            Catalog Inventory & Stock Alerts
          </button>
        </div>

        {/* --- ORDERS QUEUE VIEW (FR-6.1 to FR-6.3) --- */}
        {activeTab === 'orders' && (
          <div>
            {/* Filter buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-light)', fontWeight: 600 }}>Filter Status:</span>
              {['all', 'pending', 'paid', 'processing', 'dispatched', 'delivered', 'cancelled'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  style={{
                    padding: '0.35rem 0.85rem',
                    borderRadius: '20px',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    backgroundColor: statusFilter === status ? 'var(--primary-color)' : '#fff',
                    color: statusFilter === status ? '#fff' : 'var(--text-dark)',
                    transition: 'all 0.2s'
                  }}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Orders list */}
            {orders.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {orders.map(order => (
                  <div
                    key={order.id}
                    style={{
                      backgroundColor: '#fff',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color)',
                      boxShadow: 'var(--shadow-sm)',
                      padding: '1.5rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'block' }}>Order Reference</span>
                        <strong style={{ color: 'var(--primary-color)' }}>{order.id}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'block' }}>Placed Date</span>
                        <strong>{new Date(order.created_at).toLocaleString()}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'block' }}>Total Revenue</span>
                        <strong>₹{parseFloat(order.total_amount).toFixed(2)}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'block' }}>Payment Method</span>
                        <strong>{order.payment_method.toUpperCase()} ({order.payment_status})</strong>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '2rem' }} className="admin-order-details-grid">
                      <div>
                        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '0.5rem' }}>ITEMS ORDERED</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          {order.items && order.items.map((item, idx) => (
                            <div key={idx} style={{ fontSize: '0.9rem' }}>
                              • <strong>{item.name}</strong> ({item.weight_or_volume}) x {item.quantity} - ₹{(parseFloat(item.price_per_unit) * item.quantity).toFixed(2)}
                            </div>
                          ))}
                        </div>

                        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginTop: '1.25rem', marginBottom: '0.5rem' }}>SHIPPING DETAILS</h4>
                        <p style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
                          {order.shipping_address}
                        </p>
                        <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
                          Contact: <strong>{order.contact_number}</strong> | Buyer: {order.registered_name || order.guest_name || 'Guest'} ({order.registered_email || order.guest_email || 'N/A'})
                        </p>
                      </div>

                      {/* Status Manual Updates Action Card */}
                      <div style={{
                        backgroundColor: 'var(--bg-cream)',
                        borderRadius: '8px',
                        padding: '1.25rem',
                        border: '1px solid var(--border-color)',
                        height: 'fit-content'
                      }}>
                        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-dark)', marginBottom: '0.75rem', fontWeight: 700 }}>
                          MANAGE STATUS CONTROL
                        </h4>
                        
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                          {['pending', 'paid', 'processing', 'dispatched', 'delivered', 'cancelled'].map(st => (
                            <button
                              key={st}
                              onClick={() => handleUpdateStatus(order.id, st)}
                              disabled={updatingId === order.id}
                              style={{
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                border: '1px solid var(--border-color)',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                cursor: 'pointer',
                                backgroundColor: order.status === st ? 'var(--primary-color)' : '#fff',
                                color: order.status === st ? '#fff' : 'var(--text-dark)'
                              }}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid var(--border-color)', color: 'var(--text-light)' }}>
                <Inbox size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                <h3>No Orders In Queue</h3>
                <p>There are no current orders registered matching status: {statusFilter}.</p>
              </div>
            )}
          </div>
        )}

        {/* --- INVENTORY STOCK CONTROL VIEW (FR-6.4 / FR-10.2) --- */}
        {activeTab === 'inventory' && (
          <div>
            {/* Low stock alerts wrapper */}
            {lowStockItems.length > 0 && (
              <div style={{
                backgroundColor: 'rgba(255, 59, 48, 0.05)',
                border: '1px solid #ff3b30',
                borderRadius: '8px',
                padding: '1.25rem',
                marginBottom: '2rem',
                color: '#ff3b30'
              }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <AlertOctagon size={18} /> Low Stock Warnings Alert! ({lowStockItems.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.9rem' }}>
                  {lowStockItems.map(item => (
                    <div key={item.sku}>
                      • SKU: <strong>{item.sku}</strong> | {item.product_name} ({item.weight_or_volume}) is running low! Current Stock: <strong>{item.stock} left</strong>.
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inventory table */}
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)',
              overflowX: 'auto'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-cream)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '1rem' }}>Product Name</th>
                    <th style={{ padding: '1rem' }}>Weight/Volume</th>
                    <th style={{ padding: '1rem' }}>SKU</th>
                    <th style={{ padding: '1rem' }}>Price</th>
                    <th style={{ padding: '1rem' }}>Stock Quantity</th>
                    <th style={{ padding: '1rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map(item => (
                    <tr key={item.sku} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>{item.product_name}</td>
                      <td style={{ padding: '1rem' }}>{item.weight_or_volume}</td>
                      <td style={{ padding: '1rem' }}>{item.sku}</td>
                      <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--primary-color)' }}>₹{item.price.toFixed(2)}</td>
                      <td style={{ padding: '1rem', color: item.stock < 10 ? '#ff3b30' : 'inherit', fontWeight: item.stock < 10 ? 'bold' : 'normal' }}>
                        {item.stock} {item.stock < 10 && '(Low Stock!)'}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          backgroundColor: item.stock > 0 ? 'rgba(46,125,50,0.1)' : 'rgba(255,59,48,0.1)',
                          color: item.stock > 0 ? '#2e7d32' : '#ff3b30',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: 700
                        }}>
                          {item.stock > 0 ? 'Active Purchase' : 'Out of Stock'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
