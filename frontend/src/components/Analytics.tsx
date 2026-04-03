import React, { useState, useEffect } from 'react';
import { getAnalyticsSummary, getAnalyticsCharts } from '../api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Analytics: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [period, setPeriod] = useState('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [summaryRes, chartsRes] = await Promise.all([
          getAnalyticsSummary(period),
          getAnalyticsCharts(period),
        ]);
        setSummary(summaryRes.data);
        setCharts(chartsRes.data);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [period]);

  const statCards = summary ? [
    { label: 'Total Orders', value: summary.total_orders, icon: '📦', color: 'text-blue-400' },
    { label: 'Revenue', value: `₹${summary.revenue?.toFixed(0)}`, icon: '💰', color: 'text-green-400' },
    { label: 'SLA Breached', value: summary.sla_breached, icon: '⚠️', color: 'text-red-400' },
    { label: 'Escalations', value: summary.escalations, icon: '🔴', color: 'text-orange-400' },
    { label: 'Chat Sessions', value: summary.total_sessions, icon: '💬', color: 'text-purple-400' },
    { label: 'Avg Sentiment', value: summary.avg_sentiment?.toFixed(2), icon: '😊', color: 'text-yellow-400' },
  ] : [];

  const slaData = charts ? [
    { name: 'On Time', value: charts.sla_distribution?.on_time || 0, color: '#22c55e' },
    { name: 'At Risk', value: charts.sla_distribution?.at_risk || 0, color: '#eab308' },
    { name: 'Breached', value: charts.sla_distribution?.breached || 0, color: '#ef4444' },
  ] : [];

  const channelData = charts ? [
    { name: 'Web', value: charts.channel_split?.web || 0, color: '#3b82f6' },
    { name: 'WhatsApp', value: charts.channel_split?.whatsapp || 0, color: '#22c55e' },
    { name: 'Shopify', value: charts.channel_split?.shopify || 0, color: '#8b5cf6' },
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-slate-400">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex gap-2">
        {['today', '7d', '30d', '90d'].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === p
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {p === 'today' ? 'Today' : p === '7d' ? 'Last 7 Days' : p === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
          </button>
        ))}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="text-2xl mb-2">{card.icon}</div>
            <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
            <div className="text-xs text-slate-400 mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Over Time */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-white font-semibold mb-4">Orders Over Time</h3>
          {charts?.orders_over_time?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={charts.orders_over_time}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="timestamp" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => v.split('T')[0]} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-500 text-sm">No data yet</div>
          )}
        </div>

        {/* Sentiment Over Time */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-white font-semibold mb-4">Sentiment Trend</h3>
          {charts?.sentiment_over_time?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={charts.sentiment_over_time}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="timestamp" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => v.split('T')[0]} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[-1, 1]} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-500 text-sm">No data yet</div>
          )}
        </div>

        {/* SLA Distribution */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-white font-semibold mb-4">SLA Distribution</h3>
          <div className="flex items-center gap-6">
            <PieChart width={150} height={150}>
              <Pie data={slaData} cx={75} cy={75} innerRadius={40} outerRadius={70} dataKey="value">
                {slaData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
            <div className="space-y-2">
              {slaData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-slate-300">{item.name}: <span className="text-white font-medium">{item.value}</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Channel Split */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-white font-semibold mb-4">Channel Split</h3>
          <div className="flex items-center gap-6">
            <PieChart width={150} height={150}>
              <Pie data={channelData} cx={75} cy={75} innerRadius={40} outerRadius={70} dataKey="value">
                {channelData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
            <div className="space-y-2">
              {channelData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-slate-300">{item.name}: <span className="text-white font-medium">{item.value}</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sentiment Breakdown */}
      {summary && (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-white font-semibold mb-4">Sentiment Breakdown</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl mb-2">😊</div>
              <div className="text-2xl font-bold text-green-400">{summary.positive_msgs}</div>
              <div className="text-sm text-slate-400">Positive</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">😐</div>
              <div className="text-2xl font-bold text-slate-400">{summary.neutral_msgs}</div>
              <div className="text-sm text-slate-400">Neutral</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">😟</div>
              <div className="text-2xl font-bold text-red-400">{summary.negative_msgs}</div>
              <div className="text-sm text-slate-400">Negative</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;