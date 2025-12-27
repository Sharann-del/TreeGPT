import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Book, PlayCircle, Keyboard, HelpCircle, Zap } from 'lucide-react';

export default function HelpPage() {
  const navigate = useNavigate();

  const sections = [
    {
      icon: PlayCircle,
      title: 'Getting Started',
      content: [
        'Enter your problem in the input field on the landing page',
        'Click "Generate Tree" or press Enter to create your problem tree',
        'The AI will break down your problem into manageable steps',
        'Each step appears as a node in the tree visualization',
      ],
    },
    {
      icon: Zap,
      title: 'Solving Problems',
      content: [
        'Select a node to view its details in the right panel',
        'Click "Solve Problem" to generate a solution using AI',
        'Solutions are displayed with proper formatting and code highlighting',
        'You can create sub-problems for any node to dive deeper',
      ],
    },
    {
      icon: Keyboard,
      title: 'Keyboard Shortcuts',
      content: [
        'Enter: Generate tree (on landing page)',
        'Enter: Create sub-problem (in input field)',
        'Escape: Close modals and panels',
        'Arrow keys: Navigate between nodes (coming soon)',
      ],
    },
    {
      icon: HelpCircle,
      title: 'Tips & Tricks',
      content: [
        'Save your projects regularly using the Save button',
        'Export your trees as JSON for backup',
        'Use the search feature in the dashboard to find projects',
        'Star important projects for quick access',
        'The tree view supports panning and zooming with mouse/trackpad',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl glass hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
              Help & Documentation
            </h1>
            <p className="text-white/60">Learn how to use TreeGPT effectively</p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-panel rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">{section.title}</h2>
                </div>
                <ul className="space-y-2 ml-13">
                  {section.content.map((item, i) => (
                    <li key={i} className="text-white/70 flex items-start gap-2">
                      <span className="text-cyan-400 mt-1.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-panel rounded-2xl p-6 mt-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Book className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-white mb-1">Do I need an API key?</h3>
              <p className="text-white/60">Yes, you need an OpenAI API key to use TreeGPT. Your key is stored locally and never sent to our servers.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Is my data private?</h3>
              <p className="text-white/60">Yes! All data is stored locally in your browser. We don't collect or store any of your information.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Can I export my trees?</h3>
              <p className="text-white/60">Yes, you can export trees as JSON files and import them later. More export formats coming soon!</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">How do I create sub-problems?</h3>
              <p className="text-white/60">Select a node, enter a sub-problem in the input field, and click "Add Sub-problem" or press Enter.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

