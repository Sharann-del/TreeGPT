import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store';
import { TreeNode } from '../types';
import { renderMarkdown } from '../utils/markdown';
import { CheckCircle2, Circle, Clock, Sparkles } from 'lucide-react';
import { cn } from '../utils/cn';

const statusIcons = {
  open: Circle,
  solving: Clock,
  solved: CheckCircle2,
  revised: Sparkles,
};

const statusColors = {
  open: 'text-white/40',
  solving: 'text-blue-400',
  solved: 'text-emerald-400',
  revised: 'text-purple-400',
};

export default function TimelineView() {
  const nodes = useStore(state => state.nodes);
  const rootId = useStore(state => state.rootId);
  const selectedNodeId = useStore(state => state.selectedNodeId);
  const setSelectedNode = useStore(state => state.setSelectedNode);

  const timelineNodes = useMemo(() => {
    return Array.from(nodes.values())
      .sort((a, b) => a.createdAt - b.createdAt);
  }, [nodes]);

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
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500/30 via-white/10 to-transparent" />

          <div className="space-y-6">
            {timelineNodes.map((node, index) => {
              const StatusIcon = statusIcons[node.status];
              const isSelected = selectedNodeId === node.id;
              const isRoot = !node.parentId;
              const date = new Date(node.createdAt);
              const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });

              return (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative flex items-start gap-4"
                >
                  {/* Timeline dot */}
                  <div className={cn(
                    'relative z-10 w-16 h-16 rounded-full glass-card flex items-center justify-center flex-shrink-0 border-2',
                    isSelected
                      ? 'border-purple-500/50 ring-2 ring-purple-500/30'
                      : 'border-white/10',
                    isRoot && 'bg-gradient-to-br from-purple-500/20 to-indigo-500/20'
                  )}>
                    <StatusIcon className={cn('w-6 h-6', statusColors[node.status])} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-xs text-white/40 font-medium">
                        {dateStr} at {timeStr}
                      </div>
                      {isRoot && (
                        <span className="px-2 py-0.5 rounded text-xs bg-purple-500/20 text-purple-300 font-medium">
                          Root
                        </span>
                      )}
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

                    <motion.div
                      onClick={() => setSelectedNode(node.id)}
                      className={cn(
                        'glass-card rounded-xl p-4 cursor-pointer border transition-all',
                        isSelected
                          ? 'ring-2 ring-purple-500/50 border-purple-500/30 shadow-lg shadow-purple-500/20'
                          : 'border-white/5 hover:border-white/10'
                      )}
                    >
                      <h3 className="text-base font-semibold text-white mb-2">
                        {node.title}
                      </h3>
                      <div className="text-sm text-white/70 leading-relaxed prose-invert">
                        {renderMarkdown(node.problem)}
                      </div>
                      {node.solution && (
                        <div className="mt-3 pt-3 border-t border-white/5">
                          <div className="text-sm text-emerald-300/80 leading-relaxed prose-invert">
                            {renderMarkdown(node.solution)}
                          </div>
                        </div>
                      )}
                      {node.children.length > 0 && (
                        <div className="mt-3 text-xs text-white/40">
                          {node.children.length} child{node.children.length !== 1 ? 'ren' : ''}
                        </div>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

