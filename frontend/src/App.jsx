import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import Providers
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

// Import Layouts
import StoreLayout from './layouts/StoreLayout';
import AdminLayout from './layouts/AdminLayout';

// Import Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import OrdersHistory from './pages/OrdersHistory';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import { About, Contact, PrivacyPolicy, TermsConditions, FAQ } from './pages/LegalPages';

import { ModalProvider } from './context/ModalContext';

import ScrollToTop from './components/ScrollToTop';

// Protected Admin Guard
function ProtectedAdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center' }}>Authenticating Admin Portal...</div>;
  }
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <ModalProvider>
        <CartProvider>
          <WishlistProvider>
          <Router>
            <ScrollToTop />
            <Routes>
              {/* Consumer Storefront Routes (Wrapped in StoreLayout) */}
              <Route element={<StoreLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:slug" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-success/:id" element={<OrderSuccess />} />
                <Route path="/orders-history" element={<OrdersHistory />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsConditions />} />
                <Route path="/faq" element={<FAQ />} />
              </Route>

              {/* Dedicated Standalone Admin Portal Routes (Wrapped in AdminLayout) */}
              <Route
                element={
                  <ProtectedAdminRoute>
                    <AdminLayout />
                  </ProtectedAdminRoute>
                }
              >
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </WishlistProvider>
      </CartProvider>
    </ModalProvider>
  </AuthProvider>
  );
}
