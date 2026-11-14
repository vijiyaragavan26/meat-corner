import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Users,
  Bike,
  Clock,
  ArrowRight,
  CheckCircle2,
  PackageCheck,
  Percent
} from 'lucide-react';
import { api } from '../../services/api';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAdminDashboard()
      .then((res) => {
        if (res.success) setStats(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block w-8 h-8 border-4 border-brand-700 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-gray-500 mt-2 font-bold">Computing business analytics...</p>
      </div>
    );
  }

  const metrics = stats?.metrics || {};
  const statusDist = stats?.statusDistribution || {};
  const dailyTrends = stats?.dailyTrends || [];
  const recentOrders = stats?.recentOrders || [];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-charcoal tracking-tight">Meat Corner Analytics & Control</h1>
        <p className="text-xs text-gray-500 mt-1">
          Real-time bird butchery, inventory deductions, order fulfillment, and rider metrics
        </p>
      </div>

      {/* KPI Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Revenue</span>
            <span className="text-2xl font-black text-charcoal mt-1 block">₹{metrics.totalRevenue?.toLocaleString()}</span>
            <span className="text-[10px] text-green-600 font-bold mt-1 inline-flex items-center">
              Today: ₹{metrics.todayRevenue?.toLocaleString()}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-700 flex items-center justify-center font-bold text-lg">
            ₹
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Orders</span>
            <span className="text-2xl font-black text-charcoal mt-1 block">{metrics.totalOrders}</span>
            <span className="text-[10px] text-brand-700 font-bold mt-1 inline-flex items-center">
              Today: {metrics.todayOrders} orders
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-lg">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Pending / Preparing</span>
            <span className="text-2xl font-black text-amber-600 mt-1 block">{metrics.pendingOrders}</span>
            <span className="text-[10px] text-gray-400 font-bold mt-1 inline-flex items-center">
              Requires butchery & dispatch
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Active Delivery Partners */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Active Fleet</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">{metrics.activePartners} Online</span>
            <span className="text-[10px] text-gray-400 font-bold mt-1 inline-flex items-center">
              Low Stock Warnings: {metrics.lowStockItems}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
            <Bike className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 7-Day Revenue Trends Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-black text-base text-charcoal">7-Day Revenue Trend</h3>
              <p className="text-xs text-gray-400">Daily gross chicken sales in INR</p>
            </div>
            <span className="text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-xl">
              Avg Order Value: ₹{metrics.avgOrderValue}
            </span>
          </div>

          <div className="h-64 flex items-end space-x-3 pt-6 pb-2 px-2 border-b border-gray-100">
            {dailyTrends.map((d: any, idx: number) => {
              const maxRev = Math.max(...dailyTrends.map((t: any) => t.revenue), 1000);
              const heightPercent = Math.max(10, Math.round((d.revenue / maxRev) * 100));

              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div className="text-[10px] font-bold text-brand-700 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                    ₹{d.revenue}
                  </div>
                  <div
                    className="w-full bg-gradient-to-t from-brand-800 to-brand-500 rounded-xl transition-all duration-500 hover:brightness-110 shadow-sm"
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-[10px] text-gray-400 font-medium mt-2">
                    {d.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="font-black text-base text-charcoal">Fulfillment Status</h3>
          <p className="text-xs text-gray-400">Order lifecycle distribution</p>

          <div className="space-y-3 pt-2">
            {Object.entries(statusDist).map(([status, count]: [string, any]) => (
              <div key={status} className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-gray-700">{status.replace(/_/g, ' ')}</span>
                  <span className="text-brand-700">{count}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-700 rounded-full"
                    style={{
                      width: `${Math.min(100, Math.round((count / (metrics.totalOrders || 1)) * 100))}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-black text-base text-charcoal">Recent Customer Orders</h3>
            <p className="text-xs text-gray-400">Incoming chicken orders ready for verification & dispatch</p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center group"
          >
            <span>Manage All Orders</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Order Number</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Area</th>
                <th className="py-3 px-3">Items</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders.map((ord: any) => (
                <tr key={ord.id} className="hover:bg-gray-50/80 transition">
                  <td className="py-3.5 px-3 font-mono font-bold text-charcoal">{ord.orderNumber}</td>
                  <td className="py-3.5 px-3 font-semibold text-charcoal">{ord.customerName || 'Customer'}</td>
                  <td className="py-3.5 px-3 text-gray-500">{ord.deliveryAddressSnapshot?.area || 'Erode'}</td>
                  <td className="py-3.5 px-3 font-bold text-gray-700">{ord.items?.length || 0} items</td>
                  <td className="py-3.5 px-3 font-black text-brand-700">₹{ord.totalAmount}</td>
                  <td className="py-3.5 px-3">
                    <span className="text-[10px] font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                      {ord.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        ord.status === 'DELIVERED'
                          ? 'bg-green-100 text-green-800'
                          : ord.status === 'CANCELLED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-brand-50 text-brand-800'
                      }`}
                    >
                      {ord.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <Link
                      to={`/admin/orders`}
                      className="text-xs font-bold text-brand-700 hover:underline"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
