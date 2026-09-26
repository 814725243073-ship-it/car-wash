import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { OverviewView } from './OverviewView';
import { AppointmentsView } from './AppointmentsView';
import { ServicesView } from './ServicesView';
import { BusinessHoursView } from './BusinessHoursView';
import { BlockedDatesView } from './BlockedDatesView';
import { BusinessSettingsView } from './BusinessSettingsView';

interface AdminLayoutProps {
  onBackToWebsite: () => void;
}

export type AdminTab =
  | 'overview'
  | 'appointments'
  | 'services'
  | 'hours'
  | 'blocked'
  | 'settings';

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onBackToWebsite }) => {
  const { user, signOut } = useAuth();
  const { businessSettings } = useData();
  const [currentTab, setCurrentTab] = useState<AdminTab>('overview');

  const navItems: { id: AdminTab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'appointments', label: 'Appointments', icon: '🗓️' },
    { id: 'services', label: 'Services & Pricing', icon: '🧼' },
    { id: 'hours', label: 'Business Hours', icon: '⏰' },
    { id: 'blocked', label: 'Blocked Dates', icon: '🚫' },
    { id: 'settings', label: 'Business Settings', icon: '⚙️' },
  ];

  return (
    <div className="flex h-screen bg-[#080B11] text-slate-100 overflow-hidden">
      {/* Sidebar (260px width) */}
      <aside className="w-64 border-r border-white/5 bg-[#0A0E17] flex flex-col justify-between shrink-0">
        <div>
          {/* Brand header */}
          <div className="h-16 flex items-center px-6 border-b border-white/5">
            <div>
              <div className="font-display text-sm font-bold tracking-wider text-white uppercase">
                {businessSettings.business_name || 'AURA HYDRO'}
              </div>
              <div className="text-[10px] text-cyan-400 font-semibold uppercase tracking-widest">
                Management Console
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 text-xs">
            {navItems.map((item) => {
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-all text-left cursor-pointer ${
                    active
                      ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="text-sm">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: User & Sign Out */}
        <div className="p-4 border-t border-white/5 bg-slate-950/40">
          <div className="text-xs mb-3">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">
              Signed in as
            </span>
            <span className="text-slate-300 font-medium truncate block">
              {user?.email || 'Admin'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onBackToWebsite}
              className="flex-1 rounded-lg border border-slate-700 bg-slate-900 py-1.5 text-[11px] text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Public Site
            </button>
            <button
              onClick={() => signOut()}
              className="rounded-lg border border-rose-500/30 bg-rose-950/20 px-2.5 py-1.5 text-[11px] text-rose-400 hover:bg-rose-900/40 transition-colors cursor-pointer"
              title="Sign Out of Supabase"
            >
              Exit
            </button>
          </div>
        </div>
      </aside>

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar with Contextual Breadcrumbs */}
        <header className="h-16 border-b border-white/5 bg-[#080B11]/80 backdrop-blur px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Admin</span>
            <span>/</span>
            <span className="text-white capitalize font-semibold">{currentTab}</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onBackToWebsite}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors cursor-pointer"
            >
              ← View Public Website
            </button>
          </div>
        </header>

        {/* Tab Content Canvas */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {currentTab === 'overview' && (
            <OverviewView onNavigateTab={(t) => setCurrentTab(t as AdminTab)} />
          )}
          {currentTab === 'appointments' && <AppointmentsView />}
          {currentTab === 'services' && <ServicesView />}
          {currentTab === 'hours' && <BusinessHoursView />}
          {currentTab === 'blocked' && <BlockedDatesView />}
          {currentTab === 'settings' && <BusinessSettingsView />}
        </main>
      </div>
    </div>
  );
};
