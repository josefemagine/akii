import { handleRequest, createSuccessResponse, createErrorResponse } from "../_shared/auth.ts"
import { query, queryOne } from "../_shared/postgres.ts"

interface StripeProduct {
  id: string
  name: string
  description: string | null
  active: boolean
  prices: {
    id: string
    unit_amount: number
    currency: string
    interval: string
  }[]
}

interface AdminGetStripeProductsResponse {
  products: StripeProduct[]
}

interface Profile {
  is_admin: boolean
}

Deno.serve(async (req) => {
  return handleRequest(req, async (user, body) => {
    // Check if user is admin
    const profile = await queryOne<Profile>(`
      SELECT is_admin FROM profiles WHERE id = $1
    `, [user.id])

    if (!profile?.is_admin) {
      return createErrorResponse('Unauthorized', 403)
    }

    try {
      // Get all active products with their prices
      const products = await query<StripeProduct>(`
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
        WHERE p.active = true
        GROUP BY p.id, p.name, p.description, p.active
      `)

      return createSuccessResponse({ products })
    } catch (error) {
      console.error('Error fetching products:', error)
      return createErrorResponse('Failed to fetch products', 500)
    }
  }, {
    requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
    requireAuth: true
  })
}) 