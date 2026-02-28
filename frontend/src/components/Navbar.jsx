import React from 'react';
import { LogOut, User, Settings, Zap, Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

const Navbar = ({ user, onLogout, toggleSidebar, isSidebarOpen }) => {
  return (
    <nav className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 md:px-6 flex items-center justify-between z-10">
      <div className="flex items-center gap-4">
        <button
           onClick={toggleSidebar}
           className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors hidden md:block"
           title="Toggle Sidebar"
        >
           {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
        </button>
        <button
           onClick={toggleSidebar}
           className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors md:hidden"
           title="Toggle Menu"
        >
           <Menu size={20} />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <Zap size={18} fill="currentColor" />
          </div>
          <span className="font-bold text-slate-900 tracking-tight hidden md:block">ExtensionAI <span className="text-indigo-600">Pro</span></span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-500">
          <a href="#" className="hover:text-indigo-600 transition-colors">Documentation</a>
          <a href="#" className="hover:text-indigo-600 transition-colors">Templates</a>
        </div>
        
        <div className="h-4 w-[1px] bg-slate-200 hidden md:block" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-900">{user?.username}</p>
            <p className="text-[10px] text-green-600 font-medium">Online</p>
          </div>
          <button 
            onClick={onLogout}
            className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-red-600 transition-all active:scale-95 border border-transparent hover:border-red-100"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
