import { createClient } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast.ts';

// Ensure we have the environment variables we need
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a client for server function invocation
const functionsClient = createClient(supabaseUrl, supabaseAnonKey);

type ServerFunctionName = 
  // Team related functions
  | 'get_team'
  | 'team_invite'
  | 'team_remove'
  | 'update_team'
  | 'create_team'
  | 'user_get_teams'
  | 'team_get_member_team'
  | 'team_get_members'
  | 'team_update_member_role'
  
  // AI instance related functions
  | 'team_create_ai_instance'
  | 'team_update_ai_instance'
  | 'team_delete_ai_instance'
  | 'team_get_ai_instances'
  | 'team_get_members_with_ai_access'
  | 'team_update_ai_access'
  
  // Subscription related functions
  | 'get_subscription_plans'
  | 'get_user_subscription'
  | 'subscription_create'
  
  // Document related functions
  | 'create_document'
  | 'update_document_file'
  | 'process_document'
  | 'get_user_documents'
  | 'get_document_chunks'
  | 'delete_document'
  
  // Conversation related functions
  | 'get_conversation'
  | 'get_conversation_messages'
  | 'send_message'
  | 'run_agent';

/**
 * Invokes a server function with the given name and parameters
 * @param functionName Name of the function to invoke
 * @param params Parameters to pass to the function
 * @returns The function response data or throws an error
 */
export async function invokeServerFunction<T = any, P = any>(
  functionName: ServerFunctionName,
  params?: P
): Promise<T> {
  try {
    const { data, error } = await functionsClient.functions.invoke(functionName, {
      body: params || {},
    });

    if (error) {
      console.error(`Error invoking ${functionName}:`, error);
      throw new Error(error.message || 'Failed to call server function');
    }

    return data as T;
  } catch (error: any) {
    const errorMessage = error.message || `Failed to call ${functionName}`;
    toast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive',
    });
    throw error;
  }
}

/**
 * Get team and its members
 */
export async function getTeam(teamId: string) {
  return invokeServerFunction('get_team', { teamId });
}

/**
 * Get all teams for current user
 */
export async function getUserTeams() {
  return invokeServerFunction('user_get_teams');
}

/**
 * Invite a user to a team
 */
export async function inviteTeamMember(teamId: string, email: string, role: string) {
  return invokeServerFunction('team_invite', { teamId, email, role });
}

/**
 * Remove a user from a team
 */
export async function removeTeamMember(teamId: string, userId: string) {
  return invokeServerFunction('team_remove', { teamId, userId });
}

/**
 * Update team details
 */
export async function updateTeam(teamId: string, data: { name?: string; description?: string; isActive?: boolean }) {
  return invokeServerFunction('update_team', { teamId, ...data });
}

/**
 * Create a new team
 */
export async function createTeam(name: string, description?: string) {
  return invokeServerFunction('create_team', { name, description });
}

/**
 * Get subscription plans
 */
export async function getSubscriptionPlans() {
  return invokeServerFunction('get_subscription_plans');
}

/**
 * Get a team member's team
 */
export async function getMemberTeam(userId: string) {
  return invokeServerFunction('team_get_member_team', { userId });
}

/**
 * Get all members of a team
 */
export async function getTeamMembers(teamId: string) {
  return invokeServerFunction('team_get_members', { teamId });
}

/**
 * Update a team member's role
 */
export async function updateTeamMemberRole(teamId: string, userId: string, role: string) {
  return invokeServerFunction('team_update_member_role', { teamId, userId, role });
}

/**
 * Run an AI agent with a message
 */
export async function runAgent(agentId: string, message: string, sessionId?: string) {
  return invokeServerFunction('run_agent', { agentId, message, sessionId });
}

/**
 * Get user subscription
 */
export async function getUserSubscription() {
  return invokeServerFunction('get_user_subscription', {});
}

/**
 * Create a subscription
 */
export async function createSubscription(priceId: string) {
  return invokeServerFunction('subscription_create', { priceId });
}

/**
 * Get a conversation by ID
 */
export async function getConversation(conversationId: string) {
  return invokeServerFunction('get_conversation', { conversationId });
}

/**
 * Get messages for a conversation
 */
export async function getConversationMessages(conversationId: string) {
  return invokeServerFunction('get_conversation_messages', { conversationId });
}

/**
 * Send a message in a conversation
 */
export async function sendMessage(conversationId: string, content: string) {
  return invokeServerFunction('send_message', { conversationId, content });
}

/**
 * Create a document
 */
export async function createDocument(name: string, description?: string) {
  return invokeServerFunction('create_document', { name, description });
}

/**
 * Update a document's file
 */
export async function updateDocumentFile(documentId: string, fileUrl: string) {
  return invokeServerFunction('update_document_file', { documentId, fileUrl });
}

/**
 * Process a document
 */
export async function processDocument(documentId: string) {
  return invokeServerFunction('process_document', { documentId });
}

/**
 * Get user documents
 */
export async function getUserDocuments() {
  return invokeServerFunction('get_user_documents', {});
}

/**
 * Get document chunks
 */
export async function getDocumentChunks(documentId: string) {
  return invokeServerFunction('get_document_chunks', { documentId });
}

/**
 * Delete a document
 */
export async function deleteDocument(documentId: string) {
  return invokeServerFunction('delete_document', { documentId });
}

/**
 * Get team AI instances
 */
export async function getTeamAIInstances(teamId: string) {
  return invokeServerFunction('team_get_ai_instances', { teamId });
}

/**
 * Create team AI instance
 */
export async function createTeamAIInstance(teamId: string, data: any) {
  return invokeServerFunction('team_create_ai_instance', { teamId, ...data });
}

/**
 * Update team AI instance
 */
export async function updateTeamAIInstance(instanceId: string, data: any) {
  return invokeServerFunction('team_update_ai_instance', { instanceId, ...data });
}

/**
 * Delete team AI instance
 */
export async function deleteTeamAIInstance(instanceId: string) {
  return invokeServerFunction('team_delete_ai_instance', { instanceId });
}

/**
 * Get team members with AI access
 */
export async function getTeamMembersWithAIAccess(teamId: string) {
  return invokeServerFunction('team_get_members_with_ai_access', { teamId });
}

/**
 * Update team AI access
 */
export async function updateTeamAIAccess(teamId: string, memberId: string, instances: string[]) {
  return invokeServerFunction('team_update_ai_access', { teamId, memberId, instances });
} 