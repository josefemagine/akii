// Add type declarations for Deno at the top of the file
// deno-lint-ignore-file no-explicit-any
// @ts-ignore - Deno types
/// <reference lib="deno.ns" />

// Supabase Edge Function for AWS Bedrock operations
// @ts-ignore - Deno-specific import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleRequest, createSuccessResponse, createErrorResponse } from "../_shared/auth.ts";
import { query, queryOne, execute } from "../_shared/postgres.ts";

// CORS headers for all responses
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Environment setup
// @ts-ignore - Deno global
const AWS_ACCESS_KEY_ID = Deno.env.get("AWS_ACCESS_KEY_ID") || "";
// @ts-ignore - Deno global
const AWS_SECRET_ACCESS_KEY = Deno.env.get("AWS_SECRET_ACCESS_KEY") || "";
// @ts-ignore - Deno global
const AWS_REGION = Deno.env.get("AWS_REGION") || "us-east-1";

interface BedrockInstance {
  instance_id: string;
  model_id: string;
  commitment_duration: string;
  model_units: number;
  status: string;
  created_at: string;
  user_id: string;
}

interface CreateInstanceRequest {
  modelId: string;
  commitmentDuration: string;
  modelUnits: number;
}

// Handle diagnostics endpoint
async function handleTestEnv(user: any): Promise<Response> {
  try {
    return createSuccessResponse({
      environment: {
        // @ts-ignore - Deno global
        isProduction: Deno.env.get("DENO_ENV") !== "development",
        aws: {
          region: AWS_REGION,
          hasAccessKey: Boolean(AWS_ACCESS_KEY_ID),
          hasSecretKey: Boolean(AWS_SECRET_ACCESS_KEY),
          accessKeyFormat: AWS_ACCESS_KEY_ID ? (AWS_ACCESS_KEY_ID.startsWith("AKIA") ? "valid" : "invalid") : "missing",
        },
        // @ts-ignore - Deno global
        platform: Deno.build.os,
        supabase: {
          hasUrl: Boolean(Deno.env.get("SUPABASE_URL")),
          hasServiceKey: Boolean(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")),
        },
        user: {
          id: user.id,
          email: user.email
        }
      }
    });
  } catch (error) {
    console.error("Error handling test environment request:", error);
    return createErrorResponse(error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error));
  }
}

// Get all Bedrock model throughput instances
async function handleGetInstances(user: any): Promise<Response> {
  try {
    const instances = await query<BedrockInstance>(
      'SELECT * FROM bedrock_instances WHERE user_id = $1',
      [user.id]
    );

    return createSuccessResponse({ instances: instances || [] });
  } catch (error) {
    console.error("Error getting instances:", error);
    return createErrorResponse(error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error));
  }
}

// Create a mock Bedrock model throughput instance
async function handleCreateInstance(user: any, requestData: CreateInstanceRequest): Promise<Response> {
  try {
    const { modelId, commitmentDuration, modelUnits } = requestData;

    if (!modelId || !commitmentDuration || !modelUnits) {
      return createErrorResponse("Missing required fields", 400);
    }

    // Create a mock instance ID
    const mockInstanceId = `arn:aws:bedrock:${AWS_REGION}:123456789012:provisioned-model/${modelId.split('/').pop()}-${Date.now()}`;
    
    // Store mock data in database with user_id
    const instance = await queryOne<BedrockInstance>(
      `INSERT INTO bedrock_instances (
        instance_id,
        model_id,
        commitment_duration,
        model_units,
        status,
        created_at,
        user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        mockInstanceId,
        modelId,
        commitmentDuration,
        modelUnits,
        'CREATING',
        new Date().toISOString(),
        user.id
      ]
    );

    if (!instance) {
      throw new Error("Failed to create instance");
    }

    return createSuccessResponse({ 
      instance,
      info: "Created instance in database"
    });
  } catch (error) {
    console.error("Error creating instance:", error);
    return createErrorResponse(error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error));
  }
}

// Delete a Bedrock model throughput instance
async function handleDeleteInstance(user: any, instanceId: string): Promise<Response> {
  try {
    // Delete the instance from database
    const result = await execute(
      'DELETE FROM bedrock_instances WHERE instance_id = $1 AND user_id = $2',
      [instanceId, user.id]
    );

    // Check if any rows were affected
    if (!result || result.rowCount === 0) {
      return createErrorResponse("Instance not found or you don't have permission to delete it", 404);
    }

    return createSuccessResponse({ 
      message: "Instance deleted successfully",
      instanceId
    });
  } catch (error) {
    console.error("Error deleting instance:", error);
    return createErrorResponse(error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error));
  }
}

// Handle OPTIONS requests for CORS
function handleOptionsRequest(request: Request): Response {
  return new Response(null, { 
    headers: CORS_HEADERS
  });
}

// Main request handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  return handleRequest(req, async (user) => {
    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();

    switch (req.method) {
      case "GET":
        if (path === "test") {
          return handleTestEnv(user);
        }
        return handleGetInstances(user);

      case "POST":
        if (!path) {
          const requestData = await req.json() as CreateInstanceRequest;
          return handleCreateInstance(user, requestData);
        }
        return createErrorResponse("Invalid endpoint", 404);

      case "DELETE":
        if (path) {
          return handleDeleteInstance(user, path);
        }
        return createErrorResponse("Instance ID required", 400);

      default:
        return createErrorResponse("Method not allowed", 405);
    }
  });
}); 