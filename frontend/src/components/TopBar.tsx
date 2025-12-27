import { motion } from 'framer-motion';
import { Home, PanelLeft, Search, Settings, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ApiKeyModal from './ApiKeyModal';

interface TopBarProps {
  onToggleLeftSidebar: () => void;
  onToggleRightSidebar?: () => void;
  showLeftSidebar: boolean;
  showRightSidebar?: boolean;
  onSearch: () => void;
}

export default function TopBar({
  onToggleLeftSidebar,
  showLeftSidebar,
  onSearch,
}: TopBarProps) {
  const navigate = useNavigate();

  const iconVariants = {
    hover: { scale: 1.1, rotate: 5 },
    tap: { scale: 0.95 }
  };

  return (
    <div className="h-16 glass-strong border-b border-white/10 flex items-center justify-between px-6 flex-shrink-0 relative z-50">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-shadow">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-gradient hidden sm:block">
            TreeGPT
          </span>
        </motion.div>

        <div className="h-6 w-px bg-white/10 mx-2" />

        {/* Navigation Buttons */}
        <div className="flex items-center gap-2">
          <motion.button
            variants={iconVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => navigate('/')}
            className="p-2.5 rounded-xl glass hover:bg-white/10 transition-all text-white/70 hover:text-white group relative"
            title="Home"
          >
            <Home className="w-4 h-4" />
            <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
          </motion.button>

          <motion.button
            variants={iconVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={onToggleLeftSidebar}
            className={`p-2.5 rounded-xl transition-all relative group ${
              showLeftSidebar 
                ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-500/30' 
                : 'glass hover:bg-white/10 text-white/70 hover:text-white'
            }`}
            title="Toggle Sidebar"
          >
            <PanelLeft className="w-4 h-4" />
            <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
          </motion.button>

          <motion.button
            variants={iconVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={onSearch}
            className="p-2.5 rounded-xl glass hover:bg-white/10 transition-all text-white/70 hover:text-white group relative"
            title="Search"
          >
            <Search className="w-4 h-4" />
            <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
          </motion.button>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        <ApiKeyModal />
        <motion.button
          variants={iconVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={() => navigate('/settings')}
          className="p-2.5 rounded-xl glass hover:bg-white/10 transition-all text-white/70 hover:text-white group relative"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
          <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
        </motion.button>
      </div>
    </div>
  );
}
