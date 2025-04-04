// Core types for Supabase
export type UserRole = "user" | "admin" | "moderator";
export type UserStatus = "active" | "inactive" | "suspended" | "pending";

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  full_name?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
  theme_preference?: "light" | "dark";
}

export interface AuthResponse {
  data: any | null;
  error: Error | null;
} 