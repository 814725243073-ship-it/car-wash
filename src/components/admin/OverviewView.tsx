import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Appointment, Service } from '../../types/database';
import { useData } from '../../context/DataContext';
import { formatDateToYYYYMMDD } from '../../lib/availability';

interface OverviewViewProps {
  onNavigateTab: (tab: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ onNavigateTab }) => {
  const { services, activeServices, businessSettings } = useData();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadAppointments() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('*, service:services(*)')
          .order('appointment_date', { ascending: true })
          .order('start_time', { ascending: true });

        if (error) {
          console.error('Error loading appointments for overview:', error.message);
        } else if (data) {
          setAppointments(data);
        }
      } catch (err) {
        console.error('Overview appointments exception:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAppointments();
  }, []);

  const todayStr = formatDateToYYYYMMDD(new Date());

  const todayAppointments = appointments.filter((a) => a.appointment_date === todayStr);
  const pendingAppointments = appointments.filter((a) => a.status === 'pending');
  const upcomingAppointments = appointments.filter(
    (a) => a.appointment_date >= todayStr && a.status !== 'cancelled'
  );
  const completedAppointments = appointments.filter((a) => a.status === 'completed');

  return (
    <div className="space-y-8">
      {/* Top Banner / Studio summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Studio Operations Overview
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time wash bay load, appointment queue, and daily detailing schedule.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-900/60 px-3.5 py-1.5 text-xs text-slate-300">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>{businessSettings.bays_count || 1} Active Bays</span>
          </div>
          <button
            onClick={() => onNavigateTab('appointments')}
            className="rounded-lg bg-cyan-500 px-4 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition-colors cursor-pointer"
          >
            Manage Appointments
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Today's Appointments */}
        <div className="rounded-xl border border-white/10 bg-[#0E1522] p-5">
          <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">
            Today's Schedule
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-3xl font-bold text-white tabular-nums">
              {todayAppointments.length}
            </span>
            <span className="text-[11px] text-cyan-400">Cars Today</span>
          </div>
        </div>

        {/* Pending Approval */}
        <div className="rounded-xl border border-amber-500/20 bg-[#0E1522] p-5">
          <div className="text-xs uppercase tracking-wider text-amber-400 font-medium">
            Pending Approval
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-3xl font-bold text-amber-300 tabular-nums">
              {pendingAppointments.length}
            </span>
            <span className="text-[11px] text-amber-400/80">Needs Action</span>
          </div>
        </div>

        {/* Upcoming Total */}
        <div className="rounded-xl border border-white/10 bg-[#0E1522] p-5">
          <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">
            Upcoming Bookings
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-3xl font-bold text-white tabular-nums">
              {upcomingAppointments.length}
            </span>
            <span className="text-[11px] text-slate-400">On Calendar</span>
          </div>
        </div>

        {/* Completed */}
        <div className="rounded-xl border border-white/10 bg-[#0E1522] p-5">
          <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">
            Completed Washes
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-3xl font-bold text-emerald-400 tabular-nums">
              {completedAppointments.length}
            </span>
            <span className="text-[11px] text-emerald-400/80">Finished</span>
          </div>
        </div>

        {/* Active Services */}
        <div className="col-span-2 lg:col-span-1 rounded-xl border border-white/10 bg-[#0E1522] p-5">
          <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">
            Active Packages
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-3xl font-bold text-cyan-400 tabular-nums">
              {activeServices.length}
            </span>
            <span className="text-[11px] text-slate-400">of {services.length} Total</span>
          </div>
        </div>
      </div>

      {/* Today's Schedule Table */}
      <div className="rounded-2xl border border-white/10 bg-[#0E1522] p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display text-lg font-bold text-white">
              Today's Bay Queue ({todayAppointments.length})
            </h2>
            <p className="text-xs text-slate-400">
              Vehicles scheduled for wash and detailing today ({todayStr}).
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('appointments')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
          >
            View All Appointments →
          </button>
        </div>

        {loading ? (
          <div className="space-y-3 py-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-12 w-full rounded-lg bg-slate-900/60 animate-pulse" />
            ))}
          </div>
        ) : todayAppointments.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No appointments scheduled for today. Wash bays are currently open.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/5 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="pb-3 pl-2">Time Slot</th>
                  <th className="pb-3">Client</th>
                  <th className="pb-3">Vehicle</th>
                  <th className="pb-3">Service</th>
                  <th className="pb-3">Phone</th>
                  <th className="pb-3 text-right pr-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {todayAppointments.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 pl-2 font-mono tabular-nums text-cyan-300 font-medium">
                      {app.start_time.substring(0, 5)} - {app.end_time.substring(0, 5)}
                    </td>
                    <td className="py-3.5 font-medium text-white">{app.full_name}</td>
                    <td className="py-3.5 text-slate-300">
                      <div className="flex items-center gap-2">
                        <span className="uppercase font-semibold text-slate-200 text-xs">{app.vehicle_type}</span>
                        {app.license_plate && (
                          <span className="font-mono text-[10px] text-cyan-300 bg-slate-900 border border-white/10 px-1.5 py-0.5 rounded">
                            {app.license_plate}
                          </span>
                        )}
                      </div>
                      {app.vehicle_make_model && (
                        <div className="text-slate-400 text-[11px] truncate max-w-[180px] mt-0.5">{app.vehicle_make_model}</div>
                      )}
                    </td>
                    <td className="py-3.5 text-slate-300">{app.service?.name || 'Wash Service'}</td>
                    <td className="py-3.5 text-slate-400 font-mono tabular-nums">{app.phone}</td>
                    <td className="py-3.5 pr-2 text-right">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide ${
                          app.status === 'confirmed'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                            : app.status === 'pending'
                            ? 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                            : app.status === 'completed'
                            ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-500/30'
                            : 'bg-rose-950/60 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
