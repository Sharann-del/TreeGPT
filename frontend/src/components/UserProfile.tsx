import { useState } from 'react';
import { Mail, Calendar, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UserProfile() {
  const navigate = useNavigate();
  const [user] = useState({
    name: 'Guest User',
    email: 'guest@treegpt.com',
    joinedDate: new Date().toLocaleDateString(),
    avatar: null,
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{user.name}</h2>
          <p className="text-sm text-white/60">Free Plan</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="glass-panel rounded-xl p-4 flex items-center gap-3">
          <Mail className="w-5 h-5 text-white/60" />
          <div>
            <div className="text-xs text-white/60">Email</div>
            <div className="text-sm text-white">{user.email}</div>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-4 flex items-center gap-3">
          <Calendar className="w-5 h-5 text-white/60" />
          <div>
            <div className="text-xs text-white/60">Member Since</div>
            <div className="text-sm text-white">{user.joinedDate}</div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-white/5 space-y-2">
        <button
          onClick={() => navigate('/settings')}
          className="w-full glass-panel rounded-xl p-4 flex items-center gap-3 hover:bg-white/5 transition-all text-left"
        >
          <Settings className="w-5 h-5 text-white/60" />
          <span className="text-white">Settings</span>
        </button>
        <button
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          className="w-full glass-panel rounded-xl p-4 flex items-center gap-3 hover:bg-red-500/10 transition-all text-left"
        >
          <LogOut className="w-5 h-5 text-red-400" />
          <span className="text-red-400">Sign Out</span>
        </button>
      </div>
    </div>
  );
}

