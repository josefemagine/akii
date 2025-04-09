// This edge function tests all Fireworks AI models and logs their performance

import serve from "https://deno.land/std@0.208.0/http/server.ts";
import { handleRequest, createSuccessResponse, createErrorResponse } from "../_shared/auth.ts";
import { execute, queryOne } from "../_shared/postgres.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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
};

// Add secret variable references
const FIREWORKS_API_KEY = Deno.env.get("FIREWORKS_API_KEY");

// Function to call Fireworks AI API
async function callFireworksAI(message, tier) {
  const startTime = Date.now();
  const modelConfig = FIREWORKS_MODELS[tier];

  try {
    console.log(`Testing ${modelConfig.name} (${tier} tier)...`);

    const response = await fetch(
      "https://api.fireworks.ai/inference/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${FIREWORKS_API_KEY}`,
        },
        body: JSON.stringify({
          model: modelConfig.modelId,
          messages: [
            {
              role: "system",
              content:
                "You are Akii, an AI assistant that helps users with their questions.",
            },
            { role: "user", content: message },
          ],
          temperature: 0.7,
          max_tokens: 300,
        }),
      },
    );

    const result = await response.json();
    const latency = Date.now() - startTime;

    // Extract tokens used from the response
    const tokensUsed = result.usage?.total_tokens || 0;

    // Extract the AI's response content
    const aiResponseContent =
      result.choices?.[0]?.message?.content || "No response generated";

    return {
      success: true,
      modelId: modelConfig.modelId,
      tier: tier,
      latency,
      tokensUsed,
      response: aiResponseContent,
    };
  } catch (error) {
    console.error(`Error calling Fireworks AI (${modelConfig.name}):`, error);
    return {
      success: false,
      modelId: modelConfig.modelId,
      tier: tier,
      latency: Date.now() - startTime,
      tokensUsed: 0,
      response: `Error: ${(error instanceof Error ? error.message : String(error))}`,
    };
  }
}

// Function to log model response for testing/analytics
async function logModelResponse(modelResponse) {
  try {
    // Truncate response preview if too long
    const responsePreview = modelResponse.response.substring(0, 500);

    const result = await queryOne(
      `INSERT INTO test_model_responses (
        tier,
        model_id,
        latency,
        tokens_used,
        response_preview,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id`,
      [
        modelResponse.tier,
        modelResponse.modelId,
        modelResponse.latency,
        modelResponse.tokensUsed,
        responsePreview,
        new Date().toISOString()
      ]
    );

    if (result) {
      console.log(`Logged test result for ${modelResponse.tier} tier`);
    } else {
      console.error("Error inserting test result");
    }

    return result;
  } catch (error) {
    console.error("Error logging model response:", error);
    return null;
  }
}

// Main handler function
Deno.serve(async (req) => {
  return handleRequest(
    req,
    async (user, body) => {
      try {
        const { message, model = "llama-v2-7b-chat" } = body;
        if (!message) {
          return createErrorResponse("Missing required field: message", 400);
        }

        // Make the Fireworks API call
        const response = await fetch("https://api.fireworks.ai/inference/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${FIREWORKS_API_KEY}`,
          },
          body: JSON.stringify({
            model,
            messages: [{ role: "user", content: message }],
            temperature: 0.7,
            max_tokens: 1000,
          }),
        });

        if (!response.ok) {
          throw new Error(`Fireworks API request failed: ${response.statusText}`);
        }

        const data = await response.json();

        return createSuccessResponse({
          message: data.choices[0].message.content,
          model,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
          },
        });
      } catch (error) {
        console.error("Error in test_fireworks_models:", error);
        return createErrorResponse((error instanceof Error ? error.message : String(error)));
      }
    },
    {
      requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY", "FIREWORKS_API_KEY"],
      requireAuth: true,
      requireBody: true,
    }
  );
});
