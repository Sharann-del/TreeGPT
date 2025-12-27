import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ChatAreaProps {
  chatId: string | null;
}

const placeholderText = "Ask anything...";
const typingSpeed = 100;
const deletingSpeed = 50;
const pauseDuration = 2000;

export default function ChatArea({ chatId }: ChatAreaProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (!isDeleting && charIndex < placeholderText.length) {
      // Typing
      timeout = setTimeout(() => {
        setDisplayedText(placeholderText.substring(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      }, typingSpeed);
    } else if (!isDeleting && charIndex === placeholderText.length) {
      // Pause at end
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, pauseDuration);
    } else if (isDeleting && charIndex > 0) {
      // Deleting
      timeout = setTimeout(() => {
        setDisplayedText(placeholderText.substring(0, charIndex - 1));
        setCharIndex(charIndex - 1);
      }, deletingSpeed);
    } else if (isDeleting && charIndex === 0) {
      // Pause at start
      timeout = setTimeout(() => {
        setIsDeleting(false);
      }, 500);
    }

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="flex-1 flex items-center justify-center relative z-10"
    >
      <div className="w-full max-w-4xl px-6">
        <motion.div 
          className="relative"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Animated glowing border - moving along edges */}
          <div className="absolute -inset-[3px] rounded-2xl overflow-hidden pointer-events-none">
            <motion.div
              className="absolute"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255, 100, 50, 1), rgba(255, 20, 147, 1), transparent)',
                filter: 'blur(6px)',
              }}
              animate={{
                // Top edge (left to right)
                width: ['100px', '100px', '4px', '4px', '100px'],
                height: ['4px', '4px', '100px', '100px', '4px'],
                left: ['0px', 'calc(100% - 100px)', 'calc(100% - 4px)', '0px', '0px'],
                top: ['0px', '0px', '0px', 'calc(100% - 100px)', '0px'],
                background: [
                  'linear-gradient(90deg, transparent, rgba(255, 100, 50, 1), rgba(255, 20, 147, 1), transparent)',
                  'linear-gradient(90deg, transparent, rgba(255, 100, 50, 1), rgba(255, 20, 147, 1), transparent)',
                  'linear-gradient(180deg, transparent, rgba(255, 100, 50, 1), rgba(255, 20, 147, 1), transparent)',
                  'linear-gradient(270deg, transparent, rgba(255, 100, 50, 1), rgba(255, 20, 147, 1), transparent)',
                  'linear-gradient(90deg, transparent, rgba(255, 100, 50, 1), rgba(255, 20, 147, 1), transparent)',
                ],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'linear',
                times: [0, 0.25, 0.5, 0.75, 1],
              }}
            />
          </div>
          
          {/* Glowing corners - top left and top right */}
          <motion.div 
            className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-br from-orange-500/60 to-transparent rounded-tl-2xl blur-md"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.6, 0.9, 0.6]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          ></motion.div>
          <motion.div 
            className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-bl from-pink-500/60 to-transparent rounded-tr-2xl blur-md"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.6, 0.9, 0.6]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.5
            }}
          ></motion.div>
          
          {/* Main input box */}
          <motion.div 
            className="relative bg-black/80 backdrop-blur-sm rounded-2xl p-4 border border-white/10 overflow-hidden" 
            style={{ zIndex: 1 }}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.3 }}
          >
            {/* Input Field */}
            <motion.div 
              className="relative mb-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <textarea
                className="w-full resize-none outline-none bg-transparent text-white font-medium text-sm relative z-10 min-h-[24px]"
                rows={1}
                placeholder={chatId ? "Type your message..." : ""}
              />
              {!chatId && (
                <motion.div 
                  className="absolute top-0 left-0 pointer-events-none text-gray-400 font-medium text-sm flex items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <span>{displayedText}</span>
                  <motion.span 
                    className="inline-block w-0.5 h-4 bg-gray-400 ml-1"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  ></motion.span>
                </motion.div>
              )}
            </motion.div>
            
            {/* Controls Row */}
            <motion.div 
              className="flex items-center gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {/* Add Button */}
              <motion.button 
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center justify-center flex-shrink-0 relative overflow-hidden group"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <motion.div
                  className="absolute inset-0 bg-white/10"
                  initial={{ scale: 0 }}
                  whileHover={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                />
                <span className="text-white text-lg font-light relative z-10">+</span>
              </motion.button>
              
              {/* Normal Mode Button */}
              <motion.button 
                className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center gap-2 text-xs text-gray-300 hover:text-white relative overflow-hidden group"
                whileHover={{ scale: 1.05, x: 2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <motion.div
                  className="absolute inset-0 bg-white/5"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.5 }}
                />
                <svg className="w-3.5 h-3.5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="relative z-10">Normal</span>
                <motion.svg 
                  className="w-3 h-3 relative z-10" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  animate={{ rotate: [0, 180, 0] }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ rotate: 180 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
              </motion.button>
              
              {/* DeepThink Mode Button */}
              <motion.button 
                className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center gap-2 text-xs text-gray-300 hover:text-white relative overflow-hidden group"
                whileHover={{ scale: 1.05, x: 2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <motion.div
                  className="absolute inset-0 bg-white/5"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.5 }}
                />
                <motion.svg 
                  className="w-3.5 h-3.5 relative z-10" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  animate={{ 
                    filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)'],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </motion.svg>
                <span className="relative z-10">DeepThink</span>
                <motion.svg 
                  className="w-3 h-3 relative z-10" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  animate={{ rotate: [0, 180, 0] }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ rotate: 180 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
              </motion.button>
              
              {/* Voice Button */}
              <motion.button 
                className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center gap-2 text-xs text-gray-300 hover:text-white relative overflow-hidden group"
                whileHover={{ scale: 1.05, x: 2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <motion.div
                  className="absolute inset-0 bg-white/5"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.5 }}
                />
                <motion.svg 
                  className="w-3.5 h-3.5 relative z-10" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  animate={{ 
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </motion.svg>
                <span className="relative z-10">Voice</span>
              </motion.button>
              
              {/* Spacer */}
              <div className="flex-1"></div>
              
              {/* Send Button */}
              <motion.button 
                className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg hover:shadow-xl hover:shadow-purple-500/50 flex items-center justify-center flex-shrink-0 relative overflow-hidden"
                whileHover={{ scale: 1.1, rotate: [0, -10, 10, -10, 0] }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  initial={{ scale: 0 }}
                  whileHover={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.svg 
                  className="w-5 h-5 relative z-10" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  animate={{ 
                    x: [0, 2, 0],
                    y: [0, -2, 0]
                  }}
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </motion.svg>
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

