// This edge function handles chat interactions with AI agents

import { handleRequest, createSuccessResponse, createErrorResponse } from "../_shared/auth.ts";
import { query, queryOne, execute } from "../_shared/postgres.ts";

interface ChatWithAgentRequest {
  message: string;
  agentId: string;
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

// Add secret variable references
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

// Function to call Fireworks AI API
async function callFireworksAI(message: string, userTier: UserTier = "pro"): Promise<ModelResponse> {
  const startTime = Date.now();
  const modelConfig = FIREWORKS_MODELS[userTier];

  try {
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
          messages: [
            {
              role: "system",
              content: "You are Akii, an AI assistant that helps users with their questions.",
            },
            { role: "user", content: message },
          ],
          temperature: 0.7,
          max_tokens: 300,
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
      response: `Error: ${(error instanceof Error ? error.message : String(error))}`,
    };
  }
}

interface UserProfile {
  subscription: {
    plan: string;
  };
}

// Function to determine user's subscription tier
async function getUserTier(userId: string): Promise<UserTier> {
  if (!userId) return "pro";

  try {
    const profile = await queryOne<UserProfile>(
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

// Function to log model response for testing/analytics
async function logModelResponse(modelResponse: ModelResponse): Promise<void> {
  try {
    const responsePreview = modelResponse.response.substring(0, 500);

    await execute(
      `INSERT INTO test_model_responses (
        tier, 
        model_id, 
        latency, 
        tokens_used, 
        response_preview, 
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        modelResponse.tier,
        modelResponse.modelId,
        modelResponse.latency,
        modelResponse.tokensUsed,
        responsePreview,
        new Date().toISOString()
      ]
    );
  } catch (error) {
    console.error("Error logging model response:", error);
  }
}

// Main handler function
Deno.serve(async (req) => {
  return handleRequest(
    req,
    async (user, body) => {
      try {
        const { message, agentId } = body;

        // Validate required fields
        if (!message?.trim()) {
          return createErrorResponse("Message is required", 400);
        }
        if (!agentId?.trim()) {
          return createErrorResponse("Agent ID is required", 400);
        }

        // Get user's subscription tier
        const userTier = await getUserTier(user.id);

        // Call Fireworks AI
        const modelResponse = await callFireworksAI(message, userTier);

        // Log the response for analytics
        await logModelResponse(modelResponse);

        if (!modelResponse.success) {
          return createErrorResponse(modelResponse.response, 500);
        }

        return createSuccessResponse({
          message: modelResponse.response,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
          },
          metadata: {
            model: FIREWORKS_MODELS[userTier].name,
            tier: userTier,
            latency: modelResponse.latency,
            tokensUsed: modelResponse.tokensUsed,
          },
        });
      } catch (error) {
        console.error("Unexpected error in chat_with_agent:", error);
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
