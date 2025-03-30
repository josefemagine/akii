// This function checks if the Supabase credentials are properly configured

Deno.serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    // Check if environment variables are available
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_KEY");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseProjectId =
      Deno.env.get("SUPABASE_PROJECT_ID") || "injxxchotrvgvvzelhvj";

    // Log available environment variables for debugging
    console.log("Environment variables check:", {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseKey,
      hasAnonKey: !!supabaseAnonKey,
      hasProjectId: !!supabaseProjectId,
    });

    // Get project ID from URL if available
    let projectId = supabaseProjectId;
    if (!projectId && supabaseUrl) {
      try {
        const urlObj = new URL(supabaseUrl);
        projectId = urlObj.hostname.split(".")[0];
        console.log("Extracted project ID from URL:", projectId);
      } catch (e) {
        console.error("Failed to extract project ID from URL:", e);
      }
    }

    // Use the URL from environment or construct it from project ID
    let url = supabaseUrl;
    if (!url && projectId) {
      url = `https://${projectId}.supabase.co`;
      console.log("Constructed URL from project ID:", url);
    }

    // Use the key from environment
    const key = supabaseKey || "";

    // Try to make a simple test query to verify credentials work
    let testResponse;
    let testStatus;
    let testConnectionWorking = false;

    if (url && key) {
      try {
        console.log(
          "Testing connection to:",
          `${url}/rest/v1/profiles?limit=1`,
        );
        testResponse = await fetch(`${url}/rest/v1/profiles?limit=1`, {
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
        });

        testStatus = testResponse.status;
        testConnectionWorking = testStatus >= 200 && testStatus < 300;
        console.log("Connection test result:", {
          status: testStatus,
          working: testConnectionWorking,
        });
      } catch (fetchError) {
        console.error("Fetch error:", fetchError);
        testStatus = 500;
        testConnectionWorking = false;
      }
    } else {
      console.warn("Skipping connection test due to missing URL or key");
    }

    const data = {
      status: "success",
      message: "Supabase credentials check completed",
      credentials: {
        url: supabaseUrl ? "Available" : "Missing",
        serviceKey: supabaseKey ? "Available" : "Missing",
        anonKey: supabaseAnonKey ? "Available" : "Missing",
        projectId: supabaseProjectId ? "Available" : "Missing",
        constructedUrl: url,
        extractedProjectId: projectId,
      },
      connectionTest: {
        status: testStatus || 0,
        working: testConnectionWorking,
        error: !testConnectionWorking ? "Connection test failed" : null,
      },
    };

    return new Response(JSON.stringify(data), {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      status: 200,
    });
  } catch (error) {
    console.error("Error in check_credentials:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        status: "error",
        credentials: {
          url: Deno.env.get("SUPABASE_URL") ? "Available" : "Missing",
          serviceKey: Deno.env.get("SUPABASE_SERVICE_KEY")
            ? "Available"
            : "Missing",
          anonKey: Deno.env.get("SUPABASE_ANON_KEY") ? "Available" : "Missing",
          projectId: Deno.env.get("SUPABASE_PROJECT_ID")
            ? "Available"
            : "Missing",
        },
      }),
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        status: 400,
      },
    );
  }
});
