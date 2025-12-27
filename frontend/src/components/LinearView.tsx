import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store';
import { TreeNode } from '../types';
import { renderMarkdown } from '../utils/markdown';
import { CheckCircle2, Circle, Clock, Sparkles, ChevronRight } from 'lucide-react';
import { cn } from '../utils/cn';

export default function LinearView() {
  const nodes = useStore(state => state.nodes);
  const rootId = useStore(state => state.rootId);
  const selectedNodeId = useStore(state => state.selectedNodeId);
  const setSelectedNode = useStore(state => state.setSelectedNode);

  const linearNodes = useMemo(() => {
    if (!rootId) return [];

    const result: TreeNode[] = [];
    const visited = new Set<string>();

    const traverse = (nodeId: string, depth: number = 0) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const node = nodes.get(nodeId);
      if (!node) return;

      result.push({ ...node, depth } as TreeNode & { depth: number });

      node.children.forEach(childId => {
        traverse(childId, depth + 1);
      });
    };

    traverse(rootId);
    return result;
  }, [nodes, rootId]);

  const statusIcons = {
    open: Circle,
    solving: Clock,
    solved: CheckCircle2,
    revised: Sparkles,
  };

  const statusColors = {
    open: 'text-white/40 border-white/10',
    solving: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    solved: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    revised: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
  };

  if (!rootId) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center text-white/40">
          <p>No tree selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-auto">
      <div className="max-w-4xl mx-auto py-8 px-6">
        <div className="space-y-2">
          {linearNodes.map((node, index) => {
            const StatusIcon = statusIcons[node.status];
            const isSelected = selectedNodeId === node.id;
            const depth = (node as any).depth || 0;

            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => setSelectedNode(node.id)}
                className={cn(
                  'glass-card rounded-xl p-4 cursor-pointer transition-all border',
                  isSelected
                    ? 'ring-2 ring-purple-500/50 border-purple-500/30 shadow-lg shadow-purple-500/20'
                    : 'border-white/5 hover:border-white/10',
                  statusColors[node.status]
                )}
                style={{ marginLeft: `${depth * 24}px` }}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                    isSelected ? 'bg-purple-500/20' : 'bg-white/5'
                  )}>
                    <StatusIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {depth > 0 && (
                        <ChevronRight className="w-3 h-3 text-white/30 flex-shrink-0" />
                      )}
                      <h3 className="text-sm font-semibold text-white truncate">
                        {node.title}
                      </h3>
                      <span className={cn(
                        'px-2 py-0.5 rounded text-xs font-medium uppercase',
                        node.status === 'open' && 'bg-white/10 text-white/60',
                        node.status === 'solving' && 'bg-blue-500/20 text-blue-300',
                        node.status === 'solved' && 'bg-emerald-500/20 text-emerald-300',
                        node.status === 'revised' && 'bg-purple-500/20 text-purple-300',
                      )}>
                        {node.status}
                      </span>
                    </div>
                    <div className="text-xs text-white/60 leading-relaxed prose-invert mt-2">
                      {renderMarkdown(node.problem)}
                    </div>
                    {node.solution && (
                      <div className="mt-3 pt-3 border-t border-white/5">
                        <div className="text-xs text-emerald-300/80 leading-relaxed prose-invert">
                          {renderMarkdown(node.solution)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

