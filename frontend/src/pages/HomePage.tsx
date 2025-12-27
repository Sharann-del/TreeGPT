import { useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';

export default function HomePage() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  return (
    <motion.div 
      className="flex h-screen relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Sidebar 
        selectedChatId={selectedChatId}
        onSelectChat={setSelectedChatId}
      />
      <ChatArea chatId={selectedChatId} />
    </motion.div>
  );
}

