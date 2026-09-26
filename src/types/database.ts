export type VehicleType = 'sedan' | 'suv' | 'truck' | 'van' | 'other';

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  created_at?: string;
}

export interface Appointment {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  service_id: string;
  vehicle_type: VehicleType;
  vehicle_make_model?: string | null;
  license_plate?: string | null;
  appointment_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM:SS
  end_time: string; // HH:MM:SS
  status: AppointmentStatus;
  notes?: string | null;
  created_at?: string;
  // Joined field for convenience in admin
  service?: Service;
}

export interface BusinessHours {
  id: string;
  weekday: number; // 0 = Sunday, 6 = Saturday
  is_open: boolean;
  start_time: string; // HH:MM:SS
  end_time: string; // HH:MM:SS
}

export interface BlockedDate {
  id: string;
  blocked_date: string; // YYYY-MM-DD
  reason: string;
  created_at?: string;
}

export interface BusinessSettings {
  id: string;
  business_name: string;
  business_email: string;
  business_phone: string;
  business_address: string;
  slot_interval_minutes: number;
  booking_notice_hours: number;
  bays_count: number;
  created_at?: string;
}

export interface AdminUser {
  id: string;
  user_id: string;
  created_at?: string;
}

export interface BookedSlotRpcRow {
  start_time: string; // HH:MM:SS
  end_time: string; // HH:MM:SS
}

export interface AvailableTimeSlot {
  start: Date;
  end: Date;
  label: string;
  startTimeStr: string; // HH:MM:SS
  endTimeStr: string; // HH:MM:SS
  overlappingBookings: number;
  baysCapacity: number;
}
