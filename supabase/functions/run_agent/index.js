// This edge function handles interactions with AI agents
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
import { query, queryOne, execute } from "../_shared/postgres.ts";
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
// Function to call Fireworks AI API
function callFireworksAI(messages_1, systemPrompt_1) {
    return __awaiter(this, arguments, void 0, function* (messages, systemPrompt, userTier = "pro") {
        var _a, _b, _c, _d, _e;
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
            const response = yield fetch("https://api.fireworks.ai/inference/v1/chat/completions", {
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
                response: `Error: ${(error === null || error === void 0 ? void 0 : error.message) || "Unknown error"}`,
            };
        }
    });
}
// Function to create a new session
function createSession(agentId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield queryOne(`INSERT INTO agent_sessions (agent_id, user_id) 
     VALUES ($1, $2) 
     RETURNING id`, [agentId, userId]);
        if (!(result === null || result === void 0 ? void 0 : result.id)) {
            throw new Error("Failed to create session");
        }
        return result.id;
    });
}
// Function to get all messages from a session
function getSessionMessages(sessionId) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield query(`SELECT id, session_id, content, role, created_at 
     FROM agent_messages 
     WHERE session_id = $1 
     ORDER BY created_at ASC`, [sessionId]);
    });
}
// Function to save a message
function saveMessage(sessionId, content, role) {
    return __awaiter(this, void 0, void 0, function* () {
        yield execute(`INSERT INTO agent_messages (session_id, content, role) 
     VALUES ($1, $2, $3)`, [sessionId, content, role]);
    });
}
// Main handler function
Deno.serve((req) => __awaiter(void 0, void 0, void 0, function* () {
    return handleRequest(req, (user, body) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { message, agentId, sessionId } = body;
            // Validate required fields
            if (!(message === null || message === void 0 ? void 0 : message.trim())) {
                return createErrorResponse("Message is required", 400);
            }
            if (!(agentId === null || agentId === void 0 ? void 0 : agentId.trim())) {
                return createErrorResponse("Agent ID is required", 400);
            }
            // Get the agent
            const agent = yield queryOne(`SELECT id, name, system_prompt, created_by, is_public 
           FROM agents 
           WHERE id = $1`, [agentId]);
            if (!agent) {
                return createErrorResponse("Agent not found", 404);
            }
            // Check if the agent is accessible by the user
            if (!agent.is_public && agent.created_by !== user.id) {
                return createErrorResponse("You don't have access to this agent", 403);
            }
            // Get user's subscription tier
            const userTier = yield getUserTier(user.id);
            // Handle session creation or retrieval
            let currentSessionId;
            if (sessionId) {
                // Verify that the session belongs to this user and agent
                const existingSession = yield queryOne(`SELECT id FROM agent_sessions WHERE id = $1 AND user_id = $2 AND agent_id = $3`, [sessionId, user.id, agentId]);
                if (!existingSession) {
                    return createErrorResponse("Session not found or not accessible", 404);
                }
                currentSessionId = sessionId;
            }
            else {
                // Create a new session
                currentSessionId = yield createSession(agentId, user.id);
            }
            // Get previous messages in this session
            const previousMessages = yield getSessionMessages(currentSessionId);
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
            yield saveMessage(currentSessionId, message, 'user');
            // Get AI response
            const modelResponse = yield callFireworksAI(formattedMessages, agent.system_prompt, userTier);
            if (!modelResponse.success) {
                return createErrorResponse(modelResponse.response, 500);
            }
            // Save assistant response
            yield saveMessage(currentSessionId, modelResponse.response, 'assistant');
            // Track usage
            yield execute(`INSERT INTO agent_usage (
            user_id, 
            agent_id, 
            session_id, 
            tokens_used, 
            model_id,
            created_at
          ) VALUES ($1, $2, $3, $4, $5, $6)`, [
                user.id,
                agentId,
                currentSessionId,
                modelResponse.tokensUsed,
                modelResponse.modelId,
                new Date().toISOString()
            ]);
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
        }
        catch (error) {
            console.error("Unexpected error in run_agent:", error);
            return createErrorResponse("An unexpected error occurred", 500);
        }
    }), {
        requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY", "FIREWORKS_API_KEY"],
        requireAuth: true,
        requireBody: true,
    });
}));
