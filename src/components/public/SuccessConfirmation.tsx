import React from 'react';
import { Service, VehicleType } from '../../types/database';
import { useData } from '../../context/DataContext';
import { formatRupee, parseVehicleNotes } from '../../lib/formatters';
import { VehiclePassCard } from '../vehicle/VehiclePassCard';

export interface ConfirmedBookingData {
  service: Service;
  appointmentDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM:SS
  endTime: string; // HH:MM:SS
  formattedTimeRange: string;
  fullName: string;
  email: string;
  phone: string;
  vehicleType: VehicleType;
  vehicleMakeModel?: string;
  licensePlate?: string;
  notes?: string;
}

interface SuccessConfirmationProps {
  booking: ConfirmedBookingData;
  onReset: () => void;
}

export const SuccessConfirmation: React.FC<SuccessConfirmationProps> = ({ booking, onReset }) => {
  const { businessSettings } = useData();

  const formattedDate = new Date(`${booking.appointmentDate}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const parsedNotes = parseVehicleNotes(booking.notes);

  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-emerald-500/30 bg-[#0E1624] p-6 sm:p-10 shadow-2xl">
      {/* Success Banner */}
      <div className="text-center mb-8">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Appointment Request Registered
        </h3>
        <p className="mt-2 text-sm text-slate-300">
          Your wash appointment has been registered with status <span className="font-semibold text-amber-300">Pending</span>. Our concierge team has reserved an open wash bay for your vehicle.
        </p>
      </div>

      {/* Prominent Vehicle Digital Pass */}
      <div className="mb-6">
        <div className="text-xs uppercase tracking-wider text-cyan-400 font-semibold mb-2">
          Registered Vehicle Specifications
        </div>
        <VehiclePassCard
          vehicleType={booking.vehicleType}
          vehicleMakeModel={booking.vehicleMakeModel}
          licensePlate={booking.licensePlate}
          color={parsedNotes.color}
          soilLevel={parsedNotes.soilLevel}
          specialCare={parsedNotes.specialCare}
        />
      </div>

      {/* Appointment Summary Card */}
      <div className="space-y-6 divide-y divide-white/10 rounded-xl bg-slate-900/60 p-6 border border-white/5 text-sm">
        {/* Service & Time */}
        <div className="pb-4">
          <div className="text-xs uppercase tracking-wider text-cyan-400 font-semibold mb-2">
            Selected Service
          </div>
          <div className="flex justify-between items-baseline">
            <span className="font-display text-lg font-bold text-white">{booking.service.name}</span>
            <span className="text-cyan-400 font-display text-lg font-bold tabular-nums">
              Starting {formatRupee(booking.service.price)}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-2">
            <span>Duration: {booking.service.duration_minutes} minutes</span>
          </div>
        </div>

        {/* Schedule */}
        <div className="py-4">
          <div className="text-xs uppercase tracking-wider text-cyan-400 font-semibold mb-2">
            Reserved Schedule
          </div>
          <div className="text-slate-200 font-medium">{formattedDate}</div>
          <div className="text-cyan-300 font-semibold mt-1 font-mono">{booking.formattedTimeRange}</div>
        </div>

        {/* Customer Contact */}
        <div className="py-4">
          <div className="text-xs uppercase tracking-wider text-cyan-400 font-semibold mb-2">
            Customer Information
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-slate-400">Customer:</span>
              <p className="text-white font-medium">{booking.fullName}</p>
            </div>
            <div>
              <span className="text-slate-400">Contact Phone:</span>
              <p className="text-white font-medium font-mono">{booking.phone}</p>
            </div>
            <div>
              <span className="text-slate-400">Confirmation Email:</span>
              <p className="text-white font-medium truncate">{booking.email}</p>
            </div>
          </div>
          {parsedNotes.customerNotes && (
            <div className="mt-3 pt-3 border-t border-white/5 text-xs">
              <span className="text-slate-400">Customer Notes:</span>
              <p className="text-slate-300 italic mt-0.5">{parsedNotes.customerNotes}</p>
            </div>
          )}
        </div>

        {/* Car Wash Location & Contact */}
        <div className="pt-4 text-xs">
          <div className="text-xs uppercase tracking-wider text-cyan-400 font-semibold mb-2">
            Studio Location & Contact
          </div>
          <p className="text-white font-semibold text-sm">{businessSettings.business_name}</p>
          <p className="text-slate-400 mt-1">{businessSettings.business_address}</p>
          <div className="mt-2 flex flex-wrap gap-4 text-slate-300">
            <span>Phone: {businessSettings.business_phone}</span>
            <span>Email: {businessSettings.business_email}</span>
          </div>
        </div>
      </div>

      {/* Button to reserve another */}
      <div className="mt-8 text-center">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center rounded-lg bg-slate-800 px-6 py-3 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-700 cursor-pointer"
        >
          Book Another Service
        </button>
      </div>
    </div>
  );
};
