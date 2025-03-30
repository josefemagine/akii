// This edge function handles chat interactions with AI agents

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
async function callFireworksAI(message, userTier = "pro") {
  const startTime = Date.now();
  const modelConfig =
    FIREWORKS_MODELS[userTier.toLowerCase()] || FIREWORKS_MODELS.pro;

  try {
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
      tier: userTier,
      latency,
      tokensUsed,
      response: aiResponseContent,
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

// Function to determine user's subscription tier
async function getUserTier(supabaseClient, userId) {
  if (!userId) return "pro"; // Default to Pro tier if no user ID

  try {
    const { data, error } = await supabaseClient
      .from("profiles")
      .select("subscription->plan")
      .eq("id", userId)
      .single();

    if (error || !data) {
      console.warn("Could not determine user tier, defaulting to Pro:", error);
      return "pro";
    }

    // Map subscription plan to tier
    const plan = data.subscription?.plan?.toLowerCase() || "free";

    if (plan === "free" || plan === "basic") return "basic";
    if (plan === "pro") return "pro";
    if (plan === "scale") return "scale";
    if (plan === "enterprise") return "enterprise";

    return "pro"; // Default fallback
  } catch (err) {
    console.error("Error determining user tier:", err);
    return "pro"; // Default fallback on error
  }
}

// Function to log model response for testing/analytics
async function logModelResponse(supabaseClient, modelResponse) {
  try {
    // Truncate response preview if too long
    const responsePreview = modelResponse.response.substring(0, 500);

    await supabaseClient.from("test_model_responses").insert({
      tier: modelResponse.tier,
      model_id: modelResponse.modelId,
      latency: modelResponse.latency,
      tokens_used: modelResponse.tokensUsed,
      response_preview: responsePreview,
    });
  } catch (error) {
    console.error("Error logging model response:", error);
  }
}

// Main handler function
Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get the request body
    const {
      agentId,
      message,
      conversationId,
      platform = "web",
      externalUserId = null,
      userId = null, // Added userId parameter to determine subscription tier
    } = await req.json();

    if (!agentId || !message) {
      throw new Error(
        "Missing required parameters: agentId and message are required",
      );
    }

    // Create a Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_KEY") ?? "",
    );

    // Get the agent from the database
    const { data: agent, error: agentError } = await supabaseClient
      .from("agents")
      .select("*")
      .eq("id", agentId)
      .single();

    if (agentError || !agent) {
      throw new Error(
        `Error fetching agent: ${agentError?.message || "Agent not found"}`,
      );
    }

    // Check if agent is active
    if (!agent.is_active) {
      throw new Error("This agent is currently inactive");
    }

    // Get or create conversation
    let conversation;
    if (conversationId) {
      // Get existing conversation
      const { data, error } = await supabaseClient
        .from("conversations")
        .select("*")
        .eq("id", conversationId)
        .single();

      if (error || !data) {
        throw new Error(
          `Error fetching conversation: ${error?.message || "Conversation not found"}`,
        );
      }
      conversation = data;

      // Check if conversation is active
      if (!conversation.is_active) {
        throw new Error("This conversation is no longer active");
      }
    } else {
      // Create new conversation
      const { data, error } = await supabaseClient
        .from("conversations")
        .insert({
          agent_id: agentId,
          platform,
          external_user_id: externalUserId,
          is_active: true,
        })
        .select()
        .single();

      if (error || !data) {
        throw new Error(`Error creating conversation: ${error?.message}`);
      }
      conversation = data;
    }

    // Store user message
    await supabaseClient.from("messages").insert({
      conversation_id: conversation.id,
      sender_type: "user",
      content: message,
    });

    // Determine user's subscription tier
    const userTier = await getUserTier(supabaseClient, userId);

    // Call Fireworks AI API with the user's message
    const modelResponse = await callFireworksAI(message, userTier);

    // Log the model response for testing/analytics
    await logModelResponse(supabaseClient, modelResponse);

    // Use the AI-generated response
    const aiResponse = modelResponse.success
      ? modelResponse.response
      : `Sorry, I'm having trouble connecting to my AI services. Please try again later.`;

    // Store AI response
    await supabaseClient.from("messages").insert({
      conversation_id: conversation.id,
      sender_type: "agent",
      content: aiResponse,
    });

    // Update user's message usage count if userId is provided
    if (userId) {
      try {
        // Call the update_user_usage function
        const updateResponse = await fetch(
          `${Deno.env.get("SUPABASE_URL")}/functions/v1/update_user_usage`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_KEY") || ""}`,
            },
            body: JSON.stringify({
              userId,
              tokensUsed: modelResponse.tokensUsed,
            }),
          },
        );

        const usageData = await updateResponse.json();
        console.log("Updated user usage:", usageData);
      } catch (usageError) {
        console.error("Error updating user usage:", usageError);
        // Continue execution even if usage update fails
      }
    }

    // Return the response to the client
    return new Response(
      JSON.stringify({
        success: true,
        conversationId: conversation.id,
        response: aiResponse,
        modelInfo: {
          modelId: modelResponse.modelId,
          tier: userTier,
          latency: modelResponse.latency,
          tokensUsed: modelResponse.tokensUsed,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error in chat with agent:", error);
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
