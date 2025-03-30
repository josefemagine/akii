import { Json } from "./supabase";

export type UserRole = "user" | "admin";

export interface UserWithRole {
  id: string;
  email: string;
  role?: UserRole;
  subscription?: {
    plan: string;
    status: string;
    messageLimit: number;
    messagesUsed: number;
    trialEndsAt?: string | null;
  };
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_type: string;
  content: string;
  metadata: Json;
  created_at: string;
  role: "user" | "assistant" | "system";
}

export interface Conversation {
  id: string;
  agent_id: string;
  user_id: string;
  external_user_id: string;
  platform: string;
  metadata: Json;
  started_at: string;
  ended_at: string;
  is_active: boolean;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentChunk {
  id: string;
  document_id: string;
  content: string;
  metadata: {
    chunk_index: number;
    total_chunks: number;
  };
  embedding: string;
  created_at: string;
}

export interface Invitation {
  id: string;
  email: string;
  role: string;
  expires_at: string;
  team_id: string;
}

// Analytics related types
export interface AIMetrics {
  avg_response_time: number;
  satisfaction_rate: number;
  total_requests: number;
  error_rate: number;
}

export interface ModerationMetrics {
  total_moderated: number;
  flagged_content: number;
  approval_rate: number;
  active_rules: number;
}

export interface TopAgent {
  id: string;
  name: string;
  avatar_url: string;
  messages: number;
  conversations: number;
  rating: number;
  type?: string;
}

export interface AnalyticsData {
  totalRevenue: number;
  monthlyRecurring: number;
  activeSubscribers: number;
  conversionRate: number;
  averageResponseTime: number;
  satisfactionRate: number;
  totalRequests: number;
  errorRate: number;
  totalModerated: number;
  flaggedContent: number;
  approvalRate: number;
  moderationRules: number;
  dailyUsers: number[];
  dailyMessages: number[];
  topAgents: TopAgent[];
}

export type TeamMemberRole = "admin" | "member" | "viewer";

export type SubscriptionTier =
  | "free"
  | "basic"
  | "pro"
  | "scale"
  | "enterprise";
export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "limited";

export interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  subscription_tier?: SubscriptionTier;
  message_limit?: number;
  messages_used?: number;
  subscription_status?: SubscriptionStatus;
  trial_ends_at?: string | null;
  last_billing_date?: string | null;
  next_billing_date?: string | null;
}
