
import React from 'react';
import { InsightResponse } from '../services/types';

interface InsightCardProps {
  insight: InsightResponse;
}

const Section: React.FC<{ title: string; content: string; icon: string; color: string }> = ({ 
  title, content, icon, color 
}) => (
  <div className={`flex flex-col h-full bg-white rounded-xl shadow-sm border-t-4 ${color} p-6 transition-transform hover:scale-[1.01]`}>
    <div className="flex items-center gap-3 mb-4">
      <span className="text-2xl">{icon}</span>
      <h3 className="font-bold text-gray-800 uppercase tracking-wider">{title}</h3>
    </div>
    <div className="text-gray-600 leading-relaxed whitespace-pre-wrap">
      {content}
    </div>
  </div>
);

export const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2">
        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase">
          {insight.context}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Section 
          title="Understand" 
          icon="🔍" 
          color="border-blue-500" 
          content={insight.understand} 
        />
        <Section 
          title="Grow" 
          icon="📈" 
          color="border-emerald-500" 
          content={insight.grow} 
        />
        <Section 
          title="Act" 
          icon="⚡" 
          color="border-amber-500" 
          content={insight.act} 
        />
      </div>
    </div>
  );
};