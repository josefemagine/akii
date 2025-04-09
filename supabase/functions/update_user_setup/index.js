// This edge function updates a user's profile setup information
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
            // Check if any update fields were provided
            if (!body.first_name &&
                !body.last_name &&
                !body.company &&
                !body.job_title &&
                !body.preferences) {
                return createErrorResponse("No fields to update", 400);
            }
            // Prepare update data
            const updateData = {
                updated_at: new Date().toISOString(),
            };
            if (body.first_name !== undefined)
                updateData.first_name = body.first_name;
            if (body.last_name !== undefined)
                updateData.last_name = body.last_name;
            if (body.company !== undefined)
                updateData.company = body.company;
            if (body.job_title !== undefined)
                updateData.job_title = body.job_title;
            // Handle preferences separately to merge with existing preferences
            if (body.preferences) {
                // Get current preferences
                const currentProfile = yield queryOne("SELECT preferences FROM profiles WHERE id = $1", [user.id]);
                let updatedPreferences = Object.assign({}, body.preferences);
                // Merge with existing preferences if they exist
                if (currentProfile === null || currentProfile === void 0 ? void 0 : currentProfile.preferences) {
                    updatedPreferences = Object.assign(Object.assign({}, currentProfile.preferences), body.preferences);
                }
                updateData.preferences = updatedPreferences;
            }
            // Build the update query
            const setClauses = Object.entries(updateData)
                .map(([key, value], index) => `${key} = $${index + 2}`)
                .join(", ");
            const values = [user.id, ...Object.values(updateData)];
            // Update the profile
            const updatedProfile = yield queryOne(`UPDATE profiles 
           SET ${setClauses}
           WHERE id = $1
           RETURNING id, first_name, last_name, company, job_title, preferences, updated_at`, values);
            if (!updatedProfile) {
                return createErrorResponse("Profile not found", 404);
            }
            // Update onboarding status if needed
            if (!updateData.onboarding_completed && (body.first_name || body.last_name)) {
                yield execute("UPDATE profiles SET onboarding_completed = true WHERE id = $1", [user.id]);
                updatedProfile.onboarding_completed = true;
            }
            return createSuccessResponse({
                message: "Profile updated successfully",
                profile: updatedProfile
            });
        }
        catch (error) {
            console.error("Error in update_user_setup:", error);
            return createErrorResponse(error instanceof Error ? error.message : "An unexpected error occurred", 500);
        }
    }), {
        requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
        requireAuth: true,
        requireBody: true
    });
}));
