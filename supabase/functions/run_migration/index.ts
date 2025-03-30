import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get the request body
    const { sql, projectId } = await req.json();

    if (!sql) {
      return new Response(JSON.stringify({ error: "SQL query is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Get environment variables with fallbacks
    const supabaseProjectId =
      projectId ||
      Deno.env.get("SUPABASE_PROJECT_ID") ||
      "injxxchotrvgvvzelhvj";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_KEY");
    const supabaseUrl =
      Deno.env.get("SUPABASE_URL") ||
      `https://${supabaseProjectId}.supabase.co`;

    // Log what we're using (without exposing the full service key)
    console.log(`Using Supabase URL: ${supabaseUrl}`);
    console.log(`Using Project ID: ${supabaseProjectId}`);
    console.log(`Service Key available: ${!!supabaseServiceKey}`);

    if (!supabaseServiceKey) {
      return new Response(
        JSON.stringify({
          error: "SUPABASE_SERVICE_KEY environment variable is required",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        },
      );
    }

    // Create a Supabase client with the Auth context of the logged in user
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Execute the SQL query
    const { data, error } = await supabaseAdmin.rpc("pgexecute", {
      query: sql,
    });

    if (error) {
      console.error("Error executing SQL:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
