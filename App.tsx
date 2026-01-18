
import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Loader2, History, Settings } from 'lucide-react';
import { analyzePrompt } from './services/geminiService';
import { PromptAnalysis, LoadingState, HistoryItem, AppSettings, AIProvider } from './types';
import FeedbackDisplay from './components/FeedbackDisplay';
import HistorySidebar from './components/HistorySidebar';
import BackgroundAnimation from './components/BackgroundAnimation';
import SettingsModal from './components/SettingsModal';

const DEFAULT_SETTINGS: AppSettings = {
  provider: AIProvider.GOOGLE,
  openAIKey: '',
  claudeKey: '',
  localBaseUrl: 'http://localhost:1234',
  localModelName: 'local-model'
};

const App: React.FC = () => {
  const [inputPrompt, setInputPrompt] = useState('');
  const [analysis, setAnalysis] = useState<PromptAnalysis | null>(null);
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Load data from local storage on mount
  useEffect(() => {
    // Load History
    const savedHistory = localStorage.getItem('promtify_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error("Failed to parse history:", error);
      }
    }

    // Load Settings
    const savedSettings = localStorage.getItem('promtify_settings');
    if (savedSettings) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
      } catch (error) {
        console.error("Failed to parse settings:", error);
      }
    }
  }, []);

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('promtify_settings', JSON.stringify(newSettings));
  };

  const saveToHistory = (prompt: string, result: PromptAnalysis) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      prompt,
      analysis: result
    };
    
    const updatedHistory = [newItem, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('promtify_history', JSON.stringify(updatedHistory));
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('promtify_history');
  };

  const handleSelectHistory = (item: HistoryItem) => {
    setInputPrompt(item.prompt);
    setAnalysis(item.analysis);
    setStatus(LoadingState.SUCCESS);
    setIsHistoryOpen(false);
    setErrorMsg(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim()) return;

    setStatus(LoadingState.LOADING);
    setAnalysis(null);
    setErrorMsg(null);

    try {
      const result = await analyzePrompt(inputPrompt, settings);
      setAnalysis(result);
      setStatus(LoadingState.SUCCESS);
      saveToHistory(inputPrompt, result);
    } catch (error: any) {
      console.error(error);
      setStatus(LoadingState.ERROR);
      setErrorMsg(error.message || "Something went wrong with the AI service. Check your settings and try again.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-slate-950 text-slate-50 selection:bg-purple-500/30 selection:text-purple-200 relative overflow-x-hidden">
      
      {/* Animated Background */}
      <BackgroundAnimation />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => {
            setAnalysis(null);
            setInputPrompt('');
            setStatus(LoadingState.IDLE);
          }}>
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              PROMPTLY
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            <button 
              onClick={() => setIsHistoryOpen(true)}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-slate-800/50"
            >
              <History className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">History</span>
              {history.length > 0 && (
                <span className="bg-slate-700 text-slate-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                  {history.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

      {/* History Sidebar */}
      <HistorySidebar 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        history={history}
        onSelect={handleSelectHistory}
        onClear={handleClearHistory}
      />

      {/* Main Content - Added relative and z-10 to sit above canvas */}
      <main className="pt-24 pb-12 px-4 max-w-7xl mx-auto relative z-10">
        
        {/* Hero Section */}
        <div className={`transition-all duration-700 ease-in-out ${analysis ? 'opacity-0 h-0 overflow-hidden py-0' : 'opacity-100 py-12'}`}>
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-4">
              Master the Art of <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Prompt Engineering</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
              Stop guessing. Get instant feedback on your AI prompts, understand your mistakes in <span className="text-red-400">red</span>, and see improvements in <span className="text-emerald-400">green</span>.
            </p>
          </div>
        </div>

        {/* Input Section - Sticky if results shown, centered if not */}
        <div className={`max-w-3xl mx-auto transition-all duration-500 ${analysis ? 'mb-12' : 'mb-0'}`}>
          <div className="bg-slate-800/80 rounded-2xl p-2 md:p-3 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl">
            <form onSubmit={handleSubmit} className="relative">
              <textarea
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Paste your prompt here (e.g., 'Write a blog about coffee')..."
                className="w-full h-32 md:h-40 bg-transparent text-lg text-white placeholder:text-slate-500 p-4 rounded-xl border-none outline-none resize-none font-mono leading-relaxed focus:ring-0"
              />
              
              <div className="absolute bottom-3 right-3 flex items-center gap-3">
                 <span className="hidden md:block text-xs text-slate-500 font-medium">
                  Ctrl + Enter to analyze
                </span>
                <button
                  type="submit"
                  disabled={status === LoadingState.LOADING || !inputPrompt.trim()}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white transition-all shadow-lg 
                    ${status === LoadingState.LOADING 
                      ? 'bg-slate-700 cursor-not-allowed opacity-80' 
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 hover:shadow-indigo-500/25 active:scale-95'
                    }`}
                >
                  {status === LoadingState.LOADING ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Analyze Prompt
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
          
          {/* Active Provider Badge */}
          <div className="flex justify-center mt-4">
             <span className="text-xs font-medium text-slate-500 bg-slate-900/50 px-3 py-1 rounded-full border border-slate-800">
               Using: <span className="text-slate-300 capitalize">{settings.provider}</span>
             </span>
          </div>
        </div>

        {/* Loading Skeleton or Error */}
        {status === LoadingState.LOADING && !analysis && (
          <div className="max-w-3xl mx-auto mt-12 space-y-8 animate-pulse">
            <div className="h-40 bg-slate-800/50 rounded-3xl"></div>
            <div className="grid grid-cols-2 gap-6">
               <div className="h-64 bg-slate-800/50 rounded-2xl"></div>
               <div className="h-64 bg-slate-800/50 rounded-2xl"></div>
            </div>
          </div>
        )}

        {status === LoadingState.ERROR && errorMsg && (
          <div className="max-w-3xl mx-auto mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center text-red-300">
            {errorMsg}
          </div>
        )}

        {/* Results Section */}
        {analysis && status === LoadingState.SUCCESS && (
          <FeedbackDisplay analysis={analysis} />
        )}
      </main>

       {/* Footer */}
       <footer className="py-8 text-center text-slate-600 text-sm relative z-10">
        <p>© {new Date().getFullYear()} PROMPTLY. Powered by Google Gemini.</p>
      </footer>
    </div>
  );
};

export default App;
