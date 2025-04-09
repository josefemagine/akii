// Set CORS headers
const adminCheckCorsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

// Simple response helpers
const adminCheckCreateSuccessResponse = (data: any) => {
  return new Response(
    JSON.stringify(data),
    { 
      status: 200,
      headers: { ...adminCheckCorsHeaders, "Content-Type": "application/json" }
    }
  );
};

const adminCheckCreateErrorResponse = (message: string, status = 400) => {
  return new Response(
    JSON.stringify({ error: message }),
    { 
      status,
      headers: { ...adminCheckCorsHeaders, "Content-Type": "application/json" }
    }
  );
};

// Main handler function
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: adminCheckCorsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return adminCheckCreateErrorResponse("Authorization header required", 401);
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      return adminCheckCreateErrorResponse("Missing environment variables", 500);
    }

    // Create Supabase client using dynamic import to avoid TypeScript errors
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.21.0");
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get token from Authorization header
    const token = authHeader.replace("Bearer ", "");
    
    // Get user from token
    const { data, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !data.user) {
      return adminCheckCreateErrorResponse("User not authenticated", 401);
    }

    const userId = data.user.id;
    console.log("Running admin check for user:", userId);
    
    // Build response object with all data
    const responseData: Record<string, any> = {
      user_id: userId,
      timestamp: new Date().toISOString(),
      environment: Deno.env.get("ENVIRONMENT") || "unknown",
      tables: {},
      raw_jwt: {},
    };
    
    // Check profiles table
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    
    responseData.tables.profiles = {
      exists: !profileError,
      error: profileError ? profileError.message : null,
      data: profileData || null,
    };
    
    // Check users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();
    
    responseData.tables.users = {
      exists: !userError,
      error: userError ? userError.message : null,
      data: userData || null,
    };
    
    // Check JWT claims/metadata
    try {
      const { data: jwtData } = await supabase.rpc('get_claims', { uid: userId });
      responseData.raw_jwt = jwtData || {};
    } catch (e) {
      responseData.raw_jwt = { error: e instanceof Error ? e.message : String(e) };
    }
    
    // Add admin status from localStorage (client-side check)
    responseData.client_checks = {
      localStorage_admin: true, // This will be filled in by the frontend
    };
    
    // Return all the collected data
    return adminCheckCreateSuccessResponse(responseData);
  } catch (error) {
    console.error("Error checking admin status:", error);
    return adminCheckCreateErrorResponse(
      error instanceof Error ? (error instanceof Error ? error.message : String(error)) : "Failed to check admin status",
      500
    );
  }
}); 