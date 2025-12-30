
import React, { useState, useRef, useMemo } from 'react';
import { Header, Sidebar } from './components/Layout';
import { LanguageSelector } from './components/LanguageSelector';
import { InsightCard } from './components/InsightCard';
import { generateInsight } from './services/geminiService';
import { Language, InsightResponse, HistoryItem, AppTab, ContextType } from './types';

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

  // Derived stats for the summary cards
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
        {/* Personal Card */}
        <button 
          onClick={() => navigateToContext('Personal')}
          className="bg-white p-7 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4 hover:border-amber-400 hover:shadow-xl transition-all text-left group"
        >
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📄</div>
          <div>
            <div className="text-3xl font-black text-slate-800">{stats.personal}</div>
            <div className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Personal Documents Pending</div>
            <p className="text-xs text-slate-400 mt-2">Manage bank notices, KYC, and government forms.</p>
          </div>
        </button>

        {/* Career Card */}
        <button 
          onClick={() => navigateToContext('Career')}
          className="bg-white p-7 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4 hover:border-emerald-400 hover:shadow-xl transition-all text-left group"
        >
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🌱</div>
          <div>
            <div className="text-3xl font-black text-slate-800">{stats.career}</div>
            <div className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Career Opportunities / Skills</div>
            <p className="text-xs text-slate-400 mt-2">Analyze resumes, job posts, and skill development paths.</p>
          </div>
        </button>

        {/* Business Card */}
        <button 
          onClick={() => navigateToContext('Business')}
          className="bg-white p-7 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4 hover:border-blue-400 hover:shadow-xl transition-all text-left group"
        >
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">💡</div>
          <div>
            <div className="text-3xl font-black text-slate-800">{stats.business}</div>
            <div className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Business Actions / Decisions</div>
            <p className="text-xs text-slate-400 mt-2">Strategic advice for negotiations and business risks.</p>
          </div>
        </button>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800">Quick Test Scenarios</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <button 
            onClick={() => handleQuickAction("Bank account will be frozen if KYC not submitted by month end. What should I do?", "Personal")}
            className="p-6 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 hover:shadow-lg transition-all text-left border-l-4 border-l-amber-500"
          >
            <div className="text-3xl mb-3">🏦</div>
            <div className="font-bold text-slate-800">Test Bank Notice</div>
            <div className="text-xs text-slate-500 mt-2 line-clamp-2">"KYC pending status check..."</div>
          </button>
          <button 
            onClick={() => handleQuickAction("Applying for a Senior role with 5 years experience in React. Help me find gaps.", "Career")}
            className="p-6 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 hover:shadow-lg transition-all text-left border-l-4 border-l-emerald-500"
          >
            <div className="text-3xl mb-3">📄</div>
            <div className="font-bold text-slate-800">Test Resume Analysis</div>
            <div className="text-xs text-slate-500 mt-2 line-clamp-2">"Senior React Engineer role optimization..."</div>
          </button>
          <button 
            onClick={() => handleQuickAction("Client wants a 30% discount on a high-value contract. How to respond?", "Business")}
            className="p-6 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 hover:shadow-lg transition-all text-left border-l-4 border-l-blue-500"
          >
            <div className="text-3xl mb-3">🤝</div>
            <div className="font-bold text-slate-800">Test Invoice / Business Action</div>
            <div className="text-xs text-slate-500 mt-2 line-clamp-2">"Strategic negotiation for high-value contract..."</div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderAnalyze = () => (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Analyze Document / Situation</h2>
        <p className="text-slate-500">Select your context and provide the details below.</p>
      </div>

      <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <div className="flex flex-wrap gap-6 mb-8">
          <div className="flex-1 min-w-[240px]">
            <label className="block text-xs font-black text-blue-600 uppercase mb-3 tracking-widest">Input Type / Context</label>
            <div className="relative group">
              <select 
                value={contextType}
                onChange={(e) => setContextType(e.target.value as ContextType)}
                className="w-full bg-blue-50 border-2 border-blue-400 rounded-2xl p-4 pr-12 text-sm font-bold text-blue-900 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all appearance-none cursor-pointer hover:bg-blue-100 shadow-sm"
              >
                <option value="Personal">📄 Personal / Paperwork</option>
                <option value="Career">🌱 Career / Education</option>
                <option value="Business">💡 Business / Work Decisions</option>
                <option value="General">🔍 General Consultation</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-blue-600 group-focus-within:text-blue-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          <div className="flex-1 min-w-[240px]">
            <label className="block text-xs font-black text-slate-400 uppercase mb-3 tracking-widest">Output Language</label>
            <LanguageSelector selected={language} onSelect={setLanguage} />
          </div>
        </div>

        <div className="relative group">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste text, explain your situation, or upload a photo of the document..."
            className="w-full min-h-[220px] p-6 text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all resize-none shadow-inner"
          />
          <div className="absolute bottom-6 right-6 flex gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => setImagePreview(reader.result as string);
                  reader.readAsDataURL(file);
                }
              }}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 text-slate-500 hover:text-blue-600 bg-white shadow-md border border-slate-200 rounded-xl flex items-center gap-2 font-medium transition-all hover:scale-105 active:scale-95"
            >
              <span className="text-xl">📷</span>
              <span className="text-sm">Upload Photo</span>
            </button>
          </div>
        </div>

        {imagePreview && (
          <div className="mt-6 flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200 w-fit">
            <img src={imagePreview} className="w-16 h-16 object-cover rounded-lg border border-slate-300" />
            <div className="text-xs text-slate-500 font-medium">Document attached</div>
            <button onClick={() => setImagePreview(null)} className="p-1 hover:bg-red-50 text-red-500 rounded-full transition-colors">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-100">
          <button onClick={clearInput} className="px-8 py-3 text-slate-500 font-bold hover:text-slate-800 transition-colors">Reset</button>
          <button
            onClick={() => triggerAnalysis()}
            disabled={isLoading || (!input.trim() && !imagePreview)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-2xl font-bold shadow-xl shadow-blue-200 disabled:opacity-50 flex items-center gap-3 transition-all hover:-translate-y-1 active:translate-y-0"
          >
            {isLoading ? (
               <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            {isLoading ? 'Processing Intelligence...' : 'Submit / Analyze'}
          </button>
        </div>
      </section>

      {error && (
        <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-3 font-medium">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error}
        </div>
      )}

      {currentInsight && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800">AI Professional Intelligence</h3>
            <button className="text-sm text-blue-600 font-bold hover:underline">Download Report (PDF)</button>
          </div>
          <InsightCard insight={currentInsight} />
        </div>
      )}
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-slate-800">Previous Actions / History</h3>
          <p className="text-slate-500 text-sm mt-1">Review your past consultations and strategy reports.</p>
        </div>
        <div className="flex gap-4">
           <div className="relative">
             <input type="text" placeholder="Search past advice..." className="bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
             <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
           </div>
           <button onClick={() => setHistory([])} className="text-sm font-bold text-red-400 hover:text-red-600 transition-colors">Clear All</button>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="py-32 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-300">
          <div className="text-6xl mb-6">🏜️</div>
          <h4 className="text-xl font-bold text-slate-800">No records found</h4>
          <p className="text-slate-400 mt-2">Start your first analysis to see history here.</p>
          <button onClick={() => setActiveTab('analyze')} className="mt-6 bg-slate-900 text-white px-6 py-2 rounded-xl font-bold">New Analysis</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {history.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-lg transition-all group border-l-8 border-l-blue-600">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-full uppercase tracking-tighter">{item.response.context}</span>
                  <span className="text-xs text-slate-400 font-medium">🕒 {new Date(item.timestamp).toLocaleString()}</span>
                </div>
                <h4 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">{item.input}</h4>
              </div>
              <div className="flex items-center gap-3">
                 <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400" title="Download Summary">💾</button>
                 <button 
                  onClick={() => { setCurrentInsight(item.response); setActiveTab('analyze'); }}
                  className="bg-slate-50 text-slate-800 font-bold text-sm px-6 py-2 rounded-xl border border-slate-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderResources = () => (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-slate-800">Resources & Guides</h2>
        <p className="text-slate-500 mt-2">Expert-curated templates, government schemes, and career strategies to help you grow further.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl">🚀</div>
          <h3 className="text-xl font-bold text-slate-800">Career Guidance</h3>
          <ul className="space-y-4">
            {['Resume Building 101', 'Mock Interview Prep', 'Modern Skill Gap Analysis', 'LinkedIn Profile Tuning'].map(guide => (
              <li key={guide} className="p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-blue-300 cursor-pointer flex justify-between items-center transition-all">
                <span className="text-sm font-semibold text-slate-700">{guide}</span>
                <span className="text-blue-500 text-lg">→</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-xl">🏛️</div>
          <h3 className="text-xl font-bold text-slate-800">Govt Schemes</h3>
          <ul className="space-y-4">
            {['Startup India Benefits', 'MSME Loan Programs', 'Educational Grants', 'Health Insurance Schemes'].map(guide => (
              <li key={guide} className="p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-emerald-300 cursor-pointer flex justify-between items-center transition-all">
                <span className="text-sm font-semibold text-slate-700">{guide}</span>
                <span className="text-emerald-500 text-lg">→</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-xl">💼</div>
          <h3 className="text-xl font-bold text-slate-800">Business Tips</h3>
          <ul className="space-y-4">
            {['Partnership Agreement', 'Invoicing Best Practices', 'Vendor Negotiation Script', 'Risk Mitigation Template'].map(guide => (
              <li key={guide} className="p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-amber-300 cursor-pointer flex justify-between items-center transition-all">
                <span className="text-sm font-semibold text-slate-700">{guide}</span>
                <span className="text-amber-500 text-lg">→</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Inter'] selection:bg-blue-100">
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
          {activeTab === 'history' && renderHistory()}
          {activeTab === 'resources' && renderResources()}
          {activeTab === 'settings' && (
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 max-w-2xl animate-in fade-in duration-500">
              <h3 className="text-2xl font-black mb-8">System Settings</h3>
              <div className="space-y-8">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Preferred Analysis Language</label>
                  <LanguageSelector selected={language} onSelect={setLanguage} />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Output Depth</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Concise (Fast, Actionable)</option>
                    <option>Detailed (Comprehensive Explanations)</option>
                  </select>
                </div>
                <div className="pt-6 border-t border-slate-100">
                   <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl text-blue-700">
                      <div className="flex flex-col">
                        <span className="font-bold">Sync History</span>
                        <span className="text-xs opacity-80">Store history across multiple sessions.</span>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5 accent-blue-600" />
                   </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'help' && (
            <div className="space-y-10 animate-in fade-in duration-500 max-w-4xl">
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-slate-800">Help / FAQ</h3>
                <p className="text-slate-500">Everything you need to know about using InsightAI effectively.</p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { q: "How does InsightAI process my data?", a: "We use the Google Gemini 3 Flash engine to interpret your documents. Data is processed temporarily to generate insights and is not used for future model training unless explicitly opted-in." },
                  { q: "What should I include in the Analyze textbox?", a: "The more context, the better. Paste email threads, job descriptions, or explain a complex negotiation. You can also upload a clear photo of physical documents." },
                  { q: "Is the advice legally binding?", a: "Absolutely not. InsightAI provides professional guidance and strategic suggestions. Always consult with a qualified legal or financial expert for formal advice." },
                  { q: "How do the languages work?", a: "InsightAI can translate complex concepts into Hindi and Marathi, ensuring you understand exactly what needs to be done in your primary language." }
                ].map((faq, i) => (
                  <details key={i} className="bg-white border border-slate-200 rounded-2xl p-6 cursor-pointer group transition-all hover:border-blue-200">
                    <summary className="font-bold text-slate-800 group-hover:text-blue-600 flex justify-between items-center text-lg">
                      {faq.q}
                      <span className="text-slate-300 group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <p className="mt-4 text-slate-600 leading-relaxed text-sm font-medium bg-slate-50 p-4 rounded-xl">{faq.a}</p>
                  </details>
                ))}
              </div>
              <div className="bg-slate-900 text-white p-10 rounded-3xl flex flex-col md:flex-row items-center gap-8 justify-between">
                 <div>
                    <h4 className="text-xl font-bold mb-2">Still have questions?</h4>
                    <p className="opacity-70 text-sm">Our support team is ready to help you with platform issues.</p>
                 </div>
                 <button className="bg-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-blue-500 transition-colors">Contact Support</button>
              </div>
            </div>
          )}
        </main>
      </div>
      <footer className="bg-white border-t border-slate-200 py-6 px-12 text-center text-xs text-slate-400 font-medium">
        <div className="flex flex-wrap justify-center gap-8 mb-4">
          <a href="#" className="hover:text-blue-500 transition-colors uppercase tracking-widest">Privacy Policy</a>
          <a href="#" className="hover:text-blue-500 transition-colors uppercase tracking-widest">Terms of Use</a>
          <a href="#" className="hover:text-blue-500 transition-colors uppercase tracking-widest">Contact</a>
          <a href="#" className="hover:text-blue-500 transition-colors uppercase tracking-widest">About InsightAI</a>
        </div>
        <p className="opacity-60 italic">Empowering your professional journey through intelligent insight. © {new Date().getFullYear()} InsightAI.</p>
      </footer>
    </div>
  );
};

export default App;
