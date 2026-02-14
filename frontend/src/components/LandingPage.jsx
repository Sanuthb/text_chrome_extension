import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Sparkles, Code, Download, Shield, Layout, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Zap size={24} fill="currentColor" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">ExtensionAI</span>
          </div>
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-500">
              <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How it works</a>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors px-4 py-2">
                Sign In
              </Link>
              <Link to="/register" className="bg-indigo-600 text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/25 active:scale-95">
                Join Now
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 px-6">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-bold mb-8">
              <Sparkles size={16} />
              AI-Powered Extension Builder
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 tracking-tight leading-[0.9] mb-8">
              Turn your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">ideas</span> into <br />
              Chrome extensions.
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-12 font-medium">
              Describe what you want to build in plain English, and our AI will generate a ready-to-load Manifest V3 extension in seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="w-full sm:w-auto bg-indigo-600 text-white text-lg font-bold px-10 py-5 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-3 active:scale-95 group">
                Build your first extension <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#how-it-works" className="w-full sm:w-auto bg-white text-slate-900 border border-slate-200 text-lg font-bold px-10 py-5 rounded-2xl hover:bg-slate-50 transition-all active:scale-95">
                View Demo
              </a>
            </div>
          </motion.div>
        </div>

        {/* Decorative Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl aspect-square bg-indigo-200/20 blur-[150px] rounded-full -z-10" />
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-white border-y border-slate-200 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">Everything you need.</h2>
            <p className="text-slate-500 font-medium">Built for speed, security, and developer happiness.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Code className="text-indigo-600" size={32} />,
                title: "Manifest V3 Ready",
                desc: "All generated code follows the latest Chrome security standards out of the box."
              },
              {
                icon: <Download className="text-indigo-600" size={32} />,
                title: "Instant Export",
                desc: "Download your extension as a ZIP file, ready to load in developer mode instantly."
              },
              {
                icon: <Shield className="text-indigo-600" size={32} />,
                title: "Secure & Clean",
                desc: "AI ensures no unsafe patterns like eval() or remote script injections are used."
              }
            ].map((f, i) => (
              <div key={i} className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-indigo-100 transition-all group">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-indigo-500/10 transition-all mb-6">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                <p className="text-slate-500 leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 border-t border-slate-200 pt-12">
          <div className="flex items-center gap-2 grayscale brightness-50">
            <Zap size={20} className="text-indigo-600" />
            <span className="font-bold tracking-tight">ExtensionAI</span>
          </div>
          <p className="text-slate-400 text-sm font-medium">
            © 2026 ExtensionAI Platform. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors text-sm font-bold">Twitter</a>
            <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors text-sm font-bold">GitHub</a>
            <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors text-sm font-bold">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
