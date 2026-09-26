import React from 'react';
import { IMAGES } from '../../lib/images';
import { useData } from '../../context/DataContext';

interface HeroProps {
  onBookClick: () => void;
  onExploreServices: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onBookClick, onExploreServices }) => {
  const { businessSettings } = useData();

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden border-b border-white/5 bg-[#080B11] pt-6 pb-20">
      {/* Background Studio Visual with Cinematic Gradient Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src={IMAGES.hero}
          alt="Luxury sports car in pristine automotive detailing studio under hexagonal studio lighting"
          className="h-full w-full object-cover object-center filter brightness-90 contrast-105"
          referrerPolicy="no-referrer"
        />
        {/* Measured dark scrim for WCAG AA readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080B11] via-[#080B11]/75 to-[#080B11]/45" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080B11]/90 via-[#080B11]/60 to-transparent" />
        {/* Subtle water reflection and blue rim light */}
        <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full py-12 md:py-20">
        <div className="max-w-3xl">
          {/* Unboxed natural kicker */}
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-cyan-400">
            <span>Automotive Care Studio</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Multi-Bay Facility</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Hand Wash Protocol</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white [text-wrap:balance] leading-[1.1]">
            Precision Hydro Care for Exceptional Vehicles
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed font-normal max-w-2xl">
            Experience hand-applied citrus snow foam baths, deionized spot-free water filtration, and gentle microfiber detailing. Designed for drivers who cherish pristine paint and spotless interiors.
          </p>

          {/* Action Row */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={onBookClick}
              className="inline-flex items-center justify-center rounded-lg bg-cyan-500 px-7 py-3.5 text-sm font-semibold text-slate-950 transition-all duration-200 hover:bg-cyan-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.45)] active:scale-98 cursor-pointer whitespace-nowrap"
            >
              Reserve Wash Appointment
            </button>
            <button
              type="button"
              onClick={onExploreServices}
              className="inline-flex items-center justify-center rounded-lg border border-slate-700/80 bg-slate-900/60 backdrop-blur-sm px-6 py-3.5 text-sm font-medium text-slate-200 transition-colors hover:border-slate-500 hover:bg-slate-800/80 cursor-pointer whitespace-nowrap"
            >
              View Service Menu
            </button>
          </div>

          {/* Claim-to-Proof Quantitative Adjacency */}
          <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-6 text-left">
            <div>
              <div className="text-2xl font-bold font-display text-white tabular-nums tracking-tight">
                {businessSettings.bays_count || 3} Bays
              </div>
              <p className="text-xs text-slate-400 mt-1">Simultaneous bay capacity</p>
            </div>
            <div>
              <div className="text-2xl font-bold font-display text-white tracking-tight">
                0% Swirls
              </div>
              <p className="text-xs text-slate-400 mt-1">Multi-stage grit guard wash</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <div className="text-2xl font-bold font-display text-white tracking-tight">
                Deionized
              </div>
              <p className="text-xs text-slate-400 mt-1">Filtered spot-free pure water</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
