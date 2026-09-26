import React from 'react';
import { useData } from '../../context/DataContext';
import { getServiceImage } from '../../lib/images';
import { Service } from '../../types/database';
import { formatRupee } from '../../lib/formatters';

interface ServicesSectionProps {
  onSelectService: (service: Service) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onSelectService }) => {
  const { activeServices, loading } = useData();

  return (
    <section id="services" className="relative py-24 bg-[#0B0F17] border-b border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-3">
              <span>Bespoke Treatments</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>Hand Wash & Detailing</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight [text-wrap:balance]">
              Curated Services for Every Finish
            </h2>
            <p className="mt-3 text-slate-400 text-base leading-relaxed">
              Every package is carried out using pH-balanced lubricants, double-bucket wash methods with grit guards, and ultra-plush microfiber towels to protect your vehicle's clear coat.
            </p>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            <span>Prices vary with vehicle size & soil depth</span>
          </div>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 animate-pulse min-h-[380px]"
              >
                <div className="h-48 w-full bg-slate-800/60 rounded-xl mb-4" />
                <div className="h-6 w-3/4 bg-slate-800/80 rounded mb-2" />
                <div className="h-4 w-1/2 bg-slate-800/50 rounded mb-4" />
                <div className="h-16 w-full bg-slate-800/30 rounded" />
              </div>
            ))}
          </div>
        ) : activeServices.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-12 text-center max-w-xl mx-auto">
            <p className="text-slate-300 font-medium text-lg">No active services listed yet</p>
            <p className="text-slate-500 text-sm mt-2">
              Services configured in the management dashboard will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeServices.map((service, index) => {
              const imageUrl = getServiceImage(service.name);
              return (
                <div
                  key={service.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#0E1420]/80 transition-all duration-300 hover:border-cyan-500/40 hover:shadow-[0_8px_30px_rgba(6,182,212,0.12)] hover:-translate-y-1"
                >
                  {/* Card Visual Header */}
                  <div>
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
                      <img
                        src={imageUrl}
                        alt={`${service.name} detailing procedure`}
                        className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0E1420] via-[#0E1420]/30 to-transparent" />
                      
                      {/* Quiet unboxed metadata badge in corner */}
                      <div className="absolute bottom-3 left-4 flex items-center gap-1.5 text-xs font-semibold text-cyan-300 bg-slate-950/80 px-2.5 py-1 rounded-md backdrop-blur-md border border-white/10">
                        <span className="tabular-nums">{service.duration_minutes}</span>
                        <span>min duration</span>
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-6">
                      <div className="flex items-baseline justify-between gap-4 mb-2">
                        <h3 className="font-display text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {service.name}
                        </h3>
                      </div>

                      {/* Starting Price: label as "From ₹X" */}
                      <div className="text-sm font-semibold text-slate-300 mb-4">
                        <span className="text-xs font-normal text-slate-400">Starting </span>
                        <span className="text-cyan-400 font-display text-lg font-bold tabular-nums">
                          From {formatRupee(service.price)}
                        </span>
                      </div>

                      <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">
                        {service.description || 'Comprehensive exterior and interior treatment by our certified detailing technicians.'}
                      </p>
                    </div>
                  </div>

                  {/* Booking Affordance */}
                  <div className="p-6 pt-0">
                    <button
                      type="button"
                      onClick={() => onSelectService(service)}
                      className="w-full inline-flex items-center justify-center rounded-lg bg-slate-800/80 py-3 text-xs font-semibold text-slate-200 transition-all hover:bg-cyan-500 hover:text-slate-950 cursor-pointer group-hover:border-cyan-500/50"
                    >
                      <span>Select & Book Service</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
