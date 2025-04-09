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
Deno.serve((req) => __awaiter(void 0, void 0, void 0, function* () {
    return handleRequest(req, (user) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Get all active products with their prices
            const { rows: products } = yield query(`
        SELECT 
          p.id,
          p.name,
          p.description,
          p.active,
          json_agg(
            json_build_object(
              'id', pr.id,
              'unit_amount', pr.unit_amount,
              'currency', pr.currency,
              'interval', pr.interval
            )
          ) as prices
        FROM stripe_products p
        LEFT JOIN stripe_prices pr ON p.id = pr.product_id
        WHERE p.active = true AND p.show_to_users = true
        GROUP BY p.id, p.name, p.description, p.active
      `);
            return createSuccessResponse({ products });
        }
        catch (error) {
            console.error('Error fetching products:', error);
            return createErrorResponse('Failed to fetch products', 500);
        }
    }), {
        requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
        requireAuth: true,
    });
}));
