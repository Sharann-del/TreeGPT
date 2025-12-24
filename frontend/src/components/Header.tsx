import React, { useState } from 'react';
import { useStore } from '../store';
import ApiKeyModal from './ApiKeyModal';

export default function Header() {
  const createRoot = useStore(state => state.createRoot);
  const exportTree = useStore(state => state.exportTree);
  const importTree = useStore(state => state.importTree);
  const clearTree = useStore(state => state.clearTree);
  const rootId = useStore(state => state.rootId);
  const apiKey = useStore(state => state.apiKey);


  const handleExport = () => {
    const data = exportTree();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `treegpt-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          importTree(content);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <header className="h-16 bg-black/80 border-b border-white/10 text-white flex items-center justify-between px-6 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400/20 to-blue-400/20 border border-cyan-400/30 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-cyan-400/60 border-t-cyan-300 rounded animate-spin" />
          </div>
          <h1 className="text-lg font-semibold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent tracking-tight">
            TreeGPT
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {apiKey && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-400/10 border border-green-400/30 rounded-lg backdrop-blur-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-green-300 font-medium uppercase tracking-wider">Connected</span>
          </div>
        )}
        <ApiKeyModal />
        
        {rootId && (
          <>
            <button
              onClick={handleExport}
              className="px-3 py-1.5 text-xs bg-cyan-400/10 hover:bg-cyan-400/15 border border-cyan-400/30 rounded-lg transition-all duration-200 hover:border-cyan-400/40 text-cyan-300 hover:text-cyan-200 uppercase tracking-wider font-medium backdrop-blur-sm"
            >
              Export
            </button>
            <button
              onClick={handleImport}
              className="px-3 py-1.5 text-xs bg-blue-400/10 hover:bg-blue-400/15 border border-blue-400/30 rounded-lg transition-all duration-200 hover:border-blue-400/40 text-blue-300 hover:text-blue-200 uppercase tracking-wider font-medium backdrop-blur-sm"
            >
              Import
            </button>
            <button
              onClick={() => {
                if (confirm('Clear the entire tree?')) {
                  clearTree();
                }
              }}
              className="px-3 py-1.5 text-xs bg-red-400/10 hover:bg-red-400/15 border border-red-400/30 rounded-lg transition-all duration-200 text-red-300 hover:text-red-200 uppercase tracking-wider font-medium backdrop-blur-sm"
            >
              Clear
            </button>
          </>
        )}
      </div>
    </header>
  );
}

