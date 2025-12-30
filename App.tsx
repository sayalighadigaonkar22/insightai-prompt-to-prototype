
import React, { useState, useRef, useMemo } from 'react';
import { Header, Sidebar } from './components/Layout';
import { LanguageSelector } from './components/LanguageSelector';
import { InsightCard } from './components/InsightCard';
import { generateInsight } from './services/geminiService';
import { Language, InsightResponse, HistoryItem, AppTab, ContextType } from './services/types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Analyzer state
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState<Language>(Language.ENGLISH);
  const [contextType, setContextType] = useState<ContextType>('General');
  const [isLoading, setIsLoading] = useState(false);
  const [currentInsight, setCurrentInsight] = useState<InsightResponse | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stats = useMemo(() => {
    return {
      personal: history.filter(h => h.response.context === 'Personal').length,
      career: history.filter(h => h.response.context === 'Career').length,
      business: history.filter(h => h.response.context === 'Business').length,
    };
  }, [history]);

  const triggerAnalysis = async (customInput?: string, customContext?: ContextType) => {
    const textToUse = customInput || input;
    if (!textToUse.trim() && !imagePreview) return;
    
    setActiveTab('analyze');
    setIsLoading(true);
    setError(null);
    setCurrentInsight(null);

    try {
      const base64Image = imagePreview?.split(',')[1];
      const result = await generateInsight(textToUse, language, base64Image);
      setCurrentInsight(result);
      
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        input: textToUse || "Document Analysis",
        language,
        response: result
      };
      setHistory(prev => [newHistoryItem, ...prev.slice(0, 19)]);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (text: string, context: ContextType) => {
    setInput(text);
    setContextType(context);
    triggerAnalysis(text, context);
  };

  const navigateToContext = (context: ContextType) => {
    setContextType(context);
    setActiveTab('analyze');
    clearInput();
  };

  const clearInput = () => {
    setInput('');
    setImagePreview(null);
    setCurrentInsight(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const renderDashboard = () => (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 opacity-10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="relative z-10">
          <h2 className="text-4xl font-extrabold mb-3">Welcome to InsightAI</h2>
          <p className="opacity-80 max-w-xl text-lg leading-relaxed font-light">
            Your personal hub for career growth, business strategy, and personal document management. 
            How can we assist you today?
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button 
          onClick={() => navigateToContext('Personal')}
          className="bg-white p-7 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4 hover:border-amber-400 hover:shadow-xl transition-all text-left group"
        >
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📄</div>
          <div>
            <div className="text-3xl font-black text-slate-800">{stats.personal}</div>
            <div className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Personal Documents</div>
            <p className="text-xs text-slate-400 mt-2">Manage bank notices, KYC, and government forms.</p>
          </div>
        </button>

        <button 
          onClick={() => navigateToContext('Career')}
          className="bg-white p-7 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4 hover:border-emerald-400 hover:shadow-xl transition-all text-left group"
        >
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🌱</div>
          <div>
            <div className="text-3xl font-black text-slate-800">{stats.career}</div>
            <div className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Career / Skills</div>
            <p className="text-xs text-slate-400 mt-2">Analyze resumes, job posts, and skill development.</p>
          </div>
        </button>

        <button 
          onClick={() => navigateToContext('Business')}
          className="bg-white p-7 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4 hover:border-blue-400 hover:shadow-xl transition-all text-left group"
        >
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">💡</div>
          <div>
            <div className="text-3xl font-black text-slate-800">{stats.business}</div>
            <div className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Business Actions</div>
            <p className="text-xs text-slate-400 mt-2">Strategic advice for negotiations and business risks.</p>
          </div>
        </button>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-800">Quick Test Scenarios</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <button 
            onClick={() => handleQuickAction("Bank account will be frozen if KYC not submitted by month end.", "Personal")}
            className="p-6 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 hover:shadow-lg transition-all text-left border-l-4 border-l-amber-500"
          >
            <div className="text-3xl mb-3">🏦</div>
            <div className="font-bold text-slate-800">Bank Notice</div>
          </button>
          <button 
            onClick={() => handleQuickAction("Applying for a Senior role with 5 years experience in React.", "Career")}
            className="p-6 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 hover:shadow-lg transition-all text-left border-l-4 border-l-emerald-500"
          >
            <div className="text-3xl mb-3">📄</div>
            <div className="font-bold text-slate-800">Resume Analysis</div>
          </button>
          <button 
            onClick={() => handleQuickAction("Client wants a 30% discount on a contract. How to respond?", "Business")}
            className="p-6 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 hover:shadow-lg transition-all text-left border-l-4 border-l-blue-500"
          >
            <div className="text-3xl mb-3">🤝</div>
            <div className="font-bold text-slate-800">Negotiation Strategy</div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderAnalyze = () => (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <div className="flex flex-wrap gap-6 mb-8">
          <div className="flex-1 min-w-[240px]">
            <label className="block text-xs font-black text-blue-600 uppercase mb-3 tracking-widest">Context</label>
            <select 
              value={contextType}
              onChange={(e) => setContextType(e.target.value as ContextType)}
              className="w-full bg-blue-50 border-2 border-blue-400 rounded-2xl p-4 text-sm font-bold text-blue-900 outline-none"
            >
              <option value="Personal">📄 Personal</option>
              <option value="Career">🌱 Career</option>
              <option value="Business">💡 Business</option>
              <option value="General">🔍 General</option>
            </select>
          </div>
          <div className="flex-1 min-w-[240px]">
            <label className="block text-xs font-black text-slate-400 uppercase mb-3 tracking-widest">Language</label>
            <LanguageSelector selected={language} onSelect={setLanguage} />
          </div>
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your situation or document here..."
          className="w-full min-h-[220px] p-6 text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all resize-none shadow-inner"
        />

        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-100">
          <button onClick={clearInput} className="px-8 py-3 text-slate-500 font-bold">Reset</button>
          <button
            onClick={() => triggerAnalysis()}
            disabled={isLoading || (!input.trim() && !imagePreview)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-2xl font-bold disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Analyze'}
          </button>
        </div>
      </section>

      {error && <div className="p-6 bg-red-50 text-red-700 rounded-2xl">{error}</div>}
      {currentInsight && <InsightCard insight={currentInsight} />}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Inter']">
      <Header setActiveTab={setActiveTab} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          collapsed={sidebarCollapsed} 
          setCollapsed={setSidebarCollapsed} 
        />
        <main className="flex-1 p-6 md:p-12 max-w-7xl mx-auto w-full overflow-y-auto">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'analyze' && renderAnalyze()}
          {activeTab === 'history' && (
            <div className="space-y-6">
               <h3 className="text-2xl font-bold">History</h3>
               {history.map(item => (
                 <div key={item.id} className="p-6 bg-white border rounded-2xl flex justify-between items-center">
                    <div>
                      <div className="text-xs font-bold text-blue-600 uppercase mb-1">{item.response.context}</div>
                      <div className="font-bold">{item.input}</div>
                    </div>
                    <button onClick={() => { setCurrentInsight(item.response); setActiveTab('analyze'); }} className="text-blue-600 font-bold">View</button>
                 </div>
               ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;