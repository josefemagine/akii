export type TeamMemberRole = "owner" | "admin" | "member" | "viewer";
export type UserRole = "user" | "admin" | "team_member";
export type UserStatus = "active" | "inactive" | "banned" | "pending";
export type AIInstanceStatus = "active" | "inactive" | "archived";

export interface User {
  id: string;
  email?: string;
  app_metadata?: Record<string, any>;
  user_metadata?: Record<string, any>;
  aud?: string;
  created_at?: string;
  role?: string;
  subscription?: Subscription;
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
}

