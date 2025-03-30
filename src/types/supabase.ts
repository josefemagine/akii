export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan_id: string;
          status: string;
          current_period_start: string;
          current_period_end: string;
          cancel_at_period_end: boolean;
          stripe_subscription_id: string | null;
          stripe_customer_id: string | null;
          billing_cycle: string;
          messages_used: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_id: string;
          status: string;
          current_period_start: string;
          current_period_end: string;
          cancel_at_period_end?: boolean;
          stripe_subscription_id?: string | null;
          stripe_customer_id?: string | null;
          billing_cycle: string;
          messages_used?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan_id?: string;
          status?: string;
          current_period_start?: string;
          current_period_end?: string;
          cancel_at_period_end?: boolean;
          stripe_subscription_id?: string | null;
          stripe_customer_id?: string | null;
          billing_cycle?: string;
          messages_used?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      plans: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price_monthly: number;
          price_yearly: number;
          features: Json;
          message_limit: number;
          is_active: boolean;
          stripe_price_id_monthly: string | null;
          stripe_price_id_yearly: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price_monthly: number;
          price_yearly: number;
          features?: Json;
          message_limit: number;
          is_active?: boolean;
          stripe_price_id_monthly?: string | null;
          stripe_price_id_yearly?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          price_monthly?: number;
          price_yearly?: number;
          features?: Json;
          message_limit?: number;
          is_active?: boolean;
          stripe_price_id_monthly?: string | null;
          stripe_price_id_yearly?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          title: string;
          user_id: string;
          agent_id: string;
          created_at: string;
          updated_at: string;
          started_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          user_id: string;
          agent_id: string;
          created_at?: string;
          updated_at?: string;
          started_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          user_id?: string;
          agent_id?: string;
          created_at?: string;
          updated_at?: string;
          started_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          content: string;
          role: string;
          created_at: string;
          user_id: string;
          sender_type: string;
          metadata: Json | null;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          content: string;
          role: string;
          created_at?: string;
          user_id: string;
          sender_type: string;
          metadata?: Json | null;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          content?: string;
          role?: string;
          created_at?: string;
          user_id?: string;
          sender_type?: string;
          metadata?: Json | null;
        };
      };
      training_documents: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          file_name: string;
          file_type: string;
          file_size: number;
          content: string;
          storage_path: string;
          status: string;
          created_at: string;
          updated_at: string;
          description: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          file_name: string;
          file_type: string;
          file_size: number;
          content: string;
          storage_path: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
          description?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          file_name?: string;
          file_type?: string;
          file_size?: number;
          content?: string;
          storage_path?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
          description?: string | null;
        };
      };
      document_chunks: {
        Row: {
          id: string;
          document_id: string;
          content: string;
          tokens: number;
          embedding: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          document_id: string;
          content: string;
          tokens: number;
          embedding?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          document_id?: string;
          content?: string;
          tokens?: number;
          embedding?: any;
          created_at?: string;
        };
      };
      team_invitations: {
        Row: {
          id: string;
          team_id: string;
          email: string;
          role: string;
          status: string;
          created_at: string;
          updated_at: string;
          invited_by: string;
          expires_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          email: string;
          role: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
          invited_by: string;
          expires_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          email?: string;
          role?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
          invited_by?: string;
          expires_at?: string;
        };
      };
      team_members: {
        Row: {
          id: string;
          team_id: string;
          user_id: string;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          user_id: string;
          role: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          user_id?: string;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
  };
} 