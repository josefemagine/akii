import { handleRequest, createSuccessResponse, createErrorResponse } from "../_shared/auth.ts";
import { query, queryOne, execute } from "../_shared/postgres.ts";
import encode from "https://deno.land/std@0.168.0/encoding/base64/encode.ts";

// Valid permission types for API keys
const VALID_PERMISSIONS = ["read", "write", "admin"] as const;
type Permission = typeof VALID_PERMISSIONS[number];

interface ApiKeyRequest {
  instanceId: string;
  name: string;
  permissions?: Permission[];
}

interface Instance {
  id: string;
}

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  permissions: Permission[];
  created_at: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  return handleRequest(req, async (user, body: ApiKeyRequest) => {
    try {
      const { instanceId, name, permissions = ["read"] } = body;

      // Validate required fields
      if (!instanceId?.trim()) {
        return createErrorResponse("Instance ID is required", 400);
      }
      if (!name?.trim()) {
        return createErrorResponse("Name is required", 400);
      }

      // Validate permissions
      if (!Array.isArray(permissions) || permissions.length === 0) {
        return createErrorResponse("At least one permission is required", 400);
      }
      if (!permissions.every(p => VALID_PERMISSIONS.includes(p))) {
        return createErrorResponse(`Invalid permissions. Must be one of: ${VALID_PERMISSIONS.join(", ")}`, 400);
      }

      // Check if the instance exists and belongs to the user
      const instance = await queryOne<Instance>(
        "SELECT id FROM private_ai_instances WHERE id = $1 AND user_id = $2",
        [instanceId, user.id]
      );

      if (!instance) {
        return createErrorResponse("Instance not found or access denied", 404);
      }

      // Generate a cryptographically secure API key
      const keyBuffer = new Uint8Array(32);
      crypto.getRandomValues(keyBuffer);
      const keyPrefix = `ak_${encode(keyBuffer.slice(0, 4))}_`;
      const keySecret = encode(keyBuffer.slice(4));
      const fullKey = `${keyPrefix}${keySecret}`;

      // Hash the key using base64 encoding
      const keyHash = encode(new TextEncoder().encode(fullKey));

      // Insert the new API key
      const apiKey = await queryOne<ApiKey>(
        `INSERT INTO api_keys (
          user_id,
          instance_id,
          name,
          key_prefix,
          key_hash,
          permissions,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, name, key_prefix, permissions, created_at`,
        [
          user.id,
          instanceId,
          name.trim(),
          keyPrefix,
          keyHash,
          permissions,
          new Date().toISOString()
        ]
      );

      if (!apiKey) {
        console.error("Error creating API key");
        return createErrorResponse("Failed to create API key", 500);
      }

      // Return the API key (only returned once, never stored in plain text)
      return createSuccessResponse({
        message: "API key created successfully",
        apiKey: {
          ...apiKey,
          key: fullKey, // Only returned once, never stored
        },
      });
    } catch (error) {
      console.error("Unexpected error in generate_api_key:", error);
      return createErrorResponse("An unexpected error occurred", 500);
    }
  }, {
    requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
    requireAuth: true,
    requireBody: true,
  });
});
