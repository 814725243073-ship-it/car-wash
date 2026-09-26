import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  Service,
  BusinessSettings,
  BusinessHours,
  BlockedDate,
  BookedSlotRpcRow,
  VehicleType,
  AppointmentStatus,
  Appointment,
} from '../types/database';

export interface BookingSubmissionPayload {
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
  notes?: string | null;
}

interface DataContextType {
  services: Service[];
  activeServices: Service[];
  businessSettings: BusinessSettings;
  businessHours: BusinessHours[];
  blockedDates: BlockedDate[];
  loading: boolean;
  refreshData: () => Promise<void>;
  fetchBookedSlotsForDate: (dateStr: string) => Promise<BookedSlotRpcRow[]>;
  submitAppointment: (payload: BookingSubmissionPayload) => Promise<{ success: boolean; isFullyBooked?: boolean; error?: string }>;
  // Admin mutations
  updateBusinessSettings: (newSettings: Partial<BusinessSettings>) => Promise<{ success: boolean; error?: string }>;
  updateBusinessHour: (item: Partial<BusinessHours> & { id?: string; weekday: number }) => Promise<{ success: boolean; error?: string }>;
  createService: (service: Omit<Service, 'id' | 'created_at'>) => Promise<{ success: boolean; error?: string }>;
  updateService: (id: string, updates: Partial<Service>) => Promise<{ success: boolean; error?: string }>;
  addBlockedDate: (dateStr: string, reason: string) => Promise<{ success: boolean; error?: string }>;
  deleteBlockedDate: (id: string) => Promise<{ success: boolean; error?: string }>;
}

const defaultSettings: BusinessSettings = {
  id: '',
  business_name: 'AURA Hydro Detailing',
  business_email: 'concierge@auradetailing.com',
  business_phone: '(555) 849-2872',
  business_address: '840 Apex Boulevard, Suite 100, West Bay',
  slot_interval_minutes: 30,
  booking_notice_hours: 2,
  bays_count: 3,
};

const defaultBusinessHours: BusinessHours[] = [
  { id: 'sun', weekday: 0, is_open: false, start_time: '09:00:00', end_time: '17:00:00' },
  { id: 'mon', weekday: 1, is_open: true, start_time: '08:00:00', end_time: '18:00:00' },
  { id: 'tue', weekday: 2, is_open: true, start_time: '08:00:00', end_time: '18:00:00' },
  { id: 'wed', weekday: 3, is_open: true, start_time: '08:00:00', end_time: '18:00:00' },
  { id: 'thu', weekday: 4, is_open: true, start_time: '08:00:00', end_time: '18:00:00' },
  { id: 'fri', weekday: 5, is_open: true, start_time: '08:00:00', end_time: '19:00:00' },
  { id: 'sat', weekday: 6, is_open: true, start_time: '08:00:00', end_time: '17:00:00' },
];

const defaultSeedServices: Service[] = [
  {
    id: 'seed-exterior',
    name: 'Hydro Exterior Foam Bath',
    description: 'High-lubricity pH-neutral snow foam pre-wash, two-bucket hand wash, wheel iron decontamination, and spot-free deionized air dry.',
    duration_minutes: 30,
    price: 499,
    is_active: true,
  },
  {
    id: 'seed-full',
    name: 'Signature Full Wash & Interior Detail',
    description: 'Complete exterior hydro bath plus deep cabin vacuum, anti-bacterial dashboard conditioning, footwell shampoo, and crystal glass.',
    duration_minutes: 60,
    price: 999,
    is_active: true,
  },
  {
    id: 'seed-wax',
    name: 'Hydro Gloss & Ceramic Wax Polish',
    description: 'Paint decontamination clay bar, hydrophobic ceramic wax sealant application, tire dressing, and deep wet-look reflection.',
    duration_minutes: 75,
    price: 1899,
    is_active: true,
  },
  {
    id: 'seed-deep-clean',
    name: 'Executive Studio Spa & Engine Bay Deep Clean',
    description: 'Multi-stage paint gloss enhancement, hot water extraction for leather/upholstery, and detailed engine bay degrease.',
    duration_minutes: 90,
    price: 3499,
    is_active: true,
  },
];

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>(defaultSettings);
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>(defaultBusinessHours);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshData = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    try {
      // 1. Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .order('price', { ascending: true });

      if (servicesError) {
        console.warn('Error fetching services:', servicesError.message);
      } else if (servicesData && servicesData.length > 0) {
        setServices(servicesData);
      } else if (!servicesData || servicesData.length === 0) {
        // Fallback default services in Rupee if table is freshly provisioned
        setServices(defaultSeedServices);
      }

      // 2. Fetch business_settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('business_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (settingsError) {
        console.warn('Error fetching business_settings:', settingsError.message);
      } else if (settingsData) {
        setBusinessSettings(settingsData);
      }

      // 3. Fetch business_hours
      const { data: hoursData, error: hoursError } = await supabase
        .from('business_hours')
        .select('*')
        .order('weekday', { ascending: true });

      if (hoursError) {
        console.warn('Error fetching business_hours:', hoursError.message);
      } else if (hoursData && hoursData.length > 0) {
        setBusinessHours(hoursData);
      }

      // 4. Fetch blocked_dates
      const { data: blockedData, error: blockedError } = await supabase
        .from('blocked_dates')
        .select('*')
        .order('blocked_date', { ascending: true });

      if (blockedError) {
        console.warn('Error fetching blocked_dates:', blockedError.message);
      } else if (blockedData) {
        setBlockedDates(blockedData);
      }
    } catch (err) {
      console.error('Data refresh error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Fetch booked slots for a given date using RPC get_booked_slots
  const fetchBookedSlotsForDate = async (dateStr: string): Promise<BookedSlotRpcRow[]> => {
    if (!isSupabaseConfigured()) {
      return [];
    }

    try {
      const { data, error } = await supabase.rpc('get_booked_slots', {
        p_date: dateStr,
      });

      if (error) {
        console.error('Error invoking get_booked_slots RPC:', error.message);
        return [];
      }

      return (data as BookedSlotRpcRow[]) || [];
    } catch (err) {
      console.error('Exception calling get_booked_slots:', err);
      return [];
    }
  };

  /**
   * Submit an appointment request.
   * STRICT RULE:
   * Do not use .insert(...).select() or .insert(...).select().single().
   * Public users insert without select.
   * Always insert status: 'pending'.
   */
  const submitAppointment = async (
    payload: BookingSubmissionPayload
  ): Promise<{ success: boolean; isFullyBooked?: boolean; error?: string }> => {
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        error: 'Supabase credentials are not configured yet. Please configure Supabase.',
      };
    }

    try {
      let resolvedServiceId = payload.service_id;

      // If service_id is a temporary seed key, map to a live Supabase service UUID
      if (resolvedServiceId && resolvedServiceId.startsWith('seed-')) {
        const { data: existingLive } = await supabase
          .from('services')
          .select('id')
          .eq('is_active', true)
          .limit(1);

        if (existingLive && existingLive.length > 0) {
          resolvedServiceId = existingLive[0].id;
        } else {
          // If the services table is completely empty, insert the selected seed service
          const matched = defaultSeedServices.find((s) => s.id === payload.service_id) || defaultSeedServices[0];
          const { data: newSvc } = await supabase
            .from('services')
            .insert([
              {
                name: matched.name,
                description: matched.description,
                duration_minutes: matched.duration_minutes,
                price: matched.price,
                is_active: true,
              },
            ])
            .select('id')
            .single();

          if (newSvc) {
            resolvedServiceId = newSvc.id;
          }
        }
      }

      const insertRecord = {
        full_name: payload.full_name.trim(),
        email: payload.email.trim(),
        phone: payload.phone.trim(),
        service_id: resolvedServiceId,
        vehicle_type: payload.vehicle_type,
        vehicle_make_model: payload.vehicle_make_model?.trim() || null,
        license_plate: payload.license_plate?.trim() || null,
        appointment_date: payload.appointment_date,
        start_time: payload.start_time,
        end_time: payload.end_time,
        notes: payload.notes?.trim() || null,
        status: 'pending' as const, // Must be 'pending'
      };

      // Notice NO .select() here!
      const { error } = await supabase.from('appointments').insert([insertRecord]);

      if (error) {
        console.error('Insert appointment error:', error);
        const lowerErr = error.message.toLowerCase();
        if (lowerErr.includes('fully booked')) {
          return {
            success: false,
            isFullyBooked: true,
            error: 'Sorry, that time was just taken. Please choose another time.',
          };
        }
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      console.error('Insert appointment exception:', err);
      const errMsg = err?.message || 'Failed to submit appointment.';
      if (errMsg.toLowerCase().includes('fully booked')) {
        return {
          success: false,
          isFullyBooked: true,
          error: 'Sorry, that time was just taken. Please choose another time.',
        };
      }
      return { success: false, error: errMsg };
    }
  };

  // ADMIN: Update business settings
  const updateBusinessSettings = async (
    newSettings: Partial<BusinessSettings>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!businessSettings.id) {
        // Try finding or inserting
        const { data, error } = await supabase
          .from('business_settings')
          .upsert([{ ...businessSettings, ...newSettings }])
          .select()
          .single();

        if (error) return { success: false, error: error.message };
        if (data) setBusinessSettings(data);
        return { success: true };
      }

      const { data, error } = await supabase
        .from('business_settings')
        .update(newSettings)
        .eq('id', businessSettings.id)
        .select()
        .single();

      if (error) return { success: false, error: error.message };
      if (data) setBusinessSettings(data);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error updating settings' };
    }
  };

  // ADMIN: Update business hours
  const updateBusinessHour = async (
    item: Partial<BusinessHours> & { id?: string; weekday: number }
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (item.id && item.id.length > 5) {
        const { error } = await supabase
          .from('business_hours')
          .update({
            is_open: item.is_open,
            start_time: item.start_time,
            end_time: item.end_time,
          })
          .eq('id', item.id);

        if (error) return { success: false, error: error.message };
      } else {
        const { error } = await supabase.from('business_hours').upsert([
          {
            weekday: item.weekday,
            is_open: item.is_open,
            start_time: item.start_time,
            end_time: item.end_time,
          },
        ]);
        if (error) return { success: false, error: error.message };
      }

      await refreshData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error updating hour' };
    }
  };

  // ADMIN: Create service
  const createService = async (
    service: Omit<Service, 'id' | 'created_at'>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.from('services').insert([service]);
      if (error) return { success: false, error: error.message };
      await refreshData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error creating service' };
    }
  };

  // ADMIN: Update service
  const updateService = async (
    id: string,
    updates: Partial<Service>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.from('services').update(updates).eq('id', id);
      if (error) return { success: false, error: error.message };
      await refreshData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error updating service' };
    }
  };

  // ADMIN: Add blocked date
  const addBlockedDate = async (
    dateStr: string,
    reason: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase
        .from('blocked_dates')
        .insert([{ blocked_date: dateStr, reason: reason.trim() }]);
      if (error) return { success: false, error: error.message };
      await refreshData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error adding blocked date' };
    }
  };

  // ADMIN: Delete blocked date
  const deleteBlockedDate = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.from('blocked_dates').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
      await refreshData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error deleting blocked date' };
    }
  };

  const activeServices = services.filter((s) => s.is_active);

  return (
    <DataContext.Provider
      value={{
        services,
        activeServices,
        businessSettings,
        businessHours,
        blockedDates,
        loading,
        refreshData,
        fetchBookedSlotsForDate,
        submitAppointment,
        updateBusinessSettings,
        updateBusinessHour,
        createService,
        updateService,
        addBlockedDate,
        deleteBlockedDate,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
