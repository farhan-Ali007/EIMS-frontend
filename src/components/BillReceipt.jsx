import React from 'react';
import { Calendar, Phone, Mail, MapPin, Hash, User, Package, Receipt, Download, Share2, CheckCircle, Clock, X } from 'lucide-react';

const BillReceipt = ({ bill, onClose, onPrint }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `Rs. ${Number(amount || 0).toLocaleString('en-PK')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[95vh] overflow-hidden print-root">
        {/* Header Actions (compact, invoice style) */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-10 rounded-md">
                <Receipt size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold tracking-[0.25em] uppercase">Invoice</h2>
                <p className="text-slate-200 text-xs">Invoice No: {bill.billNumber}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onPrint}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg text-sm"
              >
                <Download size={16} />
                Print Invoice
              </button>
              <button
                onClick={onClose}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-all duration-200 flex items-center gap-1 text-sm"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Bill Content */}
        <div id="bill-content" className="relative overflow-y-auto max-h-[calc(95vh-120px)] bg-white">
          <div className="bill-watermark">Etimad Mart</div>
          {/* Company Header (compact) */}
          <div className="bg-gray-50 px-8 pt-6 pb-4 border-b border-gray-300">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-1 tracking-wide">ETIMAD MART</h1>
              <p className="text-sm text-gray-700 mb-3">Retail &amp; Mart Billing Invoice</p>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-2xl mx-auto text-xs">
                <div className="flex items-center justify-center gap-2 text-gray-700">
                  {/* <div className="p-2 bg-gray-200 rounded-lg">
                    <Phone size={16} className="text-gray-700" />
                  </div> */}
                  <span className="font-medium">0307-1111832</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-700">
                  {/* <div className="p-2 bg-gray-200 rounded-lg">
                    <MapPin size={16} className="text-gray-700" />
                  </div> */}
                  <span className="font-medium">Zahir Pir , Pakistan</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bill & Customer Information */}
          <div className="px-8 pt-6 pb-4 bg-white">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

              {/* Bill Details Card - simple form style */}
              <div className="bg-gray-50  p-4  text-xs">
                <h3 className="text-sm font-semibold text-gray-900 text-center mb-3 border-b border-gray-200 pb-2">Invoice Details</h3>

                <div className="space-y-1.5">
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-600 whitespace-nowrap">Bill Number:</span>
                    <span className="font-semibold text-gray-900 flex-1 text-right">{bill.billNumber}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-600 whitespace-nowrap">Date &amp; Time:</span>
                    <span className="font-medium text-gray-800 flex-1 text-right">{formatDate(bill.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Customer Details Card - simple form style */}
              <div className="bg-gray-50 p-4 text-xs">
                <h3 className="text-sm text-center font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">Bill To</h3>

                {bill.customer ? (
                  <div className="space-y-1.5">
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-600 whitespace-nowrap">Name:</span>
                      <span className="font-semibold text-gray-900 flex-1 text-right">{bill.customer.name}</span>
                    </div>
                    {bill.customer.phone && (
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-600 whitespace-nowrap">Phone:</span>
                        <span className="font-medium text-gray-900 flex-1 text-right">{bill.customer.phone}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-5 text-xs">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">Walk-in Customer</h4>
                    <p className="text-gray-600">No customer information provided</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Items Table - compact invoice style */}
          <div className="px-8 pt-2 pb-4 bg-white">
            <div className="bg-white  shadow-sm border border-gray-300 overflow-hidden mb-6">
              <div className="bg-white text-black font-bold px-5 py-3">
                <div className="flex items-center justify-center ">
                  {/* <div className="p-3 bg-black bg-opacity-20 rounded-xl">
                    <Package size={24} />
                  </div> */}
                  <div>
                    <h3 className="text-[1rem] font-semibold tracking-wide ">Invoice Items</h3>
                    {/* <p className="text-gray-200 text-xs">Products and services</p> */}
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-gray-800">Item / Description</th>
                      <th className="px-3 py-2 text-center font-semibold text-gray-800">Rate</th>
                      <th className="px-3 py-2 text-center font-semibold text-gray-800">Qty</th>
                      <th className="px-3 py-2 text-right font-semibold text-gray-800">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {bill.items.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-3 py-2 align-top">
                          <div>
                            <div className="font-semibold text-gray-900 text-xs">{item.name}-{item.model} | ({item.category})</div>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-center font-medium text-gray-800">
                          {formatCurrency(item.selectedPrice)}
                        </td>
                        <td className="px-3 py-2 text-center font-semibold text-gray-900">
                          {item.quantity}
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-gray-900">
                          {formatCurrency(item.totalAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Bill Summary - bottom band similar to Canva style */}
          <div className="px-8 pb-6 pt-2">
            <div className="bg-gray-50 border border-gray-300  p-4 text-xs mb-3">
              <div className="flex justify-between mb-1">
                <span className="text-gray-700">Total</span>
                <span className="font-semibold text-gray-900">{formatCurrency(bill.total)}</span>
              </div>
              {bill.discount > 0 && (
                <div className="flex justify-between mb-1">
                  <span className="text-gray-700">Discount ({bill.discountType === 'percentage' ? '%' : 'Fixed'})</span>
                  <span className="font-semibold text-gray-700">- {formatCurrency(bill.discount)}</span>
                </div>
              )}
              <div className="flex justify-between mt-2 items-center">
                <span className="text-gray-700">Amount Paid</span>
                <span className="flex-1 ml-4 border-b border-dashed border-gray-400 h-4" />
              </div>
              <div className="flex justify-between mt-2 items-center">
                <span className="text-gray-700">Remaining Balance</span>
                <span className="flex-1 ml-4 border-b border-dashed border-gray-400 h-4" />
              </div>
            </div>

            <div className="bg-gray-700 text-white  py-3 px-6 flex justify-between items-center shadow-md">
              <span className="text-sm font-medium uppercase tracking-wide">Total</span>
              <span className="text-xl font-bold">{formatCurrency(bill.total)}</span>
            </div>
          </div>

          {/* Notes */}
          {bill.notes && (
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <h4 className="font-bold text-gray-800 mb-2">Notes:</h4>
              <p className="text-gray-700">{bill.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-4 border-t border-slate-200 pt-4 bg-white rounded-2xl px-6 pb-5">
            <div className="flex flex-col items-center gap-2 text-xs text-slate-600 md:flex-row md:justify-center md:gap-6">
              <p className="text-sm md:text-base font-semibold text-emerald-600">
                Thank you for your business!
              </p>
              <p>📞 For support: +92307-1111832</p>
              <p>🌐 Visit: www.etimadmart.com</p>
            </div>
            {/* <div className="mt-4 text-[10px] text-slate-500 border-t border-slate-200 pt-3">
              <p>This is a computer-generated receipt and does not require a signature.</p>
              <p>Generated on {formatDate(new Date())}</p>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillReceipt;
