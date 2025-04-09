// This edge function updates a user's profile setup information

import { handleRequest, createSuccessResponse, createErrorResponse } from "../_shared/auth.ts";
import { query, queryOne, execute } from "../_shared/postgres.ts";

interface UpdateUserSetupRequest {
  first_name?: string;
  last_name?: string;
  company?: string;
  job_title?: string;
  preferences?: {
    theme?: string;
    notifications?: boolean;
    email_frequency?: string;
  };
}

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  job_title: string | null;
  preferences: Record<string, any> | null;
  updated_at: string;
  onboarding_completed?: boolean;
}

Deno.serve(async (req) => {
  return handleRequest(
    req,
    async (user, body: UpdateUserSetupRequest) => {
      try {
        // Check if any update fields were provided
        if (
          !body.first_name && 
          !body.last_name && 
          !body.company && 
          !body.job_title && 
          !body.preferences
        ) {
          return createErrorResponse("No fields to update", 400);
        }

        // Prepare update data
        const updateData: Record<string, any> = {
          updated_at: new Date().toISOString(),
        };

        if (body.first_name !== undefined) updateData.first_name = body.first_name;
        if (body.last_name !== undefined) updateData.last_name = body.last_name;
        if (body.company !== undefined) updateData.company = body.company;
        if (body.job_title !== undefined) updateData.job_title = body.job_title;
        
        // Handle preferences separately to merge with existing preferences
        if (body.preferences) {
          // Get current preferences
          const currentProfile = await queryOne<UserProfile>(
            "SELECT preferences FROM profiles WHERE id = $1",
            [user.id]
          );

          let updatedPreferences = { ...body.preferences };
          
          // Merge with existing preferences if they exist
          if (currentProfile?.preferences) {
            updatedPreferences = {
              ...currentProfile.preferences,
              ...body.preferences,
            };
          }
          
          updateData.preferences = updatedPreferences;
        }

        // Build the update query
        const setClauses = Object.entries(updateData)
          .map(([key, value], index) => `${key} = $${index + 2}`)
          .join(", ");

        const values = [user.id, ...Object.values(updateData)];

        // Update the profile
        const updatedProfile = await queryOne<UserProfile>(
          `UPDATE profiles 
           SET ${setClauses}
           WHERE id = $1
           RETURNING id, first_name, last_name, company, job_title, preferences, updated_at`,
          values
        );

        if (!updatedProfile) {
          return createErrorResponse("Profile not found", 404);
        }

        // Update onboarding status if needed
        if (!updateData.onboarding_completed && (body.first_name || body.last_name)) {
          await execute(
            "UPDATE profiles SET onboarding_completed = true WHERE id = $1",
            [user.id]
          );
          updatedProfile.onboarding_completed = true;
        }

        return createSuccessResponse({
          message: "Profile updated successfully",
          profile: updatedProfile
        });
      } catch (error) {
        console.error("Error in update_user_setup:", error);
        return createErrorResponse(
          error instanceof Error ? (error instanceof Error ? error.message : String(error)) : "An unexpected error occurred",
          500
        );
      }
    },
    {
      requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
      requireAuth: true,
      requireBody: true
    }
  );
}); 