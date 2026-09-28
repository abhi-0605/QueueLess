import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login({ email, password });
      if (user.role === 'ROLE_ADMIN' || user.role === 'ROLE_STAFF') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const fillQuick = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-lg p-6 sm:p-8 shadow-xl">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 bg-amber-400 rounded-sm" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400">
              Terminal Authentication
            </span>
          </div>
          <h2 className="text-2xl font-bold font-mono tracking-tight text-zinc-100">
            Sign In to QueueLess
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Access queue tracking, counter operations, or organization management.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
              Operator / User Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@queueless.local"
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
              Security Key / Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-mono font-bold text-xs uppercase tracking-wider rounded transition-colors disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Authenticate & Continue'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-zinc-800">
          <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-2">
            Quick Preset Accounts (Development)
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillQuick('admin@queueless.local', 'admin123')}
              className="px-2 py-1.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded text-[11px] font-mono text-zinc-300 text-center transition-colors"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => fillQuick('staff@queueless.local', 'staff123')}
              className="px-2 py-1.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded text-[11px] font-mono text-zinc-300 text-center transition-colors"
            >
              Staff
            </button>
            <button
              type="button"
              onClick={() => fillQuick('user@queueless.local', 'user123')}
              className="px-2 py-1.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded text-[11px] font-mono text-zinc-300 text-center transition-colors"
            >
              User
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs font-mono text-zinc-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-amber-400 hover:underline">
            Register new account
          </Link>
        </div>
      </div>
    </div>
  );
};
