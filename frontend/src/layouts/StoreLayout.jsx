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
    <div className="flex flex-col min-h-screen bg-[#FAF9F6] text-slate-800">
      {/* Consumer Header */}
      <Header />

      {/* Main Consumer Content Area */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Consumer Footer */}
      <Footer />
    </div>
  );
}
