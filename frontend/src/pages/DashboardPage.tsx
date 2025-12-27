import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Star,
  Trash2,
  Folder,
  TrendingUp,
  Clock,
  FileText,
} from 'lucide-react';
import { getAllProjects, deleteProject, setCurrentProjectId, Project } from '../utils/projects';
import { useStore } from '../store';
import { useToast } from '../utils/toast';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { ProjectCardSkeleton } from '../components/LoadingSkeleton';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'starred' | 'recent'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useKeyboardShortcuts();

  useEffect(() => {
    loadProjects();
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  const loadProjects = () => {
    const allProjects = getAllProjects();
    setProjects(allProjects);
  };

  const handleCreateNew = () => {
    useStore.getState().clearTree();
    navigate('/');
  };

  const handleOpenProject = (project: Project) => {
    const store = useStore.getState();
    store.clearTree();
    
    // Restore project state
    project.nodes.forEach((node) => {
      store.addNode(node);
    });
    
    if (project.rootId) {
      store.updateNode(project.rootId, {});
      // @ts-ignore - accessing private state
      store.setState({ rootId: project.rootId, selectedNodeId: project.rootId });
    }
    
    setCurrentProjectId(project.id);
    navigate('/workspace');
    showToast('Project loaded', 'success');
  };

  const handleDeleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this project?')) {
      deleteProject(id);
      loadProjects();
      showToast('Project deleted', 'success');
    }
  };

  const handleStarProject = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = { ...project, isStarred: !project.isStarred };
    const { saveProject } = require('../utils/projects');
    saveProject(updated);
    loadProjects();
    showToast(project.isStarred ? 'Removed from favorites' : 'Added to favorites', 'info');
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'starred') return matchesSearch && project.isStarred;
    if (filter === 'recent') {
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return matchesSearch && project.updatedAt > weekAgo;
    }
    return matchesSearch;
  });

  const stats = {
    total: projects.length,
    starred: projects.filter(p => p.isStarred).length,
    recent: projects.filter(p => {
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return p.updatedAt > weekAgo;
    }).length,
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-white/60">Manage your problem-solving projects</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-sm">Total Projects</span>
              <FileText className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="text-3xl font-bold text-white">{stats.total}</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-sm">Starred</span>
              <Star className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-3xl font-bold text-white">{stats.starred}</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-sm">Recent (7d)</span>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white">{stats.recent}</div>
          </motion.div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full glass-panel rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl transition-all ${
                filter === 'all' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50' : 'glass-panel text-white/60 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('starred')}
              className={`px-4 py-2 rounded-xl transition-all ${
                filter === 'starred' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50' : 'glass-panel text-white/60 hover:text-white'
              }`}
            >
              Starred
            </button>
            <button
              onClick={() => setFilter('recent')}
              className={`px-4 py-2 rounded-xl transition-all ${
                filter === 'recent' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50' : 'glass-panel text-white/60 hover:text-white'
              }`}
            >
              Recent
            </button>
          </div>
          <button
            onClick={handleCreateNew}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Project
          </button>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-panel rounded-xl p-12 text-center"
          >
            <Folder className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-white/60">No projects found</h3>
            <p className="text-white/40 mb-6">
              {searchQuery ? 'Try a different search query' : 'Create your first project to get started'}
            </p>
            {!searchQuery && (
              <button
                onClick={handleCreateNew}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all"
              >
                Create Project
              </button>
            )}
          </motion.div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleOpenProject(project)}
                className="glass-panel rounded-xl p-6 cursor-pointer hover:border-cyan-500/30 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-cyan-300 transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-sm text-white/60 line-clamp-2">{project.description || 'No description'}</p>
                  </div>
                  <button
                    onClick={(e) => handleStarProject(project, e)}
                    className={`p-2 rounded-lg transition-all ${
                      project.isStarred
                        ? 'text-yellow-400 hover:bg-yellow-400/10'
                        : 'text-white/40 hover:text-yellow-400 hover:bg-yellow-400/10'
                    }`}
                  >
                    <Star className={`w-5 h-5 ${project.isStarred ? 'fill-current' : ''}`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between text-xs text-white/40">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteProject(project.id, e)}
                    className="p-1.5 text-red-400/60 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

