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
            const { name } = body;
            if (!name) {
                return createErrorResponse("Missing required field: name", 400);
            }
            // Start a transaction
            yield execute("BEGIN");
            try {
                // Create the team
                const team = yield queryOne(`INSERT INTO teams (
              name,
              created_by,
              created_at,
              updated_at
            ) VALUES ($1, $2, NOW(), NOW())
            RETURNING *`, [name, user.id]);
                if (!team) {
                    throw new Error("Failed to create team");
                }
                // Add the creator as an admin member
                const teamMember = yield queryOne(`INSERT INTO team_members (
              team_id,
              user_id,
              role,
              created_at,
              updated_at
            ) VALUES ($1, $2, 'admin', NOW(), NOW())
            RETURNING *`, [team.id, user.id]);
                if (!teamMember) {
                    throw new Error("Failed to add team member");
                }
                // Commit the transaction
                yield execute("COMMIT");
                return createSuccessResponse({
                    message: "Team created successfully",
                    team,
                    teamMember,
                });
            }
            catch (error) {
                // Rollback the transaction on error
                yield execute("ROLLBACK");
                throw error;
            }
        }
        catch (error) {
            console.error("Error in create_team:", error);
            return createErrorResponse(error.message);
        }
    }), {
        requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
        requireAuth: true,
        requireBody: true,
    });
}));
