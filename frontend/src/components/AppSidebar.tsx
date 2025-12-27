import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  GitBranch,
  FolderKanban,
  BookOpen,
  FileText,
  History,
  Settings,
  Search,
  Pin,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Plus
} from 'lucide-react';
import { useStore } from '../store';
import { cn } from '../utils/cn';
import SearchModal from './SearchModal';
import ProblemInputModal from './ProblemInputModal';
import { useToast } from '../utils/toast';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { id: 'trees', label: 'Trees', icon: GitBranch, path: '/workspace' },
  { id: 'projects', label: 'Projects', icon: FolderKanban, path: '/projects' },
  { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen, path: '/knowledge' },
  { id: 'templates', label: 'Templates', icon: FileText, path: '/templates' },
  { id: 'history', label: 'History', icon: History, path: '/history' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

export default function AppSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showNewTreeModal, setShowNewTreeModal] = useState(false);
  const [pinnedTrees, setPinnedTrees] = useState<string[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const rootId = useStore(state => state.rootId);
  const nodes = useStore(state => state.nodes);
  const createRoot = useStore(state => state.createRoot);
  const clearTree = useStore(state => state.clearTree);
  const { showToast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('sidebar_collapsed');
    if (saved !== null) {
      setIsCollapsed(saved === 'true');
    }
    const pinned = localStorage.getItem('pinned_trees');
    if (pinned) {
      try {
        setPinnedTrees(JSON.parse(pinned));
      } catch (e) {
        console.error('Failed to parse pinned trees', e);
      }
    }
  }, []);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar_collapsed', String(newState));
  };

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const currentTree = rootId ? nodes.get(rootId) : null;
  const pinnedTreeNodes = pinnedTrees
    .map(id => nodes.get(id))
    .filter((node): node is NonNullable<typeof node> => node !== undefined)
    .slice(0, 5);

  const handleNewTree = () => {
    setShowNewTreeModal(true);
  };

  const handleNewTreeSubmit = (problem: string) => {
    clearTree();
    createRoot(problem);
    navigate('/workspace');
    showToast('New tree created!', 'success');
    setShowNewTreeModal(false);
  };

  return (
    <>
      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? '64px' : '280px',
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className={cn(
          'h-full glass-strong border-r border-white/5 flex flex-col relative z-50',
          isCollapsed && 'items-center'
        )}
      >
        {/* Logo */}
        <div className={cn(
          'flex items-center gap-3 px-4 py-5 border-b border-white/5',
          isCollapsed && 'justify-center px-0'
        )}>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2.5"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-white">TreeGPT</span>
            </motion.div>
          )}
          {isCollapsed && (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* New Tree Button */}
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 py-3 border-b border-white/5"
          >
            <button
              onClick={handleNewTree}
              className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Tree</span>
            </button>
          </motion.div>
        )}

        {/* Global Search */}
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 py-3 border-b border-white/5"
          >
            <button
              onClick={() => setShowSearch(true)}
              className="w-full px-3 py-2 rounded-lg glass text-left text-sm text-white/60 hover:text-white/80 hover:bg-white/5 transition-all flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Search...</span>
              <span className="ml-auto text-xs text-white/40">⌘K</span>
            </button>
          </motion.div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3">
          <div className={cn('space-y-1', isCollapsed ? 'px-2' : 'px-3')}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <motion.button
                  key={item.id}
                  whileHover={{ x: isCollapsed ? 0 : 2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleNavClick(item.path)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all relative group',
                    active
                      ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-white border border-purple-500/30'
                      : 'text-white/60 hover:text-white hover:bg-white/5',
                    isCollapsed && 'justify-center'
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className={cn('w-5 h-5 flex-shrink-0', active && 'text-purple-300')} />
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm font-medium flex-1 text-left"
                    >
                      {item.label}
                    </motion.span>
                  )}
                  {item.badge && !isCollapsed && (
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-medium">
                      {item.badge}
                    </span>
                  )}
                  {active && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-indigo-500 rounded-r-full"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </nav>

        {/* Pinned Trees */}
        {!isCollapsed && pinnedTreeNodes.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-3 py-3 border-t border-white/5"
          >
            <div className="flex items-center gap-2 mb-2 px-2">
              <Pin className="w-3.5 h-3.5 text-white/40" />
              <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                Pinned
              </span>
            </div>
            <div className="space-y-1">
              {pinnedTreeNodes.map((node) => (
                <button
                  key={node.id}
                  onClick={() => {
                    navigate('/workspace');
                    useStore.getState().setSelectedNode(node.id);
                  }}
                  className="w-full px-2 py-1.5 rounded-lg text-left text-xs text-white/60 hover:text-white hover:bg-white/5 transition-all truncate flex items-center gap-2"
                >
                  <GitBranch className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{node.title}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Current Tree Indicator */}
        {!isCollapsed && currentTree && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-3 py-3 border-t border-white/5"
          >
            <div className="px-2 py-2 rounded-lg glass-card">
              <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1.5">
                Current Tree
              </div>
              <div className="text-sm font-medium text-white truncate">{currentTree.title}</div>
            </div>
          </motion.div>
        )}

        {/* Collapse Toggle */}
        <button
          onClick={toggleCollapse}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full glass-strong border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all z-10"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </motion.aside>

      <SearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />
      <ProblemInputModal
        isOpen={showNewTreeModal}
        onClose={() => setShowNewTreeModal(false)}
        onSubmit={handleNewTreeSubmit}
        title="Create New Tree"
        placeholder="Enter your problem or question..."
      />
    </>
  );
}

