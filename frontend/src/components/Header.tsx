import { useStore } from '../store';
import ApiKeyModal from './ApiKeyModal';
import { Download, Upload, Trash2, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();
  const exportTree = useStore(state => state.exportTree);
  const importTree = useStore(state => state.importTree);
  const clearTree = useStore(state => state.clearTree);
  const rootId = useStore(state => state.rootId);

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
    <header className="flex items-center gap-3 p-1.5 glass rounded-xl">
      <div className="flex items-center gap-3 px-3">
        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
          <Cpu className="w-5 h-5 text-white/90" />
        </div>
        <h1 className="text-sm font-semibold text-white/90 tracking-wide">
          TreeGPT
        </h1>
      </div>

      <div className="h-6 w-px bg-white/10 mx-1" />

      <div className="flex items-center gap-1">
        <ApiKeyModal />

        {rootId && (
          <>
            <button
              onClick={handleExport}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              title="Export Tree"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handleImport}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              title="Import Tree"
            >
              <Upload className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (confirm('Clear the entire tree?')) {
                  clearTree();
                  navigate('/');
                }
              }}
              className="p-2 text-red-400/60 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
              title="Clear Tree"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </header>
  );
}

