import { useStore } from '../store';
import { getAllProjects, Project } from '../utils/projects';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Clock, Plus, Sparkles } from 'lucide-react';
import { useToast } from '../utils/toast';
import ProblemInputModal from './ProblemInputModal';

interface ChatSidebarProps {
  onSelectProject?: (project: Project) => void;
}

export default function ChatSidebar({ onSelectProject }: ChatSidebarProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const rootId = useStore(state => state.rootId);
  const nodes = useStore(state => state.nodes);
  const { showToast } = useToast();

  useEffect(() => {
    loadProjects();
  }, [rootId, nodes]);

  const loadProjects = () => {
    const allProjects = getAllProjects();
    
    if (rootId) {
      const root = nodes.get(rootId);
      if (root) {
        const currentProjectExists = allProjects.some(p => p.rootId === rootId);
        if (!currentProjectExists) {
          const currentProject: Project = {
            id: 'current',
            name: root.title,
            description: root.problem.substring(0, 100),
            rootId: rootId,
            nodes: new Map(nodes),
            createdAt: root.createdAt,
            updatedAt: root.updatedAt,
            tags: [],
            isStarred: false,
          };
          setProjects([currentProject, ...allProjects]);
          return;
        }
      }
    }
    
    setProjects(allProjects);
  };

  const handleSelectProject = (project: Project) => {
    const store = useStore.getState();
    store.clearTree();
    
    project.nodes.forEach((node) => {
      store.addNode(node);
    });
    
    if (project.rootId) {
      store.updateNode(project.rootId, {});
      // @ts-ignore
      store.setState({ rootId: project.rootId, selectedNodeId: project.rootId });
    }
    
    showToast('Project loaded', 'success');
    if (onSelectProject) {
      onSelectProject(project);
    }
  };

  const [showNewChatModal, setShowNewChatModal] = useState(false);

  const handleNewChat = () => {
    setShowNewChatModal(true);
  };

  const handleNewChatSubmit = (problem: string) => {
    const store = useStore.getState();
    store.clearTree();
    store.createRoot(problem);
    showToast('New chat created!', 'success');
    setShowNewChatModal(false);
  };

  return (
    <div className="h-full flex flex-col relative">
      {/* Header */}
      <div className="p-6 flex-shrink-0 border-b border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white mb-1">Conversations</h2>
            <p className="text-xs text-white/50">Your problem-solving sessions</p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNewChat}
          className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </motion.button>
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <AnimatePresence mode="popLayout">
          {projects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-purple-400" />
              </div>
              <p className="text-sm text-white/60 mb-1">No conversations yet</p>
              <p className="text-xs text-white/40">Create your first chat to get started</p>
            </motion.div>
          ) : (
            projects.map((project, index) => {
              const isCurrent = project.id === 'current' || rootId === project.rootId;
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ 
                    delay: index * 0.05,
                    type: "spring",
                    stiffness: 300,
                    damping: 25
                  }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (project.id !== 'current') {
                      handleSelectProject(project);
                    }
                  }}
                  className={`
                    card-modern cursor-pointer relative overflow-hidden
                    ${isCurrent
                      ? 'bg-gradient-to-br from-purple-500/20 via-indigo-500/20 to-blue-500/20 border-purple-500/30 shadow-lg shadow-purple-500/20'
                      : 'bg-white/5 hover:bg-white/10 border-white/10'
                    }
                  `}
                >
                  {/* Active indicator */}
                  {isCurrent && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '4px' }}
                      className="absolute left-0 top-0 bottom-0 bg-gradient-to-b from-purple-500 to-indigo-500 rounded-r-full"
                    />
                  )}

                  <div className="flex items-start gap-3">
                    <div className={`
                      w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                      ${isCurrent 
                        ? 'bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg shadow-purple-500/30' 
                        : 'bg-white/10'
                      }
                    `}>
                      <FileText className={`w-5 h-5 ${isCurrent ? 'text-white' : 'text-white/70'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-white truncate">
                          {project.name}
                        </h3>
                        {isCurrent && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="px-2 py-0.5 rounded-full bg-purple-500/30 text-xs text-purple-300 font-medium"
                          >
                            Active
                          </motion.span>
                        )}
                      </div>
                      <p className="text-xs text-white/50 line-clamp-2 mb-2">
                        {project.description || 'No description'}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-white/40">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* New Chat Modal */}
      <ProblemInputModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onSubmit={handleNewChatSubmit}
        title="Create New Conversation"
        placeholder="Enter your problem or question..."
      />
    </div>
  );
}
