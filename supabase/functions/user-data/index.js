var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import serve from "https://deno.land/std@0.168.0/http/server.ts";
import { queryOne } from "../_shared/postgres.ts";
import createClient from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/dist/umd/supabase.js"; // Kept for auth
// Initialize Supabase client for auth only
const supabaseUrl = "https://injxxchotrvgvvzelhvj.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imluanh4Y2hvdHJ2Z3Z2emVsaHZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxODcxODMsImV4cCI6MjA1ODc2MzE4M30.i4oE_xcL6jo7MihdMiYXmxu2ytzopHR3Vrv19Wwob4w";
const supabase = createClient(supabaseUrl, supabaseKey);
serve((req) => __awaiter(void 0, void 0, void 0, function* () {
    // Get the current user's ID
    const { data: user, error: userError } = yield supabase.auth.getUser();
    if (userError || !user.data) {
        return new Response(JSON.stringify({
            error: "User not authenticated"
        }), {
            status: 401,
            headers: { "Content-Type": "application/json" }
        });
    }
    const userId = user.data.id;
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
            const userData = yield queryOne(sql, [userId]);
            if (!userData) {
                return new Response(JSON.stringify({
                    error: "User profile not found"
                }), {
                    status: 404,
                    headers: { "Content-Type": "application/json" }
                });
            }
            return new Response(JSON.stringify(userData), {
                status: 200,
                headers: { "Content-Type": "application/json" }
            });
        }
        catch (error) {
            console.error("Database query error:", error);
            return new Response(JSON.stringify({
                error: "Database error occurred"
            }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }
    }
    // Handle PUT request - update user profile data
    else if (req.method === "PUT") {
        try {
            // Parse the request body
            const requestData = yield req.json();
            // Only allow specific fields to be updated
            const allowedFields = ["first_name", "last_name", "company", "avatar_url"];
            // Filter out any fields that aren't allowed and build SET clause
            const updates = {};
            let setClause = "";
            const queryParams = [];
            let paramIndex = 1;
            for (const field of allowedFields) {
                if (field in requestData) {
                    updates[field] = requestData[field];
                    if (setClause)
                        setClause += ", ";
                    setClause += `${field} = $${paramIndex}`;
                    queryParams.push(requestData[field]);
                    paramIndex++;
                }
            }
            // Add updated_at timestamp
            const currentTimestamp = new Date().toISOString();
            if (setClause)
                setClause += ", ";
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
            const updatedProfile = yield queryOne(updateSql, queryParams);
            if (!updatedProfile) {
                return new Response(JSON.stringify({
                    error: "Failed to update profile"
                }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" }
                });
            }
            return new Response(JSON.stringify({
                message: "Profile updated successfully",
                profile: updatedProfile
            }), {
                status: 200,
                headers: { "Content-Type": "application/json" }
            });
        }
        catch (error) {
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
    return new Response(JSON.stringify({
        error: "Method not allowed"
    }), {
        status: 405,
        headers: { "Content-Type": "application/json" }
    });
}));
