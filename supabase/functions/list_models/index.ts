import { handleRequest, createSuccessResponse, createErrorResponse } from "../_shared/auth.ts";
import { query } from "../_shared/postgres.ts";

// Augment query result with rows property
declare module "../_shared/postgres" {
  interface QueryResult<T> {
    rows: T[];
    rowCount: number;
  }
}


interface Model {
  id: string;
  name: string;
  provider: string;
  description: string;
  context_length: number;
  max_tokens: number;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

interface ListModelsResponse {
  models: Model[];
}

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export default async function handler(req: Request) {
  return handleRequest(req, async (supabaseClient) => {
    try {
      // Get all models from the database
      const { rows } = await query(`
        SELECT 
          id,
          name,
          provider,
          description,
          context_length,
          max_tokens,
          is_private,
          created_at,
          updated_at
        FROM models
        ORDER BY name ASC
      `);

      return createSuccessResponse({
        models: rows[0] || [],
      });
    } catch (error) {
      console.error("Error listing models:", error);
      return createErrorResponse("Failed to list models", 500);
    }
  });
} 