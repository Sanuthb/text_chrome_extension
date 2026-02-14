import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, Plus, Search, Loader2, User, LogOut, Settings, Zap, Book, Globe } from 'lucide-react';

const Sidebar = ({ history, onSelectChat, activeChatId, loading, user, onLogout }) => {
  const navigate = useNavigate();
  const username = user?.profile?.username || user?.email?.split('@')[0] || 'User';
  const initials = username.substring(0, 2).toUpperCase();

  return (
    <div className="w-80 h-screen flex flex-col bg-white/70 border-r border-slate-200 backdrop-blur-md relative z-[50]">
      {/* Header */}
      <div className="p-6">
        <div 
          onClick={() => {
            onSelectChat(null);
            navigate('/dashboard');
          }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform">
            <Zap fill="white" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Extension<span className="text-indigo-600">AI</span></h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Build in seconds</p>
          </div>
        </div>
      </div>

      {/* Search & History omitted for brevity, but kept in full file */}
      <div className="px-6 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search history..." 
            className="w-full bg-white/50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-2">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
          Platform
        </div>
        <Link 
          to="/dashboard/gallery"
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/60 text-slate-600 hover:text-slate-900 transition-all font-medium"
        >
          <Globe size={18} className="text-blue-500" />
          Community Gallery
        </Link>
        <Link 
          to="/dashboard/templates"
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/60 text-slate-600 hover:text-slate-900 transition-all font-medium"
        >
          <Zap size={18} className="text-amber-500" />
          Templates
        </Link>
        <Link 
          to="/dashboard/docs"
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/60 text-slate-600 hover:text-slate-900 transition-all font-medium"
        >
          <Book className="text-emerald-500" size={18} />
          Documentation
        </Link>

        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 mt-6">
          Recent Projects
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Loader2 className="animate-spin mb-2" size={24} />
            <span className="text-sm">Loading history...</span>
          </div>
        ) : history.length === 0 ? (
          <div className="px-3 py-8 text-center bg-white/30 rounded-xl border border-dashed border-slate-200">
            <p className="text-sm text-slate-400">No projects yet. Start by creating one!</p>
          </div>
        ) : (
          history.map((chat) => (
            <div 
              key={chat.id}
              onClick={() => {
                onSelectChat(chat);
                navigate('/dashboard');
              }}
              className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
                activeChatId === chat.id 
                  ? 'bg-indigo-50 text-indigo-900 border border-indigo-100 shadow-sm' 
                  : 'hover:bg-white/60 text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare size={18} className={activeChatId === chat.id ? 'text-indigo-600' : 'text-slate-400'} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{chat.title}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {new Date(chat.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-200/50 bg-white/30 space-y-2">
        <Link 
          to="/dashboard/profile"
          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/60 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:scale-105 transition-transform">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-700 truncate">{username}</p>
            <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">View Profile</p>
          </div>
          <Settings size={18} className="text-slate-400 group-hover:rotate-45 transition-transform" />
        </Link>
        
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all text-sm font-bold group"
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
