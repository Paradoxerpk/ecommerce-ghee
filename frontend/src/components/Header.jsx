import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, LogOut, Phone, Menu, X, ShieldCheck } from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    } else {
      setMobileMenuOpen(false);
    }
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm h-20 flex items-center">
      <div className="container mx-auto px-4 flex justify-between items-center w-full">
        {/* Brand Logo */}
        <Link to="/" onClick={closeMenu} className="flex items-center gap-2 text-primary font-bold">
          <svg viewBox="0 0 100 100" className="w-11 h-11 object-contain" xmlns="http://www.w3.org/2000/svg">
            <path d="M50,15 C75,15 80,45 80,60 C80,78 67,90 50,90 C33,90 20,78 20,60 C20,45 25,15 50,15 Z" fill="#F5C518" />
            <path d="M50,22 C70,22 74,48 74,60 C74,74 63,84 50,84 C37,84 26,74 26,60 C26,48 30,22 50,22 Z" fill="#0033B4" />
            <path d="M50,35 C58,35 62,42 62,50 C62,58 56,64 50,64 C44,64 38,58 38,50" fill="none" stroke="#F5C518" strokeWidth="4" strokeLinecap="round" />
            <circle cx="50" cy="50" r="5" fill="#F5C518" />
          </svg>
          <div>
            <span className="block text-xl font-extrabold text-[#0033B4] leading-tight">Sai KRISHNA</span>
            <span className="block text-xs font-bold text-[#F5C518] tracking-widest uppercase leading-none">Ghee</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <ul className="hidden md:flex items-center gap-8 list-none m-0 p-0">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `font-medium text-sm transition-colors relative hover:text-[#0033B4] ${
                  isActive ? "text-[#0033B4] font-semibold after:content-[''] after:absolute after:-bottom-1.5 after:left-0 after:w-full after:h-0.5 after:bg-[#F5C518]" : "text-slate-700"
                }`
              }
              end
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/shop"
              className={({ isActive }) =>
                `font-medium text-sm transition-colors relative hover:text-[#0033B4] ${
                  isActive ? "text-[#0033B4] font-semibold after:content-[''] after:absolute after:-bottom-1.5 after:left-0 after:w-full after:h-0.5 after:bg-[#F5C518]" : "text-slate-700"
                }`
              }
            >
              Shop Ghee
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `font-medium text-sm transition-colors relative hover:text-[#0033B4] ${
                  isActive ? "text-[#0033B4] font-semibold after:content-[''] after:absolute after:-bottom-1.5 after:left-0 after:w-full after:h-0.5 after:bg-[#F5C518]" : "text-slate-700"
                }`
              }
            >
              Our Heritage
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `font-medium text-sm transition-colors relative hover:text-[#0033B4] ${
                  isActive ? "text-[#0033B4] font-semibold after:content-[''] after:absolute after:-bottom-1.5 after:left-0 after:w-full after:h-0.5 after:bg-[#F5C518]" : "text-slate-700"
                }`
              }
            >
              Contact
            </NavLink>
          </li>
        </ul>

        {/* Action Buttons & Mobile Toggle */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Quick Hotline Info */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Phone size={14} className="text-[#D8AA0D]" />
            <span>+91 98765 43210</span>
          </div>

          <Link
            to="/wishlist"
            onClick={(e) => handleProtectedNav(e, '/wishlist', 'wishlist')}
            className="relative p-2 rounded-full text-slate-700 hover:text-[#0033B4] hover:bg-amber-50/50 transition-colors"
            title="Wishlist"
          >
            <Heart size={20} />
            {isAuthenticated && wishlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#F5C518] text-[#121F3E] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link
            to="/cart"
            onClick={(e) => handleProtectedNav(e, '/cart', 'shopping cart')}
            className="relative p-2 rounded-full text-slate-700 hover:text-[#0033B4] hover:bg-amber-50/50 transition-colors"
            title="Shopping Cart"
          >
            <ShoppingCart size={20} />
            {isAuthenticated && cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#F5C518] text-[#121F3E] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to="/orders-history"
                onClick={closeMenu}
                className="flex items-center gap-1.5 p-2 rounded-full text-slate-700 hover:text-[#0033B4] hover:bg-amber-50/50 transition-colors text-sm font-semibold"
                title="Order History"
              >
                <User size={20} />
                <span className="hidden sm:inline">{user?.name?.split(' ')[0]}</span>
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={closeMenu}
                  className="hidden sm:inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-[#0033B4] text-xs font-bold rounded-full hover:bg-amber-200 transition-colors"
                >
                  <ShieldCheck size={14} /> Admin
                </Link>
              )}
              <button
                onClick={() => { logout(); navigate('/'); closeMenu(); }}
                className="p-2 rounded-full text-slate-700 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={closeMenu}
              className="btn btn-primary px-4 py-2 text-xs sm:text-sm font-semibold"
            >
              Login
            </Link>
          )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-700 hover:text-[#0033B4] hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-20 z-40 bg-black/50 md:hidden flex flex-col" onClick={closeMenu}>
          <div
            className="bg-white border-b border-slate-200 p-6 flex flex-col gap-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-xs text-slate-500 font-medium">
              <Phone size={14} className="text-[#F5C518]" />
              <span>Customer Care: +91 98765 43210</span>
            </div>

            <NavLink
              to="/"
              onClick={closeMenu}
              className={({ isActive }) =>
                `text-base font-semibold py-2 transition-colors ${isActive ? 'text-[#0033B4]' : 'text-slate-700'}`
              }
              end
            >
              Home
            </NavLink>
            <NavLink
              to="/shop"
              onClick={closeMenu}
              className={({ isActive }) =>
                `text-base font-semibold py-2 transition-colors ${isActive ? 'text-[#0033B4]' : 'text-slate-700'}`
              }
            >
              Shop Ghee
            </NavLink>
            <NavLink
              to="/about"
              onClick={closeMenu}
              className={({ isActive }) =>
                `text-base font-semibold py-2 transition-colors ${isActive ? 'text-[#0033B4]' : 'text-slate-700'}`
              }
            >
              Our Heritage
            </NavLink>
            <NavLink
              to="/contact"
              onClick={closeMenu}
              className={({ isActive }) =>
                `text-base font-semibold py-2 transition-colors ${isActive ? 'text-[#0033B4]' : 'text-slate-700'}`
              }
            >
              Contact Us
            </NavLink>

            {isAuthenticated && isAdmin && (
              <NavLink
                to="/admin"
                onClick={closeMenu}
                className="text-base font-semibold py-2 text-[#0033B4] flex items-center gap-2"
              >
                <ShieldCheck size={18} /> Admin Portal
              </NavLink>
            )}

            {!isAuthenticated && (
              <div className="pt-3 border-t border-slate-100 flex gap-3">
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="btn btn-primary w-full text-center py-2.5 text-sm"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="btn btn-outline w-full text-center py-2.5 text-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
