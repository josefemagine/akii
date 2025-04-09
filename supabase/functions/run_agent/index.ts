// This edge function handles interactions with AI agents

import { handleRequest, createSuccessResponse, createErrorResponse } from "../_shared/auth.ts";
import { query, queryOne, execute } from "../_shared/postgres.ts";

interface RunAgentRequest {
  message: string;
  agentId: string;
  sessionId?: string; // Optional - if not provided, a new session will be created
}

interface Agent {
  id: string;
  name: string;
  system_prompt: string;
  created_by: string;
  is_public: boolean;
}

interface AgentSession {
  id: string;
  agent_id: string;
  user_id: string;
  created_at: string;
}

interface AgentMessage {
  id: string;
  session_id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  created_at: string;
}

interface ModelResponse {
  success: boolean;
  modelId: string;
  tier: string;
  latency: number;
  tokensUsed: number;
  response: string;
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
async function callFireworksAI(
  messages: { role: string; content: string }[], 
  systemPrompt: string,
  userTier: UserTier = "pro"
): Promise<ModelResponse> {
  const startTime = Date.now();
  const modelConfig = FIREWORKS_MODELS[userTier];

  try {
    const allMessages = [
      {
        role: "system",
        content: systemPrompt,
      },
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
          messages: allMessages,
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
  } catch (error: any) {
    console.error(`Error calling Fireworks AI (${modelConfig.name}):`, error);
    return {
      success: false,
      modelId: modelConfig.modelId,
      tier: userTier,
      latency: Date.now() - startTime,
      tokensUsed: 0,
      response: `Error: ${error?.message || "Unknown error"}`,
    };
  }
}

// Function to create a new session
async function createSession(agentId: string, userId: string): Promise<string> {
  const result = await queryOne<{ id: string }>(
    `INSERT INTO agent_sessions (agent_id, user_id) 
     VALUES ($1, $2) 
     RETURNING id`,
    [agentId, userId]
  );
  
  if (!result?.id) {
    throw new Error("Failed to create session");
  }
  
  return result.id;
}

// Function to get all messages from a session
async function getSessionMessages(sessionId: string): Promise<AgentMessage[]> {
  return await query<AgentMessage>(
    `SELECT id, session_id, content, role, created_at 
     FROM agent_messages 
     WHERE session_id = $1 
     ORDER BY created_at ASC`,
    [sessionId]
  );
}

// Function to save a message
async function saveMessage(
  sessionId: string, 
  content: string, 
  role: 'user' | 'assistant' | 'system'
): Promise<void> {
  await execute(
    `INSERT INTO agent_messages (session_id, content, role) 
     VALUES ($1, $2, $3)`,
    [sessionId, content, role]
  );
}

// Main handler function
Deno.serve(async (req) => {
  return handleRequest(
    req,
    async (user, body) => {
      try {
        const { message, agentId, sessionId } = body as RunAgentRequest;

        // Validate required fields
        if (!message?.trim()) {
          return createErrorResponse("Message is required", 400);
        }
        if (!agentId?.trim()) {
          return createErrorResponse("Agent ID is required", 400);
        }

        // Get the agent
        const agent = await queryOne<Agent>(
          `SELECT id, name, system_prompt, created_by, is_public 
           FROM agents 
           WHERE id = $1`,
          [agentId]
        );

        if (!agent) {
          return createErrorResponse("Agent not found", 404);
        }

        // Check if the agent is accessible by the user
        if (!agent.is_public && agent.created_by !== user.id) {
          return createErrorResponse("You don't have access to this agent", 403);
        }

        // Get user's subscription tier
        const userTier = await getUserTier(user.id);

        // Handle session creation or retrieval
        let currentSessionId: string;

        if (sessionId) {
          // Verify that the session belongs to this user and agent
          const existingSession = await queryOne<AgentSession>(
            `SELECT id FROM agent_sessions WHERE id = $1 AND user_id = $2 AND agent_id = $3`,
            [sessionId, user.id, agentId]
          );

          if (!existingSession) {
            return createErrorResponse("Session not found or not accessible", 404);
          }

          currentSessionId = sessionId;
        } else {
          // Create a new session
          currentSessionId = await createSession(agentId, user.id);
        }

        // Get previous messages in this session
        const previousMessages = await getSessionMessages(currentSessionId);
        
        // Format messages for the AI
        const formattedMessages = previousMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));

        // Add the new user message
        formattedMessages.push({
          role: 'user',
          content: message
        });

        // Save user message
        await saveMessage(currentSessionId, message, 'user');

        // Get AI response
        const modelResponse = await callFireworksAI(
          formattedMessages,
          agent.system_prompt,
          userTier
        );

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