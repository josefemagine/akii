import React from "react";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { supabase } from "@/lib/supabase.tsx";
interface stripe-providerProps {}

// Implementation of the BillingProvider interface for Stripe
export class StripeBillingProvider {
    /**
     * Creates a Stripe checkout session for subscription
     */
    createCheckoutSession(params) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Call our edge function to create a checkout session
                const { data, error } = yield supabase.functions.invoke('create-checkout', {
                    body: {
                        planId: params.planId,
                        billingCycle: params.billingCycle,
                    },
                });
                if (error)
                    throw error;
                return { url: data.url };
            }
            catch (error) {
                console.error('Failed to create checkout session:', error);
                throw new Error('Failed to create checkout session');
            }
        });
    }
    /**
     * Creates a Stripe customer portal session for managing subscriptions
     */
    createPortalSession(params) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Call our edge function to create a customer portal session
                const { data, error } = yield supabase.functions.invoke('create-portal', {
                    body: {},
                });
                if (error)
                    throw error;
                return { url: data.url };
            }
            catch (error) {
                console.error('Failed to create portal session:', error);
                throw new Error('Failed to create portal session');
            }
        });
    }
    /**
     * Cancels a user's subscription
     */
    cancelSubscription(params) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Call our edge function to cancel a subscription
                const { error } = yield supabase.functions.invoke('cancel-subscription', {
                    body: {
                        immediateCancel: params.immediateCancel,
                    },
                });
                if (error)
                    throw error;
                return true;
            }
            catch (error) {
                console.error('Failed to cancel subscription:', error);
                throw new Error('Failed to cancel subscription');
            }
        });
    }
    /**
     * Updates a user's subscription to a new plan
     */
    updateSubscription(params) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Call our edge function to update a subscription
                const { error } = yield supabase.functions.invoke('update-subscription', {
                    body: {
                        planId: params.planId,
                        billingCycle: params.billingCycle,
                    },
                });
                if (error)
                    throw error;
                return true;
            }
            catch (error) {
                console.error('Failed to update subscription:', error);
                throw new Error('Failed to update subscription');
            }
        });
    }
    /**
     * Gets a user's subscription status
     */
    getSubscriptionStatus(params) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Fetch subscription from database 
                const { data, error } = yield supabase
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
            }
            catch (error) {
                console.error('Failed to get subscription status:', error);
                throw new Error('Failed to get subscription status');
            }
        });
    }
}
