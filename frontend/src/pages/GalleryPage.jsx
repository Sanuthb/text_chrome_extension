import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Globe, Users, Zap, Search, MessageSquare, Download, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const GalleryPage = ({ onRemix }) => {
  const [publicChats, setPublicChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchGallery = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/chats/gallery');
      setPublicChats(res.data);
    } catch (err) {
      toast.error('Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const filteredChats = publicChats.filter(chat => 
    chat.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    chat.prompt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-indigo-600">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="font-bold">Loading community creations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-wider">
          <Globe size={12} fill="currentColor" />
          Community Hub
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Public Gallery</h1>
        <p className="text-slate-500 font-medium">Explore and remix extensions created by the community.</p>
      </div>

      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Search extensions..."
          className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 outline-none transition-all shadow-sm font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChats.map((chat) => (
          <div key={chat.id} className="glass-card p-6 flex flex-col justify-between hover:border-indigo-300 transition-all bg-white group grayscale hover:grayscale-0">
             <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xs">
                         {chat.title.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 truncate max-w-[150px]">{chat.title}</h3>
                        <p className="text-[10px] text-slate-400 font-bold">by {chat.profiles?.full_name || 'Anonymous'}</p>
                      </div>
                   </div>
                   <div className="px-2 py-0.5 rounded bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-widest border border-slate-100">
                      v1.0.0
                   </div>
                </div>
                
                <p className="text-xs text-slate-500 font-medium line-clamp-3 leading-relaxed">
                   {chat.prompt}
                </p>

                <div className="flex items-center gap-3 py-2 border-y border-slate-50">
                   <div className="flex items-center gap-1 text-[10px] text-slate-400 font-black uppercase">
                      <Download size={12} /> {Object.keys(chat.files || {}).length} Files
                   </div>
                   <div className="w-1 h-1 bg-slate-200 rounded-full" />
                   <div className="flex items-center gap-1 text-[10px] text-slate-400 font-black uppercase">
                      <Users size={12} /> Public
                   </div>
                </div>
             </div>

             <div className="mt-6">
                <button 
                  onClick={() => onRemix(chat.prompt)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 text-white font-black text-xs hover:bg-indigo-600 transition-all shadow-lg shadow-slate-900/10 group-hover:shadow-indigo-500/20"
                >
                  <Zap size={14} fill="currentColor" /> Remix this Idea
                </button>
             </div>
          </div>
        ))}

        {filteredChats.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center space-y-4">
             <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Search size={32} />
             </div>
             <p className="text-slate-500 font-bold">No public extensions found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryPage;
