import React, { useState } from 'react';
import { isSupabaseConfigured, setCustomSupabaseCredentials } from '../lib/supabase';

export const SupabaseConfigModal: React.FC = () => {
  const [open, setOpen] = useState<boolean>(!isSupabaseConfigured());
  const [url, setUrl] = useState<string>('');
  const [anonKey, setAnonKey] = useState<string>('');

  if (isSupabaseConfigured() && !open) {
    return null;
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.startsWith('http') || anonKey.length < 20) {
      alert('Please enter a valid Supabase project URL and anon publishable key.');
      return;
    }
    setCustomSupabaseCredentials(url, anonKey);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md rounded-2xl border border-cyan-500/40 bg-[#0E1522]/95 p-6 shadow-2xl backdrop-blur-xl text-left">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
            Supabase Connection
          </h4>
        </div>
        {isSupabaseConfigured() && (
          <button
            onClick={() => setOpen(false)}
            className="text-xs text-slate-400 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      <p className="text-xs text-slate-300 leading-relaxed mb-4">
        {isSupabaseConfigured()
          ? 'Connected to live Supabase backend.'
          : 'To activate live database queries, RPC availability, and admin authentication, paste your Supabase URL & Anon Key below, or update /.env.'}
      </p>

      {!isSupabaseConfigured() && (
        <form onSubmit={handleSave} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">VITE_SUPABASE_URL</label>
            <input
              type="url"
              required
              placeholder="https://xyz.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">VITE_SUPABASE_ANON_KEY</label>
            <input
              type="password"
              required
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-cyan-500 py-2.5 font-semibold text-slate-950 hover:bg-cyan-400 transition-colors"
          >
            Connect Supabase
          </button>
        </form>
      )}
    </div>
  );
};
