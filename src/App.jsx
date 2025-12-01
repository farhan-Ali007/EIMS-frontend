import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
// import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Sellers from './pages/Sellers';
import Customers from './pages/Customers';
import Billing from './pages/Billing';
import Sales from './pages/Sales';
import Expenses from './pages/Expenses';
import Income from './pages/Income';
import Returns from './pages/Returns';
import PO from './pages/PO';
import SellerDashboard from './pages/SellerDashboard';
import SellerPasswordChange from './pages/SellerPasswordChange';
import AdminManagement from './pages/AdminManagement';

const App = () => {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <ToastProvider>
          <NotificationProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              
              {/* Protected Routes - Admin / Manager area */}
              <Route
                path="/"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'superadmin', 'manager']}>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="admin-management" element={<AdminManagement />} />
                <Route path="products" element={<Products />} />
                <Route path="sellers" element={<Sellers />} />
                <Route path="customers" element={<Customers />} />
                <Route path="billing" element={<Billing />} />
                <Route path="sales" element={<Sales />} />
                <Route path="expenses" element={<Expenses />} />
                <Route path="income" element={<Income />} />
                <Route path="returns" element={<Returns />} />
                <Route path="po" element={<PO />} />
              </Route>
              
              {/* Seller Dashboard Route */}
              <Route 
                path="/seller-dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['seller']}>
                    <SellerDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Seller Password Change Route */}
              <Route 
                path="/seller-change-password" 
                element={
                  <ProtectedRoute allowedRoles={['seller']}>
                    <SellerPasswordChange />
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch all - redirect to dashboard */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </NotificationProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;