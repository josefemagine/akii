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
    return handleRequest(req, (_user, body) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { user_id, email, role = "user", status = "active" } = body;
            if (!user_id) {
                return createErrorResponse("Missing required parameter: user_id", 400);
            }
            // Check if profile exists
            const existingProfile = yield queryOne("SELECT * FROM profiles WHERE id = $1", [user_id]);
            let profile;
            if (existingProfile) {
                // Update existing profile
                profile = yield queryOne(`UPDATE profiles
            SET
              email = $1,
              role = $2,
              status = $3,
              updated_at = $4
            WHERE id = $5
            RETURNING *`, [
                    email || existingProfile.email,
                    role || existingProfile.role,
                    status || existingProfile.status,
                    new Date().toISOString(),
                    user_id
                ]);
                if (!profile) {
                    throw new Error("Failed to update profile");
                }
            }
            else {
                // Create new profile
                profile = yield queryOne(`INSERT INTO profiles (
              id, 
              email, 
              first_name, 
              last_name, 
              role, 
              status, 
              created_at, 
              updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *`, [
                    user_id,
                    email || "",
                    email ? email.split("@")[0] : "",
                    "",
                    role || "user",
                    status || "active",
                    new Date().toISOString(),
                    new Date().toISOString()
                ]);
                if (!profile) {
                    throw new Error("Failed to create profile");
                }
            }
            return createSuccessResponse({ profile });
        }
        catch (error) {
            console.error("Error in ensure_profile_exists:", error);
            return createErrorResponse(error instanceof Error ? error.message : "An unexpected error occurred", 500);
        }
    }), {
        requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
        requireAuth: false,
        requireBody: true,
    });
}));
