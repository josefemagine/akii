// This edge function tests all Fireworks AI models and logs their performance

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

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
          Authorization: `Bearer ${Deno.env.get("FIREWORKS_API_KEY") || ""}`,
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
      response: `Error: ${error.message}`,
    };
  }
}

// Function to log model response for testing/analytics
async function logModelResponse(supabaseClient, modelResponse) {
  try {
    // Truncate response preview if too long
    const responsePreview = modelResponse.response.substring(0, 500);

    const { data, error } = await supabaseClient
      .from("test_model_responses")
      .insert({
        tier: modelResponse.tier,
        model_id: modelResponse.modelId,
        latency: modelResponse.latency,
        tokens_used: modelResponse.tokensUsed,
        response_preview: responsePreview,
      })
      .select();

    if (error) {
      console.error("Error inserting test result:", error);
    } else {
      console.log(`Logged test result for ${modelResponse.tier} tier`);
    }

    return data;
  } catch (error) {
    console.error("Error logging model response:", error);
    return null;
  }
}

// Main handler function
Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_KEY") ?? "",
    );

    // Test prompt
    const testPrompt = "Hi Akii, can you summarize what your capabilities are?";

    // Test all models
    const tiers = ["basic", "pro", "scale", "enterprise"];
    const results = [];

    for (const tier of tiers) {
      // Call Fireworks AI API
      const modelResponse = await callFireworksAI(testPrompt, tier);

      // Log the model response
      await logModelResponse(supabaseClient, modelResponse);

      // Add to results
      results.push({
        tier: tier,
        modelId: modelResponse.modelId,
        modelName: FIREWORKS_MODELS[tier].name,
        latency: modelResponse.latency,
        tokensUsed: modelResponse.tokensUsed,
        responsePreview: modelResponse.response.substring(0, 100) + "...",
      });
    }

    // Return the results
    return new Response(
      JSON.stringify({
        success: true,
        message: "All Fireworks AI models tested successfully",
        results: results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error testing Fireworks AI models:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  }
});
