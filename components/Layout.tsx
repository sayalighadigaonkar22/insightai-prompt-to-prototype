
import React from 'react';
import { AppTab } from '../services/types';

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
    <div className="flex items-center gap-3">
      <button 
        onClick={() => setActiveTab('help')}
        className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
      >
        ?
      </button>
      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-400">👤</div>
    </div>
  </header>
);

export const Sidebar: React.FC<NavProps> = ({ activeTab, setActiveTab, collapsed, setCollapsed }) => {
  const items: { id: AppTab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'analyze', label: 'Analyze', icon: '🔍' },
    { id: 'history', label: 'History', icon: '🕒' },
    { id: 'resources', label: 'Resources', icon: '📚' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'help', label: 'Help & FAQ', icon: '❓' },
  ];

  return (
    <aside className={`${collapsed ? 'w-20' : 'w-64'} transition-all duration-300 bg-slate-900 min-h-[calc(100vh-64px)] hidden md:flex flex-col text-slate-300 py-6`}>
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="mx-4 mb-8 p-2 hover:bg-slate-800 rounded-lg self-end text-slate-500 hover:text-white transition-colors"
      >
        {collapsed ? '→' : '←'}
      </button>
      <nav className="flex-1 space-y-1 px-3">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-left ${
              activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'hover:bg-slate-800 text-slate-400 hover:text-slate-100'
            }`}
          >
            <span className="text-xl shrink-0">{item.icon}</span>
            {!collapsed && <span className="font-semibold text-sm truncate">{item.label}</span>}
          </button>
        ))}
      </nav>
      {!collapsed && (
        <div className="px-6 py-4 mt-auto">
          <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700">
            <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Status</div>
            <div className="text-xs font-bold text-slate-100 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              System Active
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
