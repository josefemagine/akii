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
Deno.serve((req) => __awaiter(void 0, void 0, void 0, function* () {
    return handleRequest(req, (user, body) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { prompt, model = "gpt-3.5-turbo", temperature = 0.7, max_tokens = 1000 } = body;
            if (!prompt) {
                return createErrorResponse("Missing required field: prompt", 400);
            }
            // Get user's subscription tier
            const profile = yield queryOne("SELECT subscription_tier FROM profiles WHERE id = $1", [user.id]);
            if (!profile) {
                console.error("Error fetching user profile: Profile not found");
                return createErrorResponse("Error fetching user profile", 500);
            }
            // Check if user has access to private AI
            if (!profile.subscription_tier || profile.subscription_tier === "free") {
                return createErrorResponse("Private AI completion requires a paid subscription", 403);
            }
            // Make API request to the private AI provider
            const response = yield fetch("https://api.private-ai-provider.com/v1/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${Deno.env.get("PRIVATE_AI_API_KEY")}`,
                },
                body: JSON.stringify({
                    prompt,
                    model,
                    temperature,
                    max_tokens,
                }),
            });
            if (!response.ok) {
                const error = yield response.json();
                console.error("Error from private AI provider:", error);
                return createErrorResponse("Error generating completion", response.status);
            }
            const result = yield response.json();
            // Update user's token usage
            yield execute(`INSERT INTO user_usage (user_id, tokens_used, updated_at)
           VALUES ($1, $2, $3)
           ON CONFLICT (user_id) 
           DO UPDATE SET tokens_used = user_usage.tokens_used + $2, updated_at = $3`, [user.id, result.usage.total_tokens, new Date().toISOString()]);
            return createSuccessResponse({
                text: result.choices[0].text,
                model: result.model,
                usage: {
                    prompt_tokens: result.usage.prompt_tokens,
                    completion_tokens: result.usage.completion_tokens,
                    total_tokens: result.usage.total_tokens,
                },
            });
        }
        catch (error) {
            console.error("Error in private_ai_completion:", error);
            return createErrorResponse(error instanceof Error ? error.message : "An unexpected error occurred", 500);
        }
    }), {
        requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY", "PRIVATE_AI_API_KEY"],
        requireAuth: true,
        requireBody: true,
    });
}));
