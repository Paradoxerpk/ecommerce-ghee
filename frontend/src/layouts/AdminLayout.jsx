import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, ExternalLink, LogOut, ShieldCheck, Menu, X 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => setMobileSidebarOpen(false);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* 1. Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 bottom-0 left-0 z-50 w-60 bg-slate-900 text-slate-400 flex flex-col flex-shrink-0 h-screen transition-transform duration-300 ease-in-out
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#F5C518] text-[#0033B4] w-8 h-8 rounded-lg flex items-center justify-center font-extrabold shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className="text-white font-extrabold text-sm leading-tight">Sai Krishna</div>
              <div className="text-[#F5C518] text-[10px] font-bold tracking-wider uppercase">Admin Panel</div>
            </div>
          </div>
          <button 
            onClick={closeSidebar}
            className="lg:hidden text-slate-400 hover:text-white p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
          <div className="text-[10px] font-extrabold text-slate-500 px-3 py-2 uppercase tracking-wider">
            Management
          </div>

          <NavLink
            to="/admin"
            end
            onClick={closeSidebar}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors font-medium ${
                isActive ? 'text-white bg-slate-800 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`
            }
          >
            <ShoppingBag size={17} className="text-[#F5C518]" />
            <span>Dashboard</span>
          </NavLink>

          <Link
            to="/shop"
            target="_blank"
            onClick={closeSidebar}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors font-medium mt-2"
          >
            <ExternalLink size={16} />
            <span>View Storefront</span>
          </Link>
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <div className="text-white text-xs font-bold truncate">{user?.name || 'Admin'}</div>
            <div className="text-slate-500 text-[11px] truncate">{user?.email || 'admin@saikrishnaghee.com'}</div>
          </div>
          <button
            onClick={handleLogout}
            className="text-red-400 hover:text-red-300 p-1.5 rounded hover:bg-slate-800 transition-colors shrink-0"
            title="Log Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* 2. Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 m-0">
              Store Management
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 text-[#0033B4] hover:text-[#002688] text-xs sm:text-sm font-bold transition-colors"
            >
              <ExternalLink size={14} /> Open Store
            </Link>
          </div>
        </header>

        {/* Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>

      </div>

    </div>
  );
}
