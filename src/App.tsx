import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Settings2, 
  FileText, 
  CheckCircle2, 
  Copy, 
  RotateCcw, 
  ArrowRight,
  Loader2,
  BarChart3,
  MessageSquare
} from 'lucide-react';
import { optimizeContent } from './services/gemini';
import { OptimizationSettings, OptimizedContent, OptimizationGoal } from './types';
import { cn } from './utils';
import Markdown from 'react-markdown';

export default function App() {
  const [content, setContent] = useState('');
  const [settings, setSettings] = useState<OptimizationSettings>({
    goal: 'readability',
    targetAudience: 'General Public',
    keywords: '',
    tone: 'Professional & Approachable'
  });
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [result, setResult] = useState<OptimizedContent | null>(null);
  const [copied, setCopied] = useState(false);

  const handleOptimize = async () => {
    if (!content.trim()) return;
    setIsOptimizing(true);
    try {
      const optimized = await optimizeContent(content, settings);
      setResult(optimized);
    } catch (error) {
      console.error('Optimization failed:', error);
      alert('Failed to optimize content. Please check your API key and try again.');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.optimized);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setContent('');
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-slate-900 font-sans selection:bg-indigo-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-semibold text-lg tracking-tight">AI Content Optimizer</h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleReset}
              className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Input & Settings */}
          <div className="lg:col-span-5 space-y-6">
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Source Content</h2>
              </div>
              <div className="p-4">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste your content here (articles, emails, social posts...)"
                  className="w-full h-64 resize-none border-none focus:ring-0 text-slate-700 placeholder:text-slate-300"
                />
                <div className="mt-2 flex justify-between items-center text-[10px] text-slate-400 font-mono uppercase tracking-widest">
                  <span>{content.length} characters</span>
                  <span>{content.split(/\s+/).filter(Boolean).length} words</span>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-slate-400" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Optimization Settings</h2>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Primary Goal</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['readability', 'seo', 'engagement', 'professional', 'concise'] as OptimizationGoal[]).map((goal) => (
                      <button
                        key={goal}
                        onClick={() => setSettings({ ...settings, goal })}
                        className={cn(
                          "px-3 py-2 rounded-xl text-sm font-medium border transition-all text-left",
                          settings.goal === goal 
                            ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm"
                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                        )}
                      >
                        {goal.charAt(0).toUpperCase() + goal.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Target Audience</label>
                    <input
                      type="text"
                      value={settings.targetAudience}
                      onChange={(e) => setSettings({ ...settings, targetAudience: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-sm"
                      placeholder="e.g. Tech-savvy professionals"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Focus Keywords</label>
                    <input
                      type="text"
                      value={settings.keywords}
                      onChange={(e) => setSettings({ ...settings, keywords: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-sm"
                      placeholder="e.g. AI, productivity, workflow"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Desired Tone</label>
                    <input
                      type="text"
                      value={settings.tone}
                      onChange={(e) => setSettings({ ...settings, tone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-sm"
                      placeholder="e.g. Witty, Academic, Urgent"
                    />
                  </div>
                </div>

                <button
                  onClick={handleOptimize}
                  disabled={isOptimizing || !content.trim()}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-2xl font-semibold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 group"
                >
                  {isOptimizing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Optimizing...
                    </>
                  ) : (
                    <>
                      Optimize Content
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </section>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {!result && !isOptimizing ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-3xl border border-dashed border-slate-300"
                >
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <Sparkles className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Ready to Optimize</h3>
                  <p className="text-slate-500 max-w-xs mx-auto">
                    Enter your content and choose your settings to see the magic happen.
                  </p>
                </motion.div>
              ) : isOptimizing ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-200"
                >
                  <div className="relative mb-8">
                    <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                    <Sparkles className="w-8 h-8 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Analyzing & Refining</h3>
                  <p className="text-slate-500 animate-pulse">Gemini is crafting your perfect version...</p>
                </motion.div>
              ) : (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* Main Output */}
                  <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Optimized Result</h2>
                      </div>
                      <button
                        onClick={handleCopy}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all",
                          copied ? "bg-emerald-50 text-emerald-600" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        {copied ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copy Result
                          </>
                        )}
                      </button>
                    </div>
                    <div className="p-8 prose prose-slate max-w-none prose-p:leading-relaxed prose-headings:font-bold">
                      <Markdown>{result?.optimized}</Markdown>
                    </div>
                  </section>

                  {/* Insights & Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <BarChart3 className="w-4 h-4 text-indigo-500" />
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Performance Metrics</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-end">
                          <span className="text-sm text-slate-500">Readability</span>
                          <span className="text-lg font-semibold text-slate-900">{result?.metrics.readabilityScore}</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 w-[85%]" />
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Word Count</div>
                            <div className="text-lg font-bold text-slate-700">
                              {result?.metrics.optimizedWordCount}
                              <span className="text-xs font-normal text-slate-400 ml-1">
                                ({result?.metrics.optimizedWordCount! > result?.metrics.originalWordCount! ? '+' : ''}{result?.metrics.optimizedWordCount! - result?.metrics.originalWordCount!})
                              </span>
                            </div>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Improvements</div>
                            <div className="text-lg font-bold text-slate-700">{result?.metrics.improvements.length}</div>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <MessageSquare className="w-4 h-4 text-indigo-500" />
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">AI Explanation</h3>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed italic">
                        "{result?.explanation}"
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {result?.metrics.improvements.map((imp, i) => (
                          <span key={i} className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider rounded-md">
                            {imp}
                          </span>
                        ))}
                      </div>
                    </section>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 py-12 border-t border-slate-200 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-xs font-medium">
          <p>© 2024 AI Content Optimizer. Powered by Gemini Flash.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-600 transition-colors">API Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
