import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, Plus, Trash2, Edit3, Eye, EyeOff, 
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
      const ordersRes = await fetch(`${API_BASE}/orders/admin/ordersQueue?status=${statusFilter}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (ordersRes.ok) setOrders(await ordersRes.json());

      // Fetch Products & Categories
      const prodRes = await fetch(`${API_BASE}/products/admin/allProducts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (prodRes.ok) setProducts(await prodRes.json());

      const catRes = await fetch(`${API_BASE}/products/categories`);
      if (catRes.ok) setCategories(await catRes.json());

      // Fetch Reviews
      const revRes = await fetch(`${API_BASE}/reviews/admin/allReviews`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (revRes.ok) setReviews(await revRes.json());

      // Fetch Inquiries
      const inqRes = await fetch(`${API_BASE}/inquiries/admin/allInquiries`, {
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
      const res = await fetch(`${API_BASE}/orders/admin/${orderId}/updateOrderStatus`, {
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
      ? `${API_BASE}/products/admin/updateProduct/${editProductId}`
      : `${API_BASE}/products/admin/addProduct`;
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
      const res = await fetch(`${API_BASE}/products/admin/updateProduct/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ active: !currentActive })
      });

      if (res.ok) {
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, active: !currentActive } : p));
        showNotification(`Product visibility updated`);
      }
    } catch (e) {
      showNotification('Failed to update product visibility');
    }
  };

  const handleQuickUpdateStock = async (variantId, newStock, currentPrice, currentActive) => {
    try {
      const res = await fetch(`${API_BASE}/products/admin/updateVariant/${variantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          stock: parseInt(newStock, 10),
          price: currentPrice,
          active: currentActive
        })
      });

      if (res.ok) {
        showNotification('Variant stock updated');
        fetchAllData();
      }
    } catch (e) {
      showNotification('Failed to update stock');
    }
  };

  const handleDeleteProductConfirm = async (productId) => {
    try {
      const res = await fetch(`${API_BASE}/products/admin/deleteProduct/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        showNotification(data.message || 'Product deleted');
        fetchAllData();
      }
    } catch (e) {
      showNotification('Failed to delete product');
    } finally {
      setDeletingProductId(null);
    }
  };

  // --- REVIEW HANDLERS ---
  const handleUpdateReviewStatus = async (reviewId, status) => {
    try {
      const res = await fetch(`${API_BASE}/reviews/admin/${reviewId}/updateReviewStatus`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, status } : r));
        showNotification(`Review status set to ${status}`);
      }
    } catch (e) {
      showNotification('Failed to update review status');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      const res = await fetch(`${API_BASE}/reviews/admin/deleteReview/${reviewId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setReviews(prev => prev.filter(r => r.id !== reviewId));
        showNotification('Review deleted');
      }
    } catch (e) {
      showNotification('Failed to delete review');
    }
  };

  // Calculations
  const totalRevenue = orders.reduce((sum, o) => {
    if (o.status !== 'cancelled') {
      return sum + parseFloat(o.total_amount || 0);
    }
    return sum;
  }, 0);

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
    let styleClass = 'bg-slate-100 text-slate-700';

    if (s === 'paid' || s === 'delivered' || s === 'approved') {
      styleClass = 'bg-emerald-100 text-emerald-800';
    } else if (s === 'pending') {
      styleClass = 'bg-amber-100 text-amber-800';
    } else if (s === 'processing' || s === 'dispatched') {
      styleClass = 'bg-sky-100 text-sky-800';
    } else if (s === 'cancelled' || s === 'hidden') {
      styleClass = 'bg-red-100 text-red-800';
    }

    return (
      <span className={`px-2.5 py-1 rounded text-[10px] font-extrabold uppercase tracking-wider ${styleClass}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl z-50 font-bold text-xs flex items-center gap-2">
          <CheckCircle size={16} className="text-[#F5C518]" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Header & Refresh */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 m-0">Dashboard</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Overview of orders, products, and customer communications.</p>
        </div>

        <button
          onClick={fetchAllData}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 cursor-pointer font-bold text-xs text-slate-700 transition-colors"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* 1. Clear Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-bold mb-1">Total Sales Revenue</div>
          <div className="text-2xl font-black text-slate-900">₹{totalRevenue.toFixed(2)}</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-bold mb-1">Total Orders</div>
          <div className="text-2xl font-black text-slate-900">{orders.length}</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-bold mb-1">Active Products</div>
          <div className="text-2xl font-black text-slate-900">{products.length}</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-bold mb-1">Customer Inquiries</div>
          <div className="text-2xl font-black text-slate-900">{inquiries.length}</div>
        </div>

      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-200 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-3 border-b-2 font-bold text-sm transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'orders' ? 'border-[#0033B4] text-[#0033B4]' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Orders ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-3 border-b-2 font-bold text-sm transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'products' ? 'border-[#0033B4] text-[#0033B4]' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Products ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-3 border-b-2 font-bold text-sm transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'reviews' ? 'border-[#0033B4] text-[#0033B4]' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Reviews ({reviews.length})
        </button>

        <button
          onClick={() => setActiveTab('inquiries')}
          className={`px-4 py-3 border-b-2 font-bold text-sm transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'inquiries' ? 'border-[#0033B4] text-[#0033B4]' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Inquiries ({inquiries.length})
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 font-semibold text-sm">Loading content...</div>
      ) : (
        <>
          {/* TAB 1: ORDERS TABLE */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex gap-1.5 flex-wrap">
                  {['all', 'pending', 'paid', 'processing', 'dispatched', 'delivered', 'cancelled'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold capitalize transition-colors cursor-pointer border ${
                        statusFilter === st
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#0033B4]"
                  />
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Inbox size={36} className="mx-auto opacity-40 mb-2" />
                  <div className="text-sm">No orders match current filter.</div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                        <th className="p-3 font-bold">Order ID</th>
                        <th className="p-3 font-bold">Customer Details</th>
                        <th className="p-3 font-bold">Items & Shipping</th>
                        <th className="p-3 font-bold">Date</th>
                        <th className="p-3 font-bold">Total Amount</th>
                        <th className="p-3 font-bold">Status</th>
                        <th className="p-3 font-bold text-right">Update Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-bold text-slate-900">
                            #{order.id.slice(0, 8)}
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-slate-900">
                              {order.customer_name || order.registered_name || order.guest_name || 'Customer'}
                            </div>
                            <div className="text-xs text-slate-500">
                              {order.customer_email || order.registered_email || order.guest_email || 'guest@saikrishnaghee.com'}
                            </div>
                            {(order.contact_number || order.customer_phone) && (
                              <div className="text-xs text-slate-500">
                                📞 {order.contact_number || order.customer_phone}
                              </div>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="text-xs font-medium text-slate-800">
                              {Array.isArray(order.items) && order.items.length > 0 ? (
                                order.items.map((it, i) => (
                                  <div key={i} className="mb-0.5">
                                    • {it.quantity}x {it.name} ({it.weight_or_volume || 'Jar'})
                                  </div>
                                ))
                              ) : (
                                <span className="text-slate-400">Ghee Order Items</span>
                              )}
                            </div>
                            {order.shipping_address && (
                              <div className="text-[11px] text-slate-500 mt-1 italic">
                                📍 {order.shipping_address}
                              </div>
                            )}
                          </td>
                          <td className="p-3 text-slate-500 text-xs whitespace-nowrap">
                            {new Date(order.created_at).toLocaleDateString()} <br />
                            <span className="text-[10px] text-slate-400">
                              {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="font-black text-slate-900">
                              ₹{parseFloat(order.total_amount || 0).toFixed(2)}
                            </div>
                            <span className="text-[10px] text-slate-500 uppercase font-bold">
                              {order.payment_method || 'cod'}
                            </span>
                          </td>
                          <td className="p-3">
                            {renderBadge(order.status)}
                          </td>
                          <td className="p-3 text-right">
                            <select
                              value={order.status}
                              disabled={updatingOrderId === order.id}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                              className="p-1.5 rounded border border-slate-200 text-xs font-bold bg-white cursor-pointer"
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
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-bold text-slate-900 m-0">Product Inventory</h3>
                <button
                  onClick={handleOpenAddProduct}
                  className="btn btn-primary px-4 py-2 text-xs font-bold flex items-center gap-1"
                >
                  <Plus size={15} /> Add Product
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => {
                  const mainImg = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : '/images/cow_ghee_front.webp';

                  return (
                    <div key={p.id} className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex flex-col justify-between">
                      <div>
                        <div className="flex gap-3 mb-3">
                          <img
                            src={mainImg}
                            alt={p.name}
                            className="w-14 h-14 object-contain bg-white rounded-lg border border-slate-200 p-1 shrink-0"
                            onError={(e) => { e.target.src = '/images/cow_ghee_front.webp'; }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <h4 className="text-sm font-bold text-slate-900 truncate m-0">{p.name}</h4>
                              <button
                                onClick={() => handleToggleProductActive(p.id, p.active)}
                                className={`p-1 cursor-pointer ${p.active ? 'text-emerald-600' : 'text-slate-400'}`}
                                title={p.active ? 'Active' : 'Hidden'}
                              >
                                {p.active ? <Eye size={16} /> : <EyeOff size={16} />}
                              </button>
                            </div>
                            <div className="text-xs text-slate-500">{p.category_name || 'Ghee'}</div>
                          </div>
                        </div>

                        {/* Variants list */}
                        <div className="bg-white rounded-lg p-3 border border-slate-200 mb-4 space-y-2">
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Package Stock</div>
                          {p.variants && p.variants.map((v) => (
                            <div key={v.id} className="flex justify-between items-center text-xs">
                              <span className="text-slate-700 font-medium">{v.weight_or_volume} (₹{v.price})</span>
                              <input
                                type="number"
                                defaultValue={v.stock}
                                onBlur={(e) => handleQuickUpdateStock(v.id, e.target.value, v.price, v.active)}
                                className="w-14 p-1 rounded border border-slate-200 text-center text-xs font-bold"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenEditProduct(p)}
                          className="flex-1 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-semibold text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          <Edit3 size={13} /> Edit
                        </button>
                        <button
                          onClick={() => setDeletingProductId(p.id)}
                          className="flex-1 py-2 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 font-semibold text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
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
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
              <div className="flex gap-1.5 mb-6 flex-wrap">
                {['all', 'approved', 'pending', 'hidden'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setReviewStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold capitalize transition-colors cursor-pointer border ${
                      reviewStatusFilter === st
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {filteredReviews.map((rev) => (
                  <div key={rev.id} className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <strong className="text-sm text-slate-900">{rev.reviewer_name}</strong>
                        <span className="text-xs text-amber-600 font-bold ml-2">★ {rev.rating} / 5</span>
                      </div>
                      {renderBadge(rev.status)}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 mb-3 italic">"{rev.comment}"</p>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateReviewStatus(rev.id, 'approved')}
                        className="px-3 py-1.5 rounded bg-emerald-100 text-emerald-800 font-bold text-xs cursor-pointer"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleUpdateReviewStatus(rev.id, 'hidden')}
                        className="px-3 py-1.5 rounded bg-red-100 text-red-800 font-bold text-xs cursor-pointer"
                      >
                        Hide
                      </button>
                      <button
                        onClick={() => handleDeleteReview(rev.id)}
                        className="px-3 py-1.5 rounded border border-slate-200 bg-white text-slate-600 font-semibold text-xs cursor-pointer"
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
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
              {inquiries.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Mail size={36} className="mx-auto opacity-40 mb-2" />
                  <div className="text-sm">No contact messages.</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {inquiries.map((inq) => (
                    <div key={inq.id} className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <strong className="text-sm text-slate-900">{inq.name}</strong>
                          <span className="text-xs text-slate-500 ml-2">{inq.email} | {inq.phone || 'No Phone'}</span>
                        </div>
                        <span className="text-xs text-slate-400">{new Date(inq.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 p-3 bg-white rounded-lg border border-slate-200 m-0">
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
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-red-600 mb-2">
              Delete Product
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Are you sure you want to delete this product? If historical customer orders exist for this product, it will be automatically deactivated instead of deleted.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeletingProductId(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProductConfirm(deletingProductId)}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold text-xs cursor-pointer"
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
