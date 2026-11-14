import React, { useEffect, useState } from 'react';
import { Download, BarChart3, TrendingUp, Calendar, FileText } from 'lucide-react';
import { api } from '../../services/api';

export const AdminReportsPage: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAdminReports()
      .then((res) => {
        if (res.success) setReport(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleExportCSV = () => {
    if (!report?.ordersSummary) return;

    const headers = ['Order Number', 'Customer', 'Date', 'Items Count', 'Payment Mode', 'Payment Status', 'Fulfillment Status', 'Total Amount'];
    const rows = report.ordersSummary.map((o: any) => [
      o.orderNumber,
      `"${o.customerName || 'Customer'}"`,
      o.date,
      o.itemsCount,
      o.paymentMethod,
      o.paymentStatus,
      o.status,
      o.totalAmount
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `meat_corner_sales_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="py-12 text-center text-gray-400">Compiling sales reports...</div>;
  }

  const topProducts = report?.topProducts || [];
  const ordersSummary = report?.ordersSummary || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-charcoal">Business Reports & Sales Export</h1>
          <p className="text-xs text-gray-500">Chicken sales volume, product performance, and transaction audits</p>
        </div>

        <button
          onClick={handleExportCSV}
          className="bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Export Orders CSV</span>
        </button>
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

        {/* Financial Overview */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
          <h3 className="font-black text-base text-charcoal">Fulfillment Summary</h3>
          <p className="text-xs text-gray-400">Total transaction breakdown</p>

          <div className="bg-gray-50 p-4 rounded-2xl space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Total Tracked Orders:</span>
              <span className="font-bold text-charcoal">{report?.totalOrders}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Delivered Orders:</span>
              <span className="font-bold text-green-700">
                {ordersSummary.filter((o: any) => o.status === 'DELIVERED').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Cancelled Orders:</span>
              <span className="font-bold text-red-600">
                {ordersSummary.filter((o: any) => o.status === 'CANCELLED').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
