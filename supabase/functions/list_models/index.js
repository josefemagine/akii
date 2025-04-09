var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { handleRequest, createSuccessResponse, createErrorResponse } from "../_shared/auth.ts";
import { query } from "../_shared/postgres.ts";
export const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
export default function handler(req) {
    return __awaiter(this, void 0, void 0, function* () {
        return handleRequest(req, (supabaseClient) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Get all models from the database
                const { rows } = yield query(`
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
            }
            catch (error) {
                console.error("Error listing models:", error);
                return createErrorResponse("Failed to list models", 500);
            }
        }));
    });
}
