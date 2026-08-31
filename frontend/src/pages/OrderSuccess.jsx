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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div>Loading order receipt...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="section" style={{ textAlign: 'center' }}>
        <div className="container">
          <h2>Order Not Found</h2>
          <p>We could not find details for the specified order reference.</p>
          <Link to="/shop" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: '800px' }}>
        
        {/* Success Header Message */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'inline-flex', color: '#2e7d32', marginBottom: '1rem' }}>
            <CheckCircle size={64} fill="rgba(46, 125, 50, 0.1)" />
          </div>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--text-dark)' }}>Order Confirmed!</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '1.1rem', marginTop: '0.5rem', maxWidth: '600px', margin: '0.5rem auto 0 auto' }}>
            Thank you for shopping with Sai Krishna Ghee. Your order has been registered successfully and is now being prepared for dispatch.
          </p>
        </div>

        {/* Info Grid summary */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden',
          marginBottom: '2rem'
        }}>
          {/* Header block */}
          <div style={{ backgroundColor: 'var(--bg-cream)', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1rem', fontSize: '0.9rem' }}>
            <div>
              <span style={{ color: 'var(--text-light)', display: 'block' }}>Order Reference ID (Unguessable Tracker)</span>
              <strong style={{ color: 'var(--primary-color)', fontSize: '0.95rem' }}>{order.id}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-light)', display: 'block' }}>Date & Time Placed</span>
              <strong>{new Date(order.created_at).toLocaleString()}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-light)', display: 'block' }}>Order Status</span>
              <span style={{
                backgroundColor: order.status === 'paid' || order.status === 'processing' ? 'rgba(46,125,50,0.1)' : 'rgba(0,51,180,0.1)',
                color: order.status === 'paid' || order.status === 'processing' ? '#2e7d32' : 'var(--primary-color)',
                padding: '0.2rem 0.6rem',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: 700,
                textTransform: 'uppercase'
              }}>
                {order.status}
              </span>
            </div>
          </div>

          <div style={{ padding: '1.75rem' }}>
            {/* 1. Itemized Receipt list */}
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-dark)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Package size={18} /> Invoice Details
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
              {order.items && order.items.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.95rem' }}>
                  <div>
                    <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{item.name}</span>
                    <span style={{ color: 'var(--text-light)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                      ({item.weight_or_volume})
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-light)' }}>Qty: {item.quantity}</div>
                  <div style={{ fontWeight: 700 }}>₹{(parseFloat(item.price_per_unit) * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end', fontSize: '0.95rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '4rem' }}>
                <span style={{ color: 'var(--text-light)' }}>Subtotal:</span>
                <span style={{ fontWeight: 600 }}>₹{parseFloat(order.total_amount).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', gap: '4rem' }}>
                <span style={{ color: 'var(--text-light)' }}>Shipping:</span>
                <span style={{ color: '#2e7d32', fontWeight: 600 }}>FREE</span>
              </div>
              <div style={{ display: 'flex', gap: '4rem', fontSize: '1.25rem', fontWeight: 800 }}>
                <span style={{ color: 'var(--text-dark)' }}>Amount Paid:</span>
                <span style={{ color: 'var(--primary-color)' }}>₹{parseFloat(order.total_amount).toFixed(2)}</span>
              </div>
            </div>

            {/* 2. Customer Contact details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }} className="success-delivery-row">
              <div>
                <h4 style={{ fontSize: '1rem', color: 'var(--text-dark)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={16} style={{ color: 'var(--primary-color)' }} /> Delivery Address
                </h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', lineHeight: 1.5 }}>
                  {order.shipping_address}
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '1rem', color: 'var(--text-dark)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Phone size={16} style={{ color: 'var(--primary-color)' }} /> Contact Details
                </h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>
                  Name: <strong>{order.registered_name || order.guest_name || 'Guest'}</strong>
                </p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                  Phone: {order.contact_number}
                </p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                  Email: {order.registered_email || order.guest_email || 'N/A'}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/shop" className="btn btn-primary">
            Order More Ghee <ArrowRight size={16} />
          </Link>
          <Link to="/" className="btn btn-outline">
            Go to Homepage
          </Link>
        </div>

      </div>
    </div>
  );
}
