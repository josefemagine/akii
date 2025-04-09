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
import { queryOne } from "../_shared/postgres.ts";
Deno.serve((req) => __awaiter(void 0, void 0, void 0, function* () {
    return handleRequest(req, (user, body) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { action, params } = body;
            if (!action) {
                return createErrorResponse("Action is required", 400);
            }
            // Log the action for audit purposes
            console.log(`Super action executed by user ${user.id}: ${action}`);
            // Handle different actions
            switch (action) {
                case "test_connection":
                    return createSuccessResponse({
                        result: "Connection successful",
                        timestamp: new Date().toISOString(),
                    });
                case "get_user_info":
                    const userData = yield queryOne("SELECT * FROM profiles WHERE id = $1", [user.id]);
                    if (!userData) {
                        throw new Error("User profile not found");
                    }
                    return createSuccessResponse({
                        result: userData,
                        timestamp: new Date().toISOString(),
                    });
                default:
                    return createErrorResponse(`Unknown action: ${action}`, 400);
            }
        }
        catch (error) {
            console.error("Error in super_action:", error);
            return createErrorResponse(error instanceof Error ? error.message : "An unexpected error occurred", 500);
        }
    }), {
        requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
        requireAuth: true,
        requireBody: true,
    });
}));
