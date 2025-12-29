
import React from 'react';
import { AppTab } from '../types';

interface NavProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

export const Header: React.FC<{ setActiveTab: (t: AppTab) => void }> = ({ setActiveTab }) => (
  <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-50">
    <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
      <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">IA</div>
      <span className="text-xl font-bold text-slate-800 hidden sm:block">InsightAI</span>
    </div>
    <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-500">
      <button onClick={() => setActiveTab('dashboard')} className="hover:text-blue-600">Home</button>
      <span className="text-slate-300">|</span>
      <button onClick={() => setActiveTab('analyze')} className="hover:text-blue-600">Upload</button>
      <span className="text-slate-300">|</span>
      <button onClick={() => setActiveTab('history')} className="hover:text-blue-600">History</button>
      <span className="text-slate-300">|</span>
      <button onClick={() => setActiveTab('resources')} className="hover:text-blue-600">Resources</button>
      <span className="text-slate-300">|</span>
      <button onClick={() => setActiveTab('settings')} className="hover:text-blue-600">Settings</button>
      <span className="text-slate-300">|</span>
      <button onClick={() => setActiveTab('help')} className="hover:text-blue-600">Help</button>
    </nav>
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-400">👤</div>
    </div>
  </header>
);

export const Sidebar: React.FC<NavProps> = ({ activeTab, setActiveTab, collapsed, setCollapsed }) => {
  const items: { id: AppTab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'analyze', label: 'Analyze Document / Situation', icon: '🔍' },
    { id: 'history', label: 'Previous Actions / History', icon: '🕒' },
    { id: 'resources', label: 'Resources & Guides', icon: '📚' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'help', label: 'Help / FAQ', icon: '❓' },
  ];

  return (
    <aside className={`${collapsed ? 'w-20' : 'w-72'} transition-all duration-300 bg-slate-900 min-h-[calc(100vh-64px)] hidden md:flex flex-col text-slate-300 py-6`}>
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="mx-4 mb-8 p-2 hover:bg-slate-800 rounded-lg self-end"
        title={collapsed ? "Expand" : "Collapse"}
      >
        {collapsed ? '→' : '←'}
      </button>
      <nav className="flex-1 space-y-2 px-3">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-colors text-left ${
              activeTab === item.id ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-800'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            {!collapsed && <span className="font-medium text-sm truncate">{item.label}</span>}
          </button>
        ))}
      </nav>
    </aside>
  );
};
