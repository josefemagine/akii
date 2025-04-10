import { Database } from "./supabase.tsx";

// Define types for database operations
export type Tables = Database["public"]["Tables"];

// Profile types
export type Profile = Tables["profiles"]["Row"];
export type ProfileInsert = Tables["profiles"]["Insert"];
export type ProfileUpdate = Tables["profiles"]["Update"];

// Subscription types
export type Subscription = Tables["subscriptions"]["Row"];
export type SubscriptionInsert = Tables["subscriptions"]["Insert"];
export type SubscriptionUpdate = Tables["subscriptions"]["Update"];

// Conversation types
export type Conversation = Tables["conversations"]["Row"];
export type ConversationInsert = Tables["conversations"]["Insert"];
export type ConversationUpdate = Tables["conversations"]["Update"];

// Message types
export type Message = Tables["messages"]["Row"];
export type MessageInsert = Tables["messages"]["Insert"];
export type MessageUpdate = Tables["messages"]["Update"];

// Document types
export type Document = Tables["training_documents"]["Row"];
export type DocumentInsert = Tables["training_documents"]["Insert"];
export type DocumentUpdate = Tables["training_documents"]["Update"];

// Document chunk types
export type DocumentChunk = Tables["document_chunks"]["Row"];
export type DocumentChunkInsert = Tables["document_chunks"]["Insert"];
export type DocumentChunkUpdate = Tables["document_chunks"]["Update"];

// Helper type for database operations
export type DbResult<T> = {
  data: T | null;
  error: Error | null;
};

export interface User {
  id: string;
  email: string;
  role: string;
  status?: string;
  subscription?: Subscription;
  created_at: string;
  updated_at: string;
}
