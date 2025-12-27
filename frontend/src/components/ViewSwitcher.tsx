import { motion } from 'framer-motion';
import { GitBranch, List, LayoutGrid, Clock } from 'lucide-react';
import { useStore, ViewMode } from '../store';
import { cn } from '../utils/cn';

const views: { id: ViewMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'tree', label: 'Tree', icon: GitBranch },
  { id: 'linear', label: 'Linear', icon: List },
  { id: 'kanban', label: 'Kanban', icon: LayoutGrid },
  { id: 'timeline', label: 'Timeline', icon: Clock },
];

export default function ViewSwitcher() {
  const viewMode = useStore(state => state.viewMode);
  const setViewMode = useStore(state => state.setViewMode);

  return (
    <div className="flex items-center gap-1 glass-card rounded-lg p-1">
      {views.map((view) => {
        const Icon = view.icon;
        const isActive = viewMode === view.id;
        return (
          <button
            key={view.id}
            onClick={() => setViewMode(view.id)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
              isActive
                ? 'bg-purple-500/20 text-purple-300'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{view.label}</span>
          </button>
        );
      })}
    </div>
  );
}

