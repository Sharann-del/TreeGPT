import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StepBasedView from '../components/StepBasedView';
import { useSolutionStream } from '../hooks/useSolutionStream';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import SearchModal from '../components/SearchModal';
import OnboardingModal from '../components/OnboardingModal';
import TopBar from '../components/TopBar';
import ChatSidebar from '../components/ChatSidebar';

export default function WorkspacePage() {
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useSolutionStream();
  useKeyboardShortcuts();

  useEffect(() => {
    const completed = localStorage.getItem('treegpt_onboarding_completed');
    if (!completed) {
      setTimeout(() => setShowOnboarding(true), 1000);
    }
  }, []);

  return (
    <div className="h-screen w-screen bg-[#0a0a0f] overflow-hidden flex flex-col relative">
      {/* Animated background gradient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0s' }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Top Bar - Fixed */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-50"
      >
        <TopBar
          onToggleLeftSidebar={() => setShowLeftSidebar(!showLeftSidebar)}
          onToggleRightSidebar={() => {}}
          showLeftSidebar={showLeftSidebar}
          showRightSidebar={false}
          onSearch={() => setShowSearchModal(true)}
        />
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Left Sidebar - Chats/Trees */}
        <AnimatePresence mode="wait">
          {showLeftSidebar && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                duration: 0.4
              }}
              className="w-72 flex-shrink-0 glass border-r border-white/10"
            >
              <ChatSidebar />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center Main - Step-based Tree View */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1 overflow-x-auto overflow-y-auto relative"
        >
          <StepBasedView />
        </motion.div>
      </div>

      {/* Modals */}
      <SearchModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} />
      <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />
    </div>
  );
}
