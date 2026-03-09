import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';

import axios from 'axios';
import JSZip from 'jszip';
import { Sparkles, Download, Loader2, AlertCircle, CheckCircle2, Zap, Globe, Upload, ArrowLeft, PanelLeftClose, PanelLeftOpen, Image as ImageIcon, Users, Share2 } from 'lucide-react';
import WorkspaceViewer from './WorkspaceViewer';
import toast from 'react-hot-toast';
import { supabase } from '../supabaseClient';


const Generator = ({ activeChat, onGenerationComplete, initialPrompt }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [status, setStatus] = useState('');
  const [generatedFiles, setGeneratedFiles] = useState(null);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isContextOpen, setIsContextOpen] = useState(true);
  const [auditData, setAuditData] = useState(null);
  const [listingData, setListingData] = useState(null);
  const [toolLoading, setToolLoading] = useState(null);
  const [isPublished, setIsPublished] = useState(false);
  const [followUpPrompt, setFollowUpPrompt] = useState('');

  // Track the full conversation text to split into bubbles
  const [promptHistoryText, setPromptHistoryText] = useState('');
  const [iconPrompt, setIconPrompt] = useState('');
  const [collaborators, setCollaborators] = useState([]);


  const fileInputRef = useRef(null);
  const chatScrollRef = useRef(null);
  const channelRef = useRef(null);


  useEffect(() => {
    if (activeChat) {
      setPrompt(activeChat.prompt.split('\n\n---\n\nFollow-up: ')[0]); // Extract first
      setPromptHistoryText(activeChat.prompt);
      setGeneratedFiles(activeChat.files);
      setCurrentChatId(activeChat.id);
      setSuccess(true);
      setError(null);
      setAuditData(null);
      setListingData(null);
      setIsPublished(activeChat.is_public || false);
    } else if (initialPrompt) {
      setPrompt(initialPrompt);
      setPromptHistoryText(initialPrompt);
      setGeneratedFiles(null);
      setCurrentChatId(null);
      setSuccess(false);
      setError(null);
    } else {
      setPrompt('');
      setPromptHistoryText('');
      setGeneratedFiles(null);
      setCurrentChatId(null);
      setSuccess(false);
      setError(null);
    }
  }, [activeChat, initialPrompt]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [promptHistoryText, loading, success]);

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

  const handleGenerateIcon = async () => {
    if (!iconPrompt) return;
    setToolLoading('icon');
    try {
      const response = await axios.post('http://localhost:5000/api/icons/generate', {
        prompt: iconPrompt,
        chatId: currentChatId
      }, { withCredentials: true });

      const newIcons = response.data; // { 'icon16.png': '...', ... }

      // Update files
      setGeneratedFiles(prev => {
        const updated = { ...prev, ...newIcons };

        // Auto-update manifest.json if it exists
        if (updated['manifest.json']) {
          try {
            const manifest = JSON.parse(updated['manifest.json']);
            manifest.icons = {
              "16": "icon16.png",
              "32": "icon32.png",
              "48": "icon48.png",
              "128": "icon128.png"
            };
            updated['manifest.json'] = JSON.stringify(manifest, null, 2);
          } catch (e) {
            console.error("Failed to update manifest icons", e);
          }
        }

        return updated;
      });

      setIconPrompt('');
      toast.success('Icons generated and added to project!');
    } catch (err) {
      toast.error('Icon generation failed.');
    } finally {
      setToolLoading(null);
    }
  };

  const handleShare = () => {
    if (!currentChatId) {
      toast.error('Save the project first to share!');
      return;
    }
    const shareUrl = `${window.location.origin}/dashboard/project/${currentChatId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Project link copied to clipboard!');
  };


  // Real-time Collaboration (Sync IN)
  useEffect(() => {
    if (!currentChatId) return;

    // Use a stable channel reference
    channelRef.current = supabase.channel(`project:${currentChatId}`, {
      config: {
        broadcast: { self: false },
        presence: { key: currentChatId }
      }
    });

    const channel = channelRef.current;

    channel
      .on('broadcast', { event: 'sync-project' }, ({ payload }) => {
        if (payload.chatId === currentChatId) {
          // Deep compare before updating to avoid loops
          setGeneratedFiles(prev => {
            if (JSON.stringify(prev) === JSON.stringify(payload.files)) return prev;
            return payload.files;
          });
          setPromptHistoryText(prev => {
            if (prev === payload.history) return prev;
            return payload.history;
          });
        }
      })

      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.values(state).flat();
        setCollaborators(users);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user: `Collaborator-${Math.floor(Math.random() * 1000)}`,
            online_at: new Date().toISOString()
          });
        }
      });

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [currentChatId]);

  // Sync OUT (Broadcast changes)
  const lastSyncRef = useRef('');

  useEffect(() => {
    if (!currentChatId || loading || !channelRef.current) return;

    const syncState = JSON.stringify({ f: generatedFiles, h: promptHistoryText });
    if (syncState === lastSyncRef.current) return;

    const timeout = setTimeout(() => {
      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'sync-project',
          payload: {
            chatId: currentChatId,
            files: generatedFiles,
            history: promptHistoryText
          }
        });
        lastSyncRef.current = syncState;
      }
    }, 1000); // Throttled broadcast

    return () => clearTimeout(timeout);
  }, [generatedFiles, promptHistoryText, currentChatId, loading]);



  const handleDownload = async (chatId) => {

    if (!chatId) {
      // If no chatId (e.g. uploaded a ZIP and haven't saved), we'd need to rebuild the ZIP client side.
      toast.error('Please make a change before re-downloading an uploaded item.');
      return;
    }
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

  const handleZipUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setStatus('Extracting ZIP...');
    try {
      const zip = new JSZip();
      const loadedZip = await zip.loadAsync(file);
      const extractedFiles = {};

      for (const [filename, zipEntry] of Object.entries(loadedZip.files)) {
        if (!zipEntry.dir) {
          const content = await zipEntry.async('string');
          extractedFiles[filename] = content;
        }
      }

      setGeneratedFiles(extractedFiles);
      setSuccess(true);
      setCurrentChatId(null);
      const importedText = `[Imported Extension: ${file.name}]`;
      setPrompt(importedText);
      setPromptHistoryText(importedText);
      toast.success('Extension loaded successfully!');
    } catch (err) {
      toast.error('Failed to parse ZIP file.');
      console.error(err);
    } finally {
      setLoading(false);
      event.target.value = null;
    }
  };

  const handleGenerate = async (isIteration = false) => {
    const currentPrompt = isIteration ? followUpPrompt : prompt;
    if (!currentPrompt) return;

    setLoading(true);
    setError(null);
    if (!isIteration) {
      setSuccess(false);
      setGeneratedFiles(null);
      setPromptHistoryText(currentPrompt);
    } else {
      setPromptHistoryText(prev => prev + '\n\n---\n\nFollow-up: ' + currentPrompt);
    }

    setStatus(isIteration ? 'Applying changes...' : 'Analyzing prompt...');

    try {
      setStatus(isIteration ? 'AI is updating your extension...' : 'AI is building your extension...');

      const payload = { prompt: currentPrompt };
      if (isIteration) {
        payload.previousFiles = generatedFiles;
        payload.chatId = currentChatId;
      }

      const response = await axios.post(
        'http://localhost:5000/api/chats/generate',
        payload,
        { withCredentials: true }
      );

      const chatData = response.data;
      setGeneratedFiles(chatData.files);
      setCurrentChatId(chatData.id);

      setStatus('Success!');
      setSuccess(true);
      if (isIteration) {
        setFollowUpPrompt('');
        toast.success('Extension updated successfully!');
      }
      if (onGenerationComplete) onGenerationComplete();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate extension. Please try again.');
      toast.error('Generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const chatMessages = promptHistoryText ? promptHistoryText.split('\n\n---\n\nFollow-up: ').filter(Boolean) : [];
  const isWorkspaceActive = currentChatId || generatedFiles || loading;

  if (!isWorkspaceActive) {
    // ----------------------------------------------------------------------
    // HOME VIEW (Centered)
    // ----------------------------------------------------------------------
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto p-6 md:p-8 pt-12 md:pt-20">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-wider animate-bounce">
            <Zap size={14} fill="currentColor" />
            AI Generator
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            What will you <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">build today?</span>
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">
            Describe the Chrome extension you need in plain English. Our AI will handle the code, manifest, and assets to give you a ready-to-install package.
          </p>
        </div>

        <div className="glass-card p-6 md:p-8 space-y-6 relative overflow-hidden max-w-3xl mx-auto shadow-2xl shadow-indigo-500/10">
          <div className="relative">
            <textarea
              className="w-full h-48 bg-white/60 border border-slate-200 rounded-2xl p-6 text-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all resize-none shadow-inner"
              placeholder="e.g. Create an extension that changes the background color of any website to dark navy..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
              <div className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-green-500" /> Manifest V3</div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors cursor-pointer"
              >
                <Upload size={16} className="text-indigo-500" /> Upload ZIP
                <input
                  type="file"
                  accept=".zip"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleZipUpload}
                />
              </button>
            </div>

            <button
              onClick={() => handleGenerate(false)}
              disabled={loading || !prompt}
              className="btn-premium w-full md:w-auto min-w-[200px]"
            >
              <Sparkles size={20} /> Generate Extension
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // WORKSPACE VIEW (Split Pane)
  // ----------------------------------------------------------------------
  return (
    <div className="w-full h-full flex overflow-hidden animate-in fade-in duration-500 bg-white relative">
      {/* Floating Context Toggle Button (when closed) */}
      {!isContextOpen && (
        <button
          onClick={() => setIsContextOpen(true)}
          className="absolute top-4 left-4 z-50 p-2 bg-white border border-slate-200 shadow-lg rounded-xl text-slate-500 hover:text-indigo-600 transition-all hover:scale-105"
          title="Open Project Context"
        >
          <PanelLeftOpen size={20} />
        </button>
      )}

      {/* Left Pane - Chat & Tools */}
      <div
        className={`${isContextOpen ? 'w-full md:w-[380px] lg:w-[450px] border-r border-slate-200' : 'w-0 border-r-0'} 
         shrink-0 flex flex-col bg-slate-50/50 z-20 transition-all duration-300 ease-in-out overflow-hidden`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between shadow-sm shrink-0 w-[450px]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setPrompt('');
                setGeneratedFiles(null);
                setCurrentChatId(null);
              }}
              className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 transition-colors"
              title="New Project"
            >
              <ArrowLeft size={18} />
            </button>
            <h2 className="font-black text-slate-800 tracking-tight">Project Context</h2>

            {/* Collaborators Indicator */}
            {collaborators.length > 0 && (
              <div className="flex -space-x-2 ml-2 overflow-hidden" title={`${collaborators.length} other(s) editing`}>
                {collaborators.map((c, i) => (
                  <div key={i} className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-indigo-500 flex items-center justify-center text-[8px] text-white font-bold">
                    <Users size={10} />
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setIsContextOpen(false)}
              className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-indigo-600 transition-colors ml-1"
              title="Collapse Context"
            >
              <PanelLeftClose size={16} />
            </button>
          </div>
          <div className="flex gap-2">
            {currentChatId && (
              <button
                onClick={() => handleDownload(currentChatId)}
                className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-md transition-colors shadow-sm"
                title="Download ZIP"
              >
                <Download size={16} />
              </button>
            )}
            <button
              onClick={handleShare}
              className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-md transition-colors"
              title="Share Project"
            >
              <Share2 size={16} />
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-md transition-colors"
              title="Upload ZIP"
            >
              <Upload size={16} />
              <input type="file" accept=".zip" ref={fileInputRef} className="hidden" onChange={handleZipUpload} />
            </button>
          </div>
        </div>

        {/* Chat History & Tools List */}
        <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 w-[450px]">
          {/* Chat Bubbles */}
          <div className="space-y-4">
            {chatMessages.map((msg, i) => (
              <div key={i} className="animate-in slide-in-from-bottom-2 fade-in relative group">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-black text-indigo-700">You</div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Instruction</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-4 text-sm text-slate-700 shadow-sm leading-relaxed whitespace-pre-wrap">
                  {msg}
                </div>
              </div>
            ))}

            {loading && (
              <div className="animate-in fade-in flex items-center gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl rounded-bl-sm text-indigo-700 shadow-sm">
                <Loader2 size={18} className="animate-spin shrink-0" />
                <div className="text-sm font-bold">{status}</div>
              </div>
            )}

            {error && (
              <div className="animate-in fade-in p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 shadow-sm text-sm">
                <div className="font-bold flex items-center gap-2 mb-1"><AlertCircle size={16} /> Error</div>
                <div className="opacity-90">{error}</div>
              </div>
            )}
          </div>

          {/* Extension Tools (Only show if success and we have an ID) */}
          {success && !loading && currentChatId && (
            <div className="pt-6 border-t border-slate-200 space-y-3 pb-8">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Extension Services</h3>

              {/* Audit Tool */}
              <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm hover:border-amber-200 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <div className="text-amber-500"><AlertCircle size={14} /></div> Security Audit
                  </div>
                  {!auditData && (
                    <button onClick={handleAudit} disabled={toolLoading === 'audit'} className="text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-800">
                      {toolLoading === 'audit' ? '...' : 'Run'}
                    </button>
                  )}
                </div>
                {auditData ? (
                  <div className="text-xs space-y-2">
                    <div className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-black uppercase ${auditData.riskLevel === 'Low' ? 'bg-green-100 text-green-700' : auditData.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                      {auditData.riskLevel} Risk
                    </div>
                    <p className="text-slate-600 line-clamp-2" title={auditData.summary}>{auditData.summary}</p>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-500">Analyze permissions for risks.</p>
                )}
              </div>

              {/* Store Listing Tool */}
              <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm hover:border-purple-200 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <div className="text-purple-500"><Sparkles size={14} /></div> Store Listing
                  </div>
                  {!listingData && (
                    <button onClick={handleGenerateListing} disabled={toolLoading === 'listing'} className="text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-800">
                      {toolLoading === 'listing' ? '...' : 'Create'}
                    </button>
                  )}
                </div>
                {listingData ? (
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-slate-800 truncate">{listingData.title}</p>
                    <p className="text-slate-500 line-clamp-2">{listingData.shortDescription}</p>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-500">Generate Web Store copy & tags.</p>
                )}
              </div>

              {/* Publish Tool */}
              <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm hover:border-blue-200 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <div className="text-blue-500"><Globe size={14} /></div> Gallery
                  </div>
                  {!isPublished && (
                    <button onClick={handlePublish} disabled={toolLoading === 'publish'} className="text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-800">
                      {toolLoading === 'publish' ? '...' : 'Publish'}
                    </button>
                  )}
                </div>
                {isPublished ? (
                  <div className="text-[10px] font-bold text-green-600 flex items-center gap-1"><CheckCircle2 size={12} /> Published to Community Gallery</div>
                ) : (
                  <p className="text-[10px] text-slate-500">Share your extension with others.</p>
                )}
              </div>

              {/* AI Icon Generator Tool */}
              <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm hover:border-indigo-200 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <div className="text-indigo-500"><ImageIcon size={14} /></div> AI Icon Generator
                  </div>
                  <button
                    onClick={handleGenerateIcon}
                    disabled={toolLoading === 'icon' || !iconPrompt}
                    className="text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-800 disabled:opacity-30"
                  >
                    {toolLoading === 'icon' ? '...' : 'Generate'}
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Icon description (e.g. blue robot)..."
                  className="w-full text-[10px] p-2 bg-slate-50 border border-slate-100 rounded-lg focus:outline-none focus:border-indigo-300 mb-1"
                  value={iconPrompt}
                  onChange={(e) => setIconPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleGenerateIcon();
                  }}
                />
                <p className="text-[9px] text-slate-400">Generates 16, 32, 48, 128px PNGs and updates manifest.</p>
              </div>

            </div>
          )}
        </div>

        {/* Sticky Input */}
        <div className="p-4 bg-white border-t border-slate-200 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] z-10 shrink-0 w-[450px]">
          <div className="relative flex items-end gap-2 bg-slate-50 rounded-2xl border border-slate-200 p-1.5 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
            <textarea
              className="w-full bg-transparent border-none focus:ring-0 resize-none text-sm text-slate-800 p-2 placeholder:text-slate-400 max-h-32 min-h-[44px]"
              placeholder="Ask for changes (e.g., Make background dark)..."
              value={followUpPrompt}
              onChange={(e) => {
                setFollowUpPrompt(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate(true);
                  e.target.style.height = 'auto'; // reset height
                }
              }}
              disabled={loading}
              rows={1}
            />
            <button
              onClick={() => handleGenerate(true)}
              disabled={loading || !followUpPrompt.trim()}
              className="w-8 h-8 md:w-10 md:h-10 shrink-0 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shadow-sm"
            >
              {loading && toolLoading === null ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} className="fill-white" />}
            </button>
          </div>
          <div className="text-center mt-2 pb-1">
            <span className="text-[9px] text-slate-400 font-medium">Press <span className="font-bold border border-slate-200 rounded px-1 py-0.5 mx-0.5">Enter</span> to send, <span className="font-bold border border-slate-200 rounded px-1 py-0.5 mx-0.5">Shift+Enter</span> for new line</span>
          </div>
        </div>
      </div>

      {/* Right Pane - Viewer */}
      <div className="flex-1 w-full h-full relative z-10">
        <WorkspaceViewer files={generatedFiles} />
      </div>
    </div>
  );
};

export default Generator;
