import React from 'react';
import { X, Clock, MessageSquare, Trash2, ChevronRight } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ isOpen, onClose, history, onSelect, onClear }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
          onClick={onClose} 
        />
        
        {/* Sidebar */}
        <div className="relative w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-400" />
                    History
                </h2>
                <div className="flex items-center gap-2">
                    {history.length > 0 && (
                         <button 
                            onClick={(e) => {
                              if(confirm('Are you sure you want to clear all history?')) onClear();
                            }}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Clear History"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    )}
                   
                    <button 
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                        <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                        <p className="font-medium">No history yet</p>
                        <p className="text-sm">Analyze a prompt to save it here.</p>
                    </div>
                ) : (
                    history.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onSelect(item)}
                            className="w-full text-left bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-purple-500/30 rounded-xl p-4 transition-all group relative overflow-hidden"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                                    item.analysis.score >= 80 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                    item.analysis.score >= 50 ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                    'bg-red-500/10 text-red-400 border-red-500/20'
                                }`}>
                                    Score: {item.analysis.score}
                                </span>
                                <span className="text-xs text-slate-500">
                                    {new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div className="flex justify-between items-end gap-2">
                              <p className="text-sm text-slate-300 line-clamp-2 group-hover:text-white transition-colors flex-1">
                                  {item.prompt}
                              </p>
                              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-purple-400 transition-colors transform group-hover:translate-x-1" />
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    </div>
  );
};

export default HistorySidebar;