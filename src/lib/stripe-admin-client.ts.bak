import { supabase } from './supabase';

/**
 * Stripe admin client utilities for managing plans and subscriptions
 * These functions are only accessible to admin users
 */
export const stripeAdminClient = {
  /**
   * Sync a subscription plan to Stripe
   * @param planId - The plan ID to sync
   * @param operation - The operation to perform (create, update, delete)
   * @returns The result of the sync operation
   */
  async syncPlanToStripe(planId: string, operation: 'create' | 'update' | 'delete' = 'create') {
    try {
      const { data, error } = await supabase.functions.invoke('stripe-api/sync-plan', {
        body: {
          planId,
          operation,
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error syncing plan to Stripe:', error);
      throw error;
    }
  },

  /**
   * Get Stripe products and prices
   * This is useful for debugging and verification
   * @returns List of products and their prices
   */
  async getStripeProducts() {
    try {
      const { data, error } = await supabase.functions.invoke('stripe-api/get-products', {
        body: {},
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching Stripe products:', error);
      throw error;
    }
  },

  /**
   * Get a list of all subscriptions
   * @returns List of subscriptions with customer data
   */
  async getAllSubscriptions() {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          profiles:user_id (
            email,
            full_name
          ),
          plans:plan_id (
            name,
            price_monthly,
            price_yearly
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      throw error;
    }
  },

  /**
   * Get subscription analytics and metrics
   * @returns Subscription analytics data
   */
  async getSubscriptionAnalytics() {
    try {
      const { data, error } = await supabase.functions.invoke('stripe-api/get-analytics', {
        body: {},
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching subscription analytics:', error);
      throw error;
    }
  }
}; 