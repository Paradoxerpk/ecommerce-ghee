import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Layers, Star, Mail, Plus, Trash2, Edit3, Eye, EyeOff, 
  RefreshCw, CheckCircle, Search, Inbox
} from 'lucide-react';
import ProductFormModal from '../components/ProductFormModal';

export default function AdminDashboard() {
  const { token, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'products', 'reviews', 'inquiries'
  
  // Orders State
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Products State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedProductForEdit, setSelectedProductForEdit] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState(null);

  // Reviews & Inquiries State
  const [reviews, setReviews] = useState([]);
  const [reviewStatusFilter, setReviewStatusFilter] = useState('all');
  const [inquiries, setInquiries] = useState([]);

  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!isAdmin) {
      navigate('/');
      return;
    }

    fetchAllData();
  }, [isAuthenticated, isAdmin, token, navigate]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch Orders Queue
      const ordersRes = await fetch(`${API_BASE}/orders/admin/queue?status=${statusFilter}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (ordersRes.ok) setOrders(await ordersRes.json());

      // Fetch Products & Categories
      const prodRes = await fetch(`${API_BASE}/products/admin/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (prodRes.ok) setProducts(await prodRes.json());

      const catRes = await fetch(`${API_BASE}/products/categories`);
      if (catRes.ok) setCategories(await catRes.json());

      // Fetch Reviews
      const revRes = await fetch(`${API_BASE}/reviews/admin/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (revRes.ok) setReviews(await revRes.json());

      // Fetch Inquiries
      const inqRes = await fetch(`${API_BASE}/inquiries/admin/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (inqRes.ok) setInquiries(await inqRes.json());

    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- ORDER HANDLERS ---
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
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
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        showNotification(`Order updated to ${newStatus}`);
      }
    } catch (e) {
      showNotification('Failed to update status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // --- PRODUCT HANDLERS ---
  const handleOpenAddProduct = () => {
    setSelectedProductForEdit(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (product) => {
    setSelectedProductForEdit(product);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (payload, editProductId) => {
    const isEdit = !!editProductId;
    const url = isEdit
      ? `${API_BASE}/products/admin/${editProductId}`
      : `${API_BASE}/products/admin`;
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Error saving product');
    }

    showNotification(isEdit ? 'Product updated' : 'Product created');
    fetchAllData();
  };

  const handleToggleProductActive = async (productId, currentActive) => {
    try {
      const res = await fetch(`${API_BASE}/products/admin/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ active: !currentActive })
      });

      if (res.ok) {
        showNotification(`Product ${!currentActive ? 'activated' : 'hidden'}`);
        fetchAllData();
      }
    } catch (err) {
      showNotification('Failed to update status');
    }
  };

  const handleDeleteProductConfirm = async (productId) => {
    try {
      const res = await fetch(`${API_BASE}/products/admin/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(data.message || 'Product removed');
        fetchAllData();
      }
    } catch (err) {
      showNotification('Error deleting product');
    } finally {
      setDeletingProductId(null);
    }
  };

  const handleQuickUpdateStock = async (variantId, newStock, currentPrice, currentActive) => {
    try {
      const res = await fetch(`${API_BASE}/products/admin/variants/${variantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ stock: parseInt(newStock, 10), price: currentPrice, active: currentActive })
      });

      if (res.ok) {
        showNotification('Stock updated');
        fetchAllData();
      }
    } catch (err) {
      showNotification('Failed to update stock');
    }
  };

  // --- REVIEW HANDLERS ---
  const handleUpdateReviewStatus = async (reviewId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/reviews/admin/${reviewId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, status: newStatus } : r));
        showNotification(`Review marked as ${newStatus}`);
      }
    } catch (err) {
      showNotification('Failed to update review');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      const res = await fetch(`${API_BASE}/reviews/admin/${reviewId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setReviews(prev => prev.filter(r => r.id !== reviewId));
        showNotification('Review deleted');
      }
    } catch (err) {
      showNotification('Failed to delete review');
    }
  };

  // Calculations
  const totalRevenue = orders.reduce((sum, o) => o.status !== 'cancelled' ? sum + parseFloat(o.total_amount || 0) : sum, 0);

  const filteredOrders = orders.filter(o => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (orderSearch) {
      const q = orderSearch.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        (o.customer_name && o.customer_name.toLowerCase().includes(q)) ||
        (o.customer_email && o.customer_email.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const filteredReviews = reviewStatusFilter === 'all'
    ? reviews
    : reviews.filter(r => r.status === reviewStatusFilter);

  const renderBadge = (status) => {
    const s = (status || '').toLowerCase();
    let bg = '#F1F5F9';
    let text = '#475569';

    if (s === 'paid' || s === 'delivered' || s === 'approved') {
      bg = '#DCFCE7'; text = '#166534';
    } else if (s === 'pending') {
      bg = '#FEF3C7'; text = '#92400E';
    } else if (s === 'processing' || s === 'dispatched') {
      bg = '#E0F2FE'; text = '#075985';
    } else if (s === 'cancelled' || s === 'hidden') {
      bg = '#FEE2E2'; text = '#991B1B';
    }

    return (
      <span style={{
        backgroundColor: bg,
        color: text,
        padding: '0.2rem 0.6rem',
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontWeight: 700,
        textTransform: 'uppercase'
      }}>
        {status}
      </span>
    );
  };

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
      
      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          backgroundColor: '#0F172A',
          color: '#FFF',
          padding: '0.75rem 1.25rem',
          borderRadius: '8px',
          boxShadow: 'var(--shadow-md)',
          zIndex: 2000,
          fontWeight: 600,
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle size={16} style={{ color: 'var(--secondary-color)' }} />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Header & Refresh */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>Dashboard</h1>
          <p style={{ color: '#64748B', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>Overview of orders, products, and customer communications.</p>
        </div>

        <button
          onClick={fetchAllData}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            border: '1px solid #CBD5E1',
            backgroundColor: '#FFF',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.85rem',
            color: '#334155'
          }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* 1. Clear Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        
        <div style={{ backgroundColor: '#FFF', padding: '1.25rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, marginBottom: '0.35rem' }}>Total Sales Revenue</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A' }}>₹{totalRevenue.toFixed(2)}</div>
        </div>

        <div style={{ backgroundColor: '#FFF', padding: '1.25rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, marginBottom: '0.35rem' }}>Total Orders</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A' }}>{orders.length}</div>
        </div>

        <div style={{ backgroundColor: '#FFF', padding: '1.25rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, marginBottom: '0.35rem' }}>Active Products</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A' }}>{products.length}</div>
        </div>

        <div style={{ backgroundColor: '#FFF', padding: '1.25rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, marginBottom: '0.35rem' }}>Customer Inquiries</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A' }}>{inquiries.length}</div>
        </div>

      </div>

      {/* 2. Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #E2E8F0', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('orders')}
          style={{
            padding: '0.65rem 1.25rem',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            color: activeTab === 'orders' ? 'var(--primary-color)' : '#64748B',
            borderBottom: activeTab === 'orders' ? '2px solid var(--primary-color)' : '2px solid transparent'
          }}
        >
          Orders ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('products')}
          style={{
            padding: '0.65rem 1.25rem',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            color: activeTab === 'products' ? 'var(--primary-color)' : '#64748B',
            borderBottom: activeTab === 'products' ? '2px solid var(--primary-color)' : '2px solid transparent'
          }}
        >
          Products ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          style={{
            padding: '0.65rem 1.25rem',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            color: activeTab === 'reviews' ? 'var(--primary-color)' : '#64748B',
            borderBottom: activeTab === 'reviews' ? '2px solid var(--primary-color)' : '2px solid transparent'
          }}
        >
          Reviews ({reviews.length})
        </button>

        <button
          onClick={() => setActiveTab('inquiries')}
          style={{
            padding: '0.65rem 1.25rem',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            color: activeTab === 'inquiries' ? 'var(--primary-color)' : '#64748B',
            borderBottom: activeTab === 'inquiries' ? '2px solid var(--primary-color)' : '2px solid transparent'
          }}
        >
          Inquiries ({inquiries.length})
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>Loading content...</div>
      ) : (
        <>
          {/* TAB 1: ORDERS TABLE */}
          {activeTab === 'orders' && (
            <div style={{ backgroundColor: '#FFF', borderRadius: '10px', border: '1px solid #E2E8F0', padding: '1.25rem' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {['all', 'pending', 'paid', 'processing', 'dispatched', 'delivered', 'cancelled'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '4px',
                        border: '1px solid #CBD5E1',
                        backgroundColor: statusFilter === st ? '#0F172A' : '#FFF',
                        color: statusFilter === st ? '#FFF' : '#475569',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textTransform: 'capitalize'
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div style={{ position: 'relative', width: '250px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.65rem 0.45rem 2rem',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
                  <Inbox size={36} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
                  <div>No orders match current filter.</div>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', textAlign: 'left' }}>
                        <th style={{ padding: '0.75rem' }}>Order ID</th>
                        <th style={{ padding: '0.75rem' }}>Customer Details</th>
                        <th style={{ padding: '0.75rem' }}>Items & Shipping</th>
                        <th style={{ padding: '0.75rem' }}>Date</th>
                        <th style={{ padding: '0.75rem' }}>Total Amount</th>
                        <th style={{ padding: '0.75rem' }}>Status</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right' }}>Update Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr key={order.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                          <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700 }}>
                            #{order.id.slice(0, 8)}
                          </td>
                          <td style={{ padding: '0.85rem 0.75rem' }}>
                            <div style={{ fontWeight: 700, color: '#0F172A' }}>
                              {order.customer_name || order.registered_name || order.guest_name || 'Customer'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                              {order.customer_email || order.registered_email || order.guest_email || 'guest@saikrishnaghee.com'}
                            </div>
                            {(order.contact_number || order.customer_phone) && (
                              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                                📞 {order.contact_number || order.customer_phone}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '0.85rem 0.75rem' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>
                              {Array.isArray(order.items) && order.items.length > 0 ? (
                                order.items.map((it, i) => (
                                  <div key={i} style={{ marginBottom: '0.2rem' }}>
                                    • {it.quantity}x {it.name} ({it.weight_or_volume || 'Jar'})
                                  </div>
                                ))
                              ) : (
                                <span style={{ color: '#94A3B8' }}>Ghee Order Items</span>
                              )}
                            </div>
                            {order.shipping_address && (
                              <div style={{ fontSize: '0.725rem', color: '#64748B', marginTop: '0.35rem', fontStyle: 'italic' }}>
                                📍 {order.shipping_address}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '0.85rem 0.75rem', color: '#64748B', fontSize: '0.8rem' }}>
                            {new Date(order.created_at).toLocaleDateString()} <br />
                            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                              {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 0.75rem' }}>
                            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>
                              ₹{parseFloat(order.total_amount || 0).toFixed(2)}
                            </div>
                            <span style={{ fontSize: '0.7rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>
                              {order.payment_method || 'cod'}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 0.75rem' }}>
                            {renderBadge(order.status)}
                          </td>
                          <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right' }}>
                            <select
                              value={order.status}
                              disabled={updatingOrderId === order.id}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                              style={{
                                padding: '0.4rem 0.6rem',
                                borderRadius: '6px',
                                border: '1px solid #CBD5E1',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                backgroundColor: '#FFF',
                                cursor: 'pointer'
                              }}
                            >
                              <option value="pending">Pending</option>
                              <option value="paid">Paid</option>
                              <option value="processing">Processing</option>
                              <option value="dispatched">Dispatched</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: PRODUCTS GRID */}
          {activeTab === 'products' && (
            <div style={{ backgroundColor: '#FFF', borderRadius: '10px', border: '1px solid #E2E8F0', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Product Inventory</h3>
                <button
                  onClick={handleOpenAddProduct}
                  className="btn btn-primary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Plus size={15} /> Add Product
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                {products.map((p) => {
                  const mainImg = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : '/images/cow_ghee_front.webp';

                  return (
                    <div key={p.id} style={{ backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                          <img
                            src={mainImg}
                            alt={p.name}
                            style={{ width: '50px', height: '50px', objectFit: 'contain', backgroundColor: '#FFF', borderRadius: '6px', border: '1px solid #E2E8F0' }}
                            onError={(e) => { e.target.src = '/images/cow_ghee_front.webp'; }}
                          />
                          <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</h4>
                              <button
                                onClick={() => handleToggleProductActive(p.id, p.active)}
                                style={{ background: 'none', border: 'none', color: p.active ? '#16A34A' : '#94A3B8', cursor: 'pointer', padding: 0 }}
                                title={p.active ? 'Active' : 'Hidden'}
                              >
                                {p.active ? <Eye size={16} /> : <EyeOff size={16} />}
                              </button>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{p.category_name || 'Ghee'}</div>
                          </div>
                        </div>

                        {/* Variants list */}
                        <div style={{ backgroundColor: '#FFF', borderRadius: '6px', padding: '0.6rem', border: '1px solid #E2E8F0', marginBottom: '0.85rem' }}>
                          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Package Stock</div>
                          {p.variants && p.variants.map((v) => (
                            <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                              <span>{v.weight_or_volume} (₹{v.price})</span>
                              <input
                                type="number"
                                defaultValue={v.stock}
                                onBlur={(e) => handleQuickUpdateStock(v.id, e.target.value, v.price, v.active)}
                                style={{ width: '50px', padding: '0.15rem 0.3rem', borderRadius: '4px', border: '1px solid #CBD5E1', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700 }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleOpenEditProduct(p)}
                          style={{ flex: 1, padding: '0.4rem', borderRadius: '4px', border: '1px solid #CBD5E1', backgroundColor: '#FFF', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                        >
                          <Edit3 size={13} /> Edit
                        </button>
                        <button
                          onClick={() => setDeletingProductId(p.id)}
                          style={{ flex: 1, padding: '0.4rem', borderRadius: '4px', border: '1px solid #FCA5A5', backgroundColor: '#FEF2F2', color: '#DC2626', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: REVIEWS MODERATION */}
          {activeTab === 'reviews' && (
            <div style={{ backgroundColor: '#FFF', borderRadius: '10px', border: '1px solid #E2E8F0', padding: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1.25rem' }}>
                {['all', 'approved', 'pending', 'hidden'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setReviewStatusFilter(st)}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '4px',
                      border: '1px solid #CBD5E1',
                      backgroundColor: reviewStatusFilter === st ? '#0F172A' : '#FFF',
                      color: reviewStatusFilter === st ? '#FFF' : '#475569',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textTransform: 'capitalize'
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {filteredReviews.map((rev) => (
                  <div key={rev.id} style={{ backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <div>
                        <strong style={{ fontSize: '0.9rem' }}>{rev.reviewer_name}</strong>
                        <span style={{ fontSize: '0.8rem', color: '#D97706', fontWeight: 700, marginLeft: '0.5rem' }}>★ {rev.rating} / 5</span>
                      </div>
                      {renderBadge(rev.status)}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 0.75rem 0' }}>"{rev.comment}"</p>
                    
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleUpdateReviewStatus(rev.id, 'approved')}
                        style={{ padding: '0.3rem 0.65rem', borderRadius: '4px', border: 'none', backgroundColor: '#DCFCE7', color: '#166534', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleUpdateReviewStatus(rev.id, 'hidden')}
                        style={{ padding: '0.3rem 0.65rem', borderRadius: '4px', border: 'none', backgroundColor: '#FEE2E2', color: '#991B1B', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                      >
                        Hide
                      </button>
                      <button
                        onClick={() => handleDeleteReview(rev.id)}
                        style={{ padding: '0.3rem 0.65rem', borderRadius: '4px', border: '1px solid #CBD5E1', backgroundColor: '#FFF', color: '#64748B', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: INQUIRIES */}
          {activeTab === 'inquiries' && (
            <div style={{ backgroundColor: '#FFF', borderRadius: '10px', border: '1px solid #E2E8F0', padding: '1.25rem' }}>
              {inquiries.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
                  <Mail size={36} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
                  <div>No contact messages.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {inquiries.map((inq) => (
                    <div key={inq.id} style={{ backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <div>
                          <strong style={{ fontSize: '0.9rem' }}>{inq.name}</strong>
                          <span style={{ fontSize: '0.8rem', color: '#64748B', marginLeft: '0.5rem' }}>{inq.email} | {inq.phone || 'No Phone'}</span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{new Date(inq.created_at).toLocaleDateString()}</span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: '#334155', margin: 0, padding: '0.65rem', backgroundColor: '#FFF', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                        "{inq.message}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={handleSaveProduct}
        productToEdit={selectedProductForEdit}
        categories={categories}
      />

      {/* Delete Confirmation Modal */}
      {deletingProductId && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1500,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '1rem'
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '10px',
              padding: '1.75rem',
              maxWidth: '420px',
              width: '100%',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 800, color: '#DC2626' }}>
              Delete Product
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.4, marginBottom: '1.25rem' }}>
              Are you sure you want to delete this product? If historical customer orders exist for this product, it will be automatically deactivated instead of deleted.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                onClick={() => setDeletingProductId(null)}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#fff',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProductConfirm(deletingProductId)}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#DC2626',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
