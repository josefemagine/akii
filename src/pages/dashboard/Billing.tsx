import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import useBilling from '@/hooks/useBilling';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import BillingSection from '@/components/billing/BillingSection';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

// Define the Plan interface
interface Plan {
  id: string;
  name: string;
  description: string;
  messageLimit: number;
  priceMonthly: number;
  priceAnnual: number;
}

export default function BillingPage() {
  const navigate = useNavigate();
  const { loading, error, billingData } = useBilling();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);

  // Fetch available plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setPlansLoading(true);
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('id, name, description, message_limit, price_monthly, price_annual')
          .eq('is_active', true)
          .order('price_monthly', { ascending: true });

        if (error) throw error;

        setPlans(
          data.map((plan) => ({
            id: plan.id,
            name: plan.name,
            description: plan.description,
            messageLimit: plan.message_limit,
            priceMonthly: plan.price_monthly,
            priceAnnual: plan.price_annual,
          }))
        );
      } catch (err) {
        console.error('Error fetching plans:', err);
      } finally {
        setPlansLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // Format current period end date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(dateString));
  };

  return (
    <div className="container py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
        <p className="text-muted-foreground mt-1">
          Manage your subscription, billing information, and payments
        </p>
      </div>

      {loading || plansLoading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading billing information...</p>
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load your billing information. Please try again later or contact support.
          </AlertDescription>
          <div className="mt-4">
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </Alert>
      ) : (
        <Tabs defaultValue="subscription" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
            <TabsTrigger value="billing-history">Billing History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="subscription">
            <BillingSection 
              subscriptionData={{
                status: billingData.status,
                planId: billingData.planId || '',
                planName: billingData.planName || 'Free',
                messageLimit: billingData.messageLimit,
                billingCycle: billingData.billingCycle || 'monthly',
                currentPeriodEnd: billingData.currentPeriodEnd ? new Date(billingData.currentPeriodEnd) : null,
                cancelAtPeriodEnd: billingData.cancelAtPeriodEnd,
              }}
              plans={plans}
            />
            
            {billingData.status === 'trialing' && billingData.trialEndsAt && (
              <Alert>
                <AlertTitle>Trial Period Active</AlertTitle>
                <AlertDescription>
                  Your trial period ends on {formatDate(billingData.trialEndsAt)}. 
                  Add a payment method to avoid any interruption in service.
                </AlertDescription>
              </Alert>
            )}
            
            {billingData.status === 'past_due' && (
              <Alert variant="destructive">
                <AlertTitle>Payment Issue</AlertTitle>
                <AlertDescription>
                  There's an issue with your payment method. Please update your payment details to 
                  avoid any interruption in service.
                </AlertDescription>
                <div className="mt-4">
                  <Button onClick={() => navigate('/dashboard/billing#payment-methods')}>
                    Update Payment Method
                  </Button>
                </div>
              </Alert>
            )}
          </TabsContent>
          
          <TabsContent value="payment-methods">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>
                  Manage your payment methods and billing information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Payment methods can be managed through the Stripe Customer Portal
                  </p>
                  <Button onClick={() => navigate('/dashboard/billing')}>
                    Manage in Subscription Tab
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="billing-history">
            <Card>
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>
                  View your past invoices and payment history
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Your billing history can be viewed through the Stripe Customer Portal
                  </p>
                  <Button onClick={() => navigate('/dashboard/billing')}>
                    Manage in Subscription Tab
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
