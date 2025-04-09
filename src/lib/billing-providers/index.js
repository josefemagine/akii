import { StripeBillingProvider } from './stripe-provider';
// Register available billing providers
const billingProviders = {
    stripe: new StripeBillingProvider(),
    // paddle: new PaddleBillingProvider(), // For future use
    // chargebee: new ChargebeeBillingProvider(), // For future use
};
// Get the active billing provider from environment or default to Stripe
const defaultProvider = 'stripe';
export const activeBillingProvider = billingProviders[import.meta.env.VITE_BILLING_PROVIDER || defaultProvider] ||
    billingProviders[defaultProvider];
// Export a singleton instance for direct use
export const billingProvider = activeBillingProvider;
