import React, { useState } from 'react';
import Chat from './Chat';
import Analytics from './Analytics';
import Orders from './Orders';

interface DashboardProps {
  userRole: string;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ userRole, onLogout }) => {
  const [activeTab, setActiveTab] = useState('chat');

  const tabs = [
    { id: 'chat', label: '💬 Chat', icon: '💬' },
    { id: 'orders', label: '📦 Orders', icon: '📦' },
    { id: 'analytics', label: '📊 Analytics', icon: '📊' },
  ];

  const roleColors: any = {
    store_associate: 'bg-green-600',
    fulfillment_manager: 'bg-yellow-600',
    ops_lead: 'bg-purple-600',
    admin: 'bg-red-600',
  };

  const roleLabels: any = {
    store_associate: 'Store Associate',
    fulfillment_manager: 'Fulfillment Manager',
    ops_lead: 'Ops Lead',
    admin: 'Admin',
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-sm">🧠</div>
            <span className="text-white font-bold text-lg">OMS Intelligence v2</span>
          </div>
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${roleColors[userRole] || 'bg-blue-600'}`}>
              {roleLabels[userRole] || userRole}
            </span>
            <button
              onClick={onLogout}
              className="text-slate-400 hover:text-white text-sm transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-6">
        {activeTab === 'chat' && <Chat userRole={userRole} />}
        {activeTab === 'orders' && <Orders />}
        {activeTab === 'analytics' && <Analytics />}
      </main>
    </div>
  );
};

export default Dashboard;