import React, { useEffect, useState } from 'react';
import {
  Download,
  BarChart3,
  TrendingUp,
  Calendar,
  FileText,
  CreditCard,
  Banknote,
  Clock,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { api } from '../../services/api';

export const AdminReportsPage: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [paymentSummary, setPaymentSummary] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSettling, setIsSettling] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [repRes, payRes, ords] = await Promise.all([
        api.getAdminReports().catch(() => ({ success: true, data: null })),
        api.getPaymentSummary({ startDate, endDate }).catch(() => ({ success: true, data: null })),
        api.getAdminOrders().catch(() => [])
      ]);

      if (repRes?.success) setReport(repRes.data);
      if (payRes) setPaymentSummary(payRes.data || payRes);
      if (Array.isArray(ords)) setOrders(ords);
    } catch (e) {
      console.warn('Reports load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [startDate, endDate]);

  const handleSettlePartner = async (partnerId: string) => {
    if (!window.confirm('Confirm settlement of all collected COD cash for this delivery partner?')) return;
    setIsSettling(true);
    try {
      const res = await api.settlePartnerCodOrders(partnerId);
      if (res?.success) {
        alert(res.message || 'Partner COD settled successfully!');
        loadData();
      }
    } catch (err: any) {
      alert(err.message || 'Settlement failed');
    } finally {
      setIsSettling(false);
    }
  };

  const handleExportCSV = () => {
    const list = orders.length > 0 ? orders : (report?.ordersSummary || []);
    if (!list || list.length === 0) return;

    const headers = [
      'Order Number',
      'Customer Name',
      'Phone',
      'Date & Time',
      'Items Count',
      'Payment Method',
      'Payment Status',
      'Transaction ID',
      'Delivery Partner',
      'Delivery Status',
      'Total Amount'
    ];

    const rows = list.map((o: any) => [
      o.orderNumber || o.id,
      `"${o.deliveryAddressSnapshot?.recipientName || o.customerName || 'Customer'}"`,
      `"${o.deliveryAddressSnapshot?.phone || o.customerPhone || ''}"`,
      `"${o.createdAt || ''}"`,
      Array.isArray(o.items) ? o.items.length : 1,
      o.paymentMethod || 'COD',
      o.paymentStatus || 'PENDING',
      `"${o.paymentDetails?.transactionId || o.razorpayPaymentId || ''}"`,
      `"${o.deliveryPartnerName || 'Unassigned'}"`,
      o.status || 'PLACED',
      o.totalAmount || 0
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mpm_meat_corner_payment_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="py-12 text-center text-gray-400">Compiling financial & payment reports...</div>;
  }

  const topProducts = report?.topProducts || [];
  const partnerBreakdown = paymentSummary?.partnerBreakdown || [];

  return (
    <div className="space-y-6">
      {/* Top Heading & CSV Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-charcoal">Financial & Payment Audit Reports</h1>
          <p className="text-xs text-gray-500">Live transaction reconciliation, COD rider settlement, and butchery volume metrics</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Financial CSV</span>
          </button>
        </div>
      </div>

      {/* Date-wise Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 text-gray-700 font-bold">
          <Calendar className="w-4 h-4 text-brand-700" />
          <span>Filter Report Period:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-charcoal outline-none focus:border-brand-700"
          />
          <span className="text-gray-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-charcoal outline-none focus:border-brand-700"
          />
          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              className="text-xs font-bold text-brand-700 hover:underline px-2"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Payment Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Total Online Paid</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-charcoal block">₹{paymentSummary?.totalOnlinePaid || 0}</span>
          <span className="text-xs text-emerald-700 font-medium">{paymentSummary?.onlineCount || 0} orders verified</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-indigo-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800">COD Cash Collected</span>
            <Banknote className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-2xl font-black text-charcoal block">₹{paymentSummary?.totalCodCollected || 0}</span>
          <span className="text-xs text-indigo-700 font-medium">{paymentSummary?.codCollectedCount || 0} riders awaiting settlement</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-amber-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">COD Pending Collection</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-2xl font-black text-charcoal block">₹{paymentSummary?.totalCodPending || 0}</span>
          <span className="text-xs text-amber-700 font-medium">{paymentSummary?.codPendingCount || 0} orders in transit</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Total Settled Revenue</span>
            <ShieldCheck className="w-4 h-4 text-brand-700" />
          </div>
          <span className="text-2xl font-black text-brand-700 block">₹{paymentSummary?.totalOrderRevenue || 0}</span>
          <span className="text-xs text-gray-500 font-medium">{paymentSummary?.totalDeliveredOrders || 0} orders delivered</span>
        </div>
      </div>

      {/* Delivery Partner-wise COD Handover & Settlement */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-black text-base text-charcoal">Delivery Partner COD Cash Handover & Settlement</h3>
            <p className="text-xs text-gray-400">Cash collected from customer deliveries pending handover to store manager</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Delivery Partner</th>
                <th className="py-3 px-4">Total Orders</th>
                <th className="py-3 px-4">Cash Collected (In Hand)</th>
                <th className="py-3 px-4">Already Settled</th>
                <th className="py-3 px-4 text-right">Settlement Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {partnerBreakdown.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-400">
                    No delivery partner COD collections recorded in this period.
                  </td>
                </tr>
              ) : (
                partnerBreakdown.map((pb: any) => (
                  <tr key={pb.partnerId} className="hover:bg-gray-50/80 transition">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-charcoal block">{pb.partnerName}</span>
                      <span className="text-[10px] text-gray-400 font-mono">{pb.partnerId}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gray-700">{pb.orderCount} orders</td>
                    <td className="py-3.5 px-4">
                      <span className="font-black text-indigo-900 block text-sm">₹{pb.totalCollected || 0}</span>
                      <span className="text-[10px] text-indigo-700 font-bold">
                        {pb.pendingSettlement > 0 ? 'Cash in Rider Hand' : 'All Cash Reconciled'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-800">
                      ₹{pb.settledPaid || 0}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {pb.pendingSettlement > 0 ? (
                        <button
                          type="button"
                          disabled={isSettling}
                          onClick={() => handleSettlePartner(pb.partnerId)}
                          className="bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-sm transition"
                        >
                          Verify & Settle Handover
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-emerald-700 inline-flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Fully Settled</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Chicken Cuts by Sales */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
          <h3 className="font-black text-base text-charcoal">Top Selling Chicken Cuts</h3>
          <p className="text-xs text-gray-400">Volume and revenue by meat cut</p>

          <div className="divide-y divide-gray-100">
            {topProducts.map((p: any, idx: number) => (
              <div key={idx} className="py-3 flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-bold text-charcoal">{p.name}</h4>
                  <span className="text-[11px] text-gray-400">{p.quantity} packs sold</span>
                </div>
                <span className="font-black text-brand-700 text-sm">₹{p.revenue}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fulfillment Summary */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
          <h3 className="font-black text-base text-charcoal">Order Delivery Summary</h3>
          <p className="text-xs text-gray-400">Total fulfillment performance</p>

          <div className="bg-gray-50 p-4 rounded-2xl space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Total Orders:</span>
              <span className="font-bold text-charcoal">{orders.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Delivered Orders:</span>
              <span className="font-bold text-green-700">
                {orders.filter((o: any) => o.status === 'DELIVERED').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Pending Deliveries:</span>
              <span className="font-bold text-amber-700">
                {orders.filter((o: any) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Cancelled Orders:</span>
              <span className="font-bold text-red-600">
                {orders.filter((o: any) => o.status === 'CANCELLED').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
