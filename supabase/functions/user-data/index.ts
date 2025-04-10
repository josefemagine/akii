import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { queryOne } from "../_shared/postgres.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Fetch Supabase URL and anon key from environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);
serve(async (req: Request) => {
  console.log("[API] user-data edge function running");
  // Log headers
  const headers = {};
  for (const [key, value] of req.headers.entries()) {
    headers[key] = value;
  }
  console.log("[API] Request headers:", headers);
  
  // Log before getting the user
  console.log("[API] Attempting to get user data");
  // Get the current user's ID
  const { data: user, error: userError } = await supabase.auth.getUser()
  .catch((err) => {
      console.error("[API] Error getting user:", err);
      return {data: {user: null}, error: err};
  });
  if (userError || !user.user) {
    console.log("[API] User not authenticated or error getting user:", userError);
    return new Response(JSON.stringify({
        error: "User not authenticated",
        details: userError?.message,
        headers: headers
    }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  
  const userId: string = user.user.id;  
  console.log("[API] User ID retrieved:", userId);
  
  // Handle GET request - fetch user profile data
  if (req.method === "GET") {    
     try {
      // Use direct database query to fetch user profile with is_super_admin status
      const sql = `
        SELECT 
          p.id, 
          p.email, 
          p.first_name, 
          p.last_name, 
          p.company, 
          p.avatar_url,
          p.role,
          p.status,
          p.created_at,
          p.updated_at,
          u.is_super_admin
        FROM 
          public.profiles p
        JOIN 
          auth.users u ON p.id = u.id
        WHERE 
          p.id = $1
      `;
      
      console.log("[API] Executing database query for user profile");
      const userData = await queryOne(sql, [userId]);
      console.log("[API] Database query completed");
      
      if (!userData) {
        console.log("[API] User profile not found for user ID:", userId);
        return new Response(JSON.stringify({
          error: "User profile not found"
        }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }      
      console.log("[API] Returning user profile:", userData);
      return new Response(JSON.stringify(userData), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("[API] Error during database operations:", error);
      console.error("Database query error:", error);
      return new Response(JSON.stringify({
        error: "Database error occurred",
        details: error.message,
        stack: error.stack
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  } 
  // Handle PUT request - update user profile data
  else if (req.method === "PUT") {
    try {
      // Parse the request body
      const requestData = await req.json();
      
      // Only allow specific fields to be updated
      const allowedFields = ["first_name", "last_name", "company", "avatar_url"];
      
      // Filter out any fields that aren't allowed and build SET clause
      const updates: Record<string, any> = {};
      let setClause = "";
      const queryParams = [];
      let paramIndex = 1;
      
      for (const field of allowedFields) {
        if (field in requestData) {
          updates[field] = requestData[field];
          if (setClause) setClause += ", ";
          setClause += `${field} = $${paramIndex}`;
          queryParams.push(requestData[field]);
          paramIndex++;
        }
      }
      
      // Add updated_at timestamp to the profile table
      const currentTimestamp = new Date().toISOString();
      if (setClause) setClause += ", ";
      setClause += `updated_at = $${paramIndex}`;
      queryParams.push(currentTimestamp);
      paramIndex++;
      
      // Add user ID as the last parameter
      queryParams.push(userId);
      
      // Execute the update query
      const updateSql = `
        UPDATE 
          public.profiles
        SET 
          ${setClause}
        WHERE 
          id = $${paramIndex}
        RETURNING *
      `;
      
      console.log("[API] Executing database update for user profile");
      const updatedProfile = await queryOne(updateSql, queryParams);
      console.log("[API] Database update completed");
      
      if (!updatedProfile) {        
        return new Response(JSON.stringify({
          error: "Failed to update profile"
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      console.log("[API] Returning updated user profile:", updatedProfile);
      return new Response(JSON.stringify({
        message: "Profile updated successfully",
        profile: updatedProfile
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }).catch((err)=>{
        console.error("[API] Error returning response", err);
        return null;
      });
    } catch (error) {
      console.error("Database update error:", error);
      return new Response(JSON.stringify({
        error: "Failed to update profile"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
  
  // Handle any other HTTP methods
  console.log("[API] Method not allowed");
  return new Response(JSON.stringify({
    error: "Method not allowed"
  }), {
    status: 405,
    headers: { "Content-Type": "application/json" }
  });
});

