import React from 'react';
import { IMAGES } from '../../lib/images';
import { useData } from '../../context/DataContext';

export const AboutSection: React.FC = () => {
  const { businessSettings } = useData();

  return (
    <section id="facility" className="relative py-24 bg-[#080B11] border-b border-white/5 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Image Composition */}
          <div className="lg:col-span-6 relative">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
              <img
                src={IMAGES.aboutFacility}
                alt="Modern car wash facility and detailing studio bay"
                className="w-full h-[420px] object-cover object-center filter brightness-95"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080B11]/80 via-transparent to-transparent" />
            </div>

            {/* Overlapping Facility Badge */}
            <div className="absolute -bottom-6 -right-4 sm:right-6 rounded-xl border border-cyan-500/30 bg-[#0E1522]/90 backdrop-blur-md p-5 shadow-xl max-w-xs">
              <div className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1">
                Studio Standards
              </div>
              <div className="text-xl font-bold font-display text-white">
                Multi-Bay Clean Facility
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-snug">
                Equipped with {businessSettings.bays_count || 3} dedicated wash bays to ensure on-time scheduling and zero rushed handoffs.
              </p>
            </div>
          </div>

          {/* Right Column: Copy & Principles */}
          <div className="lg:col-span-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-3">
              <span>Our Philosophy</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>Vehicle Stewardship</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight [text-wrap:balance]">
              Engineering the Cleanest Reflection on the Road
            </h2>

            <p className="mt-5 text-slate-300 text-base leading-relaxed">
              At {businessSettings.business_name || 'AURA Hydro Detailing'}, we believe vehicle maintenance is an art form. Traditional automated tunnels strip protective waxes and introduce swirl marks with abrasive bristles. Our certified team practices gentle hand agitation, strict color-coded microfiber discipline, and filtered water chemistry.
            </p>

            {/* Features Grid with Zero-Pill Discipline */}
            <div className="mt-8 space-y-6">
              <div className="border-l-2 border-cyan-500/50 pl-4">
                <h3 className="text-base font-semibold text-white">Deionized Reverse-Osmosis Water</h3>
                <p className="text-sm text-slate-400 mt-1">
                  Our purification system removes mineral solids, ensuring a completely spotless rinse that dries naturally without hard-water calcification.
                </p>
              </div>

              <div className="border-l-2 border-cyan-500/50 pl-4">
                <h3 className="text-base font-semibold text-white">pH-Neutral Lubricating Snow Foam</h3>
                <p className="text-sm text-slate-400 mt-1">
                  Dense active foam encapsulates surface grit and road traffic film, lifting dirt away from the clear coat before any sponge touches the paint.
                </p>
              </div>

              <div className="border-l-2 border-cyan-500/50 pl-4">
                <h3 className="text-base font-semibold text-white">Dedicated Multi-Bay Capacity</h3>
                <p className="text-sm text-slate-400 mt-1">
                  Our custom-designed wash bays allow parallel detailing without overlapping queues, giving our specialists the exact time needed for every vehicle.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
