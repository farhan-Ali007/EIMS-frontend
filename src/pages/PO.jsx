import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getProducts, getParcels, createParcel } from '../services/api';
import Card, { CardBody, CardHeader, CardTitle } from '../components/Card';
import Button from '../components/Button';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import { useToast } from '../context/ToastContext';
import { Package, Truck, MapPin, Hash, CheckCircle } from 'lucide-react';

const PO = () => {
  const toast = useToast();
  const queryClient = useQueryClient();

  const [productSearch, setProductSearch] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [form, setForm] = useState({
    trackingNumber: '',
    address: '',
    status: 'processing',
    paymentStatus: 'unpaid',
    notes: ''
  });
  const [filterTracking, setFilterTracking] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPayment, setFilterPayment] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Products for dropdown
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await getProducts();
      return res.data || [];
    }
  });

  // Parcels list
  const { data: parcels = [] } = useQuery({
    queryKey: ['parcels'],
    queryFn: async () => {
      const res = await getParcels();
      return res.data || [];
    }
  });

  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products;
    const q = productSearch.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.model.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }, [products, productSearch]);

  const filteredParcels = useMemo(() => {
    return parcels.filter(p => {
      const matchTracking = filterTracking
        ? p.trackingNumber.toLowerCase().includes(filterTracking.toLowerCase())
        : true;
      const matchStatus = filterStatus ? p.status === filterStatus : true;
      const matchPayment = filterPayment ? p.paymentStatus === filterPayment : true;
      return matchTracking && matchStatus && matchPayment;
    });
  }, [parcels, filterTracking, filterStatus, filterPayment]);

  const paginatedParcels = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredParcels.slice(start, start + itemsPerPage);
  }, [filteredParcels, currentPage]);

  const totalPages = Math.ceil(filteredParcels.length / itemsPerPage) || 1;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProductId) {
      toast.error('Please select a product');
      return;
    }
    if (!form.trackingNumber.trim() || !form.address.trim()) {
      toast.error('Tracking number and address are required');
      return;
    }

    try {
      await createParcel({
        productId: selectedProductId,
        trackingNumber: form.trackingNumber.trim(),
        address: form.address.trim(),
        status: form.status,
        paymentStatus: form.paymentStatus,
        notes: form.notes.trim()
      });
      toast.success('Parcel recorded successfully');
      setForm({ trackingNumber: '', address: '', status: 'processing', paymentStatus: 'unpaid', notes: '' });
      setSelectedProductId('');
      setProductSearch('');
      await queryClient.invalidateQueries({ queryKey: ['parcels'] });
    } catch (error) {
      console.error('Error creating parcel:', error);
      const msg = error.response?.data?.message || 'Failed to create parcel';
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Truck size={26} className="text-emerald-600" />
            PO (Post Office)
          </h1>
          <p className="text-gray-600 mt-1">Track parcels sent via post office with status and payment info.</p>
        </div>
      </div>

      {/* Form */}
      <Card className="shadow-lg border-0 bg-white rounded-2xl overflow-visible">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Package size={20} />
            New Parcel Record
          </CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Product */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search by name, model, or category..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                {productSearch && filteredProducts.length > 0 && (
                  <div className="mt-1 max-h-48 overflow-y-auto border border-gray-200 rounded-lg bg-white shadow-lg text-sm">
                    {filteredProducts.map((p) => (
                      <button
                        type="button"
                        key={p._id}
                        onClick={() => {
                          setSelectedProductId(p._id);
                          setProductSearch(`${p.name} (${p.model})`);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">{p.name}</div>
                        <div className="text-xs text-gray-600">Model: {p.model} • {p.category}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Tracking number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Number</label>
                <input
                  type="text"
                  value={form.trackingNumber}
                  onChange={(e) => setForm({ ...form, trackingNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Enter tracking ID"
                  required
                />
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  rows={2}
                  placeholder="Customer address for this parcel"
                  required
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="processing">Processing</option>
                  <option value="delivered">Delivered</option>
                  <option value="return">Return</option>
                </select>
              </div>

              {/* Payment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment</label>
                <select
                  value={form.paymentStatus}
                  onChange={(e) => setForm({ ...form, paymentStatus: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                </select>
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Any extra info e.g. courier, special instructions"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" className="flex items-center gap-2">
                <CheckCircle size={18} />
                Save Parcel
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {/* Filters + Table */}
      <Card className="shadow-lg border-0 bg-white rounded-2xl overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Parcel Records</span>
            <span className="text-sm text-gray-500">{filteredParcels.length} record(s)</span>
          </CardTitle>
        </CardHeader>
        <CardBody className="p-0">
          <div className="p-4 flex flex-col md:flex-row gap-3 border-b border-gray-100">
            <div className="flex-1">
              <SearchBar
                value={filterTracking}
                onChange={setFilterTracking}
                placeholder="Search by tracking number..."
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">All Status</option>
              <option value="processing">Processing</option>
              <option value="delivered">Delivered</option>
              <option value="return">Return</option>
            </select>
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">All Payments</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tracking #</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Payment</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedParcels.length > 0 ? (
                  paginatedParcels.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium text-gray-800 flex items-center gap-2">
                        <Hash size={14} className="text-gray-400" />
                        {p.trackingNumber}
                      </td>
                      <td className="px-4 py-2 text-gray-800">
                        {p.product ? (
                          <div>
                            <div className="font-semibold text-xs">{p.product.name}</div>
                            <div className="text-[10px] text-gray-500">{p.product.model} • {p.product.category}</div>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-2 text-xs text-gray-700 max-w-xs break-words">
                        <div className="flex items-start gap-1">
                          <MapPin size={12} className="mt-0.5 text-gray-400" />
                          <span>{p.address}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                            p.status === 'delivered'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : p.status === 'return'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                            p.paymentStatus === 'paid'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-50 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {p.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-xs text-gray-700">
                        {p.createdBy ? p.createdBy.username || p.createdBy.email : '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500 text-sm">
                      No parcels found. Try adjusting your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredParcels.length > itemsPerPage && (
            <div className="p-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredParcels.length}
              />
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default PO;
