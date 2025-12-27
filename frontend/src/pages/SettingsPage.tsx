import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Key, Moon, Sun, Monitor, Trash2 } from 'lucide-react';
import { useStore } from '../store';
import { useToast } from '../utils/toast';
import ApiKeyModal from '../components/ApiKeyModal';

type Theme = 'light' | 'dark' | 'system';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const apiKey = useStore(state => state.apiKey);
  const [theme, setTheme] = useState<Theme>('dark');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    showToast(`Theme changed to ${newTheme}`, 'success');
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all local data? This cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
      showToast('All data cleared', 'info');
    }
  };

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
              Settings
            </h1>
            <p className="text-white/60">Manage your preferences and API keys</p>
          </div>
        </div>

        {/* API Key Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <Key className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">OpenAI API Key</h2>
              <p className="text-sm text-white/60">Your API key is stored locally and never sent to our servers</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              {apiKey ? (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm text-green-300">API key configured</span>
                  <span className="text-xs text-white/40 font-mono">
                    {apiKey.substring(0, 8)}...
                  </span>
                </div>
              ) : (
                <span className="text-sm text-white/60">No API key set</span>
              )}
            </div>
            <button
              onClick={() => setShowApiKeyModal(true)}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-xl font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all"
            >
              {apiKey ? 'Update Key' : 'Set API Key'}
            </button>
          </div>
        </motion.div>

        {/* Theme Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Monitor className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Theme</h2>
              <p className="text-sm text-white/60">Choose your preferred color scheme</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(['light', 'dark', 'system'] as Theme[]).map((t) => {
              const Icon = t === 'light' ? Sun : t === 'dark' ? Moon : Monitor;
              return (
                <button
                  key={t}
                  onClick={() => handleThemeChange(t)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    theme === t
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <Icon className="w-6 h-6 mx-auto mb-2 text-white/60" />
                  <div className="text-sm font-medium text-white capitalize">{t}</div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Data Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Data Management</h2>
              <p className="text-sm text-white/60">Clear all local data and settings</p>
            </div>
          </div>
          <button
            onClick={handleClearData}
            className="bg-red-500/20 text-red-400 px-4 py-2 rounded-xl font-semibold hover:bg-red-500/30 transition-all border border-red-500/30"
          >
            Clear All Data
          </button>
        </motion.div>

        {/* About Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel rounded-2xl p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4">About TreeGPT</h2>
          <div className="space-y-2 text-white/60">
            <p>Version 1.0.0</p>
            <p>TreeGPT helps you break down complex problems into manageable steps using AI.</p>
            <p className="pt-4">
              <a
                href="https://github.com/Sharann-del/TreeGPT"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 underline"
              >
                View on GitHub
              </a>
            </p>
          </div>
        </motion.div>
      </div>

      {showApiKeyModal && (
        <ApiKeyModal onClose={() => setShowApiKeyModal(false)} />
      )}
    </div>
  );
}

