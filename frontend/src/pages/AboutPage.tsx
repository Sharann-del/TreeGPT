import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Code, Heart, Github, ExternalLink } from 'lucide-react';

export default function AboutPage() {
  const navigate = useNavigate();

  const features = [
    'AI-powered problem decomposition',
    'Interactive tree visualization',
    'Real-time solution generation',
    'Hierarchical problem structure',
    'Code and command highlighting',
    'Project management',
    'Export and import capabilities',
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-12">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl glass hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
              About TreeGPT
            </h1>
            <p className="text-white/60">Break down complex problems, step by step</p>
          </div>
        </div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-2xl p-8 mb-8 text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-white">TreeGPT</h2>
          <p className="text-xl text-white/70 mb-6 max-w-2xl mx-auto">
            An intelligent problem-solving tool that uses AI to break down complex problems
            into manageable, hierarchical steps visualized as an interactive tree.
          </p>
          <div className="flex items-center justify-center gap-2 text-white/60">
            <Heart className="w-4 h-4 text-red-400 fill-red-400" />
            <span>Built with passion for problem solvers</span>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel rounded-2xl p-6 mb-8"
        >
          <h3 className="text-2xl font-semibold mb-4 text-white flex items-center gap-2">
            <Code className="w-6 h-6 text-cyan-400" />
            Features
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-white/70">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tech Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel rounded-2xl p-6 mb-8"
        >
          <h3 className="text-2xl font-semibold mb-4 text-white">Technology Stack</h3>
          <div className="grid md:grid-cols-3 gap-4 text-white/70">
            <div>
              <h4 className="font-semibold text-white mb-2">Frontend</h4>
              <ul className="space-y-1 text-sm">
                <li>• React + TypeScript</li>
                <li>• Tailwind CSS</li>
                <li>• Framer Motion</li>
                <li>• ReactFlow</li>
                <li>• Zustand</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">AI</h4>
              <ul className="space-y-1 text-sm">
                <li>• OpenAI API</li>
                <li>• GPT-4o-mini</li>
                <li>• Streaming responses</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Tools</h4>
              <ul className="space-y-1 text-sm">
                <li>• Vite</li>
                <li>• React Router</li>
                <li>• LocalStorage</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel rounded-2xl p-6"
        >
          <h3 className="text-2xl font-semibold mb-4 text-white flex items-center gap-2">
            <Github className="w-6 h-6 text-cyan-400" />
            Open Source
          </h3>
          <p className="text-white/70 mb-4">
            TreeGPT is open source and available on GitHub. Contributions are welcome!
          </p>
          <a
            href="https://github.com/Sharann-del/TreeGPT"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all"
          >
            <Github className="w-5 h-5" />
            View on GitHub
            <ExternalLink className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </div>
  );
}

