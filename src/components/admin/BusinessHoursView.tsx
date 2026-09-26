import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { BusinessHours } from '../../types/database';

export const BusinessHoursView: React.FC = () => {
  const { businessHours, updateBusinessHour, loading } = useData();

  const weekdayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  // Local state for editing rows
  const [localHours, setLocalHours] = useState<BusinessHours[]>([]);
  const [savingWeekday, setSavingWeekday] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    // Ensure all 7 days exist in local representation
    const fullWeek = Array.from({ length: 7 }, (_, i) => {
      const existing = businessHours.find((bh) => bh.weekday === i);
      if (existing) return existing;
      return {
        id: `day-${i}`,
        weekday: i,
        is_open: i !== 0, // open Mon-Sat by default
        start_time: '08:00:00',
        end_time: '18:00:00',
      };
    });
    setLocalHours(fullWeek);
  }, [businessHours]);

  const handleChange = (weekday: number, field: keyof BusinessHours, value: any) => {
    setLocalHours((prev) =>
      prev.map((item) => {
        if (item.weekday === weekday) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const handleSaveDay = async (item: BusinessHours) => {
    setSavingWeekday(item.weekday);
    setFeedback(null);

    // Ensure HH:MM:SS format
    const formatTime = (t: string) => {
      if (!t) return '08:00:00';
      if (t.split(':').length === 2) return `${t}:00`;
      return t;
    };

    const res = await updateBusinessHour({
      id: item.id && item.id.startsWith('day-') ? undefined : item.id,
      weekday: item.weekday,
      is_open: item.is_open,
      start_time: formatTime(item.start_time),
      end_time: formatTime(item.end_time),
    });

    setSavingWeekday(null);
    if (res.success) {
      setFeedback(`Schedule for ${weekdayNames[item.weekday]} saved successfully.`);
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback(`Failed to save: ${res.error}`);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Operating Schedule & Business Hours
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure bay operating windows for each day of the week. Time slots will dynamically align with these hours.
          </p>
        </div>
      </div>

      {feedback && (
        <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/40 p-4 text-xs text-cyan-200">
          {feedback}
        </div>
      )}

      {/* Weekday Schedule Cards/Rows */}
      <div className="rounded-2xl border border-white/10 bg-[#0E1522] overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <div key={n} className="h-14 rounded-xl bg-slate-900/60 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {localHours.map((item) => {
              const dayName = weekdayNames[item.weekday];
              const isSaving = savingWeekday === item.weekday;

              // Helper for input values (HH:MM)
              const startVal = item.start_time ? item.start_time.substring(0, 5) : '08:00';
              const endVal = item.end_time ? item.end_time.substring(0, 5) : '18:00';

              return (
                <div
                  key={item.weekday}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4 hover:bg-slate-900/30 transition-colors"
                >
                  {/* Day Label & Open Toggle */}
                  <div className="flex items-center gap-4 min-w-[160px]">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.is_open}
                        onChange={(e) => handleChange(item.weekday, 'is_open', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500" />
                    </label>
                    <div>
                      <span className="font-semibold text-white text-sm">{dayName}</span>
                      <p className={`text-[11px] font-medium ${item.is_open ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {item.is_open ? 'Open for bookings' : 'Closed all day'}
                      </p>
                    </div>
                  </div>

                  {/* Start & End Time Inputs */}
                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Open:</span>
                      <input
                        type="time"
                        disabled={!item.is_open}
                        value={startVal}
                        onChange={(e) =>
                          handleChange(item.weekday, 'start_time', `${e.target.value}:00`)
                        }
                        className="rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-white font-mono focus:border-cyan-500 focus:outline-none disabled:opacity-40"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Close:</span>
                      <input
                        type="time"
                        disabled={!item.is_open}
                        value={endVal}
                        onChange={(e) =>
                          handleChange(item.weekday, 'end_time', `${e.target.value}:00`)
                        }
                        className="rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-white font-mono focus:border-cyan-500 focus:outline-none disabled:opacity-40"
                      />
                    </div>
                  </div>

                  {/* Save button per row */}
                  <div>
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => handleSaveDay(item)}
                      className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-cyan-300 hover:bg-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {isSaving ? 'Saving...' : 'Save Day'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
