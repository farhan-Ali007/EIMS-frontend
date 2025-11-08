import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Products
export const getProducts = () => api.get('/products');
export const getProduct = (id) => api.get(`/products/${id}`);
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const getLowStockProducts = () => api.get('/products/low-stock');

// Sellers
export const getSellers = () => api.get('/sellers');
export const getSeller = (id) => api.get(`/sellers/${id}`);
export const createSeller = (data) => api.post('/sellers', data);
export const updateSeller = (id, data) => api.put(`/sellers/${id}`, data);
export const deleteSeller = (id) => api.delete(`/sellers/${id}`);
export const getSellerLeaderboard = () => api.get('/sellers/leaderboard');

// Customers
export const getCustomers = () => api.get('/customers');
export const getCustomer = (id) => api.get(`/customers/${id}`);
export const createCustomer = (data) => api.post('/customers', data);
export const updateCustomer = (id, data) => api.put(`/customers/${id}`, data);
export const deleteCustomer = (id) => api.delete(`/customers/${id}`);

// Sales
export const getSales = () => api.get('/sales');
export const getSale = (id) => api.get(`/sales/${id}`);
export const createSale = (data) => api.post('/sales', data);
export const deleteSale = (id) => api.delete(`/sales/${id}`);

// Dashboard
export const getDashboardStats = () => api.get('/dashboard/stats');
export const getChartData = () => api.get('/dashboard/chart-data');

// PDF
export const generateInvoice = (id) => `${API_URL}/pdf/invoice/${id}`;

// Auth
export const changePassword = (data) => api.put('/auth/change-password', data);
export const forgotPassword = (email) => axios.post(`${API_URL}/auth/forgot-password`, { email });
export const resetPassword = (data) => axios.put(`${API_URL}/auth/reset-password`, data);

// Categories
export const getCategories = () => api.get('/categories');
export const createCategory = (data) => api.post('/categories', data);
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

export default api;
