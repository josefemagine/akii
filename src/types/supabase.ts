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
      agents: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          industry: string | null;
          behavior_settings: Json | null;
          response_style: Json | null;
          is_active: boolean;
          version: number;
          parent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          industry?: string | null;
          behavior_settings?: Json | null;
          response_style?: Json | null;
          is_active?: boolean;
          version?: number;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          industry?: string | null;
          behavior_settings?: Json | null;
          response_style?: Json | null;
          is_active?: boolean;
          version?: number;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "agents_parent_id_fkey";
            columns: ["parent_id"];
            referencedRelation: "agents";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "agents_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_type: "user" | "assistant" | "system";
          content: string;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_type: "user" | "assistant" | "system";
          content: string;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_type?: "user" | "assistant" | "system";
          content?: string;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey";
            columns: ["conversation_id"];
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          }
        ];
      };
      conversations: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          started_at: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          started_at?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          started_at?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "conversations_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      team_members: {
        Row: {
          id: string;
          team_id: string;
          user_id: string;
          role: "owner" | "admin" | "member";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          user_id: string;
          role: "owner" | "admin" | "member";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          user_id?: string;
          role?: "owner" | "admin" | "member";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey";
            columns: ["team_id"];
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "team_members_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      team_invitations: {
        Row: {
          id: string;
          team_id: string;
          email: string;
          status: "pending" | "accepted" | "rejected" | "expired";
          role: "owner" | "admin" | "member";
          expires_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          email: string;
          status?: "pending" | "accepted" | "rejected" | "expired";
          role: "owner" | "admin" | "member";
          expires_at: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          email?: string;
          status?: "pending" | "accepted" | "rejected" | "expired";
          role?: "owner" | "admin" | "member";
          expires_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "team_invitations_team_id_fkey";
            columns: ["team_id"];
            referencedRelation: "teams";
            referencedColumns: ["id"];
          }
        ];
      };
      training_documents: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          file_path: string;
          file_type: string;
          file_size: number;
          status: "pending" | "processing" | "completed" | "failed";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          file_path: string;
          file_type: string;
          file_size: number;
          status?: "pending" | "processing" | "completed" | "failed";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          file_path?: string;
          file_type?: string;
          file_size?: number;
          status?: "pending" | "processing" | "completed" | "failed";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "training_documents_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      document_chunks: {
        Row: {
          id: string;
          document_id: string;
          content: string;
          embedding: string;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          document_id: string;
          content: string;
          embedding: string;
          metadata: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          document_id?: string;
          content?: string;
          embedding?: string;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "document_chunks_document_id_fkey";
            columns: ["document_id"];
            referencedRelation: "training_documents";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          role: "user" | "admin" | "team_member";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          role?: "user" | "admin" | "team_member";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: "user" | "admin" | "team_member";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      analytics: {
        Row: {
          id: string;
          visitors: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          visitors: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          visitors?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      ai_metrics: {
        Row: {
          id: string;
          avg_response_time: number;
          satisfaction_rate: number;
          total_requests: number;
          error_rate: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          avg_response_time: number;
          satisfaction_rate: number;
          total_requests: number;
          error_rate: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          avg_response_time?: number;
          satisfaction_rate?: number;
          total_requests?: number;
          error_rate?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      moderation_metrics: {
        Row: {
          id: string;
          total_moderated: number;
          flagged_content: number;
          approval_rate: number;
          active_rules: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          total_moderated: number;
          flagged_content: number;
          approval_rate: number;
          active_rules: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          total_moderated?: number;
          flagged_content?: number;
          approval_rate?: number;
          active_rules?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      agent_ratings: {
        Row: {
          id: string;
          agent_id: string;
          user_id: string;
          rating: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          agent_id: string;
          user_id: string;
          rating: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          agent_id?: string;
          user_id?: string;
          rating?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "agent_ratings_agent_id_fkey";
            columns: ["agent_id"];
            referencedRelation: "agents";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "agent_ratings_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sessions_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan: "free" | "pro" | "enterprise";
          status: "active" | "inactive" | "trial" | "cancelled" | "expired";
          message_limit: number;
          messages_used: number;
          trial_ends_at: string | null;
          renews_at: string | null;
          addons: Json;
          payment_method: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan?: "free" | "pro" | "enterprise";
          status?: "active" | "inactive" | "trial" | "cancelled" | "expired";
          message_limit?: number;
          messages_used?: number;
          trial_ends_at?: string | null;
          renews_at?: string | null;
          addons?: Json;
          payment_method?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan?: "free" | "pro" | "enterprise";
          status?: "active" | "inactive" | "trial" | "cancelled" | "expired";
          message_limit?: number;
          messages_used?: number;
          trial_ends_at?: string | null;
          renews_at?: string | null;
          addons?: Json;
          payment_method?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      plans: {
        Row: {
          id: string;
          name: string;
          description: string;
          price_monthly: number;
          price_yearly: number;
          features: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          price_monthly: number;
          price_yearly: number;
          features: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          price_monthly?: number;
          price_yearly?: number;
          features?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      handle_new_user: {
        Args: Record<PropertyKey, never>;
        Returns: unknown;
      };
      update_updated_at: {
        Args: Record<PropertyKey, never>;
        Returns: unknown;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
