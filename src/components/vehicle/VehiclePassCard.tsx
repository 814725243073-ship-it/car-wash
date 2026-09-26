import React from 'react';
import { VehicleType } from '../../types/database';

interface VehiclePassCardProps {
  vehicleType: VehicleType;
  vehicleMakeModel?: string | null;
  licensePlate?: string | null;
  color?: string;
  soilLevel?: string;
  specialCare?: string[];
  compact?: boolean;
}

export const VehiclePassCard: React.FC<VehiclePassCardProps> = ({
  vehicleType,
  vehicleMakeModel,
  licensePlate,
  color,
  soilLevel,
  specialCare = [],
  compact = false,
}) => {
  const getVehicleIcon = (type: VehicleType) => {
    switch (type) {
      case 'suv':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 13l2-5h12l3 5m-18 0h18m-18 0a2 2 0 002 2h1a2 2 0 002-2m10 0a2 2 0 002 2h1a2 2 0 002-2M5 13v2m14-2v2" />
          </svg>
        );
      case 'truck':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-1.1 0-2 .9-2 2v7h2m14 0a2 2 0 100-4 2 2 0 000 4zm-12 0a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        );
      case 'van':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 17h16M4 9h16M4 9v8m16-8v8M7 17a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4zM4 9l2-4h12l2 4" />
          </svg>
        );
      case 'other':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        );
      case 'sedan':
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M5 14l1.5-4.5A2 2 0 018.4 8h7.2a2 2 0 011.9 1.5L19 14m-16 0h18m-17 0v3a1 1 0 001 1h1a2 2 0 002-2m10 0a2 2 0 002 2h1a1 1 0 001-1v-3" />
          </svg>
        );
    }
  };

  const formattedPlate = licensePlate ? licensePlate.toUpperCase().trim() : 'NO PLATE';

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
          {getVehicleIcon(vehicleType)}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white text-xs truncate">
              {vehicleMakeModel || `${vehicleType.toUpperCase()}`}
            </span>
            <span className="text-[10px] font-mono text-cyan-300 uppercase px-1.5 py-0.5 rounded bg-slate-900 border border-white/10 shrink-0">
              {formattedPlate}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 truncate mt-0.5 flex items-center gap-2">
            <span className="capitalize">{vehicleType}</span>
            {color && (
              <>
                <span>·</span>
                <span>{color}</span>
              </>
            )}
            {soilLevel && (
              <>
                <span>·</span>
                <span className="capitalize">{soilLevel} Soil</span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-gradient-to-br from-[#0E1522] via-[#0E1522]/90 to-[#0A0E17] p-5 shadow-lg relative overflow-hidden">
      {/* Decorative water highlight */}
      <div className="absolute top-0 right-0 h-32 w-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Top Bar: Vehicle Type & Embossed Number Plate */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            {getVehicleIcon(vehicleType)}
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-cyan-400">
              Vehicle Pass
            </div>
            <div className="text-sm font-bold text-white capitalize">{vehicleType} Class</div>
          </div>
        </div>

        {/* Embossed Number Plate Badge */}
        <div className="inline-flex items-center rounded-md border-2 border-slate-700 bg-slate-900 px-3 py-1 shadow-inner">
          <div className="mr-2 flex flex-col items-center justify-center border-r border-slate-700 pr-1.5">
            <span className="text-[8px] font-black text-cyan-400 tracking-tighter">IND</span>
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 mt-0.5" />
          </div>
          <span className="font-mono text-xs font-black tracking-widest text-white tabular-nums">
            {formattedPlate}
          </span>
        </div>
      </div>

      {/* Middle Specs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 text-xs">
        <div>
          <span className="text-slate-500 text-[10px] uppercase font-semibold">Make & Model</span>
          <p className="font-semibold text-white mt-0.5 truncate">
            {vehicleMakeModel || 'Not Specified'}
          </p>
        </div>

        <div>
          <span className="text-slate-500 text-[10px] uppercase font-semibold">Finish / Color</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            {color && (
              <span className="h-2.5 w-2.5 rounded-full border border-white/20 bg-cyan-400" />
            )}
            <p className="font-medium text-slate-200 truncate">{color || 'Standard Paint'}</p>
          </div>
        </div>

        <div>
          <span className="text-slate-500 text-[10px] uppercase font-semibold">Pre-Wash Soil</span>
          <p className="font-medium text-slate-200 capitalize mt-0.5">
            {soilLevel ? `${soilLevel} Dirt Depth` : 'Standard City Soil'}
          </p>
        </div>
      </div>

      {/* Special Care Protocol Tags */}
      {specialCare && specialCare.length > 0 && (
        <div className="mt-4 pt-3 border-t border-white/5">
          <span className="text-slate-500 text-[10px] uppercase font-semibold block mb-1.5">
            Special Care Protocols Active:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {specialCare.map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] font-medium text-cyan-300 bg-cyan-950/60 border border-cyan-500/20 px-2 py-0.5 rounded"
              >
                ✓ {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
