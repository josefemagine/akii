import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

// Load the Stripe.js script
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

/**
 * Stripe client utility functions for handling billing operations
 */
export const stripeClient = {
  /**
   * Create a checkout session for subscription purchase
   * @param planId - The subscription plan ID
   * @param isBillingAnnual - Whether the billing cycle is annual
   * @returns The checkout URL to redirect to
   */
  async createCheckoutSession(planId: string, isBillingAnnual: boolean) {
    try {
      // Call the create-checkout function
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          planId,
          billingCycle: isBillingAnnual ? 'annual' : 'monthly',
        },
      });

      if (error) throw error;
      if (!data?.url) throw new Error('No checkout URL returned');

      return data.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  },

  /**
   * Create a portal session to manage subscription
   * @returns The billing portal URL to redirect to
   */
  async createPortalSession() {
    try {
      const { data, error } = await supabase.functions.invoke('create-portal', {
        body: {},
      });

      if (error) throw error;
      if (!data?.url) throw new Error('No portal URL returned');

      return data.url;
    } catch (error) {
      console.error('Error creating portal session:', error);
      throw error;
    }
  },

  /**
   * Update a subscription
   * @param planId - The new plan ID
   * @param isBillingAnnual - Whether to change to annual billing
   * @returns Success status
   */
  async updateSubscription(planId: string, isBillingAnnual: boolean) {
    try {
      const { data, error } = await supabase.functions.invoke('update-subscription', {
        body: {
          planId,
          billingCycle: isBillingAnnual ? 'annual' : 'monthly',
        },
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  },

  /**
   * Cancel a subscription
   * @param atPeriodEnd - Whether to cancel at the end of the billing period
   * @returns Success status
   */
  async cancelSubscription(atPeriodEnd = true) {
    try {
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: {
          atPeriodEnd,
        },
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  },

  /**
   * Get customer's payment methods
   * @returns List of payment methods
   */
  async getPaymentMethods() {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .order('is_default', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  },

  /**
   * Set default payment method
   * @param paymentMethodId - The payment method ID to set as default
   * @returns Success status
   */
  async setDefaultPaymentMethod(paymentMethodId: string) {
    try {
      const { data, error } = await supabase.functions.invoke('set-default-payment', {
        body: {
          paymentMethodId,
        },
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error setting default payment method:', error);
      throw error;
    }
  },

  /**
   * Get customer's invoices
   * @returns List of invoices
   */
  async getInvoices() {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('invoice_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  },

  /**
   * Get a specific invoice
   * @param invoiceId - The invoice ID
   * @returns Invoice details
   */
  async getInvoice(invoiceId: string) {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching invoice:', error);
      throw error;
    }
  }
}; 