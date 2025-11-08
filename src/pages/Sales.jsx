import React, { useEffect, useState, useMemo } from 'react';
import { getSales, createSale, getProducts, getSellers, getCustomers, generateInvoice } from '../services/api';
import Card, { CardBody, CardHeader, CardTitle } from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import DateRangeFilter from '../components/DateRangeFilter';
import { Plus, Download, ShoppingCart, Calendar, FileDown } from 'lucide-react';
import { exportToExcel, formatForExport } from '../utils/exportUtils';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [formData, setFormData] = useState({
    productId: '',
    sellerId: '',
    customerId: '',
    quantity: '1'
  });

  useEffect(() => {
    fetchSales();
    fetchProducts();
    fetchSellers();
    fetchCustomers();
  }, []);

  const fetchSales = async () => {
    try {
      const response = await getSales();
      setSales(response.data);
    } catch (error) {
      console.error('Error fetching sales:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await getProducts();
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchSellers = async () => {
    try {
      const response = await getSellers();
      setSellers(response.data);
    } catch (error) {
      console.error('Error fetching sellers:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await getCustomers();
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createSale(formData);
      setIsModalOpen(false);
      resetForm();
      fetchSales();
      fetchProducts(); // Refresh to update stock
    } catch (error) {
      console.error('Error creating sale:', error);
      alert(error.response?.data?.message || 'Error creating sale');
    }
  };

  const resetForm = () => {
    setFormData({ productId: '', sellerId: '', customerId: '', quantity: '1' });
  };

  const handleDownloadInvoice = (saleId) => {
    const invoiceUrl = generateInvoice(saleId);
    window.open(invoiceUrl, '_blank');
  };

  // Handle quick date filter
  const handleQuickFilter = (start, end) => {
    setStartDate(start ? start.toISOString().split('T')[0] : '');
    setEndDate(end ? end.toISOString().split('T')[0] : '');
  };

  // Filter and search sales
  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      // Search filter
      const matchesSearch = 
        sale.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.sellerName?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Date filter
      let matchesDate = true;
      if (startDate || endDate) {
        const saleDate = new Date(sale.createdAt);
        if (startDate) {
          matchesDate = matchesDate && saleDate >= new Date(startDate);
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          matchesDate = matchesDate && saleDate <= end;
        }
      }
      
      return matchesSearch && matchesDate;
    });
  }, [sales, searchQuery, startDate, endDate]);

  // Paginate sales
  const paginatedSales = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredSales.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredSales, currentPage]);

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);

  // Calculate totals from filtered sales
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalCommission = filteredSales.reduce((sum, sale) => sum + sale.commission, 0);

  // Handle export
  const handleExport = () => {
    const formattedData = formatForExport(filteredSales, 'sales');
    exportToExcel(formattedData, 'sales');
  };

  // Reset to page 1 when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, startDate, endDate]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Sales</h1>
          <p className="text-gray-600 mt-1">Record sales and generate invoices</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleExport}>
            <FileDown size={20} />
            Export
          </Button>
          <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
            <Plus size={20} />
            New Sale
          </Button>
        </div>
      </div>

      {/* Search and Date Filter */}
      <Card>
        <CardBody>
          <div className="space-y-4">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by product, customer, or seller..."
            />
            <DateRangeFilter
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              onQuickFilter={handleQuickFilter}
            />
          </div>
          {(searchQuery || startDate || endDate) && (
            <div className="mt-3 text-sm text-gray-600">
              Found {filteredSales.length} sale(s)
            </div>
          )}
        </CardBody>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="bg-slate-100 p-3 rounded-lg">
                <ShoppingCart className="text-slate-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-gray-800">{filteredSales.length}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-3 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-emerald-600">Rs. {totalRevenue.toLocaleString('en-PK', {minimumFractionDigits: 2})}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <span className="text-2xl">💵</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Commission</p>
                <p className="text-2xl font-bold text-blue-600">Rs. {totalCommission.toLocaleString('en-PK', {minimumFractionDigits: 2})}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {searchQuery || startDate || endDate 
              ? `Filtered Sales (${filteredSales.length})` 
              : `All Sales (${sales.length})`}
          </CardTitle>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedSales.length > 0 ? paginatedSales.map((sale) => (
                  <tr key={sale._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {new Date(sale.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">{sale.productName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{sale.customerName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{sale.sellerName}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{sale.quantity}</td>
                    <td className="px-6 py-4 font-medium text-emerald-600">Rs. {sale.total.toLocaleString('en-PK', {minimumFractionDigits: 2})}</td>
                    <td className="px-6 py-4 text-sm text-teal-600">Rs. {sale.commission.toLocaleString('en-PK', {minimumFractionDigits: 2})}</td>
                    <td className="px-6 py-4">
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => handleDownloadInvoice(sale._id)}
                      >
                        <Download size={16} />
                        PDF
                      </Button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                      No sales found. {searchQuery && 'Try adjusting your search.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {filteredSales.length > itemsPerPage && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={filteredSales.length}
            />
          )}
        </CardBody>
      </Card>

      {/* New Sale Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm(); }}
        title="Record New Sale"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
            <select
              required
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name} - Rs. {product.price.toLocaleString('en-PK')} (Stock: {product.stock})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Seller</label>
            <select
              required
              value={formData.sellerId}
              onChange={(e) => setFormData({ ...formData, sellerId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a seller</option>
              {sellers.map((seller) => (
                <option key={seller._id} value={seller._id}>
                  {seller.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
            <select
              required
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a customer</option>
              {customers.map((customer) => (
                <option key={customer._id} value={customer._id}>
                  {customer.name} ({customer.type})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input
              type="number"
              min="1"
              required
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <p className="text-sm text-emerald-800">
              <strong>Note:</strong> Total and commission will be calculated automatically based on product price and quantity.
            </p>
          </div>
          
          <div className="flex gap-3 mt-6">
            <Button type="submit" className="flex-1">
              Record Sale
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

export default Sales;
