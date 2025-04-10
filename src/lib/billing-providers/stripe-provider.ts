import { BillingProvider } from './index.ts';
import { supabase } from "@/lib/supabase.tsx";

// Implementation of the BillingProvider interface for Stripe
export class StripeBillingProvider implements BillingProvider {
  /**
   * Creates a Stripe checkout session for subscription
   */
  async createCheckoutSession(params: {
    userId: string;
    planId: string;
    billingCycle: 'monthly' | 'annual';
  }): Promise<{ url: string }> {
    try {
      // Call our edge function to create a checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          planId: params.planId,
          billingCycle: params.billingCycle,
        },
      });

      if (error) throw error;
      return { url: data.url };
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      throw new Error('Failed to create checkout session');
    }
  }

  /**
   * Creates a Stripe customer portal session for managing subscriptions
   */
  async createPortalSession(params: {
    userId: string;
  }): Promise<{ url: string }> {
    try {
      // Call our edge function to create a customer portal session
      const { data, error } = await supabase.functions.invoke('create-portal', {
        body: {},
      });

      if (error) throw error;
      return { url: data.url };
    } catch (error) {
      console.error('Failed to create portal session:', error);
      throw new Error('Failed to create portal session');
    }
  }

  /**
   * Cancels a user's subscription
   */
  async cancelSubscription(params: {
    userId: string;
    immediateCancel?: boolean;
  }): Promise<boolean> {
    try {
      // Call our edge function to cancel a subscription
      const { error } = await supabase.functions.invoke('cancel-subscription', {
        body: {
          immediateCancel: params.immediateCancel,
        },
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  /**
   * Updates a user's subscription to a new plan
   */
  async updateSubscription(params: {
    userId: string;
    planId: string;
    billingCycle?: 'monthly' | 'annual';
  }): Promise<boolean> {
    try {
      // Call our edge function to update a subscription
      const { error } = await supabase.functions.invoke('update-subscription', {
        body: {
          planId: params.planId,
          billingCycle: params.billingCycle,
        },
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to update subscription:', error);
      throw new Error('Failed to update subscription');
    }
  }

  /**
   * Gets a user's subscription status
   */
  async getSubscriptionStatus(params: {
    userId: string;
  }): Promise<{
    status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete' | 'none';
    planId: string | null;
    billingCycle: 'monthly' | 'annual' | null;
    currentPeriodEnd: Date | null;
    cancelAtPeriodEnd: boolean;
  }> {
    try {
      // Fetch subscription from database 
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', params.userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // If no subscription, return inactive status
      if (!data) {
        return {
          status: 'none',
          planId: null,
          billingCycle: null,
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
        };
      }

      return {
        status: data.status || 'none',
        planId: data.plan_id,
        billingCycle: data.billing_cycle,
        currentPeriodEnd: data.current_period_end ? new Date(data.current_period_end) : null,
        cancelAtPeriodEnd: !!data.cancel_at_period_end,
      };
    } catch (error) {
      console.error('Failed to get subscription status:', error);
      throw new Error('Failed to get subscription status');
    }
  }
} 