import serve from "https://deno.land/std@0.168.0/http/server.ts";
import createClient from "https://esm.sh/@supabase/supabase-js@2.1.0";
import Stripe from "https://esm.sh/stripe@12.0.0?dts";

// Import CORS headers helper
import { corsHeaders } from "../_shared/cors.ts";

// Import route handlers
import { handleCreateCheckout } from "./routes/checkout.ts";
import { handleCreatePortal } from "./routes/portal.ts";
import { handleUpdateSubscription } from "./routes/update-subscription.ts";
import { handleCancelSubscription } from "./routes/cancel-subscription.ts";
import { handleWebhook } from "./routes/webhook.ts";
import { handleSyncPlan } from "./routes/sync-plan.ts";
import { handleGetProducts } from "./routes/get-products.ts";
import { handleGetAnalytics } from "./routes/get-analytics.ts";

// Initialize Stripe
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: '2023-10-16',
});

// Initialize Supabase client
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop() || '';

    // Shared dependencies object to pass to all handlers
    const deps = {
      stripe,
      supabaseAdmin,
      corsHeaders,
    };

    // Route requests to appropriate handlers
    switch (path) {
      case 'create-checkout':
        return handleCreateCheckout(req, deps);
      
      case 'create-portal':
        return handleCreatePortal(req, deps);
      
      case 'update-subscription':
        return handleUpdateSubscription(req, deps);
      
      case 'cancel-subscription':
        return handleCancelSubscription(req, deps);
      
      case 'webhook':
        return handleWebhook(req, deps);
      
      case 'sync-plan':
        return handleSyncPlan(req, deps);
      
      case 'get-products':
        return handleGetProducts(req, deps);
      
      case 'get-analytics':
        return handleGetAnalytics(req, deps);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Endpoint not found' }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
    }
  } catch (error) {
    console.error('Error in Stripe API:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}); 