import React from 'react';
import { Book, Code, Terminal, Zap, Info, ShieldCheck, Download } from 'lucide-react';

const DocumentationPage = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-purple-600 text-[10px] font-black uppercase tracking-wider">
          <Book size={12} fill="currentColor" />
          Guides
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Documentation</h1>
        <p className="text-slate-500 font-medium text-lg leading-relaxed">
          Welcome to the ExtensionAI documentation. Here you'll find everything you need to build, test, and deploy your AI-generated Chrome extensions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <section className="space-y-6">
          <div className="flex items-center gap-3 text-indigo-600 font-bold">
            <Zap size={24} />
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Getting Started</h2>
          </div>
          <div className="space-y-4">
            <div className="glass-card p-6 bg-white/50 space-y-3">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 bg-indigo-600 text-white text-[10px] rounded-full flex items-center justify-center font-black">1</span>
                Describe your Idea
              </h3>
              <p className="text-sm text-slate-500 font-medium">Use natural language to tell the AI what functionality you want in your extension. Be as specific as possible.</p>
            </div>
            <div className="glass-card p-6 bg-white/50 space-y-3">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 bg-indigo-600 text-white text-[10px] rounded-full flex items-center justify-center font-black">2</span>
                Generate & Preview
              </h3>
              <p className="text-sm text-slate-500 font-medium">Click Generate and wait for the AI to orchestrate the code. You can preview the generated files directly in the dashboard.</p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3 text-purple-600 font-bold">
            <Download size={24} />
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Installation</h2>
          </div>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            Follow these steps to load your generated ZIP file into Chrome:
          </p>
          <ol className="space-y-4 text-sm text-slate-700 font-bold">
             <li className="flex items-start gap-3">
                <span className="w-5 h-5 bg-purple-100 text-purple-600 rounded-md flex items-center justify-center shrink-0">•</span>
                Navigate to <code className="bg-slate-100 px-2 py-0.5 rounded text-indigo-600">chrome://extensions</code>
             </li>
             <li className="flex items-start gap-3">
                <span className="w-5 h-5 bg-purple-100 text-purple-600 rounded-md flex items-center justify-center shrink-0">•</span>
                Enable <strong>Developer Mode</strong> (top right toggle).
             </li>
             <li className="flex items-start gap-3">
                <span className="w-5 h-5 bg-purple-100 text-purple-600 rounded-md flex items-center justify-center shrink-0">•</span>
                Unzip your extension and click <strong>Load unpacked</strong>.
             </li>
          </ol>
        </section>
      </div>

      <div className="glass-card p-8 bg-slate-900 text-indigo-100 space-y-6 overflow-hidden relative">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-indigo-400" />
          <h2 className="text-xl font-bold text-white tracking-tight">Privacy & Security</h2>
        </div>
        <p className="text-sm font-medium leading-relaxed opacity-80 relative z-10">
          ExtensionAI generates Manifest V3 compliant code. This ensures your extension uses the latest security features like service workers and restricted API access. We never generate code that uses unsafe practices like <code>eval()</code> or remote script injection.
        </p>
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[60px] rounded-full" />
      </div>
    </div>
  );
};

export default DocumentationPage;
