import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, LogOut, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

import { useModal } from '../context/ModalContext';

export default function Header() {
  const { isAuthenticated, logout, user, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { showAlert } = useModal();
  const navigate = useNavigate();

  const handleProtectedNav = (e, targetPath, featureName) => {
    if (!isAuthenticated) {
      e.preventDefault();
      showAlert({
        title: 'Authentication Required',
        message: `Please log in to access your ${featureName}.`,
        type: 'warning',
        confirmText: 'Sign In Now',
        onConfirm: () => {
          navigate('/login');
        }
      });
    }
  };

  return (
    <nav className="navbar">
      <div className="container nav-container">
        {/* Brand Logo */}
        <Link to="/" className="logo">
          <svg viewBox="0 0 100 100" className="logo-icon" xmlns="http://www.w3.org/2000/svg">
            <path d="M50,15 C75,15 80,45 80,60 C80,78 67,90 50,90 C33,90 20,78 20,60 C20,45 25,15 50,15 Z" fill="#F5C518" />
            <path d="M50,22 C70,22 74,48 74,60 C74,74 63,84 50,84 C37,84 26,74 26,60 C26,48 30,22 50,22 Z" fill="#0033B4" />
            <path d="M50,35 C58,35 62,42 62,50 C62,58 56,64 50,64 C44,64 38,58 38,50" fill="none" stroke="#F5C518" strokeWidth="4" strokeLinecap="round" />
            <circle cx="50" cy="50" r="5" fill="#F5C518" />
          </svg>
          <div>
            <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-color)', lineHeight: 1.1 }}>Sai KRISHNA</span>
            <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--secondary-color)', letterSpacing: '0.15em', textTransform: 'uppercase', lineHeight: 1 }}>Ghee</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <ul className="nav-links">
          <li>
            <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} end>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/shop" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              Shop Ghee
            </NavLink>
          </li>
          <li>
            <NavLink to="/about" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              Our Heritage
            </NavLink>
          </li>
          <li>
            <NavLink to="/contact" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              Contact
            </NavLink>
          </li>
        </ul>

        {/* Action Buttons */}
        <div className="nav-actions">
          {/* Quick Hotline Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 500 }} className="hide-mobile">
            <Phone size={14} className="text-secondary" style={{ color: 'var(--secondary-hover)' }} />
            <span>+91 98765 43210</span>
          </div>

          <Link
            to="/wishlist"
            onClick={(e) => handleProtectedNav(e, '/wishlist', 'wishlist')}
            className="nav-action-btn"
            title="Wishlist"
          >
            <Heart size={20} />
            {isAuthenticated && wishlistCount > 0 && <span className="badge">{wishlistCount}</span>}
          </Link>

          <Link
            to="/cart"
            onClick={(e) => handleProtectedNav(e, '/cart', 'shopping cart')}
            className="nav-action-btn"
            title="Shopping Cart"
          >
            <ShoppingCart size={20} />
            {isAuthenticated && cartCount > 0 && <span className="badge">{cartCount}</span>}
          </Link>

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/orders-history" className="nav-action-btn" title="Order History" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem', fontWeight: 600 }}>
                <User size={20} />
                <span className="hide-mobile">{user?.name?.split(' ')[0]}</span>
              </Link>
              <button onClick={() => { logout(); navigate('/'); }} className="nav-action-btn" title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
