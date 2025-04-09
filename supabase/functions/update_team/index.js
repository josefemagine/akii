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
            const { teamId, name, description, isActive } = body;
            if (!teamId) {
                return createErrorResponse("Missing required field: teamId", 400);
            }
            // Check if team exists and user has permission
            const team = yield queryOne("SELECT id, owner_id FROM teams WHERE id = $1", [teamId]);
            if (!team) {
                return createErrorResponse("Team not found", 404);
            }
            // Check if user is the owner or has admin role
            const isTeamAdmin = yield queryOne("SELECT role FROM team_members WHERE team_id = $1 AND user_id = $2 AND role = 'admin'", [teamId, user.id]);
            if (team.owner_id !== user.id && !isTeamAdmin && user.role !== "admin") {
                return createErrorResponse("Unauthorized to update this team", 403);
            }
            // Prepare update data
            const updateData = {
                updated_at: new Date().toISOString(),
            };
            if (name !== undefined)
                updateData.name = name;
            if (description !== undefined)
                updateData.description = description;
            if (isActive !== undefined)
                updateData.is_active = isActive;
            // Build the update query
            const setClauses = Object.entries(updateData)
                .map(([key, value], index) => `${key} = $${index + 2}`)
                .join(", ");
            const values = [teamId, ...Object.values(updateData)];
            // Update the team
            const updatedTeam = yield queryOne(`UPDATE teams 
           SET ${setClauses}
           WHERE id = $1
           RETURNING *`, values);
            return createSuccessResponse({
                message: "Team updated successfully",
                team: updatedTeam,
            });
        }
        catch (error) {
            console.error("Unexpected error in update_team:", error);
            return createErrorResponse("An unexpected error occurred", 500);
        }
    }), {
        requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
        requireAuth: true,
        requireBody: true,
    });
}));
