import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';

export const BusinessSettingsView: React.FC = () => {
  const { businessSettings, updateBusinessSettings, loading } = useData();

  const [businessName, setBusinessName] = useState<string>('');
  const [businessEmail, setBusinessEmail] = useState<string>('');
  const [businessPhone, setBusinessPhone] = useState<string>('');
  const [businessAddress, setBusinessAddress] = useState<string>('');
  const [slotInterval, setSlotInterval] = useState<number>(30);
  const [bookingNotice, setBookingNotice] = useState<number>(2);
  const [baysCount, setBaysCount] = useState<number>(3);

  const [saving, setSaving] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  useEffect(() => {
    if (businessSettings) {
      setBusinessName(businessSettings.business_name || '');
      setBusinessEmail(businessSettings.business_email || '');
      setBusinessPhone(businessSettings.business_phone || '');
      setBusinessAddress(businessSettings.business_address || '');
      setSlotInterval(businessSettings.slot_interval_minutes || 30);
      setBookingNotice(businessSettings.booking_notice_hours || 0);
      setBaysCount(businessSettings.bays_count || 1);
    }
  }, [businessSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    // Validation rules
    if (!businessName.trim()) {
      setFeedback({ type: 'error', text: 'Car wash name is required.' });
      return;
    }
    if (slotInterval < 10) {
      setFeedback({ type: 'error', text: 'Slot interval must be at least 10 minutes.' });
      return;
    }
    if (bookingNotice < 0) {
      setFeedback({ type: 'error', text: 'Booking notice hours must be greater than or equal to 0.' });
      return;
    }
    if (baysCount < 1) {
      setFeedback({ type: 'error', text: 'Wash bays count must be at least 1.' });
      return;
    }

    setSaving(true);
    const res = await updateBusinessSettings({
      business_name: businessName.trim(),
      business_email: businessEmail.trim(),
      business_phone: businessPhone.trim(),
      business_address: businessAddress.trim(),
      slot_interval_minutes: Number(slotInterval),
      booking_notice_hours: Number(bookingNotice),
      bays_count: Number(baysCount),
    });
    setSaving(false);

    if (res.success) {
      setFeedback({ type: 'success', text: 'Business settings updated and saved to database successfully.' });
      setTimeout(() => setFeedback(null), 3500);
    } else {
      setFeedback({ type: 'error', text: res.error || 'Failed to save settings.' });
    }
  };

  return (
    <div className="space-y-6 text-left max-w-4xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Business Settings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Studio identity, contact information, bay capacity, and automated booking scheduling constraints.
          </p>
        </div>
      </div>

      {feedback && (
        <div
          className={`rounded-xl border p-4 text-xs ${
            feedback.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-950/40 text-emerald-200'
              : 'border-rose-500/30 bg-rose-950/40 text-rose-200'
          }`}
        >
          {feedback.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Car Wash Identity Section */}
        <div className="rounded-2xl border border-white/10 bg-[#0E1522] p-6 space-y-4">
          <h2 className="font-display text-base font-bold text-white mb-2">
            Car Wash Identity & Public Contact
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                Car Wash Name <span className="text-cyan-400">*</span>
              </label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Email</label>
              <input
                type="email"
                required
                value={businessEmail}
                onChange={(e) => setBusinessEmail(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Phone</label>
              <input
                type="tel"
                required
                value={businessPhone}
                onChange={(e) => setBusinessPhone(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Address</label>
              <input
                type="text"
                required
                value={businessAddress}
                onChange={(e) => setBusinessAddress(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Bay Capacity & Scheduling Rules */}
        <div className="rounded-2xl border border-white/10 bg-[#0E1522] p-6 space-y-4">
          <h2 className="font-display text-base font-bold text-white mb-2">
            Capacity & Scheduling Engine
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Wash Bays */}
            <div className="rounded-xl border border-cyan-500/20 bg-slate-900/60 p-4">
              <label className="block text-cyan-400 font-semibold mb-1">
                Wash Bays (Capacity)
              </label>
              <p className="text-[11px] text-slate-400 mb-3">
                Cars that can be washed simultaneously.
              </p>
              <input
                type="number"
                min="1"
                required
                value={baysCount}
                onChange={(e) => setBaysCount(Number(e.target.value))}
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white font-mono text-base font-bold focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* Slot Interval */}
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
              <label className="block text-slate-200 font-semibold mb-1">
                Slot Interval (Minutes)
              </label>
              <p className="text-[11px] text-slate-400 mb-3">
                Frequency spacing between candidate start times.
              </p>
              <input
                type="number"
                min="10"
                step="5"
                required
                value={slotInterval}
                onChange={(e) => setSlotInterval(Number(e.target.value))}
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white font-mono text-base font-bold focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* Booking Notice */}
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
              <label className="block text-slate-200 font-semibold mb-1">
                Booking Notice (Hours)
              </label>
              <p className="text-[11px] text-slate-400 mb-3">
                Minimum advance hours before a slot starts.
              </p>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={bookingNotice}
                onChange={(e) => setBookingNotice(Number(e.target.value))}
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white font-mono text-base font-bold focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-cyan-500 px-7 py-3 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition-all disabled:opacity-50 cursor-pointer shadow-md"
          >
            {saving ? 'Saving Changes...' : 'Save Business Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};
