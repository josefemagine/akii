export type TeamMemberRole = "owner" | "admin" | "member" | "viewer";

export type AIInstanceStatus = "active" | "inactive" | "archived";

export interface AIInstanceSettings {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  customPrompt?: string;
  allowedDomains?: string[];
  webhookUrl?: string;
  apiAccess?: boolean;
}
