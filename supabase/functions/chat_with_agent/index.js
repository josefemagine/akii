// This edge function handles chat interactions with AI agents
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { handleRequest, createSuccessResponse, createErrorResponse } from "../_shared/auth.ts";
import { queryOne, execute } from "../_shared/postgres.ts";
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
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
// Function to call Fireworks AI API
function callFireworksAI(message_1) {
    return __awaiter(this, arguments, void 0, function* (message, userTier = "pro") {
        var _a, _b, _c, _d, _e;
        const startTime = Date.now();
        const modelConfig = FIREWORKS_MODELS[userTier];
        try {
            const response = yield fetch("https://api.fireworks.ai/inference/v1/chat/completions", {
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
            });
            if (!response.ok) {
                const error = yield response.json().catch(() => ({ error: { message: response.statusText } }));
                throw new Error(`Fireworks API error: ${((_a = error.error) === null || _a === void 0 ? void 0 : _a.message) || response.statusText}`);
            }
            const result = yield response.json();
            const latency = Date.now() - startTime;
            return {
                success: true,
                modelId: modelConfig.modelId,
                tier: userTier,
                latency,
                tokensUsed: ((_b = result.usage) === null || _b === void 0 ? void 0 : _b.total_tokens) || 0,
                response: ((_e = (_d = (_c = result.choices) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.message) === null || _e === void 0 ? void 0 : _e.content) || "No response generated",
            };
        }
        catch (error) {
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
    });
}
// Function to determine user's subscription tier
function getUserTier(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (!userId)
            return "pro";
        try {
            const profile = yield queryOne("SELECT subscription FROM profiles WHERE id = $1", [userId]);
            if (!profile) {
                console.warn("Could not determine user tier, defaulting to Pro");
                return "pro";
            }
            const plan = (((_a = profile.subscription) === null || _a === void 0 ? void 0 : _a.plan) || "free").toLowerCase();
            if (plan === "free" || plan === "basic")
                return "basic";
            if (plan === "pro")
                return "pro";
            if (plan === "scale")
                return "scale";
            if (plan === "enterprise")
                return "enterprise";
            return "pro";
        }
        catch (err) {
            console.error("Error determining user tier:", err);
            return "pro";
        }
    });
}
// Function to log model response for testing/analytics
function logModelResponse(modelResponse) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const responsePreview = modelResponse.response.substring(0, 500);
            yield execute(`INSERT INTO test_model_responses (
        tier, 
        model_id, 
        latency, 
        tokens_used, 
        response_preview, 
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6)`, [
                modelResponse.tier,
                modelResponse.modelId,
                modelResponse.latency,
                modelResponse.tokensUsed,
                responsePreview,
                new Date().toISOString()
            ]);
        }
        catch (error) {
            console.error("Error logging model response:", error);
        }
    });
}
// Main handler function
Deno.serve((req) => __awaiter(void 0, void 0, void 0, function* () {
    return handleRequest(req, (user, body) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { message, agentId } = body;
            // Validate required fields
            if (!(message === null || message === void 0 ? void 0 : message.trim())) {
                return createErrorResponse("Message is required", 400);
            }
            if (!(agentId === null || agentId === void 0 ? void 0 : agentId.trim())) {
                return createErrorResponse("Agent ID is required", 400);
            }
            // Get user's subscription tier
            const userTier = yield getUserTier(user.id);
            // Call Fireworks AI
            const modelResponse = yield callFireworksAI(message, userTier);
            // Log the response for analytics
            yield logModelResponse(modelResponse);
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
        }
        catch (error) {
            console.error("Unexpected error in chat_with_agent:", error);
            return createErrorResponse("An unexpected error occurred", 500);
        }
    }), {
        requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY", "FIREWORKS_API_KEY"],
        requireAuth: true,
        requireBody: true,
    });
}));
