export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "moderator";
  status: "active" | "inactive" | "suspended" | "pending";
  plan: "free" | "starter" | "professional" | "enterprise";
  createdAt: string;
  lastLogin: string;
  agents: number;
  messagesUsed: number;
  messageLimit: number;
  company_name?: string;
}

export interface AuthUser {
  id: string;
  email?: string;
  confirmed_at?: string;
  email_confirmed_at?: string;
  created_at?: string;
  last_sign_in_at?: string;
}

export interface EditUserData {
  first_name: string;
  last_name: string;
  email: string;
  company_name: string;
  role: string;
  status: string;
} 