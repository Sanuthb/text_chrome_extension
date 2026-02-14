import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Sparkles, Download, Loader2, AlertCircle, CheckCircle2, FileCode, Zap, Globe } from 'lucide-react';
import FileViewerModal from './FileViewerModal';
import toast from 'react-hot-toast';

const Generator = ({ activeChat, onGenerationComplete, initialPrompt }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [status, setStatus] = useState('');
  const [generatedFiles, setGeneratedFiles] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [auditData, setAuditData] = useState(null);
  const [listingData, setListingData] = useState(null);
  const [toolLoading, setToolLoading] = useState(null); // 'audit', 'listing', or 'publish'
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    if (activeChat) {
      setPrompt(activeChat.prompt);
      setGeneratedFiles(activeChat.files);
      setCurrentChatId(activeChat.id);
      setSuccess(true);
      setError(null);
      setAuditData(null);
      setListingData(null);
      setIsPublished(activeChat.is_public || false);
    } else if (initialPrompt) {
      setPrompt(initialPrompt);
      setGeneratedFiles(null);
      setCurrentChatId(null);
      setSuccess(false);
      setError(null);
    } else {
      setPrompt('');
      setGeneratedFiles(null);
      setCurrentChatId(null);
      setSuccess(false);
      setError(null);
    }
  }, [activeChat, initialPrompt]);

  const handleAudit = async () => {
    setToolLoading('audit');
    try {
      const response = await axios.get(`http://localhost:5000/api/chats/history/${currentChatId}/audit`, { withCredentials: true });
      setAuditData(response.data);
      toast.success('Security audit complete!');
    } catch (err) {
      toast.error('Audit failed.');
    } finally {
      setToolLoading(null);
    }
  };

  const handleGenerateListing = async () => {
    setToolLoading('listing');
    try {
      const response = await axios.get(`http://localhost:5000/api/chats/history/${currentChatId}/store-listing`, { withCredentials: true });
      setListingData(response.data);
      toast.success('Store listing generated!');
    } catch (err) {
      toast.error('Listing generation failed.');
    } finally {
      setToolLoading(null);
    }
  };

  const handlePublish = async () => {
    setToolLoading('publish');
    try {
      await axios.post(`http://localhost:5000/api/chats/history/${currentChatId}/publish`, {}, { withCredentials: true });
      setIsPublished(true);
      toast.success('Extension shared to Gallery!');
    } catch (err) {
      toast.error('Publishing failed.');
    } finally {
      setToolLoading(null);
    }
  };

  const handleDownload = async (chatId) => {
// ... existing download logic ...
    try {
      const response = await axios.get(
        `http://localhost:5000/api/chats/history/${chatId}/download`,
        { withCredentials: true, responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'extension.zip');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Download started!');
    } catch (err) {
      toast.error('Failed to download ZIP file.');
    }
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setError(null);
    setSuccess(false);
    setGeneratedFiles(null);
    setStatus('Analyzing prompt...');

    try {
      setStatus('AI is building your extension...');
      const response = await axios.post(
        'http://localhost:5000/api/chats/generate',
        { prompt },
        { withCredentials: true }
      );

      const chatData = response.data;
      setGeneratedFiles(chatData.files);
      setCurrentChatId(chatData.id);
      
      setStatus('Packaging ZIP file...');
      await handleDownload(chatData.id);

      setSuccess(true);
      setStatus('Success!');
      if (onGenerationComplete) onGenerationComplete();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate extension. Please try again.');
      toast.error('Generation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header section omitted for brevity in preview, but kept in full file */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-wider animate-bounce">
          <Zap size={14} fill="currentColor" />
          AI Generator
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
          What will you <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">build today?</span>
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Describe the Chrome extension you need in plain English. Our AI will handle the code, manifest, and assets to give you a ready-to-install package.
        </p>
      </div>

      <div className="glass-card p-6 md:p-8 space-y-6 relative overflow-hidden">
        <div className="relative">
          <textarea
            className="w-full h-48 bg-white/40 border border-slate-200 rounded-2xl p-6 text-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all resize-none"
            placeholder="e.g. Create an extension that changes the background color of any website to dark navy..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
             <div className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-green-500" /> Manifest V3</div>
             <div className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-green-500" /> ZIP Export</div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className="btn-premium w-full md:w-auto min-w-[200px]"
          >
            {loading ? (
              <><Loader2 className="animate-spin" /> {status}</>
            ) : (
              <><Sparkles size={20} /> Generate Extension</>
            )}
          </button>
        </div>

        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 rounded-2xl flex flex-col items-center justify-center p-8 text-center animate-in fade-in">
             <Loader2 size={48} className="text-indigo-600 animate-spin mb-4" />
             <p className="text-xl font-bold text-slate-800">{status}</p>
          </div>
        )}
      </div>

      {success && !loading && (
        <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
          <div className="glass-card border-green-200 bg-green-50/50 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4 text-green-800">
              <CheckCircle2 className="shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Generation Complete!</p>
                <p className="text-sm opacity-90">Files are ready and downloaded.</p>
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white border border-green-200 text-green-700 font-semibold hover:bg-green-100 transition-colors"
              >
                <FileCode size={18} />
                View Files & Simulator
              </button>
              <button 
                onClick={() => handleDownload(currentChatId)}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors shadow-lg shadow-green-500/20"
              >
                <Download size={18} />
                Redownload
              </button>
            </div>
          </div>

          {/* Extension Lab - Advanced Tools */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {/* Security Audit */}
             <div className="glass-card p-6 space-y-4 bg-white/40">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2 text-slate-900 font-bold">
                      <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                        <AlertCircle size={18} />
                      </div>
                      Security Audit
                   </div>
                   {!auditData && (
                     <button 
                       onClick={handleAudit}
                       disabled={toolLoading === 'audit'}
                       className="text-xs font-black uppercase text-indigo-600 hover:underline disabled:opacity-50"
                     >
                       {toolLoading === 'audit' ? 'Auditing...' : 'Run Audit'}
                     </button>
                   )}
                </div>

                {auditData ? (
                  <div className="space-y-3 animate-in fade-in">
                     <div className={`px-2 py-1 rounded-md text-[10px] font-black uppercase inline-block ${
                       auditData.riskLevel === 'Low' ? 'bg-green-100 text-green-700' : 
                       auditData.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                     }`}>
                       Risk Level: {auditData.riskLevel}
                     </div>
                     <p className="text-xs text-slate-600 leading-relaxed font-medium">{auditData.summary}</p>
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase">Suggestions:</p>
                        {auditData.suggestions.slice(0, 2).map((s, i) => (
                           <div key={i} className="flex items-center gap-2 text-[11px] text-slate-700 font-bold">
                             <div className="w-1 h-1 bg-indigo-400 rounded-full" /> {s}
                           </div>
                        ))}
                     </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 font-medium">Analyze your extension's permissions and manifest for security risks before publishing.</p>
                )}
             </div>

             {/* Store Listing */}
             <div className="glass-card p-6 space-y-4 bg-white/40">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2 text-slate-900 font-bold">
                      <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
                        <Sparkles size={18} />
                      </div>
                      Store Listing
                   </div>
                   {!listingData && (
                     <button 
                       onClick={handleGenerateListing}
                       disabled={toolLoading === 'listing'}
                       className="text-xs font-black uppercase text-indigo-600 hover:underline disabled:opacity-50"
                     >
                       {toolLoading === 'listing' ? 'Generating...' : 'Create Listing'}
                     </button>
                   )}
                </div>

                {listingData ? (
                  <div className="space-y-2 animate-in fade-in">
                     <h4 className="text-sm font-black text-slate-800">{listingData.title}</h4>
                     <p className="text-xs text-slate-500 font-medium line-clamp-2 italic">"{listingData.shortDescription}"</p>
                     <div className="flex flex-wrap gap-1">
                        {listingData.marketingTags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">#{tag}</span>
                        ))}
                     </div>
                     <button 
                        onClick={() => {
                          navigator.clipboard.writeText(`Title: ${listingData.title}\n\nDescription: ${listingData.longDescription}`);
                          toast.success('Listing copied!');
                        }}
                        className="text-[10px] font-black text-indigo-600 hover:underline uppercase"
                     >
                       Copy Full Listing
                     </button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 font-medium">Automatically generate a professional Chrome Web Store title, description, and marketing tags.</p>
                )}
             </div>

             {/* Community Gallery Card */}
             <div className="glass-card p-6 space-y-4 bg-white/40">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2 text-slate-900 font-bold">
                      <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                        <Globe size={18} />
                      </div>
                      Community Gallery
                   </div>
                   {!isPublished && (
                     <button 
                       onClick={handlePublish}
                       disabled={toolLoading === 'publish'}
                       className="text-xs font-black uppercase text-indigo-600 hover:underline disabled:opacity-50"
                     >
                       {toolLoading === 'publish' ? 'Sharing...' : 'Publish'}
                     </button>
                   )}
                </div>

                {isPublished ? (
                  <div className="space-y-3 animate-in fade-in">
                     <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-[10px] font-black uppercase inline-block">
                        Published to Gallery
                     </div>
                     <p className="text-xs text-slate-600 leading-relaxed font-medium">Your extension is now visible to the community! Others can see your prompt and remix it.</p>
                     <Link to="/dashboard/gallery" className="text-[10px] font-black text-indigo-600 hover:underline uppercase block">View in Gallery</Link>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 font-medium">Share your creation with the community. Others will be able to view and remix your extension idea.</p>
                )}
             </div>
          </div>
        </div>
      )}

      {error && (
        <div className="glass-card border-red-200 bg-red-50/50 p-6 text-red-700">
          <p className="font-bold">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <FileViewerModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        files={generatedFiles} 
      />
    </div>
  );
};

export default Generator;
