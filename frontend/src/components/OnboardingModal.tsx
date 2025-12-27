import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = [
  {
    title: 'Welcome to TreeGPT',
    content: 'TreeGPT helps you break down complex problems into manageable steps using AI.',
    icon: Sparkles,
  },
  {
    title: 'Create Your First Problem',
    content: 'Enter your problem in the input field and press Enter or click "Generate Tree" to get started.',
  },
  {
    title: 'Explore the Tree',
    content: 'Navigate through the tree visualization. Click on nodes to view details and create sub-problems.',
  },
  {
    title: 'Solve Problems',
    content: 'Select a node and click "Solve Problem" to generate AI-powered solutions step by step.',
  },
  {
    title: 'Save Your Work',
    content: 'Use the Save button to store your projects. Access them later from the Dashboard.',
  },
];

export default function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
      localStorage.setItem('treegpt_onboarding_completed', 'true');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = steps[currentStep];
  const Icon = step.icon || Sparkles;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="glass-panel rounded-2xl w-full max-w-lg shadow-2xl"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{step.title}</h2>
                  <p className="text-sm text-white/60">Step {currentStep + 1} of {steps.length}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-white/80 leading-relaxed">{step.content}</p>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="px-4 py-2 rounded-xl glass text-white/60 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="flex gap-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentStep ? 'bg-cyan-400 w-6' : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 transition-all flex items-center gap-2"
              >
                {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

