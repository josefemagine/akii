/**
 * SUPABASE TYPES MODULE
 * Centralized types for Supabase data
 */

// User-related types
export type UserRole = "user" | "admin" | "team_member";
export type UserStatus = "active" | "inactive" | "banned" | "pending";

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  full_name?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

// Response type for consistent error handling
export interface ApiResponse<T = any> {
  data: T | null;
  error: Error | null;
} 