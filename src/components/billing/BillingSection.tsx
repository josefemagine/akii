import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { Switch } from '@/components/ui/switch.tsx';
import { Label } from '@/components/ui/label.tsx';
import { CreditCard, Calendar, BarChart, ExternalLink, ArrowRight } from 'lucide-react';
import { billingProvider } from '@/lib/billing-providers.ts';
import { useAuth } from '@/contexts/UnifiedAuthContext.tsx';
import { useToast } from '@/components/ui/use-toast.ts';

interface Plan {
  id: string;
  name: string;
  description: string;
  messageLimit: number;
  priceMonthly: number;
  priceAnnual: number;
}

interface SubscriptionData {
  status: string;
  planId: string;
  planName: string;
  messageLimit: number;
  billingCycle: 'monthly' | 'annual';
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
}

interface BillingSectionProps {
  subscriptionData: SubscriptionData;
  plans: Plan[];
}

export default function BillingSection({ subscriptionData, plans }: BillingSectionProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState(subscriptionData?.billingCycle || 'monthly');

  // Get current plan details
  const currentPlan = plans.find(plan => plan.id === subscriptionData?.planId);

  // Format date
  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Handle opening customer portal
  const handleManageSubscription = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { url } = await billingProvider.createPortalSession({
        userId: user.id
      });
      
      // Redirect to Stripe Customer Portal
      window.location.href = url;
    } catch (error) {
      console.error('Failed to open customer portal:', error);
      toast({
        title: 'Error',
        description: 'Failed to open customer portal. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle change plan
  const handleChangePlan = async () => {
    navigate('/plans');
  };

  // Compute status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'trialing':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'past_due':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'canceled':
      case 'unpaid':
      case 'incomplete':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground border-muted';
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Subscription Details</CardTitle>
            <CardDescription>Manage your subscription and billing settings</CardDescription>
          </div>
          {subscriptionData?.status && (
            <Badge variant="outline" className={getStatusColor(subscriptionData.status)}>
              {subscriptionData.status.charAt(0).toUpperCase() + subscriptionData.status.slice(1)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {currentPlan ? (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">Current Plan</h3>
                <p className="text-muted-foreground">
                  {currentPlan.name} ({billingCycle === 'annual' ? 'Annual' : 'Monthly'})
                </p>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span>
                  {formatCurrency(billingCycle === 'annual' ? currentPlan.priceAnnual / 12 : currentPlan.priceMonthly)} / month{' '}
                  {billingCycle === 'annual' && (
                    <span className="text-muted-foreground text-sm">
                      (billed annually at {formatCurrency(currentPlan.priceAnnual)})
                    </span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {subscriptionData.cancelAtPeriodEnd
                    ? `Cancels on ${formatDate(subscriptionData.currentPeriodEnd)}`
                    : `Renews on ${formatDate(subscriptionData.currentPeriodEnd)}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart className="h-4 w-4 text-muted-foreground" />
                <span>{currentPlan.messageLimit.toLocaleString()} messages / month</span>
              </div>
            </div>
            <div className="flex flex-col justify-center space-y-4">
              <div className="flex flex-col items-center justify-center space-y-2 p-4 border rounded-md border-dashed">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="billing-cycle"
                    checked={billingCycle === 'annual'}
                    disabled={!subscriptionData || subscriptionData.status !== 'active'}
                    onCheckedChange={() => {
                      const newCycle = billingCycle === 'annual' ? 'monthly' : 'annual';
                      setBillingCycle(newCycle);
                      // This would normally trigger an update, but we're navigating to the customer portal instead
                    }}
                  />
                  <Label htmlFor="billing-cycle">Annual billing (save 16%)</Label>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  {billingCycle === 'annual'
                    ? 'You are saving 16% with annual billing'
                    : 'Switch to annual billing and save 16%'}
                </p>
              </div>
              <div className="flex flex-col space-y-2">
                <Button onClick={handleManageSubscription} disabled={loading} className="w-full">
                  {loading ? 'Loading...' : 'Manage Subscription'}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
                <Button onClick={handleChangePlan} variant="outline" className="w-full">
                  Change Plan
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">You don't have an active subscription</p>
            <Button onClick={handleChangePlan}>
              View Plans
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
