import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';

interface AdminLoginViewProps {
  onBackToWebsite: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({ onBackToWebsite }) => {
  const { signIn, loading, authError, user, isAdmin, signOut } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email.trim() || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }

    const res = await signIn(email, password);
    if (!res.success) {
      setLocalError(res.error || 'Authentication failed.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080B11] p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0E1522]/90 p-8 shadow-2xl backdrop-blur-xl relative z-10">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="font-display text-2xl font-bold text-white tracking-tight">
            Manager Access Portal
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Car wash scheduling, service pricing, and bay capacity controls.
          </p>
        </div>

        {/* If user is signed in but not in admin_users table */}
        {user && !isAdmin && (
          <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-950/40 p-4 text-center text-xs text-amber-200">
            <p className="font-semibold mb-1">
              You are signed in, but you are not authorized as an admin.
            </p>
            <p className="text-amber-300/80 mb-3">
              User ID <span className="font-mono text-[11px]">{user.id}</span> does not have a matching record in the <span className="font-mono">admin_users</span> table.
            </p>
            <button
              onClick={() => signOut()}
              className="text-xs text-amber-400 underline hover:text-amber-300 font-medium"
            >
              Sign Out & Try Another Account
            </button>
          </div>
        )}

        {(localError || authError) && !user && (
          <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-950/40 p-4 text-center text-xs text-rose-200">
            {localError || authError}
          </div>
        )}

        {!isSupabaseConfigured() && (
          <div className="mb-6 rounded-xl border border-cyan-500/30 bg-cyan-950/30 p-3 text-center text-xs text-cyan-200">
            Supabase credentials need to be configured in your environment or via the connection assistant.
          </div>
        )}

        {/* Login Form */}
        {(!user || !isAdmin) && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Admin Email
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="manager@auradetailing.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-900/90 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-900/90 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-cyan-500 py-3 text-xs font-semibold text-slate-950 transition-all hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.35)] disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <button
            type="button"
            onClick={onBackToWebsite}
            className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            ← Return to Public Website
          </button>
        </div>
      </div>
    </div>
  );
};
