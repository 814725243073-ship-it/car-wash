import React, { useState, useEffect, useCallback } from 'react';
import { useData } from '../../context/DataContext';
import { Service, AvailableTimeSlot, VehicleType } from '../../types/database';
import {
  calculateAvailableSlots,
  formatDateToYYYYMMDD,
  isDateBlocked,
} from '../../lib/availability';
import { formatRupee, buildVehicleNotes } from '../../lib/formatters';
import { SuccessConfirmation, ConfirmedBookingData } from './SuccessConfirmation';
import { VehicleDetailsBuilder } from './VehicleDetailsBuilder';

interface BookingSectionProps {
  preselectedService?: Service | null;
}

export const BookingSection: React.FC<BookingSectionProps> = ({ preselectedService }) => {
  const {
    activeServices,
    businessSettings,
    businessHours,
    blockedDates,
    fetchBookedSlotsForDate,
    submitAppointment,
  } = useData();

  // Booking Flow Steps: 1 = Service, 2 = Date & Time, 3 = Vehicle & Contact, 4 = Confirmation
  const [step, setStep] = useState<number>(1);
  const [selectedService, setSelectedService] = useState<Service | null>(preselectedService || null);
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });
  const [selectedSlot, setSelectedSlot] = useState<AvailableTimeSlot | null>(null);

  // Customer Contact Info
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [customerNotes, setCustomerNotes] = useState<string>('');

  // Comprehensive Vehicle Details
  const [vehicleType, setVehicleType] = useState<VehicleType>('sedan');
  const [vehicleMakeModel, setVehicleMakeModel] = useState<string>('Toyota Camry');
  const [licensePlate, setLicensePlate] = useState<string>('');
  const [color, setColor] = useState<string>('Obsidian Black');
  const [soilLevel, setSoilLevel] = useState<string>('moderate');
  const [specialCare, setSpecialCare] = useState<string[]>(['Ceramic Coated']);

  // Slots Loading & State
  const [availableSlots, setAvailableSlots] = useState<AvailableTimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [confirmedData, setConfirmedData] = useState<ConfirmedBookingData | null>(null);

  // Sync preselectedService if passed from props
  useEffect(() => {
    if (preselectedService) {
      setSelectedService(preselectedService);
      setStep(2);
    }
  }, [preselectedService]);

  // If no service is selected and services load, pick the first active one
  useEffect(() => {
    if (!selectedService && activeServices.length > 0) {
      setSelectedService(activeServices[0]);
    }
  }, [activeServices, selectedService]);

  // Load available slots whenever date or service changes
  const loadSlots = useCallback(async () => {
    if (!selectedService) return;
    setLoadingSlots(true);
    setSubmissionError(null);

    const dateStr = formatDateToYYYYMMDD(selectedDate);
    try {
      const bookedData = await fetchBookedSlotsForDate(dateStr);

      const slots = calculateAvailableSlots({
        selectedDate,
        service: selectedService,
        businessHours,
        businessSettings,
        blockedDates,
        bookedSlots: bookedData,
      });

      setAvailableSlots(slots);

      // Preserve currently selected slot if it is still available on this date
      setSelectedSlot((prev) => {
        if (!prev) return null;
        const matching = slots.find((s) => s.startTimeStr === prev.startTimeStr);
        return matching || null;
      });
    } catch (err) {
      console.error('Error calculating slots:', err);
    } finally {
      setLoadingSlots(false);
    }
  }, [selectedDate, selectedService, businessHours, businessSettings, blockedDates, fetchBookedSlotsForDate]);

  // Only run loadSlots when selectedDate or selectedService changes, NOT on step change
  useEffect(() => {
    if (selectedService) {
      loadSlots();
    }
  }, [selectedDate, selectedService?.id, loadSlots]);

  // Handle final appointment submission
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedService) {
      setSubmissionError('Please select a detailing service first.');
      setStep(1);
      return;
    }

    if (!selectedSlot) {
      setSubmissionError('Please select an available time slot.');
      setStep(2);
      return;
    }

    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setSubmissionError('Please enter your full name, email address, and contact phone number.');
      return;
    }

    setSubmitting(true);
    setSubmissionError(null);

    const dateStr = formatDateToYYYYMMDD(selectedDate);

    // Encode vehicle color, soil level, and special care into notes field
    const combinedNotes = buildVehicleNotes({
      customerNotes,
      color,
      soilLevel,
      specialCare,
    });

    const payload = {
      full_name: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      service_id: selectedService.id,
      vehicle_type: vehicleType,
      vehicle_make_model: vehicleMakeModel.trim() || null,
      license_plate: licensePlate.trim() ? licensePlate.toUpperCase().trim() : null,
      appointment_date: dateStr,
      start_time: selectedSlot.startTimeStr,
      end_time: selectedSlot.endTimeStr,
      notes: combinedNotes || null,
    };

    const result = await submitAppointment(payload);

    setSubmitting(false);

    if (!result.success) {
      if (result.isFullyBooked) {
        // Return visitor to time selection step and reload slots
        setSubmissionError('Sorry, that time was just taken. Please choose another time.');
        setStep(2);
        loadSlots();
      } else {
        setSubmissionError(result.error || 'Failed to submit appointment. Please try again.');
      }
      return;
    }

    // Success! Prepare local confirmed data (Strict Rule: do not SELECT from appointments)
    setConfirmedData({
      service: selectedService,
      appointmentDate: dateStr,
      startTime: selectedSlot.startTimeStr,
      endTime: selectedSlot.endTimeStr,
      formattedTimeRange: selectedSlot.label,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      vehicleType,
      vehicleMakeModel: vehicleMakeModel.trim() || undefined,
      licensePlate: licensePlate.trim() ? licensePlate.toUpperCase().trim() : undefined,
      notes: combinedNotes,
    });

    setStep(4);
  };

  const handleReset = () => {
    setStep(1);
    setSelectedSlot(null);
    setConfirmedData(null);
    setSubmissionError(null);
  };

  // Generate 7 upcoming days for convenient date buttons
  const dateOptions = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1); // Start from tomorrow
    return d;
  });

  const selectedDateStr = formatDateToYYYYMMDD(selectedDate);
  const isSelectedDateBlocked = isDateBlocked(selectedDateStr, blockedDates);

  return (
    <section id="booking" className="relative py-24 bg-[#080B11] border-b border-white/5">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-3">
            <span>Online Bay Reservation</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Real-Time Scheduling</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Reserve Your Wash Appointment
          </h2>
          <p className="mt-3 text-slate-400 text-sm sm:text-base leading-relaxed">
            Select your detailing treatment, choose an open wash bay slot, and register your vehicle specifications.
          </p>
        </div>

        {/* Step Indicator (Only visible before confirmation) */}
        {step < 4 && (
          <div className="mb-10 max-w-xl mx-auto">
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold">
              <button
                type="button"
                onClick={() => setStep(1)}
                className={`py-2 rounded-lg transition-colors cursor-pointer border ${
                  step === 1
                    ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300'
                    : 'border-white/5 bg-slate-900/50 text-slate-400 hover:text-white'
                }`}
              >
                1. Service
              </button>
              <button
                type="button"
                onClick={() => selectedService && setStep(2)}
                disabled={!selectedService}
                className={`py-2 rounded-lg transition-colors cursor-pointer border ${
                  step === 2
                    ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300'
                    : 'border-white/5 bg-slate-900/50 text-slate-400 hover:text-white disabled:opacity-40'
                }`}
              >
                2. Date & Time
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className={`py-2 rounded-lg transition-colors cursor-pointer border ${
                  step === 3
                    ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300'
                    : 'border-white/5 bg-slate-900/50 text-slate-400 hover:text-white'
                }`}
              >
                3. Vehicle & Contact
              </button>
            </div>
          </div>
        )}

        {/* Error message banner */}
        {submissionError && (
          <div className="mb-8 rounded-xl border border-rose-500/40 bg-rose-950/40 p-4 text-center text-sm text-rose-200">
            {submissionError}
          </div>
        )}

        {/* STEP 1: Select Service */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="font-display text-xl font-bold text-white mb-2">Step 1: Choose Your Service</h3>
              <p className="text-xs text-slate-400">Select the wash or detailing treatment for your vehicle.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeServices.map((service) => {
                const isSelected = selectedService?.id === service.id;
                return (
                  <div
                    key={service.id}
                    onClick={() => setSelectedService(service)}
                    className={`cursor-pointer rounded-xl border p-5 transition-all text-left ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-950/20 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                        : 'border-white/10 bg-[#0E1420] hover:border-white/20'
                    }`}
                  >
                    <div className="flex justify-between items-baseline mb-2">
                      <h4 className="font-display text-lg font-bold text-white">{service.name}</h4>
                      <span className="text-cyan-400 font-bold tabular-nums">
                        From {formatRupee(service.price)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-3 line-clamp-2">
                      {service.description || 'Professional automotive care.'}
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5">
                      <span>Duration: {service.duration_minutes} mins</span>
                      <span className={`font-semibold ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`}>
                        {isSelected ? '✓ Selected' : 'Click to select'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                disabled={!selectedService}
                onClick={() => setStep(2)}
                className="inline-flex items-center justify-center rounded-lg bg-cyan-500 px-6 py-3 text-xs font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-40 cursor-pointer"
              >
                Continue to Date & Time
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Select Date and Time */}
        {step === 2 && selectedService && (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="font-display text-xl font-bold text-white mb-2">
                Step 2: Choose Schedule ({selectedService.name})
              </h3>
              <p className="text-xs text-slate-400">
                Wash bay capacity: {businessSettings.bays_count || 1} simultaneous bays. Minimum notice:{' '}
                {businessSettings.booking_notice_hours || 0}h.
              </p>
            </div>

            {/* Date Selection: 7 Quick Days + Calendar Picker */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">
                Select Date
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {dateOptions.map((dateObj) => {
                  const dateStr = formatDateToYYYYMMDD(dateObj);
                  const isSelected = dateStr === selectedDateStr;
                  const blocked = isDateBlocked(dateStr, blockedDates).blocked;
                  const dayName = dateObj.toLocaleDateString(undefined, { weekday: 'short' });
                  const dayNum = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

                  return (
                    <button
                      key={dateStr}
                      type="button"
                      disabled={blocked}
                      onClick={() => setSelectedDate(dateObj)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        blocked
                          ? 'border-white/5 bg-slate-950/40 opacity-40 cursor-not-allowed'
                          : isSelected
                          ? 'border-cyan-500 bg-cyan-950/30 text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                          : 'border-white/10 bg-slate-900/60 text-slate-300 hover:border-white/20'
                      }`}
                    >
                      <span className="text-xs font-medium text-slate-400">{dayName}</span>
                      <span className="text-sm font-bold text-white mt-1 tabular-nums">{dayNum}</span>
                      {blocked && <span className="text-[10px] text-rose-400 mt-1">Blocked</span>}
                    </button>
                  );
                })}
              </div>

              {/* Custom Date Input for dates further out */}
              <div className="mt-4 flex items-center gap-3">
                <span className="text-xs text-slate-400">Or pick specific date:</span>
                <input
                  type="date"
                  value={selectedDateStr}
                  min={formatDateToYYYYMMDD(new Date())}
                  onChange={(e) => {
                    if (e.target.value) {
                      const [y, m, d] = e.target.value.split('-').map(Number);
                      setSelectedDate(new Date(y, m - 1, d));
                    }
                  }}
                  className="rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Time Slot Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  Available Bay Slots for {selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </label>
                <span className="text-xs text-slate-400">
                  {selectedService.duration_minutes} min service duration
                </span>
              </div>

              {isSelectedDateBlocked.blocked ? (
                <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-6 text-center text-sm text-amber-200">
                  This date is unavailable: {isSelectedDateBlocked.reason || 'Closed for maintenance'}.
                </div>
              ) : loadingSlots ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 py-8">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <div key={n} className="h-14 rounded-xl bg-slate-800/40 animate-pulse border border-white/5" />
                  ))}
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="rounded-xl border border-white/5 bg-slate-900/40 p-8 text-center">
                  <p className="text-slate-300 font-medium text-sm">No available slots for this date</p>
                  <p className="text-slate-400 text-xs mt-1">
                    All wash bays are booked or outside operating hours. Please pick another date.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {availableSlots.map((slot, index) => {
                    const isSelected = selectedSlot?.startTimeStr === slot.startTimeStr;
                    const baysRemaining = slot.baysCapacity - slot.overlappingBookings;
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'border-cyan-500 bg-cyan-950/40 text-white shadow-[0_0_15px_rgba(6,182,212,0.25)] ring-1 ring-cyan-500'
                            : 'border-white/10 bg-slate-900/60 text-slate-200 hover:border-cyan-500/30 hover:bg-slate-800/50'
                        }`}
                      >
                        <span className="text-xs font-bold text-white tabular-nums tracking-wide">
                          {slot.label}
                        </span>
                        <span className="text-[11px] text-slate-400 mt-1">
                          {baysRemaining} bay{baysRemaining > 1 ? 's' : ''} open
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-lg border border-slate-700 px-5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 cursor-pointer"
              >
                Back to Services
              </button>
              <button
                type="button"
                disabled={!selectedSlot}
                onClick={() => setStep(3)}
                className="rounded-lg bg-cyan-500 px-6 py-2.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-40 cursor-pointer"
              >
                Continue to Vehicle Details →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Vehicle Specification & Customer Details Form */}
        {step === 3 && (
          <div className="space-y-8">
            {!selectedService ? (
              <div className="rounded-2xl border border-white/10 bg-[#0E1522] p-8 text-center">
                <p className="text-white font-semibold text-base mb-2">Please select a service first</p>
                <p className="text-xs text-slate-400 mb-4">Choose a wash or detailing package to start.</p>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-lg bg-cyan-500 px-5 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400"
                >
                  Go to Step 1: Services
                </button>
              </div>
            ) : !selectedSlot ? (
              <div className="rounded-2xl border border-white/10 bg-[#0E1522] p-8 text-center">
                <p className="text-white font-semibold text-base mb-2">Please select a time slot first</p>
                <p className="text-xs text-slate-400 mb-4">
                  Choose an available wash bay slot on your preferred date for {selectedService.name}.
                </p>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-lg bg-cyan-500 px-5 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400"
                >
                  ← Choose Date & Time Slot
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitBooking} className="space-y-8">
                <div className="text-center">
                  <h3 className="font-display text-xl font-bold text-white mb-2">
                    Step 3: Vehicle Specifications & Customer Details
                  </h3>
                  <div className="inline-flex items-center gap-2 rounded-lg bg-slate-900 border border-white/10 px-4 py-1.5 text-xs text-slate-300">
                    <span className="text-cyan-400 font-semibold">{selectedService.name}</span>
                    <span>·</span>
                    <span className="text-slate-400">{formatRupee(selectedService.price)}</span>
                    <span>·</span>
                    <span className="text-white font-medium">
                      {selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at {selectedSlot.label}
                    </span>
                  </div>
                </div>

                {/* Comprehensive Vehicle Details Builder */}
                <VehicleDetailsBuilder
                  vehicleType={vehicleType}
                  onChangeVehicleType={setVehicleType}
                  vehicleMakeModel={vehicleMakeModel}
                  onChangeVehicleMakeModel={setVehicleMakeModel}
                  licensePlate={licensePlate}
                  onChangeLicensePlate={setLicensePlate}
                  color={color}
                  onChangeColor={setColor}
                  soilLevel={soilLevel}
                  onChangeSoilLevel={setSoilLevel}
                  specialCare={specialCare}
                  onChangeSpecialCare={setSpecialCare}
                />

                {/* Customer Contact Details Section */}
                <div className="rounded-2xl border border-white/10 bg-[#0E1522] p-6 sm:p-8 space-y-6">
                  <div>
                    <h4 className="font-display text-base font-bold text-white mb-1">
                      Customer Contact Information
                    </h4>
                    <p className="text-xs text-slate-400">
                      Where our bay concierge will send booking confirmation and gate arrival passes.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                    {/* Full Name */}
                    <div>
                      <label className="block text-slate-300 font-medium mb-1.5">
                        Customer Full Name <span className="text-cyan-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Vikram Malhotra"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-slate-300 font-medium mb-1.5">
                        Email Address <span className="text-cyan-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. vikram@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-slate-300 font-medium mb-1.5">
                        Contact Phone Number <span className="text-cyan-400">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                      />
                    </div>

                    {/* Additional Customer Notes */}
                    <div className="md:col-span-3">
                      <label className="block text-slate-300 font-medium mb-1.5">
                        Additional Requests / Gate Entry Notes <span className="text-slate-500">(Optional)</span>
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Any specific instructions for our detailing specialists..."
                        value={customerNotes}
                        onChange={(e) => setCustomerNotes(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Navigation and Submit Button */}
                <div className="flex justify-between pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="rounded-lg border border-slate-700 px-5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 cursor-pointer"
                  >
                    ← Back to Time Selection
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-lg bg-cyan-500 px-8 py-3 text-xs font-semibold text-slate-950 transition-all hover:bg-cyan-400 hover:shadow-[0_0_24px_rgba(6,182,212,0.4)] disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? 'Submitting Reservation...' : 'Confirm & Reserve Wash Bay'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* STEP 4: Success Confirmation Screen */}
        {step === 4 && confirmedData && (
          <SuccessConfirmation booking={confirmedData} onReset={handleReset} />
        )}
      </div>
    </section>
  );
};
