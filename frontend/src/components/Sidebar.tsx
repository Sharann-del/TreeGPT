import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MessageSquare } from 'lucide-react';

interface Chat {
  id: string;
  title: string;
  updatedAt: number;
}

interface SidebarProps {
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
}

export default function Sidebar({ selectedChatId, onSelectChat }: SidebarProps) {
  const [chats, setChats] = useState<Chat[]>([]);

  const handleNewChat = () => {
    const newChat: Chat = {
      id: `chat-${Date.now()}`,
      title: 'New Chat',
      updatedAt: Date.now(),
    };
    setChats([newChat, ...chats]);
    onSelectChat(newChat.id);
  };

  return (
    <motion.div 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="w-64 bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col h-full relative z-10" 
      style={{
        boxShadow: '0 0 30px rgba(255, 255, 255, 0.05)',
      }}
    >
      {/* New Chat Button */}
      <div className="p-3 border-b border-white/10">
        <motion.button
          onClick={handleNewChat}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="w-full px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-lg transition-all flex items-center gap-2 text-sm font-semibold border border-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-white/10 relative overflow-hidden group"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.6 }}
          />
          <motion.div
            initial={{ rotate: 0 }}
            whileHover={{ rotate: 90 }}
            transition={{ duration: 0.3 }}
          >
            <Plus className="w-4 h-4 relative z-10" />
          </motion.div>
          <span className="relative z-10">New Chat</span>
        </motion.button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-2">
        <AnimatePresence mode="popLayout">
          {chats.map((chat, index) => (
            <motion.button
              key={chat.id}
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.95 }}
              transition={{ 
                duration: 0.3, 
                delay: index * 0.05,
                ease: [0.4, 0, 0.2, 1]
              }}
              whileHover={{ 
                scale: 1.02, 
                x: 4,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectChat(chat.id)}
              className={`w-full px-3 py-2 rounded-lg text-left text-sm transition-all mb-1 relative overflow-hidden group ${
                selectedChatId === chat.id
                  ? 'bg-white/15 text-white border border-white/20 shadow-lg shadow-white/10'
                  : 'text-gray-300 hover:bg-white/5 hover:border hover:border-white/10'
              }`}
            >
              {selectedChatId === chat.id && (
                <motion.div
                  layoutId="selectedChat"
                  className="absolute inset-0 bg-white/10 rounded-lg"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.5 }}
              />
              <div className="flex items-center gap-2 relative z-10">
                <motion.div
                  animate={{ 
                    rotate: selectedChatId === chat.id ? [0, -10, 10, -10, 0] : 0 
                  }}
                  transition={{ 
                    duration: 0.5,
                    repeat: selectedChatId === chat.id ? Infinity : 0,
                    repeatDelay: 2
                  }}
                >
                  <MessageSquare className={`w-4 h-4 flex-shrink-0 ${selectedChatId === chat.id ? 'text-white' : 'text-gray-400'}`} />
                </motion.div>
                <span className="truncate font-medium">{chat.title}</span>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

