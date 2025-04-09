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
            // Check if user is admin
            const { data: profile, error: profileError } = yield query("SELECT role FROM profiles WHERE id = $1", [user.id]);
            if (profileError || !profile.rows[0] || profile.rows[0].role !== "admin") {
                return createErrorResponse("Unauthorized: Admin access required", 403);
            }
            // Get all active products with their prices
            const { rows: products } = yield query(`
          SELECT 
            p.id,
            p.name,
            p.description,
            p.active,
            p.metadata,
            json_agg(
              json_build_object(
                'id', pr.id,
                'currency', pr.currency,
                'unit_amount', pr.unit_amount,
                'recurring', pr.recurring
              )
            ) as prices
          FROM stripe_products p
          LEFT JOIN stripe_prices pr ON p.id = pr.product_id
          WHERE p.active = true
          GROUP BY p.id
        `);
            return createSuccessResponse({ products });
        }
        catch (error) {
            console.error("Error in admin_get_stripe_products:", error);
            return createErrorResponse(error instanceof Error ? error.message : "An unexpected error occurred", 500);
        }
    }), {
        requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
        requireAuth: true,
    });
}));
