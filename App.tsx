
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Header, Sidebar } from './components/Layout';
import { LanguageSelector } from './components/LanguageSelector';
import { InsightCard } from './components/InsightCard';
import { generateInsight } from './services/geminiService';
import { Language, InsightResponse, HistoryItem, AppTab, ContextType } from './services/types';

/**
 * Define AIStudio interface to match the environment's expected type.
 * This resolves the "Subsequent property declarations must have the same type" error.
 */
interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

// Extend Window interface for aistudio tools with the correct modifiers and type name
declare global {
  interface Window {
    readonly aistudio: AIStudio;
  }
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [hasCheckedKey, setHasCheckedKey] = useState(false);
  const [isKeySelected, setIsKeySelected] = useState(false);
  
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

  // Check for API key on mount
  useEffect(() => {
    const checkKey = async () => {
      // First check if process.env.API_KEY is already available (e.g. from build injection)
      if (process.env.API_KEY && process.env.API_KEY !== 'undefined') {
        setIsKeySelected(true);
        setHasCheckedKey(true);
        return;
      }

      // Otherwise, check if a key has been selected via the AI Studio dialog
      try {
        if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
          const selected = await window.aistudio.hasSelectedApiKey();
          setIsKeySelected(selected);
        }
      } catch (e) {
        console.warn("AI Studio key check failed", e);
      } finally {
        setHasCheckedKey(true);
      }
    };
    checkKey();
  }, []);

  const handleOpenKeySelector = async () => {
    try {
      if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
        await window.aistudio.openSelectKey();
        // Per instructions: assume success after triggering the dialog to avoid race conditions
        setIsKeySelected(true);
      } else {
        setError("API Key Selection is not supported in this environment. Please set the API_KEY environment variable.");
      }
    } catch (e) {
      setError("Failed to open the API key selector.");
    }
  };

  const stats = useMemo(() => ({
    personal: history.filter(h => h.response.context === 'Personal').length,
    career: history.filter(h => h.response.context === 'Career').length,
    business: history.filter(h => h.response.context === 'Business').length,
  }), [history]);

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
      const errMsg = err.message || 'An unexpected error occurred.';
      setError(errMsg);
      
      // Per instructions: reset key selection if entity not found
      if (errMsg.includes("Requested entity was not found")) {
        setIsKeySelected(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (text: string, context: ContextType) => {
    setInput(text);
    setContextType(context);
    triggerAnalysis(text, context);
  };

  const clearInput = () => {
    setInput('');
    setImagePreview(null);
    setCurrentInsight(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Setup Screen if key is missing
  if (hasCheckedKey && !isKeySelected) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 text-center border border-slate-100">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-8 shadow-lg shadow-blue-200">IA</div>
          <h1 className="text-3xl font-black text-slate-800 mb-4">Connect InsightAI</h1>
          <p className="text-slate-500 mb-8 leading-relaxed">
            To generate professional insights, you must connect a valid Gemini API key. 
            Please use a key from a paid Google Cloud Project.
          </p>
          <button 
            onClick={handleOpenKeySelector}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-xl shadow-blue-100 active:scale-95 mb-4"
          >
            Connect API Key
          </button>
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-blue-600 font-semibold hover:underline"
          >
            Learn more about billing & keys
          </a>
          {error && <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl text-xs font-medium border border-red-100">{error}</div>}
        </div>
      </div>
    );
  }

  const renderDashboard = () => (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 opacity-10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="relative z-10">
          <h2 className="text-4xl font-extrabold mb-3 text-balance">Professional Intelligence. Simplified.</h2>
          <p className="opacity-80 max-w-xl text-lg leading-relaxed font-light">
            AI-powered insights for personal paperwork, career trajectories, and business strategy.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { id: 'Personal', label: 'Personal Papers', icon: '📄', count: stats.personal, color: 'hover:border-amber-400', desc: 'Bank notices, KYC, ID forms' },
          { id: 'Career', label: 'Career Growth', icon: '🌱', count: stats.career, color: 'hover:border-emerald-400', desc: 'Resumes, Skill gaps, Interviews' },
          { id: 'Business', label: 'Business Strategy', icon: '💡', count: stats.business, color: 'hover:border-blue-400', desc: 'Negotiations, Invoices, Risk' }
        ].map(item => (
          <button 
            key={item.id}
            onClick={() => { setContextType(item.id as ContextType); setActiveTab('analyze'); clearInput(); }}
            className={`bg-white p-7 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4 ${item.color} hover:shadow-xl transition-all text-left group`}
          >
            <div className="w-14 h-14 bg-slate-50 text-slate-800 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">{item.icon}</div>
            <div>
              <div className="text-3xl font-black text-slate-800">{item.count}</div>
              <div className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">{item.label}</div>
              <p className="text-xs text-slate-400 mt-2">{item.desc}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-800">Quick Test Scenarios</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <button 
            onClick={() => handleQuickAction("Bank notice: KYC pending for account ending in 1234. Needs Aadhaar update.", "Personal")}
            className="p-6 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 hover:shadow-lg transition-all text-left border-l-4 border-l-amber-500"
          >
            <div className="text-2xl mb-2">🏦</div>
            <div className="font-bold text-slate-800">Test Bank Notice</div>
          </button>
          <button 
            onClick={() => handleQuickAction("Reviewing my resume for a Senior DevOps position. I know AWS but not Kubernetes.", "Career")}
            className="p-6 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 hover:shadow-lg transition-all text-left border-l-4 border-l-emerald-500"
          >
            <div className="text-2xl mb-2">💻</div>
            <div className="font-bold text-slate-800">Test Career Gap</div>
          </button>
          <button 
            onClick={() => handleQuickAction("Vendor is asking for a 15% price hike on raw materials. How to negotiate?", "Business")}
            className="p-6 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 hover:shadow-lg transition-all text-left border-l-4 border-l-blue-500"
          >
            <div className="text-2xl mb-2">🤝</div>
            <div className="font-bold text-slate-800">Test Business Negotiation</div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderAnalyze = () => (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto pb-20">
      <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <div className="flex flex-wrap gap-6 mb-8">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-black text-blue-600 uppercase mb-3 tracking-widest">Context</label>
            <select 
              value={contextType}
              onChange={(e) => setContextType(e.target.value as ContextType)}
              className="w-full bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 text-sm font-bold text-blue-900 outline-none focus:border-blue-500 transition-colors cursor-pointer"
            >
              <option value="Personal">📄 Personal</option>
              <option value="Career">🌱 Career</option>
              <option value="Business">💡 Business</option>
              <option value="General">🔍 General</option>
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-black text-slate-400 uppercase mb-3 tracking-widest">Language</label>
            <LanguageSelector selected={language} onSelect={setLanguage} />
          </div>
        </div>

        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste document text or describe your situation here..."
            className="w-full min-h-[200px] p-6 text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all resize-none shadow-inner text-lg"
          />
          <div className="absolute bottom-4 right-4">
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setImagePreview(reader.result as string);
                reader.readAsDataURL(file);
              }
            }} />
            <button onClick={() => fileInputRef.current?.click()} className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 text-xl" title="Upload Document Photo">📷</button>
          </div>
        </div>

        {imagePreview && (
          <div className="mt-4 p-2 bg-slate-100 rounded-xl flex items-center gap-3 w-fit pr-4">
            <img src={imagePreview} className="w-12 h-12 object-cover rounded-lg" />
            <span className="text-xs font-bold text-slate-500">Document Image Attached</span>
            <button onClick={() => setImagePreview(null)} className="text-red-500 font-bold hover:scale-110 transition-transform">✕</button>
          </div>
        )}

        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-100">
          <button onClick={clearInput} className="px-8 py-3 text-slate-500 font-bold hover:text-slate-800">Reset</button>
          <button
            onClick={() => triggerAnalysis()}
            disabled={isLoading || (!input.trim() && !imagePreview)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-2xl font-bold disabled:opacity-50 shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
          >
            {isLoading ? 'Thinking...' : 'Analyze Now'}
          </button>
        </div>
      </section>

      {error && <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl font-medium animate-shake">⚠️ {error}</div>}
      {currentInsight && <InsightCard insight={currentInsight} />}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Inter']">
      {!hasCheckedKey && (
        <div className="fixed inset-0 bg-white z-[100] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      )}
      
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
              {history.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed text-slate-400">No records found.</div>
              ) : (
                history.map(item => (
                  <div key={item.id} className="p-6 bg-white border border-slate-200 rounded-2xl flex justify-between items-center">
                    <div>
                      <div className="text-[10px] font-black text-blue-600 uppercase mb-1">{item.response.context}</div>
                      <div className="font-bold text-slate-800">{item.input}</div>
                    </div>
                    <button onClick={() => { setCurrentInsight(item.response); setActiveTab('analyze'); }} className="bg-slate-50 px-6 py-2 rounded-xl text-blue-600 font-bold text-sm">Review</button>
                  </div>
                ))
              )}
            </div>
          )}
          {activeTab === 'resources' && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
                <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <div className="text-3xl">📘</div>
                  <h4 className="text-xl font-bold text-slate-800">Govt Scheme Guide</h4>
                  <p className="text-slate-500 text-sm">Understand MSME, Aadhaar updates, and insurance policies.</p>
                </div>
                <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <div className="text-3xl">👔</div>
                  <h4 className="text-xl font-bold text-slate-800">Career Templates</h4>
                  <p className="text-slate-500 text-sm">Download high-impact resumes and email scripts.</p>
                </div>
             </div>
          )}
          {activeTab === 'settings' && (
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 max-w-xl">
              <h3 className="text-2xl font-black mb-8">Settings</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Primary Language</label>
                  <LanguageSelector selected={language} onSelect={setLanguage} />
                </div>
                <div className="pt-6 border-t border-slate-100 flex flex-col gap-4">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">API Connection</label>
                  <button 
                    onClick={handleOpenKeySelector}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-xl transition-all text-sm"
                  >
                    Reconnect API Key
                  </button>
                  <p className="text-xs text-slate-400">Application Version 1.1.0</p>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'help' && (
            <div className="space-y-6 max-w-3xl">
              <h3 className="text-3xl font-black mb-8">Help Center</h3>
              <details className="p-6 bg-white border rounded-2xl group cursor-pointer" open>
                <summary className="font-bold text-slate-800 flex justify-between">How do I analyze a document? <span className="text-slate-300">▼</span></summary>
                <p className="mt-4 text-slate-500">Go to 'Analyze', choose your context (e.g., Personal), and paste the text or upload a photo of the document.</p>
              </details>
              <details className="p-6 bg-white border rounded-2xl group cursor-pointer">
                <summary className="font-bold text-slate-800 flex justify-between">What is 'Understand, Grow, Act'? <span className="text-slate-300">▼</span></summary>
                <p className="mt-4 text-slate-500">It is our framework for analysis. We help you <b>Understand</b> the current facts, identify how you can <b>Grow</b> or improve your situation, and provide clear steps to <b>Act</b>.</p>
              </details>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
