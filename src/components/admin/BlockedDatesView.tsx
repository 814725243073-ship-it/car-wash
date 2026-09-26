import React, { useState } from 'react';
import { useData } from '../../context/DataContext';

export const BlockedDatesView: React.FC = () => {
  const { blockedDates, addBlockedDate, deleteBlockedDate, loading } = useData();

  const [dateStr, setDateStr] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateStr) {
      setFeedback({ type: 'error', text: 'Please pick a date to block.' });
      return;
    }
    if (!reason.trim()) {
      setFeedback({ type: 'error', text: 'Please provide a reason (e.g. Bay Maintenance, Holiday).' });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    const res = await addBlockedDate(dateStr, reason);
    setSubmitting(false);

    if (res.success) {
      setFeedback({ type: 'success', text: `Date ${dateStr} blocked successfully.` });
      setDateStr('');
      setReason('');
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback({ type: 'error', text: res.error || 'Failed to add blocked date.' });
    }
  };

  const handleDelete = async (id: string, date: string) => {
    if (!window.confirm(`Are you sure you want to unblock ${date}?`)) return;

    const res = await deleteBlockedDate(id);
    if (res.success) {
      setFeedback({ type: 'success', text: `Date ${date} unblocked.` });
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback({ type: 'error', text: res.error || 'Failed to remove blocked date.' });
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Blocked Dates & Closures
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Prevent appointments from being booked on holidays, facility maintenance days, or private events.
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

      {/* Add Blocked Date Form Card */}
      <div className="rounded-2xl border border-white/10 bg-[#0E1522] p-6">
        <h2 className="font-display text-base font-bold text-white mb-4">
          Block a New Date
        </h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end text-xs">
          <div className="sm:col-span-4">
            <label className="block text-slate-300 font-medium mb-1.5">
              Date to Block <span className="text-cyan-400">*</span>
            </label>
            <input
              type="date"
              required
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-6">
            <label className="block text-slate-300 font-medium mb-1.5">
              Reason / Public Notice <span className="text-cyan-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Hydraulic Lift Maintenance or National Holiday"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-2 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-cyan-500 py-2.5 font-semibold text-slate-950 hover:bg-cyan-400 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Adding...' : '+ Block Date'}
            </button>
          </div>
        </form>
      </div>

      {/* Existing Blocked Dates Table */}
      <div className="rounded-2xl border border-white/10 bg-[#0E1522] overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <h3 className="font-display text-base font-bold text-white">
            Scheduled Closures ({blockedDates.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="h-12 rounded-xl bg-slate-900/60 animate-pulse" />
            ))}
          </div>
        ) : blockedDates.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No blocked dates configured. The wash bay operates according to standard weekly business hours.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/5 bg-slate-950/40 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 pl-6">Blocked Date</th>
                  <th className="py-3.5 px-4">Reason / Notes</th>
                  <th className="py-3.5 pr-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {blockedDates.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-4 pl-6 font-semibold text-white font-mono tabular-nums">
                      {item.blocked_date}
                    </td>
                    <td className="py-4 px-4 text-slate-300">{item.reason}</td>
                    <td className="py-4 pr-6 text-right">
                      <button
                        onClick={() => handleDelete(item.id, item.blocked_date)}
                        className="rounded border border-rose-500/40 px-3 py-1.5 text-rose-400 hover:bg-rose-950/40 transition-colors font-medium cursor-pointer"
                      >
                        Remove Block
                      </button>
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
