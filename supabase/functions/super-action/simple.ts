// Minimal Supabase Edge Function for AWS Bedrock
import serve from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as jose from 'https://esm.sh/jose@4.14.4';

// Import AWS clients directly
import {
  BedrockClient,
  ListFoundationModelsCommand,
  ListProvisionedModelThroughputsCommand
} from "npm:@aws-sdk/client-bedrock@3.485.0";

import { BedrockRuntimeClient } from "npm:@aws-sdk/client-bedrock-runtime@3.485.0";

// Configuration object
const CONFIG = {
  // AWS Configuration
  AWS_REGION: Deno.env.get("AWS_REGION") || "us-east-1",
  AWS_ACCESS_KEY_ID: Deno.env.get("AWS_ACCESS_KEY_ID") || "",
  AWS_SECRET_ACCESS_KEY: Deno.env.get("AWS_SECRET_ACCESS_KEY") || "",
  
  // Supabase Configuration
  SUPABASE_URL: Deno.env.get("SUPABASE_URL") || "",
  SUPABASE_SERVICE_ROLE_KEY: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
  
  // CORS Headers
  CORS_HEADERS: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey, X-Client-Info",
    "Access-Control-Allow-Credentials": "true"
  }
};

// Initialize Supabase client
const supabaseClient = createClient(
  CONFIG.SUPABASE_URL,
  CONFIG.SUPABASE_SERVICE_ROLE_KEY
);

// Function to get a Bedrock client
function getBedrockClient() {
  return new BedrockClient({
    region: CONFIG.AWS_REGION,
    credentials: {
      accessKeyId: CONFIG.AWS_ACCESS_KEY_ID,
      secretAccessKey: CONFIG.AWS_SECRET_ACCESS_KEY
    }
  });
}

// Function to get a BedrockRuntime client
function getBedrockRuntimeClient() {
  return new BedrockRuntimeClient({
    region: CONFIG.AWS_REGION,
    credentials: {
      accessKeyId: CONFIG.AWS_ACCESS_KEY_ID,
      secretAccessKey: CONFIG.AWS_SECRET_ACCESS_KEY
    }
  });
}

// List provisioned model throughputs
async function listProvisionedModelThroughputs() {
  try {
    console.log(`[AWS] Listing provisioned model throughputs`);
    const client = getBedrockClient();
    const command = new ListProvisionedModelThroughputsCommand({});
    const result = await client.send(command);

    if (result.provisionedModelSummaries && result.provisionedModelSummaries.length > 0) {
      const instances = result.provisionedModelSummaries.map(model => ({
        provisionedModelArn: model.provisionedModelArn || '',
        modelId: model.modelArn || '',
        provisionedModelStatus: model.status || 'UNKNOWN',
        provisionedThroughput: {
          commitmentDuration: model.commitmentDuration || 'ONE_MONTH',
          provisionedModelThroughput: model.modelUnits || 1
        },
        creationTime: model.creationTime instanceof Date ? 
          model.creationTime.toISOString() : 
          new Date().toISOString()
      }));

      return {
        success: true,
        instances
      };
    } else {
      return {
        success: true,
        instances: [],
        note: "No provisioned models found."
      };
    }
  } catch (error) {
    console.error("[AWS] Error in listProvisionedModelThroughputs:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      instances: []
    };
  }
}

// JWT token validation
async function validateJwtToken(request: Request): Promise<{ user: any, error: string | null }> {
  // Get the Authorization header
  const authHeader = request.headers.get("authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("[API] Missing or invalid Authorization header");
    return { user: null, error: "Missing or invalid Authorization header" };
  }
  
  // Extract token
  const token = authHeader.split(" ")[1];
  
  try {
    // Verify the JWT token using Supabase
    const { data: { user }, error } = await supabaseClient.auth.getUser(token);
    
    if (error || !user) {
      console.log("[API] JWT verification failed:", error?.message);
      return { user: null, error: error?.message || "Invalid token" };
    }
    
    console.log("[API] JWT verification successful for user:", user.id);
    return { user, error: null };
  } catch (error) {
    console.error("[API] Error validating JWT:", error);
    return { user: null, error: "Error validating token" };
  }
}

// Main HTTP handler
serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      headers: CONFIG.CORS_HEADERS
    });
  }
  
  // Validate JWT token
  const { user, error } = await validateJwtToken(req);
  
  if (error) {
    return new Response(
      JSON.stringify({ error: "Unauthorized", message: error }),
      { status: 401, headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
  
  try {
    // Basic request info
    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "test";
    
    // Handle simple test action
    if (action === "test") {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "API is working",
          user: {
            id: user.id,
            email: user.email
          },
          env: {
            hasAwsCredentials: Boolean(CONFIG.AWS_ACCESS_KEY_ID && CONFIG.AWS_SECRET_ACCESS_KEY),
            region: CONFIG.AWS_REGION
          }
        }),
        { headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }
    
    // List instances
    if (action === "listInstances") {
      const result = await listProvisionedModelThroughputs();
      return new Response(
        JSON.stringify(result),
        { headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }
    
    // Default response for unknown actions
    return new Response(
      JSON.stringify({ 
        error: "Unknown action", 
        message: `Action '${action}' is not supported`,
        supportedActions: ["test", "listInstances"]
      }),
      { status: 400, headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error processing request:", err);
    return new Response(
      JSON.stringify({ 
        error: "Server error", 
        message: err instanceof Error ? err.message : String(err)
      }),
      { status: 500, headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
}); 