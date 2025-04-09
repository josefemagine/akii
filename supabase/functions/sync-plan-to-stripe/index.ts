import { corsHeaders } from "../_shared/cors.ts";
import { query, queryOne, execute } from "../_shared/postgres.ts";
import { handleRequest, createSuccessResponse, createErrorResponse } from "../_shared/auth.ts";
import Stripe from "https://esm.sh/stripe@12.0.0?dts";

// Initialize Stripe
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: '2023-10-16',
});

interface SyncPlanRequest {
  planId: string;
  operation?: 'create' | 'update' | 'delete';
}

interface Profile {
  is_admin: boolean;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  features: string[];
  message_limit: number;
  agent_limit: number;
  price_monthly: number;
  price_yearly: number;
  stripe_product_id: string;
  stripe_price_id_monthly: string;
  stripe_price_id_yearly: string;
}

// Main handler function
Deno.serve(async (req) => {
  return handleRequest(
    req, 
    async (user, body: SyncPlanRequest) => {
      try {
        const { planId, operation = 'create' } = body;
        
        if (!planId) {
          return createErrorResponse('Missing required parameter: planId', 400);
        }

        // Check if user is an admin
        const profile = await queryOne<Profile>(
          'SELECT is_admin FROM profiles WHERE id = $1',
          [user.id]
        );

        if (!profile?.is_admin) {
          return createErrorResponse('Admin privileges required', 403);
        }

        // Get the plan from the database
        const plan = await queryOne<SubscriptionPlan>(
          'SELECT * FROM subscription_plans WHERE id = $1',
          [planId]
        );

        if (!plan) {
          return createErrorResponse('Plan not found', 404);
        }

        // Normalize plan name for Stripe
        const stripeSafeName = plan.name.toLowerCase().replace(/\s+/g, '_');
        const stripeProductId = `plan_${stripeSafeName}_${plan.id}`;

        let result;
        
        // Handle different operations (create, update, delete)
        switch (operation) {
          case 'create':
          case 'update':
            // Check if product already exists in Stripe
            let stripeProduct;
            try {
              stripeProduct = await stripe.products.retrieve(stripeProductId);
            } catch (error) {
              // Product doesn't exist, create it
              stripeProduct = await stripe.products.create({
                id: stripeProductId,
                name: plan.name,
                description: plan.description || '',
                active: plan.is_active,
                metadata: {
                  plan_id: plan.id,
                  features: JSON.stringify(plan.features || []),
                  message_limit: plan.message_limit?.toString() || '0',
                  agent_limit: plan.agent_limit?.toString() || '0',
                },
              });
            }

            // Create or update prices
            const monthlyPriceData = {
              currency: 'usd',
              product: stripeProductId,
              unit_amount: Math.round(plan.price_monthly * 100), // Stripe uses cents
              recurring: {
                interval: 'month',
              },
              metadata: {
                plan_id: plan.id,
                billing_cycle: 'monthly',
              },
            };

            const yearlyPriceData = {
              currency: 'usd',
              product: stripeProductId,
              unit_amount: Math.round(plan.price_yearly * 100), // Stripe uses cents
              recurring: {
                interval: 'year',
              },
              metadata: {
                plan_id: plan.id,
                billing_cycle: 'annual',
              },
            };

            let monthlyPrice, yearlyPrice;

            // If we already have price IDs, update the existing prices if possible or create new ones
            if (plan.stripe_price_id_monthly) {
              try {
                // Try to retrieve existing price (will throw if not found)
                await stripe.prices.retrieve(plan.stripe_price_id_monthly);
                // Prices can't be updated in Stripe, so we'll create a new one and archive the old one
                await stripe.prices.update(plan.stripe_price_id_monthly, { active: false });
                monthlyPrice = await stripe.prices.create(monthlyPriceData);
              } catch (error) {
                // Price doesn't exist, create a new one
                monthlyPrice = await stripe.prices.create(monthlyPriceData);
              }
            } else {
              monthlyPrice = await stripe.prices.create(monthlyPriceData);
            }

            if (plan.stripe_price_id_yearly) {
              try {
                await stripe.prices.retrieve(plan.stripe_price_id_yearly);
                await stripe.prices.update(plan.stripe_price_id_yearly, { active: false });
                yearlyPrice = await stripe.prices.create(yearlyPriceData);
              } catch (error) {
                yearlyPrice = await stripe.prices.create(yearlyPriceData);
              }
            } else {
              yearlyPrice = await stripe.prices.create(yearlyPriceData);
            }

            // Update the plan in the database with Stripe IDs
            const updatedPlan = await queryOne<SubscriptionPlan>(
              `UPDATE subscription_plans 
               SET 
                stripe_product_id = $1, 
                stripe_price_id_monthly = $2, 
                stripe_price_id_yearly = $3, 
                updated_at = $4
               WHERE id = $5
               RETURNING *`,
              [
                stripeProductId, 
                monthlyPrice.id, 
                yearlyPrice.id, 
                new Date().toISOString(), 
                planId
              ]
            );

            if (!updatedPlan) {
              return createErrorResponse('Failed to update plan', 500);
            }

            result = {
              success: true,
              operation: operation,
              product: stripeProduct,
              prices: {
                monthly: monthlyPrice,
                yearly: yearlyPrice,
              },
              plan: updatedPlan,
            };
            break;

          case 'delete':
            // Archive the product in Stripe (don't actually delete it)
            const archivedProduct = await stripe.products.update(stripeProductId, {
              active: false,
            });

            // Archive associated prices
            if (plan.stripe_price_id_monthly) {
              await stripe.prices.update(plan.stripe_price_id_monthly, { active: false });
            }
            
            if (plan.stripe_price_id_yearly) {
              await stripe.prices.update(plan.stripe_price_id_yearly, { active: false });
            }

            // Update the plan in our database to mark it as inactive
            const deletedPlan = await queryOne<SubscriptionPlan>(
              `UPDATE subscription_plans 
               SET 
                is_active = false, 
                updated_at = $1
               WHERE id = $2
               RETURNING *`,
              [new Date().toISOString(), planId]
            );

            result = {
              success: true,
              operation: 'delete',
              product: archivedProduct,
              plan: deletedPlan,
            };
            break;

          default:
            return createErrorResponse(`Invalid operation: ${operation}`, 400);
        }

        return createSuccessResponse(result);
      } catch (error) {
        console.error('Error in sync-plan-to-stripe:', error);
        return createErrorResponse(`An unexpected error occurred: ${error.message}`, 500);
      }
    },
    {
      requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY", "STRIPE_SECRET_KEY"],
      requireAuth: true,
      requireBody: true
    }
  );
}); 