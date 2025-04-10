import React, { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useAuth } from "@/contexts/UnifiedAuthContext.tsx";
import { AlertCircle, CheckCircle2, BarChart3, Loader2 } from "lucide-react";
import { invokeServerFunction } from "@/utils/supabase/functions.ts";
import { useToast } from "@/components/ui/use-toast.ts";

interface SubscriptionUsageProps {
  className?: string;
}

interface SubscriptionData {
  plan: string;
  status: string;
  messages_used: number;
  message_limit: number;
  renews_at?: string;
  trial_ends_at?: string;
  addons?: Record<string, any>;
  payment_method?: string;
}

export function SubscriptionUsage({ className }: SubscriptionUsageProps) {
  const { user, hasUser } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (hasUser && user) {
      fetchSubscriptionData();
    } else {
      setIsLoading(false);
    }
  }, [hasUser, user]);
  
  const fetchSubscriptionData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const data = await invokeServerFunction<{subscription: SubscriptionData}>("get_user_subscription", {
        userId: user.id
      });
      
      if (data?.subscription) {
        setSubscription(data.subscription);
      } else {
        // Set default values if no subscription is found
        setSubscription({
          plan: "free",
          status: "active",
          messages_used: 0,
          message_limit: 1000
        });
      }
    } catch (error) {
      console.error("Error fetching subscription data:", error);
      toast({
        title: "Error",
        description: "Failed to load subscription data",
        variant: "destructive"
      });
      
      // Set default values in case of error
      setSubscription({
        plan: "free",
        status: "active",
        messages_used: 0,
        message_limit: 1000
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Subscription Usage
          </CardTitle>
          <CardDescription>Loading subscription data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Default values if subscription data is not available
  const messagesUsed = subscription?.messages_used || 0;
  const messageLimit = subscription?.message_limit || 1000;
  const plan = subscription?.plan || "free";
  const status = subscription?.status || "active";
  const renewsAt = subscription?.renews_at
    ? new Date(subscription.renews_at)
    : null;
  const addons = subscription?.addons || {};

  // Calculate usage percentage
  const usagePercentage = Math.min(
    Math.round((messagesUsed / messageLimit) * 100),
    100,
  );

  // Determine color based on usage
  const getProgressColor = () => {
    if (usagePercentage < 70) return "bg-green-500";
    if (usagePercentage < 90) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Subscription Usage
        </CardTitle>
        <CardDescription>
          Your current {plan.charAt(0).toUpperCase() + plan.slice(1)} plan usage
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Message Usage</span>
              <span className="text-sm text-muted-foreground">
                {messagesUsed.toLocaleString()} / {messageLimit.toLocaleString()} messages
              </span>
            </div>
            <Progress
              value={usagePercentage}
              className="h-2"
              indicatorClassName={getProgressColor()}
            />
          </div>

          <div className="flex items-center gap-2">
            {status === "active" ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
            <span className="text-sm">
              {status === "active"
                ? "Your subscription is active"
                : "Your subscription needs attention"}
            </span>
          </div>

          {renewsAt && (
            <div className="text-sm text-muted-foreground mt-2">
              Renews on {renewsAt.toLocaleDateString()}
            </div>
          )}

          {Object.keys(addons).length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium mb-1">Add-ons</p>
              <div className="text-xs text-muted-foreground space-y-1">
                {Object.entries(addons).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span>{key}</span>
                    <span>{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-between">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => fetchSubscriptionData()}
            >
              Refresh
            </Button>
            {usagePercentage > 80 && (
              <Button 
                size="sm"
                onClick={() => window.location.href = '/dashboard/subscription'}
              >
                Upgrade Plan
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default SubscriptionUsage;
