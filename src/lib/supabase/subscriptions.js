/**
 * SUPABASE SUBSCRIPTIONS MODULE
 * Functions for managing user subscriptions
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getClient, getAdminClient } from './client';
/**
 * Check if subscription tables exist in the database
 */
export function checkSubscriptionTables() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Check each table individually using direct SQL queries
            const checkTable = (tableName) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const { data, error } = yield getClient()
                        .from(tableName)
                        .select('id')
                        .limit(1);
                    // If there's no error, the table exists
                    return !error;
                }
                catch (e) {
                    // If an error was thrown, the table doesn't exist
                    return false;
                }
            });
            // Check if each table exists
            const hasSubscriptions = yield checkTable('subscriptions');
            const hasPlans = yield checkTable('plans');
            const hasInvoices = yield checkTable('invoices');
            // Check for relationship by making a test query
            let hasRelationship = false;
            if (hasSubscriptions && hasPlans) {
                const { error: relationshipTestError } = yield getClient()
                    .from("subscriptions")
                    .select("id, plan:plan_id(name)")
                    .limit(1);
                hasRelationship = !relationshipTestError;
            }
            return {
                data: {
                    hasSubscriptions,
                    hasPlans,
                    hasInvoices,
                    hasRelationship
                },
                error: null
            };
        }
        catch (error) {
            console.error("Error checking subscription tables:", error);
            return {
                data: {
                    hasSubscriptions: false,
                    hasPlans: false,
                    hasInvoices: false,
                    hasRelationship: false
                },
                error: error
            };
        }
    });
}
/**
 * Get all available subscription plans
 */
export function getPlans() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { data, error } = yield getClient()
                .from('plans')
                .select('*')
                .eq('is_active', true)
                .order('price_monthly', { ascending: true });
            if (error)
                throw error;
            return { data, error: null };
        }
        catch (error) {
            console.error("Error fetching plans:", error);
            return { data: null, error: error };
        }
    });
}
/**
 * Get a specific plan by ID
 */
export function getPlanById(planId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { data, error } = yield getClient()
                .from('plans')
                .select('*')
                .eq('id', planId)
                .single();
            if (error)
                throw error;
            return { data, error: null };
        }
        catch (error) {
            console.error(`Error fetching plan ${planId}:`, error);
            return { data: null, error: error };
        }
    });
}
/**
 * Get subscriptions for a user
 */
export function getUserSubscriptions(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { data, error } = yield getClient()
                .from('subscriptions')
                .select(`
        *,
        plan:plan_id(*)
      `)
                .eq('user_id', userId);
            if (error)
                throw error;
            return { data, error: null };
        }
        catch (error) {
            console.error(`Error fetching subscriptions for user ${userId}:`, error);
            return { data: null, error: error };
        }
    });
}
/**
 * Get active subscription for a user
 */
export function getActiveSubscription(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { data, error } = yield getClient()
                .from('subscriptions')
                .select(`
        *,
        plan:plan_id(*)
      `)
                .eq('user_id', userId)
                .eq('status', 'active')
                .single();
            if (error) {
                // If no active subscription is found, this isn't an error
                if (error.code === 'PGRST116') {
                    return { data: null, error: null };
                }
                throw error;
            }
            return { data, error: null };
        }
        catch (error) {
            console.error(`Error fetching active subscription for user ${userId}:`, error);
            return { data: null, error: error };
        }
    });
}
/**
 * Get invoices for a user
 */
export function getUserInvoices(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { data, error } = yield getClient()
                .from('invoices')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
            if (error)
                throw error;
            return { data, error: null };
        }
        catch (error) {
            console.error(`Error fetching invoices for user ${userId}:`, error);
            return { data: null, error: error };
        }
    });
}
/**
 * Create a subscription for a user (admin only)
 */
export function createSubscription(userId_1, planId_1) {
    return __awaiter(this, arguments, void 0, function* (userId, planId, status = 'active', billingCycle = 'monthly', trialDays = 0) {
        try {
            // Calculate subscription periods
            const now = new Date();
            const currentPeriodStart = now.toISOString();
            const currentPeriodEnd = new Date(now);
            if (billingCycle === 'monthly') {
                currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
            }
            else {
                currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
            }
            // Set up trial if needed
            let trialStart = null;
            let trialEnd = null;
            if (trialDays > 0) {
                trialStart = now.toISOString();
                const trialEndDate = new Date(now);
                trialEndDate.setDate(trialEndDate.getDate() + trialDays);
                trialEnd = trialEndDate.toISOString();
            }
            // Get admin client
            const adminClient = getAdminClient();
            if (!adminClient) {
                throw new Error('Failed to get admin client for subscription creation');
            }
            // Create the subscription using admin client for potential elevated permissions
            const { data, error } = yield adminClient
                .from('subscriptions')
                .insert({
                user_id: userId,
                plan_id: planId,
                status,
                current_period_start: currentPeriodStart,
                current_period_end: currentPeriodEnd.toISOString(),
                trial_start: trialStart,
                trial_end: trialEnd,
                billing_cycle: billingCycle,
                next_billing_date: currentPeriodEnd.toISOString(),
                cancel_at_period_end: false
            })
                .select()
                .single();
            if (error)
                throw error;
            return { data, error: null };
        }
        catch (error) {
            console.error(`Error creating subscription for user ${userId}:`, error);
            return { data: null, error: error };
        }
    });
}
/**
 * Update a subscription's status
 */
export function updateSubscriptionStatus(subscriptionId, status) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Get admin client
            const adminClient = getAdminClient();
            if (!adminClient) {
                throw new Error('Failed to get admin client for subscription status update');
            }
            const { data, error } = yield adminClient
                .from('subscriptions')
                .update(Object.assign({ status, updated_at: new Date().toISOString() }, (status === 'canceled' ? { canceled_at: new Date().toISOString() } : {})))
                .eq('id', subscriptionId)
                .select()
                .single();
            if (error)
                throw error;
            return { data, error: null };
        }
        catch (error) {
            console.error(`Error updating subscription ${subscriptionId}:`, error);
            return { data: null, error: error };
        }
    });
}
/**
 * Cancel a subscription at period end
 */
export function cancelSubscriptionAtPeriodEnd(subscriptionId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Get admin client
            const adminClient = getAdminClient();
            if (!adminClient) {
                throw new Error('Failed to get admin client for subscription cancellation');
            }
            const { data, error } = yield adminClient
                .from('subscriptions')
                .update({
                cancel_at_period_end: true,
                canceled_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
                .eq('id', subscriptionId)
                .select()
                .single();
            if (error)
                throw error;
            return { data, error: null };
        }
        catch (error) {
            console.error(`Error canceling subscription ${subscriptionId}:`, error);
            return { data: null, error: error };
        }
    });
}
/**
 * Create an invoice
 */
export function createInvoice(userId_1, amount_1) {
    return __awaiter(this, arguments, void 0, function* (userId, amount, currency = 'USD', status = 'paid', subscriptionId, paymentMethodId) {
        try {
            const now = new Date();
            const invoiceNumber = `INV-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
            // Get admin client
            const adminClient = getAdminClient();
            if (!adminClient) {
                throw new Error('Failed to get admin client for invoice creation');
            }
            const { data, error } = yield adminClient
                .from('invoices')
                .insert({
                user_id: userId,
                subscription_id: subscriptionId,
                amount,
                currency,
                status,
                payment_method_id: paymentMethodId,
                invoice_number: invoiceNumber,
                paid_at: status === 'paid' ? now.toISOString() : null
            })
                .select()
                .single();
            if (error)
                throw error;
            return { data, error: null };
        }
        catch (error) {
            console.error(`Error creating invoice for user ${userId}:`, error);
            return { data: null, error: error };
        }
    });
}
/**
 * Update an invoice's status
 */
export function updateInvoiceStatus(invoiceId, status) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const updates = {
                status,
                updated_at: new Date().toISOString()
            };
            // If status is 'paid', set paid_at
            if (status === 'paid') {
                updates.paid_at = new Date().toISOString();
            }
            // Get admin client
            const adminClient = getAdminClient();
            if (!adminClient) {
                throw new Error('Failed to get admin client for invoice status update');
            }
            const { data, error } = yield adminClient
                .from('invoices')
                .update(updates)
                .eq('id', invoiceId)
                .select()
                .single();
            if (error)
                throw error;
            return { data, error: null };
        }
        catch (error) {
            console.error(`Error updating invoice ${invoiceId}:`, error);
            return { data: null, error: error };
        }
    });
}
