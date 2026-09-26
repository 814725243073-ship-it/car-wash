import React, { useState } from 'react';
import { VehicleType } from '../../types/database';
import { VehiclePassCard } from '../vehicle/VehiclePassCard';

interface VehicleDetailsBuilderProps {
  vehicleType: VehicleType;
  onChangeVehicleType: (type: VehicleType) => void;
  vehicleMakeModel: string;
  onChangeVehicleMakeModel: (makeModel: string) => void;
  licensePlate: string;
  onChangeLicensePlate: (plate: string) => void;
  color: string;
  onChangeColor: (color: string) => void;
  soilLevel: string;
  onChangeSoilLevel: (soil: string) => void;
  specialCare: string[];
  onChangeSpecialCare: (care: string[]) => void;
}

const VEHICLE_TYPES: {
  type: VehicleType;
  title: string;
  category: string;
  popularModels: string;
  icon: (active: boolean) => React.ReactNode;
}[] = [
  {
    type: 'sedan',
    title: 'Sedan / Saloon',
    category: 'Standard Class',
    popularModels: 'Honda City, Verna, C-Class, Dzire, Camry',
    icon: (active) => (
      <svg className={`w-6 h-6 ${active ? 'text-cyan-400' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M5 14l1.5-4.5A2 2 0 018.4 8h7.2a2 2 0 011.9 1.5L19 14m-16 0h18m-17 0v3a1 1 0 001 1h1a2 2 0 002-2m10 0a2 2 0 002 2h1a1 1 0 001-1v-3" />
      </svg>
    ),
  },
  {
    type: 'suv',
    title: 'SUV / Crossover',
    category: 'Elevated Body',
    popularModels: 'Creta, Fortuner, Thar, Scorpio, Harrier, XUV700',
    icon: (active) => (
      <svg className={`w-6 h-6 ${active ? 'text-cyan-400' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 13l2-5h12l3 5m-18 0h18m-18 0a2 2 0 002 2h1a2 2 0 002-2m10 0a2 2 0 002 2h1a2 2 0 002-2M5 13v2m14-2v2" />
      </svg>
    ),
  },
  {
    type: 'truck',
    title: 'Truck / 4x4',
    category: 'Heavy-Duty Bed',
    popularModels: 'Hilux, Isuzu D-Max, V-Cross, Rubicon',
    icon: (active) => (
      <svg className={`w-6 h-6 ${active ? 'text-cyan-400' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-1.1 0-2 .9-2 2v7h2m14 0a2 2 0 100-4 2 2 0 000 4zm-12 0a2 2 0 100-4 2 2 0 000 4z" />
      </svg>
    ),
  },
  {
    type: 'van',
    title: 'Van / MPV / Luxury',
    category: 'Extended Cabin',
    popularModels: 'Innova Hycross, Carnival, Vellfire, Carens',
    icon: (active) => (
      <svg className={`w-6 h-6 ${active ? 'text-cyan-400' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 17h16M4 9h16M4 9v8m16-8v8M7 17a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4zM4 9l2-4h12l2 4" />
      </svg>
    ),
  },
  {
    type: 'other',
    title: 'Hatchback / Compact',
    category: 'City Compact',
    popularModels: 'Swift, i20, Polo, Altroz, Baleno, Mini',
    icon: (active) => (
      <svg className={`w-6 h-6 ${active ? 'text-cyan-400' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
  },
];

const POPULAR_BRANDS = [
  'Toyota',
  'Hyundai',
  'Tata',
  'Mahindra',
  'Maruti Suzuki',
  'BMW',
  'Mercedes-Benz',
  'Audi',
  'Honda',
  'Kia',
  'Skoda',
  'Volkswagen',
  'MG',
  'Porsche',
];

const POPULAR_COLORS = [
  { name: 'Obsidian Black', hex: '#111827' },
  { name: 'Pearl White', hex: '#F8FAFC' },
  { name: 'Metallic Silver', hex: '#94A3B8' },
  { name: 'Daytona Grey', hex: '#475569' },
  { name: 'Deep Royal Blue', hex: '#1E3A8A' },
  { name: 'Cherry Red', hex: '#991B1B' },
  { name: 'Forest Green', hex: '#064E3B' },
];

const CARE_PROTOCOLS = [
  { id: 'Ceramic Coated', label: 'Ceramic Coated (pH-Neutral Wash Only)' },
  { id: 'PPF Installed', label: 'Paint Protection Film (PPF Safe)' },
  { id: 'Matte Finish', label: 'Matte / Satin Wrap (Zero Polish / Gloss)' },
  { id: 'Leather Care', label: 'Nappa / Pure Leather Interior Treatment' },
  { id: 'Pet Hair Detailing', label: 'Pet Hair Deep Extraction Needed' },
];

export const VehicleDetailsBuilder: React.FC<VehicleDetailsBuilderProps> = ({
  vehicleType,
  onChangeVehicleType,
  vehicleMakeModel,
  onChangeVehicleMakeModel,
  licensePlate,
  onChangeLicensePlate,
  color,
  onChangeColor,
  soilLevel,
  onChangeSoilLevel,
  specialCare,
  onChangeSpecialCare,
}) => {
  const [selectedBrand, setSelectedBrand] = useState<string>('');

  const handleBrandClick = (brand: string) => {
    setSelectedBrand(brand);
    // If vehicleMakeModel doesn't start with this brand, set it
    if (!vehicleMakeModel.toLowerCase().includes(brand.toLowerCase())) {
      onChangeVehicleMakeModel(`${brand} `);
    }
  };

  const toggleCare = (protocol: string) => {
    if (specialCare.includes(protocol)) {
      onChangeSpecialCare(specialCare.filter((c) => c !== protocol));
    } else {
      onChangeSpecialCare([...specialCare, protocol]);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Vehicle Type Visual Selector */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs uppercase tracking-wider text-slate-300 font-semibold">
            1. Select Vehicle Classification <span className="text-cyan-400">*</span>
          </label>
          <span className="text-[11px] text-slate-500">Affects bay clearance & wash stage</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {VEHICLE_TYPES.map((vt) => {
            const isSelected = vehicleType === vt.type;
            return (
              <button
                key={vt.type}
                type="button"
                onClick={() => onChangeVehicleType(vt.type)}
                className={`flex flex-col justify-between p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-cyan-500 bg-cyan-950/30 text-white shadow-[0_0_15px_rgba(6,182,212,0.2)] ring-1 ring-cyan-500/50'
                    : 'border-white/10 bg-[#0E1522] text-slate-300 hover:border-white/20 hover:bg-slate-900/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    {vt.icon(isSelected)}
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                      {vt.category}
                    </span>
                  </div>
                  <div className="font-display font-bold text-sm text-white">{vt.title}</div>
                </div>
                <div className="mt-3 pt-2 border-t border-white/5 text-[10px] text-slate-400 line-clamp-2">
                  e.g. {vt.popularModels}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Vehicle Identification & License Plate */}
      <div className="rounded-2xl border border-white/10 bg-[#0E1522] p-6 space-y-6">
        <div>
          <h4 className="font-display text-base font-bold text-white mb-1">
            2. Vehicle Identification & Registration
          </h4>
          <p className="text-xs text-slate-400">
            Helps our bay technicians prepare the exact wash chemistry and spot inspection queue.
          </p>
        </div>

        {/* Quick Brand Badges */}
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">
            Popular Automotive Makes (Quick Select)
          </label>
          <div className="flex flex-wrap gap-2">
            {POPULAR_BRANDS.map((brand) => (
              <button
                key={brand}
                type="button"
                onClick={() => handleBrandClick(brand)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                  vehicleMakeModel.toLowerCase().includes(brand.toLowerCase())
                    ? 'border-cyan-500 bg-cyan-500/15 text-cyan-300'
                    : 'border-white/5 bg-slate-900/60 text-slate-300 hover:border-white/20'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Make & Model input */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              Vehicle Make & Model
            </label>
            <input
              type="text"
              placeholder="e.g. Toyota Fortuner Legender or Hyundai Creta"
              value={vehicleMakeModel}
              onChange={(e) => onChangeVehicleMakeModel(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Registration / License Plate */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              Registration / License Plate Number
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-0 top-0 bottom-0 flex items-center justify-center bg-cyan-500/10 border-r border-cyan-500/30 px-3 rounded-l-lg text-[10px] font-black text-cyan-400">
                IND
              </div>
              <input
                type="text"
                placeholder="MH 02 AB 1234 / DL 01 AX 9999"
                value={licensePlate}
                onChange={(e) => onChangeLicensePlate(e.target.value.toUpperCase())}
                className="w-full rounded-lg border border-white/10 bg-slate-900/80 pl-14 pr-4 py-2.5 text-sm text-white font-mono tracking-widest placeholder-slate-600 focus:border-cyan-500 focus:outline-none uppercase font-semibold"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Used by the bay concierge for automatic gate check-in.
            </p>
          </div>
        </div>

        {/* Vehicle Color Palette */}
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">
            Vehicle Color / Finish
          </label>
          <div className="flex flex-wrap items-center gap-3">
            {POPULAR_COLORS.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => onChangeColor(c.name)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
                  color === c.name
                    ? 'border-cyan-500 bg-cyan-950/30 text-white'
                    : 'border-white/5 bg-slate-900/60 text-slate-400 hover:border-white/20'
                }`}
              >
                <span
                  className="h-3.5 w-3.5 rounded-full border border-white/20 shadow-sm"
                  style={{ backgroundColor: c.hex }}
                />
                <span>{c.name}</span>
              </button>
            ))}
            <input
              type="text"
              placeholder="Other Color..."
              value={color}
              onChange={(e) => onChangeColor(e.target.value)}
              className="rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none w-36"
            />
          </div>
        </div>
      </div>

      {/* 3. Surface Dirt / Soil Assessment & Special Care */}
      <div className="rounded-2xl border border-white/10 bg-[#0E1522] p-6 space-y-6">
        <div>
          <h4 className="font-display text-base font-bold text-white mb-1">
            3. Vehicle Condition & Special Care Protocol
          </h4>
          <p className="text-xs text-slate-400">
            Tell us about the paint finish and existing dirt level so we select the ideal wash nozzle and surfactants.
          </p>
        </div>

        {/* Soil Level Selector */}
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">
            Current Soil & Grime Depth
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'light',
                title: 'Light City Dust',
                desc: 'Daily city driving, fine airborne dust, light rain spots.',
              },
              {
                id: 'moderate',
                title: 'Moderate Road Film',
                desc: 'Highway driving, rain splatters, brake dust on alloys.',
              },
              {
                id: 'heavy',
                title: 'Heavy Mud & Off-Road',
                desc: 'Caked mud, heavy road grime, wheel arch buildup.',
              },
            ].map((lvl) => {
              const active = soilLevel === lvl.id;
              return (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => onChangeSoilLevel(lvl.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    active
                      ? 'border-cyan-500 bg-cyan-950/30 text-white shadow-sm ring-1 ring-cyan-500/40'
                      : 'border-white/10 bg-slate-900/60 text-slate-300 hover:border-white/20'
                  }`}
                >
                  <div className="font-bold text-xs text-white">{lvl.title}</div>
                  <div className="text-[11px] text-slate-400 mt-1 leading-snug">{lvl.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Special Care Flags */}
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">
            Special Care Flags (Tick all that apply)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {CARE_PROTOCOLS.map((item) => {
              const isChecked = specialCare.includes(item.id);
              return (
                <label
                  key={item.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                    isChecked
                      ? 'border-cyan-500/40 bg-cyan-950/20 text-white'
                      : 'border-white/5 bg-slate-900/40 text-slate-300 hover:border-white/15'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleCare(item.id)}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                  <span className="font-medium text-[11px]">{item.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Live Vehicle Pass Preview */}
      <div>
        <label className="block text-[11px] uppercase tracking-wider text-cyan-400 font-semibold mb-2">
          Live Digital Studio Pass Preview
        </label>
        <VehiclePassCard
          vehicleType={vehicleType}
          vehicleMakeModel={vehicleMakeModel}
          licensePlate={licensePlate}
          color={color}
          soilLevel={soilLevel}
          specialCare={specialCare}
        />
      </div>
    </div>
  );
};
