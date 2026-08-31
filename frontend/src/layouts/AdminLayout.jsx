import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Layers, Star, Mail, ExternalLink, LogOut, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC', color: '#0F172A' }}>
      
      {/* 1. Clean Sidebar */}
      <aside style={{
        width: '240px',
        backgroundColor: '#0F172A',
        color: '#94A3B8',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 100
      }}>
        {/* Brand */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #1E293B',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <div style={{
            backgroundColor: 'var(--secondary-color)',
            color: 'var(--primary-color)',
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800
          }}>
            <ShieldCheck size={18} />
          </div>
          <div>
            <div style={{ color: '#FFF', fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.1 }}>Sai Krishna</div>
            <div style={{ color: 'var(--secondary-color)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Admin Panel</div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#475569', padding: '0.5rem 0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Management
          </div>

          <NavLink
            to="/admin"
            end
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.65rem 0.85rem',
              borderRadius: '6px',
              color: isActive ? '#FFFFFF' : '#94A3B8',
              backgroundColor: isActive ? '#1E293B' : 'transparent',
              fontWeight: isActive ? 700 : 500,
              textDecoration: 'none',
              fontSize: '0.875rem'
            })}
          >
            <ShoppingBag size={17} style={{ color: 'var(--secondary-color)' }} />
            <span>Dashboard</span>
          </NavLink>

          <Link
            to="/shop"
            target="_blank"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.65rem 0.85rem',
              borderRadius: '6px',
              color: '#94A3B8',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
              marginTop: '0.5rem'
            }}
          >
            <ExternalLink size={16} />
            <span>View Storefront</span>
          </Link>
        </div>

        {/* User profile footer */}
        <div style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid #1E293B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ color: '#FFF', fontSize: '0.85rem', fontWeight: 700 }}>{user?.name || 'Admin'}</div>
            <div style={{ color: '#64748B', fontSize: '0.75rem' }}>{user?.email || 'admin@saikrishnaghee.com'}</div>
          </div>
          <button
            onClick={handleLogout}
            style={{ background: 'none', border: 'none', color: '#F87171', cursor: 'pointer', padding: '0.35rem' }}
            title="Log Out"
          >
            <LogOut size={16} />
          </button>
        </div>

      </aside>

      {/* 2. Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        
        {/* Top Header */}
        <header style={{
          height: '60px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          position: 'sticky',
          top: 0,
          zIndex: 90
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Store Management
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link
              to="/shop"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                color: 'var(--primary-color)',
                fontSize: '0.85rem',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              <ExternalLink size={14} /> Open Store
            </Link>
          </div>
        </header>

        {/* Workspace */}
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          <Outlet />
        </main>

      </div>

    </div>
  );
}
