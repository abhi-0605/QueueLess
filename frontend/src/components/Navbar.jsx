import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export const Navbar = () => {
  const { user, isAuthenticated, isStaff, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = (path) =>
    `px-3 py-1.5 text-xs font-mono tracking-wider transition-colors uppercase ${
      location.pathname === path
        ? 'text-amber-400 bg-zinc-900 border border-amber-900/50 rounded'
        : 'text-zinc-400 hover:text-zinc-200'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 font-bold font-mono text-base tracking-wider text-zinc-100">
            <span className="w-6 h-6 rounded bg-amber-500 text-zinc-950 flex items-center justify-center font-black text-sm">
              Q
            </span>
            <span>QUEUE<span className="text-amber-400">LESS</span></span>
          </Link>

          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-zinc-900/80 border border-zinc-800 text-[11px] font-mono text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>CORE NODE: ONLINE</span>
          </div>
        </div>

        <nav className="flex items-center gap-2">
          <Link to="/" className={navLinkClass('/')}>
            Services
          </Link>

          {isStaff && (
            <Link to="/admin" className={navLinkClass('/admin')}>
              Ops Console
            </Link>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-3 ml-2 pl-3 border-l border-zinc-800">
              <div className="text-right hidden md:block">
                <div className="text-xs font-medium text-zinc-200">{user.name}</div>
                <div className="text-[10px] font-mono text-amber-400/90 tracking-wider">
                  {user.role}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-2.5 py-1 text-xs font-mono text-zinc-400 hover:text-rose-400 hover:bg-rose-950/30 border border-zinc-800 hover:border-rose-900/60 rounded transition-colors"
                title="Sign out"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-2 pl-3 border-l border-zinc-800">
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs font-mono text-zinc-200 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 text-xs font-mono font-semibold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};
