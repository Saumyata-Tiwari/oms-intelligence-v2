import React, { useState, useEffect } from 'react';
import { getOrders } from '../api';

const statusColors: any = {
  pending: 'bg-yellow-900 text-yellow-300',
  confirmed: 'bg-blue-900 text-blue-300',
  processing: 'bg-purple-900 text-purple-300',
  shipped: 'bg-indigo-900 text-indigo-300',
  delivered: 'bg-green-900 text-green-300',
  cancelled: 'bg-red-900 text-red-300',
  refunded: 'bg-gray-900 text-gray-300',
};

const slaColors: any = {
  on_time: 'bg-green-900 text-green-300',
  at_risk: 'bg-yellow-900 text-yellow-300',
  breached: 'bg-red-900 text-red-300',
};

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params: any = { page, page_size: 20 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await getOrders(params);
      setOrders(res.data.orders);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID, customer name or email..."
            className="flex-1 bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 text-sm focus:outline-none"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-white font-semibold">Orders ({total})</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-slate-400">Loading orders...</div>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="text-4xl mb-3">📦</div>
              <div className="text-slate-400">No orders found</div>
              <div className="text-slate-500 text-sm mt-1">Orders from Shopify will appear here</div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase">Order ID</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase">Customer</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase">SLA</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase">Total</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-blue-400 font-mono">#{order.external_id}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white">{order.customer_name || 'N/A'}</div>
                      <div className="text-xs text-slate-400">{order.customer_email || ''}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${slaColors[order.sla_status]}`}>
                        {order.sla_status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-white">
                      {order.currency} {order.total_price?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {order.ordered_at ? new Date(order.ordered_at).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > 20 && (
          <div className="px-6 py-4 border-t border-slate-700 flex justify-between items-center">
            <span className="text-sm text-slate-400">
              Showing {(page - 1) * 20 + 1} - {Math.min(page * 20, total)} of {total}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * 20 >= total}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;