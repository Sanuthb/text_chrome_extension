import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children, user, history, onSelectChat, activeChatId, onLogout, loadingHistory }) => {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        history={history} 
        onSelectChat={onSelectChat} 
        activeChatId={activeChatId}
        loading={loadingHistory}
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 relative overflow-hidden">
        <Navbar user={user} onLogout={onLogout} />
        
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-5xl mx-auto h-full">
            {children}
          </div>
        </main>

        {/* Decorative Background Elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-200/20 blur-[120px] rounded-full -z-10 animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-purple-200/20 blur-[100px] rounded-full -z-10" />
      </div>
    </div>
  );
};

export default Layout;
