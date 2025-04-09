var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    syncPlanToStripe(planId_1) {
        return __awaiter(this, arguments, void 0, function* (planId, operation = 'create') {
            try {
                const { data, error } = yield supabase.functions.invoke('stripe-api/sync-plan', {
                    body: {
                        planId,
                        operation,
                    },
                });
                if (error)
                    throw error;
                return data;
            }
            catch (error) {
                console.error('Error syncing plan to Stripe:', error);
                throw error;
            }
        });
    },
    /**
     * Get Stripe products and prices
     * This is useful for debugging and verification
     * @returns List of products and their prices
     */
    getStripeProducts() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, error } = yield supabase.functions.invoke('stripe-api/get-products', {
                    body: {},
                });
                if (error)
                    throw error;
                return data;
            }
            catch (error) {
                console.error('Error fetching Stripe products:', error);
                throw error;
            }
        });
    },
    /**
     * Get a list of all subscriptions
     * @returns List of subscriptions with customer data
     */
    getAllSubscriptions() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, error } = yield supabase
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
                if (error)
                    throw error;
                return data || [];
            }
            catch (error) {
                console.error('Error fetching subscriptions:', error);
                throw error;
            }
        });
    },
    /**
     * Get subscription analytics and metrics
     * @returns Subscription analytics data
     */
    getSubscriptionAnalytics() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, error } = yield supabase.functions.invoke('stripe-api/get-analytics', {
                    body: {},
                });
                if (error)
                    throw error;
                return data;
            }
            catch (error) {
                console.error('Error fetching subscription analytics:', error);
                throw error;
            }
        });
    }
};
