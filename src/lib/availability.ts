import {
  BusinessHours,
  BusinessSettings,
  BlockedDate,
  BookedSlotRpcRow,
  AvailableTimeSlot,
  Service,
} from '../types/database';

/**
 * Format a Date to YYYY-MM-DD
 */
export function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format a Date to HH:MM:SS (Supabase time column format)
 */
export function formatTimeToHHMMSS(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Format a Date to user-friendly time string (e.g., "9:00 AM" or "2:30 PM")
 */
export function formatDisplayTime(date: Date): string {
  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Safely parse a time string "HH:MM:SS" or "HH:MM" on a specific Date
 */
export function parseTimeToDate(baseDate: Date, timeStr: string): Date {
  const [hStr, mStr, sStr] = timeStr.split(':');
  const hours = parseInt(hStr || '0', 10);
  const minutes = parseInt(mStr || '0', 10);
  const seconds = parseInt(sStr || '0', 10);

  const result = new Date(baseDate);
  result.setHours(hours, minutes, seconds, 0);
  return result;
}

/**
 * Check if a date string YYYY-MM-DD is blocked
 */
export function isDateBlocked(dateStr: string, blockedDates: BlockedDate[]): { blocked: boolean; reason?: string } {
  const found = blockedDates.find((b) => b.blocked_date === dateStr);
  if (found) {
    return { blocked: true, reason: found.reason };
  }
  return { blocked: false };
}

/**
 * Calculate available slots for a given date and service
 */
export function calculateAvailableSlots(params: {
  selectedDate: Date;
  service: Service;
  businessHours: BusinessHours[];
  businessSettings: BusinessSettings;
  blockedDates: BlockedDate[];
  bookedSlots: BookedSlotRpcRow[];
  currentDate?: Date; // For testing or current time check
}): AvailableTimeSlot[] {
  const {
    selectedDate,
    service,
    businessHours,
    businessSettings,
    blockedDates,
    bookedSlots,
    currentDate = new Date(),
  } = params;

  const dateStr = formatDateToYYYYMMDD(selectedDate);

  // 1. Check if date is in blocked_dates
  const blockedCheck = isDateBlocked(dateStr, blockedDates);
  if (blockedCheck.blocked) {
    return [];
  }

  // 2. Check business hours for the selected weekday
  const weekday = selectedDate.getDay(); // 0 = Sunday, 6 = Saturday
  const daySchedule = businessHours.find((bh) => bh.weekday === weekday);

  if (!daySchedule || !daySchedule.is_open) {
    return [];
  }

  // 3. Parse working hours start and end
  const dayStart = parseTimeToDate(selectedDate, daySchedule.start_time);
  const dayEnd = parseTimeToDate(selectedDate, daySchedule.end_time);

  if (dayEnd <= dayStart) {
    return [];
  }

  // 4. Calculate minimum allowable booking start time based on booking_notice_hours
  const noticeHours = Math.max(0, businessSettings.booking_notice_hours || 0);
  const minNoticeTime = new Date(currentDate.getTime() + noticeHours * 60 * 60 * 1000);

  // 5. Parse booked slots into Date ranges
  const parsedBookedRanges = bookedSlots.map((b) => {
    return {
      start: parseTimeToDate(selectedDate, b.start_time),
      end: parseTimeToDate(selectedDate, b.end_time),
    };
  });

  const durationMs = (service.duration_minutes || 45) * 60 * 1000;
  const intervalMinutes = Math.max(10, businessSettings.slot_interval_minutes || 30);
  const intervalMs = intervalMinutes * 60 * 1000;
  const baysCount = Math.max(1, businessSettings.bays_count || 1);

  const slots: AvailableTimeSlot[] = [];
  let slotCandidateStart = new Date(dayStart);

  while (true) {
    const slotCandidateEnd = new Date(slotCandidateStart.getTime() + durationMs);

    // Rule: The service must finish before closing time
    if (slotCandidateEnd > dayEnd) {
      break;
    }

    // Rule: Respect booking notice time
    const respectsNotice = slotCandidateStart >= minNoticeTime;

    // Multiple wash bays capacity rule:
    // Overlap rule: new_start < existing_end AND new_end > existing_start
    let overlappingCount = 0;
    const slotStartMs = slotCandidateStart.getTime();
    const slotEndMs = slotCandidateEnd.getTime();

    for (const booked of parsedBookedRanges) {
      const bookedStartMs = booked.start.getTime();
      const bookedEndMs = booked.end.getTime();

      if (slotStartMs < bookedEndMs && slotEndMs > bookedStartMs) {
        overlappingCount++;
      }
    }

    // A slot is available only if overlapping_count < bays_count AND respects booking notice
    const isAvailable = respectsNotice && overlappingCount < baysCount;

    if (isAvailable) {
      slots.push({
        start: new Date(slotCandidateStart),
        end: new Date(slotCandidateEnd),
        label: `${formatDisplayTime(slotCandidateStart)} - ${formatDisplayTime(slotCandidateEnd)}`,
        startTimeStr: formatTimeToHHMMSS(slotCandidateStart),
        endTimeStr: formatTimeToHHMMSS(slotCandidateEnd),
        overlappingBookings: overlappingCount,
        baysCapacity: baysCount,
      });
    }

    // Advance to next interval
    slotCandidateStart = new Date(slotCandidateStart.getTime() + intervalMs);
  }

  return slots;
}
