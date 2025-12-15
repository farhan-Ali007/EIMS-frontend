import React, { useEffect, useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer, getProducts, getSellers } from '../services/api';
import Card, { CardBody, CardHeader, CardTitle } from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import { Plus, Edit, Trash2, UserCircle, Globe, MapPin, Download, Filter, Users, Monitor } from 'lucide-react';
import { exportToExcel, formatForExport } from '../utils/exportUtils';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const Customers = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'online', 'offline'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [formData, setFormData] = useState({
    name: '',
    type: 'online',
    price: '',
    phone: '',
    address: '',
    product: '', // optional associated product
    productId: ''
  });
  const [productSearch, setProductSearch] = useState('');
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [sellerSearch, setSellerSearch] = useState('');
  const [showSellerSearch, setShowSellerSearch] = useState(false);
  const toast = useToast();
  const queryClient = useQueryClient();
  const { role } = useAuth();

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const response = await getCustomers();
      return response.data;
    }
  });

  // Load products for optional customer-product association
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await getProducts();
      return response.data;
    }
  });

  // Quick lookup map for products by name (to show model in customer list)
  const productsByName = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      if (p?.name) {
        map[p.name.toLowerCase()] = p;
      }
    });
    return map;
  }, [products]);

  // Quick lookup map for products by id (authoritative)
  const productsById = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      if (p?._id) {
        map[String(p._id)] = p;
      }
    });
    return map;
  }, [products]);

  // Load sellers for optional customer-seller association
  const { data: sellers = [] } = useQuery({
    queryKey: ['sellers-for-customers'],
    queryFn: async () => {
      const response = await getSellers();
      return response.data;
    }
  });

  const filteredProducts = useMemo(() => {
    const query = productSearch.toLowerCase();
    if (!query) return products.slice(0, 8);
    return products.filter((p) =>
      p.name.toLowerCase().includes(query) ||
      p.model?.toLowerCase().includes(query) ||
      p.category?.toLowerCase().includes(query)
    ).slice(0, 8);
  }, [products, productSearch]);

  const filteredSellers = useMemo(() => {
    const query = sellerSearch.toLowerCase();
    if (!query) return sellers.slice(0, 8);
    return sellers.filter((s) =>
      s.name.toLowerCase().includes(query) ||
      s.phone?.toLowerCase().includes(query)
    ).slice(0, 8);
  }, [sellers, sellerSearch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Build payload and ensure optional seller is not sent as an empty string
      const payload = { ...formData };
      if (!payload.seller) {
        delete payload.seller;
      }

      if (!payload.product) {
        delete payload.product;
      }

      if (!payload.productId) {
        delete payload.productId;
      }

      if (editingCustomer) {
        await updateCustomer(editingCustomer._id, payload);
        toast.success('Customer updated successfully');
      } else {
        await createCustomer(payload);
        toast.success('Customer created successfully');
      }
      setIsModalOpen(false);
      resetForm();
      await queryClient.invalidateQueries({ queryKey: ['customers'] });
    } catch (error) {
      console.error('Error saving customer:', error);
      toast.error(error.response?.data?.message || 'Failed to save customer');
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    const productNameForForm = customer.productInfo?.name || customer.product || '';
    const productIdForForm =
      customer.productInfo?.productId ||
      (productNameForForm ? productsByName[productNameForForm.toLowerCase()]?._id : '') ||
      '';

    const liveProductForForm = productIdForForm ? productsById[String(productIdForForm)] : undefined;
    const productModelForForm = liveProductForForm?.model || customer.productInfo?.model;

    setFormData({
      name: customer.name,
      type: customer.type,
      price: customer.price ?? '',
      phone: customer.phone || '',
      address: customer.address || '',
      product: productNameForForm,
      productId: productIdForForm,
      seller: customer.seller?._id || ''
    });
    // Show name + model in the search input if we have both
    if (productNameForForm && productModelForForm) {
      setProductSearch(`${productNameForForm} (${productModelForForm})`);
    } else {
      setProductSearch(productNameForForm);
    }
    setSellerSearch(customer.seller?.name || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await deleteCustomer(id);
        await queryClient.invalidateQueries({ queryKey: ['customers'] });
        toast.success('Customer deleted successfully');
      } catch (error) {
        console.error('Error deleting customer:', error);
        toast.error(error.response?.data?.message || 'Failed to delete customer');
      }
    }
  };

  const resetForm = () => {
    // Default to current tab type, or 'online' if 'all' is selected
    const defaultType = activeTab === 'all' ? 'online' : activeTab;
    setFormData({ name: '', type: defaultType, price: '', phone: '', address: '', product: '', productId: '', seller: '' });
    setProductSearch('');
    setShowProductSearch(false);
    setSellerSearch('');
    setShowSellerSearch(false);
    setEditingCustomer(null);
  };

  // Filter and search customers based on active tab
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const matchesSearch =
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone?.includes(searchQuery) ||
        customer.address?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === 'all' || customer.type === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [customers, searchQuery, activeTab]);

  // Paginate customers
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCustomers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCustomers, currentPage]);

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  // Handle export
  const handleExport = () => {
    const formattedData = formatForExport(filteredCustomers, 'customers');
    exportToExcel(formattedData, 'customers');
  };

  // Reset to page 1 when search/tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  const onlineCount = customers.filter(c => c.type === 'online').length;
  const offlineCount = customers.filter(c => c.type === 'offline').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Customers</h1>
          <p className="text-gray-600 mt-1">Manage customer information and purchase history</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleExport}>
            <Download size={20} />
            Export
          </Button>
          <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
            <Plus size={20} />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="bg-slate-100 p-3 rounded-lg">
                <UserCircle className="text-slate-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-800">{customers.length}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-3 rounded-lg">
                <Globe className="text-emerald-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Online Customers</p>
                <p className="text-2xl font-bold text-gray-800">{onlineCount}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="bg-teal-100 p-3 rounded-lg">
                <MapPin className="text-teal-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Offline Customers</p>
                <p className="text-2xl font-bold text-gray-800">{offlineCount}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Tabs and Search */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <CardTitle className="text-xl font-bold text-gray-800">Customer Management</CardTitle>

              {/* Tab Navigation */}
              <div className="flex bg-white rounded-xl p-1 shadow-sm border">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'all'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  <Users size={16} />
                  All ({customers.length})
                </button>
                <button
                  onClick={() => setActiveTab('online')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'online'
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  <Globe size={16} />
                  Online ({onlineCount})
                </button>
                <button
                  onClick={() => setActiveTab('offline')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'offline'
                    ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  <MapPin size={16} />
                  Offline ({offlineCount})
                </button>
              </div>
            </div>


            <div className="flex items-center gap-3">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search customers..."
                className="w-80"
              />
            </div>
          </div>

          {searchQuery && (
            <div className="mt-3 text-sm text-gray-600">
              Found {filteredCustomers.length} customer(s) in {activeTab === 'all' ? 'all categories' : `${activeTab} customers`}
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Customers Table */}
      <Card className="shadow-lg border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
              {activeTab === 'all' && <Users className="text-gray-600" size={20} />}
              {activeTab === 'online' && <Globe className="text-emerald-600" size={20} />}
              {activeTab === 'offline' && <MapPin className="text-teal-600" size={20} />}
              {activeTab === 'all' ? 'All Customers' : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Customers`} ({filteredCustomers.length})
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="px-2 py-1 bg-white rounded-md shadow-sm">
                Page {currentPage} of {totalPages}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedCustomers.length > 0 ? paginatedCustomers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <UserCircle size={16} className="text-gray-400" />
                        <span className="font-medium text-gray-800">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${customer.type === 'online'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-teal-100 text-teal-700'
                        }`}>
                        {customer.type === 'online' ? '🌐 Online' : '📍 Offline'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {typeof customer.price === 'number' ? customer.price.toLocaleString('en-PK') : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {customer.productInfo?.name || customer.product || '-'}
                      {/* Prefer live product model from products list so model changes reflect immediately */}
                      {(() => {
                        const idKey = customer.productInfo?.productId
                          ? String(customer.productInfo.productId)
                          : undefined;
                        const liveModelById = idKey ? productsById[idKey]?.model : undefined;
                        const nameKey = (customer.productInfo?.name || customer.product)?.toLowerCase?.();
                        const liveModelByName = nameKey ? productsByName[nameKey]?.model : undefined;
                        const modelToShow = liveModelById || liveModelByName || customer.productInfo?.model;
                        return modelToShow ? ` (${modelToShow})` : '';
                      })()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{customer.seller?.name || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{customer.phone || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{customer.address || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button variant="secondary" size="sm" onClick={() => handleEdit(customer)}>
                          <Edit size={16} />
                        </Button>
                        {(role === 'admin' || role === 'superadmin') && (
                          <Button variant="danger" size="sm" onClick={() => handleDelete(customer._id)}>
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No customers found. {searchQuery && 'Try adjusting your search.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {filteredCustomers.length > itemsPerPage && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={filteredCustomers.length}
            />
          )}
        </CardBody>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm(); }}
        title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (optional)</label>
            <input
              type="number"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter price for this customer"
            />
          </div>

          {/* Optional associated product */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product (optional)</label>
            <div className="relative">
              <SearchBar
                value={productSearch}
                onChange={(value) => {
                  setProductSearch(value);
                  if (!value) {
                    // Clearing the search should also clear the selected product
                    setFormData((prev) => ({ ...prev, product: '', productId: '' }));
                    setShowProductSearch(false);
                  } else {
                    const parsedName = value.split(' (')[0];
                    setFormData((prev) => ({ ...prev, product: parsedName, productId: '' }));
                    setShowProductSearch(true);
                  }
                }}
                placeholder="Search products by name, model, or category..."
                onFocus={() => setShowProductSearch(true)}
              />

              {showProductSearch && filteredProducts.length > 0 && (
                <div className="absolute z-50 mt-1 w-full max-h-56 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg text-sm">
                  {filteredProducts.map((product) => (
                    <button
                      key={product._id}
                      type="button"
                      onClick={() => {
                        const label = `${product.name} (${product.model})`;
                        // Store exact product name for backend matching / stock deduction
                        setFormData((prev) => ({ ...prev, product: product.name, productId: product._id }));
                        setProductSearch(label);
                        setShowProductSearch(false);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b last:border-b-0 border-gray-100"
                    >
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-xs text-gray-600">Model: {product.model} • {product.category}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">Optional: link this customer to a primary product for reference.</p>
          </div>

          {/* Optional seller */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Seller (optional)</label>
            <div className="relative">
              <SearchBar
                value={sellerSearch}
                onChange={(value) => {
                  setSellerSearch(value);
                  setShowSellerSearch(true);
                }}
                placeholder="Search sellers by name or phone..."
                onFocus={() => setShowSellerSearch(true)}
              />

              {showSellerSearch && filteredSellers.length > 0 && (
                <div className="absolute z-50 mt-1 w-full max-h-56 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg text-sm">
                  {filteredSellers.map((seller) => (
                    <button
                      key={seller._id}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, seller: seller._id });
                        setSellerSearch(seller.name);
                        setShowSellerSearch(false);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b last:border-b-0 border-gray-100"
                    >
                      <div className="font-medium text-gray-900">{seller.name}</div>
                      {seller.phone && (
                        <div className="text-xs text-gray-600">{seller.phone}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">Optional: link the customer to a preferred seller.</p>
          </div>

          <div className="flex gap-3 mt-6">
            <Button type="submit" className="flex-1">
              {editingCustomer ? 'Update Customer' : 'Create Customer'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => { setIsModalOpen(false); resetForm(); }}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Customers;
