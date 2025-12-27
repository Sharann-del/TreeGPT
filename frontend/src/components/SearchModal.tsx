import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, FileText, GitBranch } from 'lucide-react';
import { useStore } from '../store';
import { TreeNode } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const nodes = useStore(state => state.nodes);
  const rootId = useStore(state => state.rootId);
  const setSelectedNode = useStore(state => state.setSelectedNode);
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || !rootId) return [];

    const query = searchQuery.toLowerCase();
    const results: Array<{ node: TreeNode; matchType: 'title' | 'problem' | 'solution' }> = [];

    nodes.forEach((node) => {
      const titleMatch = node.title.toLowerCase().includes(query);
      const problemMatch = node.problem.toLowerCase().includes(query);
      const solutionMatch = node.solution.toLowerCase().includes(query);

      if (titleMatch) {
        results.push({ node, matchType: 'title' });
      } else if (problemMatch) {
        results.push({ node, matchType: 'problem' });
      } else if (solutionMatch) {
        results.push({ node, matchType: 'solution' });
      }
    });

    return results;
  }, [searchQuery, nodes, rootId]);

  useEffect(() => {
    if (isOpen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const handleSelectNode = (nodeId: string) => {
    setSelectedNode(nodeId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center pt-20 p-4">
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="glass-panel rounded-2xl w-full max-w-2xl shadow-2xl"
        >
          <div className="p-4 border-b border-white/5 flex items-center gap-3">
            <Search className="w-5 h-5 text-white/60" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search nodes by title, problem, or solution..."
              className="flex-1 bg-transparent text-white placeholder-white/40 focus:outline-none text-lg"
              autoFocus
            />
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {searchQuery.trim() && searchResults.length === 0 ? (
              <div className="p-8 text-center text-white/40">
                <p>No results found</p>
              </div>
            ) : searchQuery.trim() ? (
              <div className="p-2">
                {searchResults.map((result) => (
                  <button
                    key={result.node.id}
                    onClick={() => handleSelectNode(result.node.id)}
                    className="w-full text-left p-4 rounded-lg hover:bg-white/5 transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      {result.matchType === 'title' ? (
                        <FileText className="w-5 h-5 text-cyan-400 mt-0.5" />
                      ) : (
                        <GitBranch className="w-5 h-5 text-blue-400 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white mb-1 group-hover:text-cyan-300 transition-colors">
                          {result.node.title}
                        </div>
                        <div className="text-sm text-white/60 line-clamp-2">
                          {result.matchType === 'title'
                            ? result.node.problem
                            : result.matchType === 'problem'
                            ? result.node.problem
                            : result.node.solution}
                        </div>
                        <div className="text-xs text-white/40 mt-1">
                          {result.matchType === 'title' && 'Title match'}
                          {result.matchType === 'problem' && 'Problem match'}
                          {result.matchType === 'solution' && 'Solution match'}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-white/40">
                <p>Start typing to search nodes...</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

