import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createBookPO, getBookPOs } from '../services/api';
import Card, { CardBody, CardHeader, CardTitle } from '../components/Card';
import Button from '../components/Button';
import { useToast } from '../context/ToastContext';
import { Printer, CheckCircle, User, Phone, MapPin, Hash } from 'lucide-react';

const BookPO = () => {
  const toast = useToast();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    toName: '',
    toPhone: '',
    toAddress: '',
    weight: '',
    amount: '',
  });
  const [selectedIds, setSelectedIds] = useState([]);
  const [ordersToPrint, setOrdersToPrint] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const { data: orders = [] } = useQuery({
    queryKey: ['book-po-orders'],
    queryFn: async () => {
      const res = await getBookPOs();
      return res.data || [];
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.toName.trim() || !form.toPhone.trim() || !form.toAddress.trim() || !form.weight.trim() || !form.amount) {
      toast.error('براہ کرم تمام خانے مکمل پُر کریں');
      return;
    }

    try {
      await createBookPO({
        toName: form.toName.trim(),
        toPhone: form.toPhone.trim(),
        toAddress: form.toAddress.trim(),
        weight: form.weight.trim(),
        amount: Number(form.amount),
      });
      toast.success('Order saved successfully');
      setForm({ toName: '', toPhone: '', toAddress: '', weight: '', amount: '' });
      await queryClient.invalidateQueries({ queryKey: ['book-po-orders'] });
    } catch (error) {
      console.error('Error creating Book PO order:', error);
      const msg = error.response?.data?.message || 'Error in saving bill.';
      toast.error(msg);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }

      // Limit to maximum 2 selected orders
      if (prev.length >= 2) {
        return prev;
      }

      return [...prev, id];
    });
  };

  const handlePrintSingle = (order) => {
    setOrdersToPrint([order]);
    setTimeout(() => {
      window.print();
    }, 0);
  };

  const handlePrintSelected = () => {
    const selected = orders.filter((o) => selectedIds.includes(o._id)).slice(0, 2);
    if (selected.length === 0) {
      toast.error('Select atleast 1 order.');
      return;
    }
    setOrdersToPrint(selected);
    setTimeout(() => {
      window.print();
    }, 0);
  };

  const formattedOrders = useMemo(() => orders, [orders]);

  return (
    <>
      <div className="space-y-6 no-print">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Printer size={26} className="text-emerald-600" />
            Book PO
          </h1>
          <p className="text-gray-600 mt-1">Print orders on A4 paper (maximum 2 orders per page).</p>
        </div>
        <div className="mt-2 md:mt-0 flex justify-end">
          <Button
            type="button"
            className="text-sm px-3 py-1"
            onClick={() => setShowForm((prev) => !prev)}
          >
            Add order
          </Button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
      <Card className="shadow-lg border-0 bg-white rounded-2xl overflow-visible">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <User size={20} />
            نیا آرڈر فارم
          </CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نام (Name)</label>
                <input
                  type="text"
                  value={form.toName}
                  onChange={(e) => setForm({ ...form, toName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="نام درج کریں"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">فون نمبر (Phone)</label>
                <input
                  type="text"
                  value={form.toPhone}
                  onChange={(e) => setForm({ ...form, toPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="فون نمبر درج کریں"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">پتہ (Address)</label>
                <textarea
                  value={form.toAddress}
                  onChange={(e) => setForm({ ...form, toAddress: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  rows={2}
                  placeholder="مکمل پتہ درج کریں"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">وزن (Weight)</label>
                <input
                  type="text"
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="مثال: 500 گرام / 1 کلو"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رقم (Rs.)</label>
                <input
                  type="number"
                  min="0"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="کل رقم"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" className="flex items-center gap-2">
                <CheckCircle size={18} />
                Save Order
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
      )}

      {/* Orders List */}
      <Card className="shadow-lg border-0 bg-white rounded-2xl overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Orders list</span>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Total: {formattedOrders.length}</span>
              <Button type="button" className="flex items-center text-xs gap-2" onClick={handlePrintSelected}>
                <Printer size={16} />
                Print selected orders
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Select</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">To</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Weight</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {formattedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-500 text-sm">
                      No orders yet.
                    </td>
                  </tr>
                ) : (
                  formattedOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(order._id)}
                          onChange={() => toggleSelect(order._id)}
                        />
                      </td>
                      <td className="px-4 py-2 text-xs text-gray-800">
                        <div className="font-semibold">{order.toName}</div>
                        <div className="text-gray-600 flex items-center gap-1 text-[11px]">
                          <Phone size={11} />
                          <span>{order.toPhone}</span>
                        </div>
                        <div className="text-gray-600 flex items-start gap-1 text-[11px]">
                          <MapPin size={11} className="mt-0.5" />
                          <span className='urdu-text text-[14px]'>{order.toAddress}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-xs text-gray-800">{order.weight}</td>
                      <td className="px-4 py-2 text-xs text-gray-800">Rs. {Number(order.amount || 0).toLocaleString('en-PK')}</td>
                      <td className="px-4 py-2 text-xs text-gray-600">
                        {new Date(order.createdAt).toLocaleString('en-PK')}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <Button
                          type="button"
                          className="flex items-center gap-1 text-xs px-3 py-1"
                          onClick={() => handlePrintSingle(order)}
                        >
                          <Printer size={14} />
                          Print
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
      </div>

      {/* Print layout */}
      <div className="book-po-print-root" aria-hidden="true">
        {ordersToPrint.map((order, index) => (
          <div
            key={order._id}
            className="book-po-chit relative border border-gray-400 p-6 mb-4 overflow-hidden"
            style={{
              pageBreakInside: 'avoid',
              pageBreakAfter: index % 2 === 1 ? 'always' : 'auto',
            }}
          >
            <div className="book-po-watermark">Etimad Mart</div>

            <div className="relative z-10 text-lg leading-relaxed w-full">
              {/* To section: heading on its own line, details below on right */}
              <div className="mb-4 urdu-text">
                <div className="font-bold text-lg text-left">To</div>
                <div className="mt-1 text-right urdu-text" dir="rtl">
                  <div>نام: {order.toName}</div>
                  <div>
                    فون نمبر: <span dir="ltr">{order.toPhone}</span>
                  </div>
                  <div>پتہ: {order.toAddress}</div>
                  <div>وزن: {order.weight}</div>
                  <div>
                    رقم: Rs. {Number(order.amount || 0).toLocaleString('en-PK')}
                  </div>
                </div>
              </div>

              <hr className="my-3 border-dashed" />

              {/* From section: heading on its own line, details below on right */}
              <div className="mt-5 urdu-text">
                <div className="font-bold text-lg text-left">From</div>
                <div className="mt-1 text-right" dir="rtl">
                  <div>اعتماد مارٹ</div>
                  <div>
                    فون نمبر: <span dir="ltr">0307-1111832</span>
                  </div>
                  <div>
                    پتہ: محلہ طارق آباد، چاچڑاں روڈ ظاہر پیر، تحصیل خان پور، ضلع رحیم یار خان
                  </div>
                  <div className='font-bold'>
                   نوٹ: گاہک سے رابطہ کریں اور اسے پہنچانے کی کوشش ضرور کریں۔

                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default BookPO;
