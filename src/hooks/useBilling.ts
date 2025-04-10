import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase.ts";
import { useAuth } from '@/contexts/UnifiedAuthContext.tsx';
import { billingProvider } from '@/lib/billing-providers';

// Define the billing data structure
export interface BillingData {
  status: string;
  planId: string | null;
  planName: string | null;
  messageLimit: number;
  billingCycle: 'monthly' | 'annual' | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  paymentStatus: string | null;
  trialEndsAt: string | null;
  nextBillingDate: string | null;
}

const defaultBillingData: BillingData = {
  status: 'none',
  planId: null,
  planName: null,
  messageLimit: 0,
  billingCycle: null,
  currentPeriodStart: null,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  paymentStatus: null,
  trialEndsAt: null,
  nextBillingDate: null,
};

export default function useBilling() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [billingData, setBillingData] = useState<BillingData>(defaultBillingData);
  
  const fetchBillingData = async () => {
    if (!user) {
      setBillingData(defaultBillingData);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('billing-summary', {
        body: {},
      });
      
      if (error) throw new Error(error.message);
      
      setBillingData(data || defaultBillingData);
    } catch (e) {
      console.error('Error fetching billing data:', e);
      setError(e instanceof Error ? e : new Error('Failed to fetch billing data'));
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch billing data on mount and when user changes
  useEffect(() => {
    fetchBillingData();
  }, [user?.id]);
  
  // Method to create a checkout session
  const createCheckoutSession = async (planId: string, billingCycle: 'monthly' | 'annual') => {
    if (!user) throw new Error('User must be logged in');
    
    try {
      const result = await billingProvider.createCheckoutSession({
        userId: user.id,
        planId,
        billingCycle,
      });
      
      return result;
    } catch (e) {
      console.error('Error creating checkout session:', e);
      throw e;
    }
  };
  
  // Method to open billing portal
  const openBillingPortal = async () => {
    if (!user) throw new Error('User must be logged in');
    
    try {
      const result = await billingProvider.createPortalSession({
        userId: user.id,
      });
      
      return result;
    } catch (e) {
      console.error('Error opening billing portal:', e);
      throw e;
    }
  };
  
  // Method to cancel subscription
  const cancelSubscription = async (immediateCancel = false) => {
    if (!user) throw new Error('User must be logged in');
    
    try {
      const result = await billingProvider.cancelSubscription({
        userId: user.id,
        immediateCancel,
      });
      
      if (result) {
        // Refresh billing data
        await fetchBillingData();
      }
      
      return result;
    } catch (e) {
      console.error('Error canceling subscription:', e);
      throw e;
    }
  };
  
  // Method to update subscription
  const updateSubscription = async (planId: string, billingCycle?: 'monthly' | 'annual') => {
    if (!user) throw new Error('User must be logged in');
    
    try {
      const result = await billingProvider.updateSubscription({
        userId: user.id,
        planId,
        billingCycle,
      });
      
      if (result) {
        // Refresh billing data
        await fetchBillingData();
      }
      
      return result;
    } catch (e) {
      console.error('Error updating subscription:', e);
      throw e;
    }
  };
  
  return {
    loading,
    error,
    billingData,
    fetchBillingData,
    createCheckoutSession,
    openBillingPortal,
    cancelSubscription,
    updateSubscription,
  };
} 