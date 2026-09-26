import React from 'react';
import { useData } from '../../context/DataContext';

interface FooterProps {
  onAdminClick: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onAdminClick }) => {
  const { businessSettings, businessHours } = useData();

  const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <footer className="border-t border-white/5 bg-[#05080E] text-slate-400 py-16 text-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Column 1: Brand & Identity */}
          <div className="md:col-span-1">
            <h4 className="font-display text-lg font-bold text-white tracking-wider uppercase mb-3">
              {businessSettings.business_name || 'AURA HYDRO'}
            </h4>
            <p className="text-slate-400 leading-relaxed">
              Bespoke automotive detailing and hand wash studio. Engineering pristine showroom reflections through deionized water chemistry and paint-safe practices.
            </p>
            <div className="mt-4 text-[11px] text-slate-500">
              {businessSettings.bays_count || 3} Active Wash Bays
            </div>
          </div>

          {/* Column 2: Studio Location & Contact */}
          <div>
            <h5 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">
              Studio Location
            </h5>
            <p className="text-slate-300 leading-relaxed">
              {businessSettings.business_address || 'West Bay Detailing Center'}
            </p>
            <div className="mt-4 space-y-1.5">
              <p>
                <span className="text-slate-500">Phone: </span>
                <span className="text-slate-300">{businessSettings.business_phone}</span>
              </p>
              <p>
                <span className="text-slate-500">Email: </span>
                <span className="text-slate-300">{businessSettings.business_email}</span>
              </p>
            </div>
          </div>

          {/* Column 3: Operating Hours */}
          <div>
            <h5 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">
              Operating Hours
            </h5>
            <div className="space-y-1 text-[11px]">
              {businessHours.map((bh) => {
                const dayName = weekdayNames[bh.weekday];
                const formatTime = (t: string) => {
                  const [h, m] = t.split(':');
                  const hours = parseInt(h, 10);
                  const ampm = hours >= 12 ? 'PM' : 'AM';
                  const displayH = hours % 12 || 12;
                  return `${displayH}:${m} ${ampm}`;
                };

                return (
                  <div key={bh.weekday} className="flex justify-between py-0.5">
                    <span className="text-slate-400">{dayName}</span>
                    <span className={bh.is_open ? 'text-slate-200' : 'text-slate-600'}>
                      {bh.is_open
                        ? `${formatTime(bh.start_time)} - ${formatTime(bh.end_time)}`
                        : 'Closed'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column 4: Links & Portal */}
          <div>
            <h5 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">
              Quick Links
            </h5>
            <ul className="space-y-2">
              <li>
                <a href="#services" className="hover:text-cyan-400 transition-colors">
                  Services & Detailing Packages
                </a>
              </li>
              <li>
                <a href="#facility" className="hover:text-cyan-400 transition-colors">
                  Studio Bay & Equipment
                </a>
              </li>
              <li>
                <a href="#booking" className="hover:text-cyan-400 transition-colors">
                  Book Wash Appointment
                </a>
              </li>
              <li className="pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={onAdminClick}
                  className="text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>Manager Portal</span>
                  <span aria-hidden="true">→</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} {businessSettings.business_name || 'AURA Hydro Detailing'}. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>Precision Hand Wash</span>
            <span>·</span>
            <span>Zero-Swirl Guarantee</span>
            <span>·</span>
            <span>Spot-Free Deionized Water</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
