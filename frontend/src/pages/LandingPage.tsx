import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  GitBranch, 
  Zap, 
  Shield, 
  ArrowRight, 
  CheckCircle,
  Code,
  Brain,
  Network
} from 'lucide-react';
import { useStore } from '../store';
import { useToast } from '../utils/toast';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import OnboardingModal from '../components/OnboardingModal';

export default function LandingPage() {
  const navigate = useNavigate();
  const createRoot = useStore(state => state.createRoot);
  const { showToast } = useToast();
  const [problemInput, setProblemInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useKeyboardShortcuts();

  useEffect(() => {
    const completed = localStorage.getItem('treegpt_onboarding_completed');
    if (!completed && !problemInput) {
      setTimeout(() => setShowOnboarding(true), 2000);
    }
  }, [problemInput]);

  const handleCreateRoot = async () => {
    if (!problemInput.trim()) {
      showToast('Please enter a problem to solve', 'warning');
      return;
    }

    setIsGenerating(true);
    try {
      const id = createRoot(problemInput.trim());
      useStore.getState().updateNode(id, { status: 'solving' });
      setProblemInput('');
      navigate('/workspace');
      showToast('Problem tree created!', 'success');
    } catch (error) {
      showToast('Failed to create problem tree', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Solutions',
      description: 'Break down complex problems into manageable steps with GPT-4',
    },
    {
      icon: GitBranch,
      title: 'Hierarchical Structure',
      description: 'Visualize problems as trees with parent-child relationships',
    },
    {
      icon: Zap,
      title: 'Real-time Generation',
      description: 'Watch solutions generate in real-time as you work',
    },
    {
      icon: Network,
      title: 'Interactive Tree View',
      description: 'Navigate and explore your problem tree with intuitive controls',
    },
    {
      icon: Code,
      title: 'Code Highlighting',
      description: 'Commands and code snippets are automatically highlighted',
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'All data stays on your device. API keys never leave your browser',
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
            TreeGPT
          </span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate('/help')}
            className="px-4 py-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            Help
          </button>
          <button
            onClick={() => navigate('/about')}
            className="px-4 py-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            About
          </button>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent"
          >
            Solve Complex Problems
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Step by Step
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-white/60 max-w-2xl mx-auto mb-12"
          >
            TreeGPT uses AI to break down your problems into manageable steps, 
            visualized as an interactive tree structure.
          </motion.p>

          {/* Problem Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative glass-panel rounded-2xl p-2">
                <textarea
                  value={problemInput}
                  onChange={(e) => setProblemInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleCreateRoot();
                    }
                  }}
                  placeholder="Describe your problem, architecture, or algorithm..."
                  className="w-full bg-transparent text-white p-6 text-lg placeholder-white/40 focus:outline-none resize-none min-h-[140px]"
                  disabled={isGenerating}
                />
                <div className="px-6 py-4 border-t border-white/5 flex justify-between items-center">
                  <span className="text-sm text-white/40">
                    Press <kbd className="font-mono bg-white/10 px-2 py-1 rounded text-white/60">Enter</kbd> to generate
                  </span>
                  <button
                    onClick={handleCreateRoot}
                    disabled={!problemInput.trim() || isGenerating}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isGenerating ? 'Generating...' : 'Generate Tree'}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-32"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="glass-panel rounded-2xl p-6 hover:border-cyan-500/30 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-white/60">{feature.description}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="mt-32 text-center"
        >
          <h2 className="text-4xl font-bold mb-6">Ready to get started?</h2>
          <p className="text-white/60 mb-8 max-w-xl mx-auto">
            Join thousands of developers using TreeGPT to solve complex problems efficiently.
          </p>
          <div className="flex items-center justify-center gap-8 text-white/40">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Free to use</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>No account required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Privacy focused</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Onboarding Modal */}
      <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />
    </div>
  );
}

