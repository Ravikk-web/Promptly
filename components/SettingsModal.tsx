
import React, { useState, useEffect } from 'react';
import { X, Save, AlertTriangle, Check, Server, Key, Globe, Box } from 'lucide-react';
import { AppSettings, AIProvider } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [activeTab, setActiveTab] = useState<AIProvider>(settings.provider);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
    setActiveTab(settings.provider);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      ...localSettings,
      provider: activeTab
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  const handleInputChange = (key: keyof AppSettings, value: string) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div>
            <h2 className="text-xl font-bold text-white">AI Settings</h2>
            <p className="text-sm text-slate-400">Configure your model provider</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row h-[400px]">
          
          {/* Sidebar Tabs */}
          <div className="w-full md:w-48 bg-slate-950/50 border-r border-slate-800 p-2 space-y-1">
            <button
              onClick={() => setActiveTab(AIProvider.GOOGLE)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === AIProvider.GOOGLE ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            >
              <Globe className="w-4 h-4 text-blue-400" />
              Google Gemini
            </button>
            <button
              onClick={() => setActiveTab(AIProvider.OPENAI)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === AIProvider.OPENAI ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            >
              <Box className="w-4 h-4 text-emerald-400" />
              ChatGPT
            </button>
            <button
              onClick={() => setActiveTab(AIProvider.CLAUDE)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === AIProvider.CLAUDE ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            >
              <Box className="w-4 h-4 text-orange-400" />
              Claude
            </button>
            <button
              onClick={() => setActiveTab(AIProvider.LOCAL)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === AIProvider.LOCAL ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            >
              <Server className="w-4 h-4 text-purple-400" />
              Local / Custom
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-y-auto bg-slate-900">
            
            {activeTab === AIProvider.GOOGLE && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3">
                  <Check className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <div>
                    <h3 className="text-blue-200 font-semibold text-sm">Recommended</h3>
                    <p className="text-blue-300/80 text-xs mt-1">Uses the Google Gemini API optimized for this application.</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    API Key Status
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-500">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-sm">Managed by System Environment</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    The API key is securely injected by the application environment. You do not need to configure this manually.
                  </p>
                </div>
              </div>
            )}

            {activeTab === AIProvider.OPENAI && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    OpenAI API Key
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input 
                      type="password"
                      value={localSettings.openAIKey}
                      onChange={(e) => handleInputChange('openAIKey', e.target.value)}
                      placeholder="sk-..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Keys are stored locally in your browser. Ensure your key has access to GPT-4o or GPT-3.5-Turbo.
                  </p>
                </div>
              </div>
            )}

            {activeTab === AIProvider.CLAUDE && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                  <div>
                    <h3 className="text-orange-200 font-semibold text-sm">CORS Warning</h3>
                    <p className="text-orange-300/80 text-xs mt-1">
                      Direct browser requests to Anthropic often fail due to CORS. You may need a proxy or a browser extension to allow cross-origin requests.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Anthropic API Key
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input 
                      type="password"
                      value={localSettings.claudeKey}
                      onChange={(e) => handleInputChange('claudeKey', e.target.value)}
                      placeholder="sk-ant-..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === AIProvider.LOCAL && (
              <div className="space-y-6 animate-in fade-in duration-300">
                 <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 flex gap-3">
                  <Server className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <div>
                    <h3 className="text-purple-200 font-semibold text-sm">Local / Custom API</h3>
                    <p className="text-purple-300/80 text-xs mt-1">
                      Connect to LM Studio, Ollama, or any OpenAI-compatible endpoint.
                    </p>
                  </div>
                </div>
                
                {/* CORS Hint for Local */}
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 flex gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-yellow-200/90 text-xs">
                    <span className="font-bold block mb-0.5">Connection Error?</span>
                    Ensure your local server (e.g., LM Studio) has <strong>CORS enabled</strong> in its settings to allow requests from the browser.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Base URL
                  </label>
                  <input 
                    type="text"
                    value={localSettings.localBaseUrl}
                    onChange={(e) => handleInputChange('localBaseUrl', e.target.value)}
                    placeholder="http://localhost:1234/v1"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-4 text-sm text-white placeholder:text-slate-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Model Name (Optional)
                  </label>
                  <input 
                    type="text"
                    value={localSettings.localModelName}
                    onChange={(e) => handleInputChange('localModelName', e.target.value)}
                    placeholder="llama-2-7b-chat"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-4 text-sm text-white placeholder:text-slate-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all font-mono"
                  />
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold text-white transition-all shadow-lg ${
              isSaved 
              ? 'bg-emerald-500 hover:bg-emerald-600' 
              : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500'
            }`}
          >
            {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {isSaved ? 'Saved' : 'Save Changes'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;
