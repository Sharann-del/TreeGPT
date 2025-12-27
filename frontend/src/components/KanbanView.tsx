import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store';
import { TreeNode, NodeStatus } from '../types';
import { renderMarkdown } from '../utils/markdown';
import { CheckCircle2, Circle, Clock, Sparkles } from 'lucide-react';
import { cn } from '../utils/cn';

const statuses: NodeStatus[] = ['open', 'solving', 'solved', 'revised'];

const statusConfig = {
  open: {
    label: 'Open',
    icon: Circle,
    color: 'text-white/40',
    bgColor: 'bg-white/5',
    borderColor: 'border-white/10',
  },
  solving: {
    label: 'In Progress',
    icon: Clock,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  solved: {
    label: 'Solved',
    icon: CheckCircle2,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
  },
  revised: {
    label: 'Revised',
    icon: Sparkles,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
  },
};

export default function KanbanView() {
  const nodes = useStore(state => state.nodes);
  const rootId = useStore(state => state.rootId);
  const selectedNodeId = useStore(state => state.selectedNodeId);
  const setSelectedNode = useStore(state => state.setSelectedNode);
  const updateNode = useStore(state => state.updateNode);

  const nodesByStatus = useMemo(() => {
    const result: Record<NodeStatus, TreeNode[]> = {
      open: [],
      solving: [],
      solved: [],
      revised: [],
    };

    nodes.forEach((node) => {
      result[node.status].push(node);
    });

    return result;
  }, [nodes]);

  const handleStatusChange = (nodeId: string, newStatus: NodeStatus) => {
    updateNode(nodeId, { status: newStatus });
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
      <div className="p-6">
        <div className="grid grid-cols-4 gap-4 h-full">
          {statuses.map((status) => {
            const config = statusConfig[status];
            const StatusIcon = config.icon;
            const statusNodes = nodesByStatus[status];

            return (
              <div key={status} className="flex flex-col min-w-[280px]">
                <div className={cn(
                  'flex items-center gap-2 px-4 py-3 rounded-t-xl border-b',
                  config.bgColor,
                  config.borderColor
                )}>
                  <StatusIcon className={cn('w-4 h-4', config.color)} />
                  <h3 className={cn('text-sm font-semibold', config.color)}>
                    {config.label}
                  </h3>
                  <span className={cn('ml-auto px-2 py-0.5 rounded-full text-xs font-medium', config.bgColor, config.color)}>
                    {statusNodes.length}
                  </span>
                </div>

                <div className="flex-1 p-3 space-y-2 rounded-b-xl min-h-[200px] overflow-y-auto">
                  {statusNodes.map((node, index) => {
                    const isSelected = selectedNodeId === node.id;
                    return (
                      <motion.div
                        key={node.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedNode(node.id)}
                        className={cn(
                          'glass-card rounded-lg p-3 cursor-pointer border transition-all group',
                          isSelected
                            ? 'ring-2 ring-purple-500/50 border-purple-500/30'
                            : 'border-white/5 hover:border-white/10'
                        )}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h4 className="text-sm font-medium text-white line-clamp-2 flex-1">
                            {node.title}
                          </h4>
                          <select
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleStatusChange(node.id, e.target.value as NodeStatus)}
                            value={node.status}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-white/10 border border-white/20 rounded px-2 py-1 text-white"
                          >
                            {statuses.map((s) => (
                              <option key={s} value={s}>
                                {statusConfig[s].label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="text-xs text-white/60 line-clamp-3 prose-invert">
                          {renderMarkdown(node.problem)}
                        </div>
                        {node.children.length > 0 && (
                          <div className="mt-2 text-xs text-white/40">
                            {node.children.length} child{node.children.length !== 1 ? 'ren' : ''}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                  {statusNodes.length === 0 && (
                    <div className="flex items-center justify-center h-32 text-white/30 text-sm">
                      No nodes
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

