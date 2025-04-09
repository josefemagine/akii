import { handleRequest, createSuccessResponse, createErrorResponse } from "../_shared/auth.ts";
import { query, queryOne, execute } from "../_shared/postgres.ts";

interface EnsureProfileRequest {
  user_id: string;
  email?: string;
  role?: string;
  status?: string;
}

interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
}

Deno.serve(async (req) => {
  return handleRequest(
    req,
    async (_user, body: EnsureProfileRequest) => {
      try {
        const { user_id, email, role = "user", status = "active" } = body;

        if (!user_id) {
          return createErrorResponse("Missing required parameter: user_id", 400);
        }

        // Check if profile exists
        const existingProfile = await queryOne<Profile>(
          "SELECT * FROM profiles WHERE id = $1", 
          [user_id]
        );

        let profile: Profile;

        if (existingProfile) {
          // Update existing profile
          profile = await queryOne<Profile>(
            `UPDATE profiles
            SET
              email = $1,
              role = $2,
              status = $3,
              updated_at = $4
            WHERE id = $5
            RETURNING *`,
            [
              email || existingProfile.email,
              role || existingProfile.role,
              status || existingProfile.status,
              new Date().toISOString(),
              user_id
            ]
          );

          if (!profile) {
            throw new Error("Failed to update profile");
          }
        } else {
          // Create new profile
          profile = await queryOne<Profile>(
            `INSERT INTO profiles (
              id, 
              email, 
              first_name, 
              last_name, 
              role, 
              status, 
              created_at, 
              updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *`,
            [
              user_id,
              email || "",
              email ? email.split("@")[0] : "",
              "",
              role || "user",
              status || "active",
              new Date().toISOString(),
              new Date().toISOString()
            ]
          );

          if (!profile) {
            throw new Error("Failed to create profile");
          }
        }

        return createSuccessResponse({ profile });

      } catch (error) {
        console.error("Error in ensure_profile_exists:", error);
        return createErrorResponse(
          error instanceof Error ? error.message : "An unexpected error occurred",
          500
        );
      }
    },
    {
      requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
      requireAuth: false,
      requireBody: true,
    }
  );
}); 