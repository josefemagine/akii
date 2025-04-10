import { StripeBillingProvider } from './stripe-provider.ts';

// Define the BillingProvider interface
export interface BillingProvider {
  createCheckoutSession: (params: {
    userId: string;
    planId: string;
    billingCycle: 'monthly' | 'annual';
  }) => Promise<{ url: string }>;
  
  createPortalSession: (params: {
    userId: string;
  }) => Promise<{ url: string }>;
  
  cancelSubscription: (params: {
    userId: string;
    immediateCancel?: boolean;
  }) => Promise<boolean>;
  
  updateSubscription: (params: {
    userId: string;
    planId: string;
    billingCycle?: 'monthly' | 'annual';
  }) => Promise<boolean>;
  
  getSubscriptionStatus: (params: {
    userId: string;
  }) => Promise<{
    status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete' | 'none';
    planId: string | null;
    billingCycle: 'monthly' | 'annual' | null;
    currentPeriodEnd: Date | null;
    cancelAtPeriodEnd: boolean;
  }>;
}

// Register available billing providers
const billingProviders: Record<string, BillingProvider> = {
  stripe: new StripeBillingProvider(),
  // paddle: new PaddleBillingProvider(), // For future use
  // chargebee: new ChargebeeBillingProvider(), // For future use
};

// Get the active billing provider from environment or default to Stripe
const defaultProvider = 'stripe';
export const activeBillingProvider = 
  billingProviders[import.meta.env.VITE_BILLING_PROVIDER || defaultProvider] || 
  billingProviders[defaultProvider];

// Export a singleton instance for direct use
export const billingProvider = activeBillingProvider; 