export interface Subscription {
  plan: string;
  status: string;
  messages_used: number;
  message_limit: number;
  renews_at?: string;
  trial_ends_at?: string;
  addons?: Record<string, any>;
  payment_method?: string;
} 