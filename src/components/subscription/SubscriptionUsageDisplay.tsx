import React from "react";
import { Progress } from "@/components/ui/progress.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";

interface SubscriptionUsageDisplayProps {
  subscription: {
    plan: string;
    status: string;
    messages_used: number;
    message_limit: number;
    trial_ends_at?: string;
    renews_at?: string;
    payment_method?: string;
  };
}

export function SubscriptionUsageDisplay({ subscription }: SubscriptionUsageDisplayProps) {
  if (!subscription) {
    return null;
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Calculate usage percentage
  const usagePercentage = Math.min(
    Math.round((subscription.messages_used / subscription.message_limit) * 100),
    100
  );

  // Determine color based on usage percentage
  const getUsageColor = (percentage: number) => {
    if (percentage < 60) return "bg-green-500";
    if (percentage < 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Format plan name for display
  const formatPlanName = (plan: string) => {
    if (!plan) return "Free";
    // Remove first character (assumed to be a prefix) and capitalize first letter
    return plan.slice(1).charAt(0).toUpperCase() + plan.slice(2) + " Plan";
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">{formatPlanName(subscription.plan)}</CardTitle>
          <Badge
            variant={subscription.status === "active" ? "default" : "destructive"}
            className="uppercase"
          >
            {subscription.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Message Usage</span>
            <span>
              {subscription.messages_used.toLocaleString()} / {subscription.message_limit.toLocaleString()}
            </span>
          </div>
          <Progress 
            value={usagePercentage} 
            className="h-2" 
            indicatorClassName={getUsageColor(usagePercentage)} 
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          {subscription.trial_ends_at && (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground">Trial ends</p>
              <p>{formatDate(subscription.trial_ends_at)}</p>
            </div>
          )}
          
          {subscription.renews_at && (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground">Renews</p>
              <p>{formatDate(subscription.renews_at)}</p>
            </div>
          )}
          
          <div>
            <p className="text-muted-foreground">Payment Method</p>
            <p>{subscription.payment_method || "Not set"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
