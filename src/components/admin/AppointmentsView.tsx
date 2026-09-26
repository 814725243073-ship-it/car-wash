import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Appointment, AppointmentStatus, VehicleType } from '../../types/database';
import { formatRupee, parseVehicleNotes } from '../../lib/formatters';
import { VehiclePassCard } from '../vehicle/VehiclePassCard';

export const AppointmentsView: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [vehicleFilter, setVehicleFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    setActionError(null);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*, service:services(*)')
        .order('appointment_date', { ascending: false })
        .order('start_time', { ascending: false });

      if (error) {
        setActionError(error.message);
      } else if (data) {
        setAppointments(data);
      }
    } catch (err: any) {
      setActionError(err?.message || 'Error loading appointments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const handleUpdateStatus = async (id: string, newStatus: AppointmentStatus) => {
    setUpdatingId(id);
    setActionError(null);
    setActionSuccess(null);

    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) {
        const lowerErr = error.message.toLowerCase();
        if (lowerErr.includes('fully booked')) {
          setActionError('Cannot confirm: this time slot is already fully booked for available bays.');
        } else {
          setActionError(error.message);
        }
      } else {
        setActionSuccess(`Appointment status successfully updated to ${newStatus}.`);
        await loadAppointments();
        if (selectedAppointment?.id === id) {
          setSelectedAppointment((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      }
    } catch (err: any) {
      setActionError(err?.message || 'Failed to update appointment status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredAppointments = appointments.filter((app) => {
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesVehicle = vehicleFilter === 'all' || app.vehicle_type === vehicleFilter;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      app.full_name.toLowerCase().includes(query) ||
      app.email.toLowerCase().includes(query) ||
      app.phone.includes(query) ||
      (app.vehicle_make_model && app.vehicle_make_model.toLowerCase().includes(query)) ||
      (app.license_plate && app.license_plate.toLowerCase().includes(query));

    return matchesStatus && matchesVehicle && matchesSearch;
  });

  const selectedNotesParsed = selectedAppointment ? parseVehicleNotes(selectedAppointment.notes) : null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Client Appointments & Vehicle Queue
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review bookings, verify vehicle specifications, check-in license plates, and manage bay confirmations.
          </p>
        </div>
        <button
          onClick={loadAppointments}
          className="rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
        >
          ↻ Refresh List
        </button>
      </div>

      {/* Action Banners */}
      {actionError && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-950/40 p-4 text-xs text-rose-200">
          {actionError}
        </div>
      )}
      {actionSuccess && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-xs text-emerald-200">
          {actionSuccess}
        </div>
      )}

      {/* Controls Bar: Filters & Search */}
      <div className="space-y-3">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Status segmented buttons */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-white/5">
            <span className="text-[10px] uppercase font-bold text-slate-500 px-2">Status:</span>
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors cursor-pointer ${
                  statusFilter === st
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="w-full lg:w-80">
            <input
              type="text"
              placeholder="Search by client, plate, make/model, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900/90 px-4 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Vehicle Classification Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-slate-500">Filter Vehicle Type:</span>
          {(['all', 'sedan', 'suv', 'truck', 'van', 'other'] as const).map((vt) => (
            <button
              key={vt}
              onClick={() => setVehicleFilter(vt)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md uppercase transition-colors cursor-pointer border ${
                vehicleFilter === vt
                  ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300'
                  : 'border-white/5 bg-slate-900/50 text-slate-400 hover:text-white'
              }`}
            >
              {vt === 'other' ? 'Hatchback/Other' : vt}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List / Table */}
      <div className="rounded-2xl border border-white/10 bg-[#0E1522] overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-900/60 animate-pulse" />
            ))}
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No appointments found matching this status or vehicle filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/5 bg-slate-950/40 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 pl-6">Date & Time</th>
                  <th className="py-3.5 px-4">Client Contact</th>
                  <th className="py-3.5 px-4">Vehicle Details</th>
                  <th className="py-3.5 px-4">Service & Price</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredAppointments.map((app) => {
                  const parsed = parseVehicleNotes(app.notes);
                  return (
                    <tr key={app.id} className="hover:bg-slate-900/40 transition-colors">
                      {/* Date & Time */}
                      <td className="py-4 pl-6 align-top">
                        <div className="font-semibold text-white tabular-nums">{app.appointment_date}</div>
                        <div className="text-[11px] font-mono text-cyan-300 tabular-nums">
                          {app.start_time.substring(0, 5)} - {app.end_time.substring(0, 5)}
                        </div>
                      </td>

                      {/* Client Info */}
                      <td className="py-4 px-4 align-top">
                        <div className="font-semibold text-white">{app.full_name}</div>
                        <div className="text-[11px] text-slate-400 tabular-nums font-mono">{app.phone}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[150px]">{app.email}</div>
                      </td>

                      {/* Comprehensive Vehicle Column */}
                      <td className="py-4 px-4 align-top">
                        <VehiclePassCard
                          vehicleType={app.vehicle_type}
                          vehicleMakeModel={app.vehicle_make_model}
                          licensePlate={app.license_plate}
                          color={parsed.color}
                          soilLevel={parsed.soilLevel}
                          specialCare={parsed.specialCare}
                          compact={true}
                        />
                      </td>

                      {/* Service & Price */}
                      <td className="py-4 px-4 align-top">
                        <div className="font-medium text-slate-200">
                          {app.service?.name || 'Wash Service'}
                        </div>
                        {app.service?.price && (
                          <div className="text-[11px] text-cyan-400 font-bold tabular-nums">
                            {formatRupee(app.service.price)}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-500">
                          {app.service?.duration_minutes} mins
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-4 align-top">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                            app.status === 'confirmed'
                              ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/30'
                              : app.status === 'pending'
                              ? 'bg-amber-950/70 text-amber-400 border border-amber-500/30'
                              : app.status === 'completed'
                              ? 'bg-cyan-950/70 text-cyan-400 border border-cyan-500/30'
                              : 'bg-rose-950/70 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 pr-6 text-right align-top">
                        <div className="inline-flex items-center gap-1.5">
                          {app.status === 'pending' && (
                            <button
                              disabled={updatingId === app.id}
                              onClick={() => handleUpdateStatus(app.id, 'confirmed')}
                              className="rounded bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-500 transition-colors cursor-pointer"
                            >
                              Confirm
                            </button>
                          )}
                          {app.status === 'confirmed' && (
                            <button
                              disabled={updatingId === app.id}
                              onClick={() => handleUpdateStatus(app.id, 'completed')}
                              className="rounded bg-cyan-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-cyan-500 transition-colors cursor-pointer"
                            >
                              Complete
                            </button>
                          )}
                          {app.status !== 'cancelled' && (
                            <button
                              disabled={updatingId === app.id}
                              onClick={() => handleUpdateStatus(app.id, 'cancelled')}
                              className="rounded border border-rose-500/40 px-2.5 py-1 text-[11px] font-semibold text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedAppointment(app)}
                            className="rounded border border-slate-700 px-2.5 py-1 text-[11px] text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            Pass
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Appointment & Vehicle Details Modal */}
      {selectedAppointment && selectedNotesParsed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#0E1522] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="font-display text-lg font-bold text-white">
                Studio Pass & Vehicle Dossier
              </h3>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="text-slate-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-5 text-xs">
              {/* Full Digital Vehicle Pass */}
              <VehiclePassCard
                vehicleType={selectedAppointment.vehicle_type}
                vehicleMakeModel={selectedAppointment.vehicle_make_model}
                licensePlate={selectedAppointment.license_plate}
                color={selectedNotesParsed.color}
                soilLevel={selectedNotesParsed.soilLevel}
                specialCare={selectedNotesParsed.specialCare}
              />

              {/* Client & Service Info */}
              <div className="grid grid-cols-2 gap-4 bg-slate-900/60 p-4 rounded-xl border border-white/5">
                <div>
                  <span className="text-slate-400">Client Name:</span>
                  <p className="font-semibold text-white text-sm mt-0.5">{selectedAppointment.full_name}</p>
                </div>
                <div>
                  <span className="text-slate-400">Current Status:</span>
                  <p className="font-bold text-cyan-400 uppercase mt-0.5">{selectedAppointment.status}</p>
                </div>
                <div>
                  <span className="text-slate-400">Contact Phone:</span>
                  <p className="font-mono text-white mt-0.5">{selectedAppointment.phone}</p>
                </div>
                <div>
                  <span className="text-slate-400">Contact Email:</span>
                  <p className="text-white mt-0.5 truncate">{selectedAppointment.email}</p>
                </div>
                <div>
                  <span className="text-slate-400">Reserved Service:</span>
                  <p className="font-semibold text-white mt-0.5">{selectedAppointment.service?.name}</p>
                </div>
                <div>
                  <span className="text-slate-400">Package Starting Price:</span>
                  <p className="font-bold text-cyan-400 mt-0.5">
                    {formatRupee(selectedAppointment.service?.price)}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Scheduled Date:</span>
                  <p className="font-semibold text-white mt-0.5">{selectedAppointment.appointment_date}</p>
                </div>
                <div>
                  <span className="text-slate-400">Scheduled Time Slot:</span>
                  <p className="font-mono text-cyan-300 mt-0.5">
                    {selectedAppointment.start_time} - {selectedAppointment.end_time}
                  </p>
                </div>
              </div>

              {selectedNotesParsed.customerNotes && (
                <div>
                  <span className="text-slate-400 block mb-1">Customer Care Instructions:</span>
                  <p className="text-slate-300 italic bg-slate-900/60 p-3 rounded-lg border border-white/5">
                    {selectedNotesParsed.customerNotes}
                  </p>
                </div>
              )}

              {/* Status Update Quick Buttons */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-slate-400">Update Bay Status:</span>
                <div className="flex gap-2">
                  {(['pending', 'confirmed', 'completed', 'cancelled'] as AppointmentStatus[]).map((st) => (
                    <button
                      key={st}
                      disabled={updatingId === selectedAppointment.id || selectedAppointment.status === st}
                      onClick={() => handleUpdateStatus(selectedAppointment.id, st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize cursor-pointer transition-colors ${
                        selectedAppointment.status === st
                          ? 'bg-cyan-500 text-slate-950 shadow-sm'
                          : 'border border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
