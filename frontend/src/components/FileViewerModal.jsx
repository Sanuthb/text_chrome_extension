import React, { useState } from 'react';
import { X, FileText, ChevronRight, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const FileViewerModal = ({ isOpen, onClose, files }) => {
  const [selectedFile, setSelectedFile] = useState(Object.keys(files || {})[0]);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !files) return null;

  const fileList = Object.keys(files);
  const currentContent = files[selectedFile] || '';

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="glass-card w-full max-w-6xl h-[80vh] flex flex-col bg-white overflow-hidden relative z-10 shadow-2xl border-white/20">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Extension Files</h3>
              <p className="text-xs text-slate-500 font-medium">{fileList.length} files generated</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* File Sidebar */}
          <div className="w-64 border-r border-slate-100 bg-slate-50/50 overflow-y-auto">
            <div className="p-3 space-y-1">
              {fileList.map((filename) => (
                <button
                  key={filename}
                  onClick={() => setSelectedFile(filename)}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    selectedFile === filename
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-600 hover:bg-white hover:text-slate-900'
                  }`}
                >
                  <ChevronRight size={14} className={selectedFile === filename ? 'opacity-100' : 'opacity-0'} />
                  <span className="truncate">{filename}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Editor/Viewer */}
          <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden">
             <div className="px-4 py-2 bg-slate-800 flex items-center justify-between border-b border-slate-700">
                <span className="text-xs font-mono text-slate-400">{selectedFile}</span>
                <button 
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
                >
                  {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                  {copied ? 'Copied' : 'Copy Code'}
                </button>
             </div>
             <pre className="flex-1 p-6 overflow-auto font-mono text-sm leading-relaxed text-indigo-200/90 selection:bg-indigo-500/30">
                <code>{currentContent}</code>
             </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileViewerModal;
