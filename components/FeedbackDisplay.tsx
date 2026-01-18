import React, { useState } from 'react';
import { PromptAnalysis, Segment } from '../types';
import { AlertCircle, CheckCircle, Wand2, Copy, Check, FileJson, Loader2, AlignLeft } from 'lucide-react';
import ScoreGauge from './ScoreGauge';
import { getStructuredJsonPrompt } from '../services/geminiService';

interface FeedbackDisplayProps {
  analysis: PromptAnalysis;
}

const SegmentText: React.FC<{ segment: Segment; isOriginal: boolean }> = ({ segment, isOriginal }) => {
  const { text, type, reason } = segment;

  if (type === 'neutral') {
    return <span className="text-slate-300">{text}</span>;
  }

  if (isOriginal && type === 'bad') {
    return (
      <span className="group relative inline-block cursor-help bg-red-500/10 text-red-400 border-b-2 border-red-500/30 hover:bg-red-500/20 transition-colors rounded px-0.5 mx-0.5">
        {text}
        {reason && (
          <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] rounded bg-slate-800 p-2 text-xs text-white opacity-0 shadow-xl group-hover:opacity-100 z-10 transition-opacity border border-slate-700">
            {reason}
            <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-slate-800"></span>
          </span>
        )}
      </span>
    );
  }

  if (!isOriginal && type === 'good') {
    return (
      <span className="group relative inline-block cursor-help bg-emerald-500/10 text-emerald-400 border-b-2 border-emerald-500/30 hover:bg-emerald-500/20 transition-colors rounded px-0.5 mx-0.5">
        {text}
        {reason && (
          <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] rounded bg-slate-800 p-2 text-xs text-white opacity-0 shadow-xl group-hover:opacity-100 z-10 transition-opacity border border-slate-700">
            {reason}
            <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-slate-800"></span>
          </span>
        )}
      </span>
    );
  }

  return <span>{text}</span>;
};

const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({ analysis }) => {
  const [copied, setCopied] = useState(false);
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonContent, setJsonContent] = useState<string | null>(null);
  const [loadingJson, setLoadingJson] = useState(false);

  const getFullImprovedText = () => analysis.improvedSegments.map(s => s.text).join('');

  const handleCopy = () => {
    const textToCopy = jsonMode && jsonContent ? jsonContent : getFullImprovedText();
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJsonToggle = async () => {
    if (jsonMode) {
      setJsonMode(false);
      return;
    }

    if (jsonContent) {
      setJsonMode(true);
      return;
    }

    setLoadingJson(true);
    try {
      const fullText = getFullImprovedText();
      const json = await getStructuredJsonPrompt(fullText);
      // Format it nicely
      const parsed = JSON.parse(json);
      setJsonContent(JSON.stringify(parsed, null, 2));
      setJsonMode(true);
    } catch (e) {
      console.error("Failed to convert to JSON", e);
    } finally {
      setLoadingJson(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Top Section: Score & Summary */}
      <div className="bg-slate-800/50 rounded-3xl p-6 md:p-8 border border-slate-700 shadow-2xl backdrop-blur-sm flex flex-col md:flex-row items-center gap-8">
        <ScoreGauge score={analysis.score} />
        <div className="flex-1 space-y-3 text-center md:text-left">
          <h2 className="text-2xl font-bold text-white flex items-center justify-center md:justify-start gap-2">
            Analysis Result
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed">
            {analysis.summary}
          </p>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Original Prompt Card */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden flex flex-col h-full shadow-lg">
          <div className="bg-red-500/10 border-b border-red-500/20 p-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <h3 className="font-semibold text-red-100">Original Prompt</h3>
          </div>
          <div className="p-6 text-slate-300 leading-relaxed text-lg font-mono">
            {analysis.originalSegments.map((seg, i) => (
              <SegmentText key={i} segment={seg} isOriginal={true} />
            ))}
          </div>
          <div className="mt-auto p-4 bg-slate-900/30 text-sm text-slate-400 border-t border-slate-700/50">
            * Hover over red text to see issues
          </div>
        </div>

        {/* Improved Prompt Card */}
        <div className="bg-slate-800/50 rounded-2xl border border-emerald-500/30 overflow-hidden flex flex-col h-full shadow-lg relative transition-all duration-300">
           <div className="bg-emerald-500/10 border-b border-emerald-500/20 p-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-emerald-400" />
              <h3 className="font-semibold text-emerald-100">Optimized Prompt</h3>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={handleJsonToggle}
                disabled={loadingJson}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  jsonMode 
                    ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30' 
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                }`}
                title={jsonMode ? "View as Text" : "View as JSON"}
              >
                {loadingJson ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : jsonMode ? (
                  <AlignLeft className="w-3.5 h-3.5" />
                ) : (
                  <FileJson className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">{jsonMode ? 'Text' : 'JSON'}</span>
              </button>

              <button 
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-medium transition-colors"
                title="Copy to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
          
          <div className="p-6 text-slate-300 leading-relaxed text-lg font-mono relative min-h-[200px]">
            {jsonMode && jsonContent ? (
              <pre className="text-sm text-purple-300 font-mono whitespace-pre-wrap animate-in fade-in duration-300 overflow-x-auto">
                {jsonContent}
              </pre>
            ) : (
              <div className="animate-in fade-in duration-300">
                {analysis.improvedSegments.map((seg, i) => (
                  <SegmentText key={i} segment={seg} isOriginal={false} />
                ))}
              </div>
            )}
          </div>

           <div className="mt-auto p-4 bg-slate-900/30 text-sm text-slate-400 border-t border-slate-700/50 flex justify-between">
            <span>
              {jsonMode ? '* Structured format for advanced usage' : '* Green text highlights improvements'}
            </span>
          </div>
        </div>
      </div>

      {/* Actionable Tips */}
      <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-blue-400" />
          Key Improvements
        </h3>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {analysis.tips.map((tip, idx) => (
            <li key={idx} className="bg-slate-800 p-4 rounded-xl border border-slate-700/50 text-slate-300 shadow-sm flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold border border-blue-500/30">
                {idx + 1}
              </span>
              <span className="text-sm">{tip}</span>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
};

export default FeedbackDisplay;