import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, Settings, HelpCircle, Info } from 'lucide-react';
import { cn } from '../utils/cn';

export default function Navigation() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/settings', label: 'Settings', icon: Settings },
    { path: '/help', label: 'Help', icon: HelpCircle },
    { path: '/about', label: 'About', icon: Info },
  ];

  return (
    <nav className="flex items-center gap-1 p-1 glass rounded-xl">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
              isActive
                ? "bg-white/10 text-white"
                : "text-white/60 hover:text-white hover:bg-white/5"
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

