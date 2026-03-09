import React, { useState } from 'react';
import { X, FileText, ChevronRight, Copy, Check, Eye, Code, Image as ImageIcon } from 'lucide-react';

import Simulator from './Simulator';
import toast from 'react-hot-toast';

const WorkspaceViewer = ({ files }) => {
  const [selectedFile, setSelectedFile] = useState(Object.keys(files || {})[0]);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState('simulator'); // Default to simulator

  if (!files || Object.keys(files).length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400">
        <FileText size={48} className="mb-4 opacity-20" />
        <p>No extension files to display.</p>
      </div>
    );
  }

  const fileList = Object.keys(files);
  const currentContent = files[selectedFile] || '';

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden shadow-2xl relative z-10 border-l border-slate-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Extension Files</h3>
              <p className="text-xs text-slate-500 font-medium">{fileList.length} files generated</p>
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('code')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'code' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              <Code size={14} /> Code
            </button>
            <button
              onClick={() => setViewMode('simulator')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'simulator' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              <Eye size={14} /> Simulator
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {viewMode === 'code' ? (
          <>
            {/* File Sidebar */}
            <div className="w-64 border-r border-slate-100 bg-slate-50/50 overflow-y-auto">
              <div className="p-3 space-y-1">
                {fileList.map((filename) => (
                  <button
                    key={filename}
                    onClick={() => setSelectedFile(filename)}
                    className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${selectedFile === filename
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-600 hover:bg-white hover:text-slate-900'
                      }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {filename.endsWith('.png') ? (
                        <ImageIcon size={14} className={selectedFile === filename ? 'text-white' : 'text-indigo-400'} />
                      ) : (
                        <ChevronRight size={14} className={selectedFile === filename ? 'opacity-100' : 'opacity-0'} />
                      )}
                      <span className="truncate">{filename}</span>
                    </div>

                  </button>
                ))}
              </div>
            </div>

            {/* Editor/Viewer */}
            <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden">
              <div className="px-4 py-2 bg-slate-800 flex items-center justify-between border-b border-slate-700">
                <span className="text-xs font-mono text-slate-400">{selectedFile}</span>
                {!selectedFile.endsWith('.png') && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
                  >
                    {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                    {copied ? 'Copied' : 'Copy Code'}
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-auto bg-slate-950/50">
                {selectedFile.endsWith('.png') ? (
                  <div className="h-full flex flex-col items-center justify-center p-12 bg-[radial-gradient(#2e3440_1px,transparent_1px)] [background-size:20px_20px]">
                    <div className="bg-white p-4 rounded-2xl shadow-2xl ring-1 ring-white/10">
                      <img
                        src={`data:image/png;base64,${currentContent}`}
                        alt={selectedFile}
                        className="max-w-[256px] h-auto object-contain image-pixelated"
                      />
                    </div>
                    <div className="mt-8 text-center">
                      <p className="text-slate-400 font-mono text-xs">{selectedFile}</p>
                      <div className="mt-2 flex gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <span>PNG IMAGE</span>
                        <span>•</span>
                        <span>{Math.round(currentContent.length * 0.75 / 1024)} KB</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <pre className="p-6 font-mono text-sm leading-relaxed text-indigo-200/90 selection:bg-indigo-500/30">
                    <code>{currentContent}</code>
                  </pre>
                )}
              </div>
            </div>

          </>
        ) : (
          <div className="flex-1 bg-slate-50">
            <Simulator files={files} />
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkspaceViewer;
