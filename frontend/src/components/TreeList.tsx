import { useMemo } from 'react';
import { useStore } from '../store';
import { TreeNode } from '../types';
import { cn } from '../utils/cn';
import { Circle, Clock, CheckCircle2, Sparkles } from 'lucide-react';

export default function TreeList() {
  const nodes = useStore(state => state.nodes);
  const rootId = useStore(state => state.rootId);
  const selectedNodeId = useStore(state => state.selectedNodeId);
  const setSelected = useStore(state => state.setSelectedNode);

  const flatList = useMemo(() => {
    if (!rootId) return [];

    const list: { node: TreeNode; depth: number }[] = [];
    const visited = new Set<string>();

    const traverse = (nodeId: string, depth: number) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const node = nodes.get(nodeId);
      if (!node) return;

      list.push({ node, depth });

      node.children.forEach(childId => traverse(childId, depth + 1));
    };

    traverse(rootId, 0);
    return list;
  }, [nodes, rootId]);

  if (!rootId) {
    return (
      <div className="flex items-center justify-center h-40 text-white/20 text-sm">
        No items
      </div>
    );
  }

  const statusIcons = {
    open: Circle,
    solving: Clock,
    solved: CheckCircle2,
    revised: Sparkles
  };

  return (
    <div className="space-y-0.5">
      {flatList.map(({ node, depth }) => {
        const StatusIcon = statusIcons[node.status];
        const isSelected = selectedNodeId === node.id;

        return (
          <div
            key={node.id}
            onClick={() => setSelected(node.id)}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all text-sm group",
              isSelected
                ? "bg-white/10 text-white shadow-sm"
                : "text-white/50 hover:bg-white/5 hover:text-white/80"
            )}
            style={{ paddingLeft: `${depth * 12 + 12}px` }}
          >
            <StatusIcon className={cn(
              "w-3.5 h-3.5 shrink-0 transition-colors",
              isSelected ? "text-white" : "text-white/40 group-hover:text-white/60",
              node.status === 'solving' && "animate-pulse text-blue-400",
              node.status === 'solved' && "text-emerald-400",
              node.status === 'revised' && "text-purple-400"
            )} />
            <span className="truncate">{node.title}</span>
          </div>
        );
      })}
    </div>
  );
}
