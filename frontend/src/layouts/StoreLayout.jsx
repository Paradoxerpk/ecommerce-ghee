import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

export default function StoreLayout() {
  const { isAuthenticated, isAdmin } = useAuth();

  // Redirect admin users strictly to the dedicated Admin Panel
  if (isAuthenticated && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Consumer Header */}
      <Header />

      {/* Main Consumer Content Area */}
      <main style={{ flexGrow: 1 }}>
        <Outlet />
      </main>

      {/* Consumer Footer */}
      <Footer />
    </div>
  );
}
