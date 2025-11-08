import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Users,
  UserCircle,
  ShoppingCart,
  LogOut,
  Menu,
  X,
  Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import PasswordResetModal from './PasswordResetModal';
import NotificationCenter from './NotificationCenter';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const { user, logout } = useAuth();
  const { notifications, dismissNotification, clearAllNotifications } = useNotifications();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/products', icon: Package, label: 'Products' },
    { path: '/sellers', icon: Users, label: 'Sellers' },
    { path: '/customers', icon: UserCircle, label: 'Customers' },
    { path: '/sales', icon: ShoppingCart, label: 'Sales' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-slate-800 to-slate-900 text-white transition-all duration-300 flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-700">
          {isSidebarOpen ? (
            <h1 className="text-2xl font-bold text-white">Etimad Mart</h1>
          ) : (
            <div className="flex justify-center">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                  ${isActive 
                    ? 'bg-blue-600 shadow-lg text-white' 
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'}
                `}
              >
                <item.icon size={20} />
                {isSidebarOpen && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        
        {/* Sidebar Footer */}
        <div className="border-t border-slate-700">
          {isSidebarOpen ? (
            <div className="p-4 space-y-3">
              {/* User Info */}
              <div className="bg-slate-700/50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-1">Logged in as</p>
                <p className="text-sm font-semibold text-white">{user?.username || 'Admin'}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email || ''}</p>
              </div>
              
              {/* Action Buttons */}
              <button
                onClick={() => setPasswordModalOpen(true)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg transition-all"
              >
                <Settings size={18} />
                <span className="font-medium">Change Password</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-rose-400 hover:bg-rose-600/20 hover:text-rose-300 rounded-lg transition-all"
              >
                <LogOut size={18} />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              <button
                onClick={() => setPasswordModalOpen(true)}
                className="w-full flex items-center justify-center p-3 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg transition-all"
                title="Change Password"
              >
                <Settings size={22} />
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center p-3 text-rose-400 hover:bg-rose-600/20 hover:text-rose-300 rounded-lg transition-all"
                title="Logout"
              >
                <LogOut size={22} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              >
                <Menu size={24} />
              </button>
              <h2 className="text-2xl font-bold text-gray-800">
                {navItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
              </h2>
            </div>
            <NotificationCenter
              notifications={notifications}
              onDismiss={dismissNotification}
              onClearAll={clearAllNotifications}
            />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Password Reset Modal */}
      <PasswordResetModal 
        isOpen={passwordModalOpen} 
        onClose={() => setPasswordModalOpen(false)} 
      />
    </div>
  );
};

export default Layout;
