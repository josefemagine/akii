/**
 * SUPABASE SUBSCRIPTIONS MODULE
 * Functions for managing user subscriptions
 */

import { getClient, getAdminClient } from './client.ts';
import type { ApiResponse } from './types.ts';

// Type definitions
export interface Plan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  plan?: Plan;
  status: 'active' | 'canceled' | 'past_due' | 'expired' | 'trialing';
  current_period_start: string;
  current_period_end: string;
  trial_start?: string;
  trial_end?: string;
  billing_cycle: 'monthly' | 'yearly';
  next_billing_date?: string;
  cancel_at_period_end: boolean;
  canceled_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  subscription_id?: string;
  amount: number;
  currency: string;
  status: 'paid' | 'unpaid' | 'pending' | 'failed' | 'refunded';
  billing_reason?: string;
  payment_method_id?: string;
  invoice_pdf_url?: string;
  invoice_number?: string;
  created_at: string;
  updated_at: string;
  paid_at?: string;
}

export interface TablesInfo {
  hasSubscriptions: boolean;
  hasPlans: boolean;
  hasInvoices: boolean;
  hasRelationship: boolean;
}

/**
 * Check if subscription tables exist in the database
 */
export async function checkSubscriptionTables(): Promise<ApiResponse<TablesInfo>> {
  try {
    // Check each table individually using direct SQL queries
    const checkTable = async (tableName: string): Promise<boolean> => {
      try {
        const { data, error } = await getClient()
          .from(tableName)
          .select('id')
          .limit(1);
        
        // If there's no error, the table exists
        return !error;
      } catch (e) {
        // If an error was thrown, the table doesn't exist
        return false;
      }
    };

    // Check if each table exists
    const hasSubscriptions = await checkTable('subscriptions');
    const hasPlans = await checkTable('plans');
    const hasInvoices = await checkTable('invoices');
    
    // Check for relationship by making a test query
    let hasRelationship = false;
    if (hasSubscriptions && hasPlans) {
      const { error: relationshipTestError } = await getClient()
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
  } catch (error) {
    console.error("Error checking subscription tables:", error);
    return { 
      data: {
        hasSubscriptions: false,
        hasPlans: false,
        hasInvoices: false,
        hasRelationship: false
      }, 
      error: error as Error 
    };
  }
}

/**
 * Get all available subscription plans
 */
export async function getPlans(): Promise<ApiResponse<Plan[]>> {
  try {
    const { data, error } = await getClient()
      .from('plans')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error fetching plans:", error);
    return { data: null, error: error as Error };
  }
}

/**
 * Get a specific plan by ID
 */
export async function getPlanById(planId: string): Promise<ApiResponse<Plan>> {
  try {
    const { data, error } = await getClient()
      .from('plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching plan ${planId}:`, error);
    return { data: null, error: error as Error };
  }
}

/**
 * Get subscriptions for a user
 */
export async function getUserSubscriptions(userId: string): Promise<ApiResponse<Subscription[]>> {
  try {
    const { data, error } = await getClient()
      .from('subscriptions')
      .select(`
        *,
        plan:plan_id(*)
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching subscriptions for user ${userId}:`, error);
    return { data: null, error: error as Error };
  }
}

/**
 * Get active subscription for a user
 */
export async function getActiveSubscription(userId: string): Promise<ApiResponse<Subscription>> {
  try {
    const { data, error } = await getClient()
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
  } catch (error) {
    console.error(`Error fetching active subscription for user ${userId}:`, error);
    return { data: null, error: error as Error };
  }
}

/**
 * Get invoices for a user
 */
export async function getUserInvoices(userId: string): Promise<ApiResponse<Invoice[]>> {
  try {
    const { data, error } = await getClient()
      .from('invoices')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching invoices for user ${userId}:`, error);
    return { data: null, error: error as Error };
  }
}

/**
 * Create a subscription for a user (admin only)
 */
export async function createSubscription(
  userId: string,
  planId: string,
  status: Subscription['status'] = 'active',
  billingCycle: 'monthly' | 'yearly' = 'monthly',
  trialDays: number = 0
): Promise<ApiResponse<Subscription>> {
  try {
    // Calculate subscription periods
    const now = new Date();
    const currentPeriodStart = now.toISOString();
    const currentPeriodEnd = new Date(now);
    
    if (billingCycle === 'monthly') {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    } else {
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
    }
    
    // Set up trial if needed
    let trialStart: string | null = null;
    let trialEnd: string | null = null;
    
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
    const { data, error } = await adminClient
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

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error creating subscription for user ${userId}:`, error);
    return { data: null, error: error as Error };
  }
}

/**
 * Update a subscription's status
 */
export async function updateSubscriptionStatus(
  subscriptionId: string,
  status: Subscription['status']
): Promise<ApiResponse<Subscription>> {
  try {
    // Get admin client
    const adminClient = getAdminClient();
    if (!adminClient) {
      throw new Error('Failed to get admin client for subscription status update');
    }

    const { data, error } = await adminClient
      .from('subscriptions')
      .update({
        status,
        updated_at: new Date().toISOString(),
        ...(status === 'canceled' ? { canceled_at: new Date().toISOString() } : {})
      })
      .eq('id', subscriptionId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error updating subscription ${subscriptionId}:`, error);
    return { data: null, error: error as Error };
  }
}

/**
 * Cancel a subscription at period end
 */
export async function cancelSubscriptionAtPeriodEnd(
  subscriptionId: string
): Promise<ApiResponse<Subscription>> {
  try {
    // Get admin client
    const adminClient = getAdminClient();
    if (!adminClient) {
      throw new Error('Failed to get admin client for subscription cancellation');
    }

    const { data, error } = await adminClient
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', subscriptionId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error canceling subscription ${subscriptionId}:`, error);
    return { data: null, error: error as Error };
  }
}

/**
 * Create an invoice
 */
export async function createInvoice(
  userId: string,
  amount: number,
  currency: string = 'USD',
  status: Invoice['status'] = 'paid',
  subscriptionId?: string,
  paymentMethodId?: string
): Promise<ApiResponse<Invoice>> {
  try {
    const now = new Date();
    const invoiceNumber = `INV-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    // Get admin client
    const adminClient = getAdminClient();
    if (!adminClient) {
      throw new Error('Failed to get admin client for invoice creation');
    }

    const { data, error } = await adminClient
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

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error creating invoice for user ${userId}:`, error);
    return { data: null, error: error as Error };
  }
}

/**
 * Update an invoice's status
 */
export async function updateInvoiceStatus(
  invoiceId: string,
  status: Invoice['status']
): Promise<ApiResponse<Invoice>> {
  try {
    const updates: Record<string, any> = {
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

    const { data, error } = await adminClient
      .from('invoices')
      .update(updates)
      .eq('id', invoiceId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error updating invoice ${invoiceId}:`, error);
    return { data: null, error: error as Error };
  }
} 