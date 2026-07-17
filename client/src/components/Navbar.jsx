import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Extract queue ID from path for analytics link
  const queueMatch = location.pathname.match(/^\/queue\/([^/]+)/);
  const queueId = queueMatch ? queueMatch[1] : null;

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/60 backdrop-blur-xl border-b border-outline-variant/30 shadow-sm">
      <div className="flex justify-between items-center w-full px-6 py-2 max-w-[1440px] mx-auto">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <Link to="/home" className="flex items-center gap-2 no-underline">
            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>all_inclusive</span>
            <span className="text-3xl font-bold text-primary tracking-tight">QueueFlow</span>
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Nav links */}
          <div className="hidden sm:flex items-center gap-1">
            <Link to="/about" className="px-3 py-1.5 rounded-md text-sm font-medium text-on-surface-variant hover:text-white transition-colors">About</Link>
            <Link to="/contact" className="px-3 py-1.5 rounded-md text-sm font-medium text-on-surface-variant hover:text-white transition-colors">Contact</Link>
            <Link to="/privacy" className="px-3 py-1.5 rounded-md text-sm font-medium text-on-surface-variant hover:text-white transition-colors">Privacy</Link>
            
            {queueId && (
              <Link
                to={`/queue/${queueId}/dashboard`}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  location.pathname.includes('/dashboard')
                    ? 'text-primary bg-surface-variant/50'
                    : 'text-on-surface-variant hover:text-primary hover:bg-surface-variant/30'
                }`}
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* Separator */}
          <div className="w-px h-6 bg-outline-variant/50" />

          {/* User info */}
          <div className="flex items-center gap-2">
            <Link to="/profile" className="flex items-center gap-2 no-underline group">
              <div className="w-8 h-8 rounded-full bg-primary-container group-hover:bg-primary flex items-center justify-center text-on-primary-container group-hover:text-on-primary text-sm font-bold transition-colors">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="text-base font-medium text-on-surface hidden md:inline group-hover:text-primary transition-colors">
                {user?.name || 'User'}
              </span>
            </Link>
            <button
              onClick={logout}
              className="ml-2 text-xs font-semibold text-on-surface-variant hover:text-error transition-colors uppercase tracking-wider flex items-center gap-1 cursor-pointer"
            >
              Logout
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
