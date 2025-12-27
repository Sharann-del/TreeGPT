import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { useToast } from '../utils/toast';

export function useKeyboardShortcuts() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const rootId = useStore(state => state.rootId);
  const selectedNodeId = useStore(state => state.selectedNodeId);
  const setSelectedNode = useStore(state => state.setSelectedNode);
  const nodes = useStore(state => state.nodes);
  const exportTree = useStore(state => state.exportTree);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        (e.target as HTMLElement).tagName === 'INPUT' ||
        (e.target as HTMLElement).tagName === 'TEXTAREA' ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      // Ctrl/Cmd + K: Show keyboard shortcuts help
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        showToast('Press ? to see all keyboard shortcuts', 'info');
      }

      // ?: Show help modal
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        navigate('/help');
      }

      // Escape: Close modals or go back
      if (e.key === 'Escape') {
        // Could close modals here if needed
      }

      // Ctrl/Cmd + S: Save project
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (rootId) {
          showToast('Use the Save button in the workspace to save projects', 'info');
        }
      }

      // Ctrl/Cmd + E: Export
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        if (rootId) {
          const data = exportTree();
          const blob = new Blob([data], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `treegpt-${Date.now()}.json`;
          a.click();
          URL.revokeObjectURL(url);
          showToast('Tree exported', 'success');
        }
      }

      // Arrow keys: Navigate between nodes (when in workspace)
      if (rootId && selectedNodeId) {
        const flatNodes = Array.from(nodes.values());
        const currentIndex = flatNodes.findIndex(n => n.id === selectedNodeId);

        if (e.key === 'ArrowDown' && currentIndex < flatNodes.length - 1) {
          e.preventDefault();
          setSelectedNode(flatNodes[currentIndex + 1].id);
        } else if (e.key === 'ArrowUp' && currentIndex > 0) {
          e.preventDefault();
          setSelectedNode(flatNodes[currentIndex - 1].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, showToast, rootId, selectedNodeId, nodes, setSelectedNode, exportTree]);
}

