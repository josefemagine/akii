// Minimal Edge Function
import serve from "https://deno.land/std@0.168.0/http/server.ts";

// Import AWS SDK
import { 
  BedrockClient, 
  ListFoundationModelsCommand
} from "npm:@aws-sdk/client-bedrock@3.462.0";

// CORS headers
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "https://www.akii.com",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey, X-Client-Info",
  "Access-Control-Allow-Credentials": "true",
  "Content-Type": "application/json"
};

// Main handler function
serve(async (req) => {
  // Always add CORS headers to all responses
  const responseInit = {
    headers: CORS_HEADERS
  };

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("[CORS] Handling OPTIONS preflight request");
    return new Response(null, { 
      status: 204,
      headers: CORS_HEADERS
    });
  }
  
  try {
    // Get AWS configuration from environment
    const region = Deno.env.get("AWS_REGION") || "us-east-1";
    const accessKeyId = Deno.env.get("AWS_ACCESS_KEY_ID") || "";
    const secretAccessKey = Deno.env.get("AWS_SECRET_ACCESS_KEY") || "";
    
    // Create AWS client
    const client = new BedrockClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    });
    
    // List models as a test
    const command = new ListFoundationModelsCommand({});
    const result = await client.send(command);
    
    // Return the response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "AWS connection successful", 
        models: result.modelSummaries?.length || 0,
        region
      }),
      { headers: CORS_HEADERS, status: 200 }
    );
  } catch (error) {
    console.error("[ERROR]", error);
    // Handle errors
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      }),
      { 
        status: 500, 
        headers: CORS_HEADERS
      }
    );
  }
});
