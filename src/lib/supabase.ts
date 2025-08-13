import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      devices: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          device_type: string;
          last_lat: number | null;
          last_lng: number | null;
          last_seen: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          device_type: string;
          last_lat?: number | null;
          last_lng?: number | null;
          last_seen?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          device_type?: string;
          last_lat?: number | null;
          last_lng?: number | null;
          last_seen?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      device_locations: {
        Row: {
          id: string;
          device_id: string;
          lat: number;
          lng: number;
          timestamp: string;
          battery_level: number | null;
          accuracy: number | null;
        };
        Insert: {
          id?: string;
          device_id: string;
          lat: number;
          lng: number;
          timestamp?: string;
          battery_level?: number | null;
          accuracy?: number | null;
        };
        Update: {
          id?: string;
          device_id?: string;
          lat?: number;
          lng?: number;
          timestamp?: string;
          battery_level?: number | null;
          accuracy?: number | null;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};