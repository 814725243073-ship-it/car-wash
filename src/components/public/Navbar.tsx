import React from 'react';
import { useData } from '../../context/DataContext';

interface NavbarProps {
  onBookClick: () => void;
  onAdminClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onBookClick, onAdminClick }) => {
  const { businessSettings } = useData();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#080B11]/85 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#"
          className="font-display text-xl font-bold tracking-wider text-white transition-opacity hover:opacity-90 uppercase"
        >
          {businessSettings.business_name || 'AURA HYDRO'}
        </a>

        {/* Zone 2: 4 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a
            href="#services"
            className="hover:text-cyan-400 transition-colors whitespace-nowrap"
          >
            Services & Packages
          </a>
          <a
            href="#facility"
            className="hover:text-cyan-400 transition-colors whitespace-nowrap"
          >
            Studio Bay
          </a>
          <a
            href="#booking"
            className="hover:text-cyan-400 transition-colors whitespace-nowrap"
          >
            Reserve Wash
          </a>
          <button
            type="button"
            onClick={onAdminClick}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            Manager Portal
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBookClick}
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-cyan-500 px-5 py-2.5 text-xs font-semibold tracking-wide text-slate-950 transition-all duration-200 hover:bg-cyan-400 hover:shadow-[0_0_24px_rgba(6,182,212,0.4)] active:scale-98 whitespace-nowrap cursor-pointer"
          >
            <span>Book a Wash</span>
          </button>
        </div>
      </div>
    </header>
  );
};
