import React, { useMemo } from 'react';
import { Monitor, Smartphone, RefreshCw, AlertTriangle } from 'lucide-react';

const Simulator = ({ files }) => {
  const popupHtml = files?.['popup.html'];
  
  const combinedSrcDoc = useMemo(() => {
    if (!popupHtml) return null;

    let doc = popupHtml;

    // Inject CSS links as style tags
    Object.keys(files).forEach(filename => {
      if (filename.endsWith('.css')) {
        const cssContent = files[filename];
        const escapedFilename = filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        doc = doc.replace(
          new RegExp(`<link[^>]*href=["']${escapedFilename}["'][^>]*>`, 'g'),
          `<style>${cssContent}</style>`
        );
        // Also catch cases where it's linked but not exactly matching the filename in regex
        if (!doc.includes(`<style>${cssContent}</style>`)) {
            doc = doc.replace('</head>', `<style>${cssContent}</style></head>`);
        }
      }
    });

    // Inject JS scripts as script tags
    Object.keys(files).forEach(filename => {
      if (filename.endsWith('.js') && filename !== 'background.js' && filename !== 'content.js') {
        const jsContent = files[filename];
        const escapedFilename = filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        doc = doc.replace(
          new RegExp(`<script[^>]*src=["']${escapedFilename}["'][^>]*></script>`, 'g'),
          `<script>${jsContent}</script>`
        );
      }
    });

    return doc;
  }, [files, popupHtml]);

  if (!popupHtml) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
        <AlertTriangle size={48} className="mb-4 opacity-50" />
        <h3 className="font-bold text-slate-600">No Popup Found</h3>
        <p className="text-sm max-w-xs mt-2">This extension might be a background-only tool or a content script without a popup UI.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-100/50 rounded-2xl border border-slate-200 overflow-hidden">
      {/* Simulator Toolbar */}
      <div className="bg-white border-b border-slate-200 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <div className="flex gap-1">
             <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
             <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
             <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
           </div>
           <div className="h-4 w-px bg-slate-200 mx-2" />
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Extension Simulator</span>
        </div>
        <div className="flex items-center gap-1">
           <button className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 transition-colors">
             <RefreshCw size={14} />
           </button>
        </div>
      </div>

      {/* Simulator Content */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
        <div className="relative group">
          {/* Browser-like Frame */}
          <div className="bg-white rounded-xl shadow-2xl border-4 border-slate-800 w-[350px] min-h-[450px] overflow-hidden flex flex-col transition-all group-hover:shadow-indigo-500/10">
             {/* Virtual Header */}
             <div className="bg-slate-800 text-white px-4 py-2 flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-indigo-500" />
                <span className="text-[10px] font-bold opacity-80 truncate">My Extension</span>
             </div>
             
             {/* Actual Iframe Rendering popup.html */}
             <iframe 
                srcDoc={combinedSrcDoc}
                title="Popup Simulator"
                className="w-full flex-1 border-none bg-white"
                sandbox="allow-scripts"
             />
          </div>
          
          {/* Shadow/Reflection Decoration */}
          <div className="absolute inset-0 bg-indigo-500/5 blur-3xl -z-10 rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-all duration-700" />
        </div>
      </div>
      
      {/* Bottom Info */}
      <div className="p-4 bg-white border-t border-slate-200">
         <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
           <span className="text-indigo-600 font-black">PRO TIP:</span> This sandbox simulates <code className="bg-slate-50 px-1 rounded text-slate-600">popup.html</code>. Background workers and storage APIs are mocked or disabled for security.
         </p>
      </div>
    </div>
  );
};

export default Simulator;
