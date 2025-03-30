import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Special admin email for development purposes
const ADMIN_EMAIL = "josef@holm.com";

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      },
    );

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", message: userError?.message }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        },
      );
    }

    // Check if the current user is the admin email and update their role if needed
    if (user.email === ADMIN_EMAIL) {
      // Update the user's profile to have admin role
      const { error: updateError } = await supabaseClient
        .from("profiles")
        .update({ role: "admin" })
        .eq("id", user.id);

      if (!updateError) {
        console.log(`Set user ${ADMIN_EMAIL} as admin`);
      }
    }

    // Get the request body
    const { action, teamId, email, role } = await req.json();

    if (action === "invite") {
      if (!teamId || !email || !role) {
        return new Response(
          JSON.stringify({
            error: "Bad Request",
            message: "Missing required fields",
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          },
        );
      }

      // Check if the user is an admin of the team
      const { data: teamMember, error: teamMemberError } = await supabaseClient
        .from("team_members")
        .select("*")
        .eq("user_id", user.id)
        .eq("team_id", teamId)
        .eq("role", "admin")
        .single();

      if (teamMemberError || !teamMember) {
        return new Response(
          JSON.stringify({
            error: "Forbidden",
            message: "You must be a team admin to invite members",
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 403,
          },
        );
      }

      // Check if the email is already a member
      const { data: existingUser } =
        await supabaseClient.auth.admin.listUsers();
      const targetUser = existingUser?.users.find((u) => u.email === email);

      if (targetUser) {
        const { data: existingMember } = await supabaseClient
          .from("team_members")
          .select("*")
          .eq("team_id", teamId)
          .eq("user_id", targetUser.id)
          .maybeSingle();

        if (existingMember) {
          return new Response(
            JSON.stringify({
              error: "Conflict",
              message: "This user is already a member of the team",
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 409,
            },
          );
        }
      }

      // Check if there's already a pending invitation
      const { data: existingInvitation } = await supabaseClient
        .from("team_invitations")
        .select("*")
        .eq("team_id", teamId)
        .eq("email", email)
        .maybeSingle();

      if (existingInvitation) {
        return new Response(
          JSON.stringify({
            error: "Conflict",
            message: "An invitation has already been sent to this email",
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 409,
          },
        );
      }

      // Generate a unique token for the invitation
      const token = crypto.randomUUID();

      // Create the invitation
      const { data: invitation, error: invitationError } = await supabaseClient
        .from("team_invitations")
        .insert([
          {
            team_id: teamId,
            email,
            role,
            token,
            status: "pending",
          },
        ])
        .select()
        .single();

      if (invitationError) {
        return new Response(
          JSON.stringify({
            error: "Internal Server Error",
            message: invitationError.message,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
          },
        );
      }

      // In a real implementation, you would send an email to the invited user here
      // For now, we'll just return the invitation data

      return new Response(
        JSON.stringify({
          message: "Invitation sent successfully",
          data: invitation,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    } else if (action === "accept") {
      const { token } = await req.json();

      if (!token) {
        return new Response(
          JSON.stringify({
            error: "Bad Request",
            message: "Missing token",
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          },
        );
      }

      // Find the invitation
      const { data: invitation, error: invitationError } = await supabaseClient
        .from("team_invitations")
        .select("*")
        .eq("token", token)
        .single();

      if (invitationError || !invitation) {
        return new Response(
          JSON.stringify({
            error: "Not Found",
            message: "Invitation not found or expired",
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 404,
          },
        );
      }

      // Check if invitation is for the current user
      if (invitation.email !== user.email) {
        return new Response(
          JSON.stringify({
            error: "Forbidden",
            message: "This invitation is for a different user",
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 403,
          },
        );
      }

      // Add user to team
      const { error: memberError } = await supabaseClient
        .from("team_members")
        .insert([
          {
            team_id: invitation.team_id,
            user_id: user.id,
            role: invitation.role,
          },
        ]);

      if (memberError) {
        return new Response(
          JSON.stringify({
            error: "Internal Server Error",
            message: memberError.message,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
          },
        );
      }

      // Delete the invitation
      await supabaseClient
        .from("team_invitations")
        .delete()
        .eq("id", invitation.id);

      return new Response(
        JSON.stringify({
          message: "Successfully joined team",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    } else {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Invalid action",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
