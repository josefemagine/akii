export type TeamMemberRole = "owner" | "admin" | "member" | "viewer";
export type UserRole = "user" | "admin" | "moderator" | "owner" | "editor" | null;
export type UserStatus = "active" | "inactive" | "suspended" | "pending" | null;
export type AIInstanceStatus = "active" | "inactive" | "archived";

// Import the User type from Supabase
import type { User as SupabaseUser } from "@supabase/supabase-js";

// Fix the User interface to properly handle role type
export interface User extends Omit<SupabaseUser, 'role'> {
  role: UserRole | undefined;
  status?: UserStatus;
  subscription?: Subscription | null;
  isAdmin?: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  full_name?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
  first_name?: string | null;
  last_name?: string | null;
  company?: string | null;
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
  conversation_id?: string;
  user_id?: string;
  sender_type?: string;
  metadata?: Record<string, any> | null;
}

export interface DocumentChunk {
  id: string;
  document_id: string;
  content: string;
  metadata: {
    chunk_index: number;
    total_chunks: number;
    [key: string]: any;
  };
  embedding?: number[];
  created_at?: string;
}

export interface AIInstanceSettings {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  customPrompt?: string;
  allowedDomains?: string[];
  webhookUrl?: string;
  apiAccess?: boolean;
}

export interface Subscription {
  plan: string;
  status: string;
  messages_used: number;
  message_limit: number;
  renews_at: string;
  trial_ends_at?: string;
  addons?: Record<string, any>;
  payment_method?: string;
}

