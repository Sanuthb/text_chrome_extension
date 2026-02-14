import React from 'react';
import { Sparkles, Layout, Zap, Shield, Globe } from 'lucide-react';

const templates = [
  {
    title: "Dark Mode Toggle",
    description: "Automatically injects a dark theme toggle into any website.",
    category: "Appearance",
    prompt: "Create a dark mode extension that adds a button to the top-right of every page to toggle a dark navy background and white text. Ensure it injects a CSS file or script.",
    icon: <Zap className="text-indigo-600" />
  },
  {
    title: "Tab Manager",
    description: "Organize and group your tabs by domain or search query.",
    category: "Productivity",
    prompt: "Build an extension that lists all open tabs in a popup and allows me to close them or group them by domain in the current window.",
    icon: <Layout className="text-purple-600" />
  },
  {
    title: "Price Tracker",
    description: "Monitors changes in price on e-commerce product pages.",
    category: "Shopping",
    prompt: "Create a price tracker that detects price tags on product pages, and logs them to local storage to show price trends in the popup.",
    icon: <Globe className="text-green-600" />
  },
  {
    title: "Basic Guard",
    description: "Basic blocking for intrusive elements and banners.",
    category: "Utility",
    prompt: "Create a basic blocker extension that hides floating ad containers using common CSS selectors like .ads, #banner, etc.",
    icon: <Shield className="text-red-600" />
  }
];

const TemplatesPage = ({ onSelectTemplate }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-wider">
          <Sparkles size={12} fill="currentColor" />
          Quick Start
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Extension Templates</h1>
        <p className="text-slate-500 font-medium">Get started quickly with these pre-built extension prompts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
        {templates.map((t, i) => (
          <div 
            key={i} 
            className="glass-card p-6 flex flex-col justify-between hover:border-indigo-300 transition-all cursor-pointer group bg-white/50"
            onClick={() => onSelectTemplate(t.prompt)}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  {t.icon}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                  {t.category}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1 tracking-tight">{t.title}</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">{t.description}</p>
              </div>
            </div>
            
            <button className="mt-6 flex items-center gap-2 text-indigo-600 font-bold text-sm hover:underline">
              Use Template <Sparkles size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplatesPage;
