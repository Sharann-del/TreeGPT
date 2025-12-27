import { useMemo } from 'react';
import { useStore } from '../store';
import { TrendingUp, GitBranch, CheckCircle2, Clock, Target } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StatisticsPanel() {
  const nodes = useStore(state => state.nodes);
  const rootId = useStore(state => state.rootId);

  const stats = useMemo(() => {
    if (!rootId) return null;

    const allNodes = Array.from(nodes.values());
    const totalNodes = allNodes.length;
    const solvedNodes = allNodes.filter(n => n.status === 'solved').length;
    const solvingNodes = allNodes.filter(n => n.status === 'solving').length;
    const openNodes = allNodes.filter(n => n.status === 'open').length;
    const revisedNodes = allNodes.filter(n => n.status === 'revised').length;
    const totalChildren = allNodes.reduce((sum, n) => sum + n.children.length, 0);
    const avgChildren = totalNodes > 0 ? (totalChildren / totalNodes).toFixed(1) : '0';

    const oldestNode = allNodes.reduce((oldest, node) => 
      node.createdAt < oldest.createdAt ? node : oldest, allNodes[0]
    );
    const newestNode = allNodes.reduce((newest, node) => 
      node.updatedAt > newest.updatedAt ? node : newest, allNodes[0]
    );

    return {
      totalNodes,
      solvedNodes,
      solvingNodes,
      openNodes,
      revisedNodes,
      avgChildren,
      oldestDate: oldestNode ? new Date(oldestNode.createdAt).toLocaleDateString() : 'N/A',
      newestDate: newestNode ? new Date(newestNode.updatedAt).toLocaleDateString() : 'N/A',
    };
  }, [nodes, rootId]);

  if (!stats) {
    return (
      <div className="p-6 text-center text-white/40">
        <p>No statistics available</p>
      </div>
    );
  }

  const statCards = [
    { icon: Target, label: 'Total Nodes', value: stats.totalNodes, color: 'cyan' },
    { icon: CheckCircle2, label: 'Solved', value: stats.solvedNodes, color: 'green' },
    { icon: Clock, label: 'Solving', value: stats.solvingNodes, color: 'blue' },
    { icon: GitBranch, label: 'Open', value: stats.openNodes, color: 'yellow' },
    { icon: TrendingUp, label: 'Avg Children', value: stats.avgChildren, color: 'purple' },
  ];

  return (
    <div className="p-6 space-y-6">
      <h3 className="text-lg font-semibold text-white mb-4">Statistics</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            cyan: 'text-cyan-400 bg-cyan-400/10',
            green: 'text-green-400 bg-green-400/10',
            blue: 'text-blue-400 bg-blue-400/10',
            yellow: 'text-yellow-400 bg-yellow-400/10',
            purple: 'text-purple-400 bg-purple-400/10',
          };

          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="glass-panel rounded-xl p-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-white/60">{stat.label}</div>
                  <div className="text-xl font-bold text-white">{stat.value}</div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="glass-panel rounded-xl p-4 space-y-2">
        <div className="text-xs text-white/60">Timeline</div>
        <div className="text-sm text-white/80">
          <div>Created: {stats.oldestDate}</div>
          <div>Last Updated: {stats.newestDate}</div>
        </div>
      </div>
    </div>
  );
}

