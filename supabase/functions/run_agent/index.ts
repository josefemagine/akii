// This edge function handles running interactions with AI agents

import { handleRequest, createSuccessResponse, createErrorResponse } from "../_shared/auth.ts";
import { query, queryOne, execute } from "../_shared/postgres.ts";

interface RunAgentRequest {
  agentId: string;
  message: string;
  sessionId?: string;
}

interface Agent {
  id: string;
  created_by: string;
  name: string;
  description: string;
  system_prompt: string;
  is_public: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AgentSession {
  id: string;
  agent_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface AgentMessage {
  id: string;
  session_id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  created_at: string;
}

// Fireworks AI model configuration by subscription tier
const FIREWORKS_MODELS = {
  basic: {
    modelId: "accounts/fireworks/models/tinyllama-1.1b-chat",
    name: "TinyLlama 1.1B",
  },
  pro: {
    modelId: "accounts/fireworks/models/mistral-7b-instruct",
    name: "Mistral 7B Instruct",
  },
  scale: {
    modelId: "accounts/fireworks/models/llama-2-13b-chat",
    name: "LLaMA 2 13B Chat",
  },
  enterprise: {
    modelId: "accounts/fireworks/models/llama-2-70b-chat",
    name: "LLaMA 2 70B Chat",
  },
} as const;

type UserTier = keyof typeof FIREWORKS_MODELS;

// Function to determine user's subscription tier
async function getUserTier(userId: string): Promise<UserTier> {
  if (!userId) return "pro";

  try {
    const profile = await queryOne<{ subscription: { plan: string } }>(
      "SELECT subscription FROM profiles WHERE id = $1",
      [userId]
    );

    if (!profile) {
      console.warn("Could not determine user tier, defaulting to Pro");
      return "pro";
    }

    const plan = (profile.subscription?.plan || "free").toLowerCase();
    
    if (plan === "free" || plan === "basic") return "basic";
    if (plan === "pro") return "pro";
    if (plan === "scale") return "scale";
    if (plan === "enterprise") return "enterprise";

    return "pro";
  } catch (err) {
    console.error("Error determining user tier:", err);
    return "pro";
  }
}

// Function to call Fireworks AI API
async function callFireworksAI(messages: { role: string; content: string }[], systemPrompt: string, userTier: UserTier = "pro") {
  const startTime = Date.now();
  const modelConfig = FIREWORKS_MODELS[userTier];

  try {
    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages
    ];

    const response = await fetch(
      "https://api.fireworks.ai/inference/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("FIREWORKS_API_KEY")}`,
        },
        body: JSON.stringify({
          model: modelConfig.modelId,
          messages: apiMessages,
          temperature: 0.7,
          max_tokens: 800,
        }),
      },
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
      throw new Error(`Fireworks API error: ${error.error?.message || response.statusText}`);
    }

    const result = await response.json();
    const latency = Date.now() - startTime;

    return {
      success: true,
      modelId: modelConfig.modelId,
      tier: userTier,
      latency,
      tokensUsed: result.usage?.total_tokens || 0,
      response: result.choices?.[0]?.message?.content || "No response generated",
    };
  } catch (error) {
    console.error(`Error calling Fireworks AI (${modelConfig.name}):`, error);
    return {
      success: false,
      modelId: modelConfig.modelId,
      tier: userTier,
      latency: Date.now() - startTime,
      tokensUsed: 0,
      response: `Error: ${error.message}`,
    };
  }
}

// Function to create a new session
async function createSession(agentId: string, userId: string): Promise<string> {
  const session = await queryOne<{ id: string }>(
    `INSERT INTO agent_sessions (agent_id, user_id, created_at, updated_at)
     VALUES ($1, $2, $3, $3)
     RETURNING id`,
    [agentId, userId, new Date().toISOString()]
  );
  
  return session?.id;
}

// Function to retrieve session history
async function getSessionMessages(sessionId: string): Promise<AgentMessage[]> {
  const result = await query<AgentMessage>(
    `SELECT id, session_id, content, role, created_at
     FROM agent_messages
     WHERE session_id = $1
     ORDER BY created_at ASC`,
    [sessionId]
  );
  return result.rows;
}

// Function to save a message
async function saveMessage(sessionId: string, content: string, role: 'user' | 'assistant' | 'system'): Promise<void> {
  await execute(
    `INSERT INTO agent_messages (session_id, content, role, created_at)
     VALUES ($1, $2, $3, $4)`,
    [sessionId, content, role, new Date().toISOString()]
  );
}

// Main handler function
Deno.serve(async (req) => {
  return handleRequest(
    req,
    async (user, body: RunAgentRequest) => {
      try {
        const { agentId, message, sessionId } = body;

        // Validate required fields
        if (!message?.trim()) {
          return createErrorResponse("Message is required", 400);
        }
        if (!agentId?.trim()) {
          return createErrorResponse("Agent ID is required", 400);
        }

        // Get agent details
        const agent = await queryOne<Agent>(
          "SELECT * FROM agents WHERE id = $1 AND (is_public = true OR created_by = $2)",
          [agentId, user.id]
        );

        if (!agent) {
          return createErrorResponse("Agent not found or you don't have access to it", 404);
        }

        if (!agent.is_active) {
          return createErrorResponse("This agent is currently inactive", 403);
        }

        // Get user's subscription tier
        const userTier = await getUserTier(user.id);

        // Handle session management
        let currentSessionId = sessionId;
        
        if (!currentSessionId) {
          // Create new session if none provided
          currentSessionId = await createSession(agentId, user.id);
        } else {
          // Verify session exists and belongs to this user and agent
          const session = await queryOne<AgentSession>(
            `SELECT * FROM agent_sessions 
             WHERE id = $1 AND agent_id = $2 AND user_id = $3`,
            [currentSessionId, agentId, user.id]
          );
          
          if (!session) {
            return createErrorResponse("Invalid session ID", 403);
          }
        }

        // Save user message
        await saveMessage(currentSessionId, message, 'user');

        // Get conversation history
        const messages = await getSessionMessages(currentSessionId);
        const formattedMessages = messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));

        // Call AI model with agent's system prompt and conversation history
        const modelResponse = await callFireworksAI(formattedMessages, agent.system_prompt, userTier);

        if (!modelResponse.success) {
          return createErrorResponse(modelResponse.response, 500);
        }

        // Save assistant response
        await saveMessage(currentSessionId, modelResponse.response, 'assistant');

        // Track usage
        await execute(
          `INSERT INTO agent_usage (
            user_id, 
            agent_id, 
            session_id, 
            tokens_used, 
            model_id,
            created_at
          ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            user.id,
            agentId,
            currentSessionId,
            modelResponse.tokensUsed,
            modelResponse.modelId,
            new Date().toISOString()
          ]
        );

        return createSuccessResponse({
          message: modelResponse.response,
          sessionId: currentSessionId,
          agent: {
            id: agent.id,
            name: agent.name,
          },
          metadata: {
            model: FIREWORKS_MODELS[userTier].name,
            tier: userTier,
            latency: modelResponse.latency,
            tokensUsed: modelResponse.tokensUsed,
          },
        });
      } catch (error) {
        console.error("Unexpected error in run_agent:", error);
        return createErrorResponse("An unexpected error occurred", 500);
      }
    },
    {
      requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY", "FIREWORKS_API_KEY"],
      requireAuth: true,
      requireBody: true,
    }
  );
}); 