import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles } from 'lucide-react';

interface ProblemInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (problem: string) => void;
  title: string;
  placeholder?: string;
  defaultValue?: string;
}

export default function ProblemInputModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  placeholder = 'Enter your problem...',
  defaultValue = ''
}: ProblemInputModalProps) {
  const [input, setInput] = useState(defaultValue);

  useEffect(() => {
    if (isOpen) {
      setInput(defaultValue);
    }
  }, [isOpen, defaultValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSubmit(input.trim());
      setInput('');
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl glass-panel rounded-3xl overflow-hidden shadow-2xl"
        >
          {/* Gradient Header */}
          <div className="relative bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-blue-500/20 p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white flex-1">{title}</h2>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 rounded-xl glass hover:bg-white/10 text-white/60 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                autoFocus
                className="w-full h-48 glass rounded-2xl p-5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all resize-none text-sm leading-relaxed"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              />
              <div className="absolute bottom-4 right-4 text-xs text-white/30">
                Press ⌘+Enter to submit
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 mt-6">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl glass hover:bg-white/10 text-white/70 hover:text-white transition-all font-medium"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                disabled={!input.trim()}
                whileHover={{ scale: input.trim() ? 1.05 : 1 }}
                whileTap={{ scale: input.trim() ? 0.95 : 1 }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold flex items-center gap-2 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                <span>Submit</span>
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
