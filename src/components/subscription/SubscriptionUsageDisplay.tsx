import React from "react";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/UnifiedAuthContext";
import { User } from "@/types/custom-types";
import { Subscription } from "@/types/custom";

export default function SubscriptionUsageDisplay() {
  const { user: authUser } = useAuth();
  const user = authUser as User | null;
  const subscription = user?.subscription || null;

  // If no subscription data is available, show a default view
  if (!subscription) {
    return (
      <Card className="border border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Subscription Usage</CardTitle>
          <CardDescription>No subscription data available</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Message Usage</span>
              <span>0 / 0</span>
            </div>
            <Progress value={0} className="h-2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate usage percentage
  const usagePercentage = Math.min(
    100,
    Math.round((subscription.messages_used / subscription.message_limit) * 100),
  );

  // Format dates
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Determine status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "text-green-500";
      case "trialing":
        return "text-blue-500";
      case "past_due":
        return "text-amber-500";
      case "canceled":
      case "incomplete":
      case "incomplete_expired":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  // Determine usage color
  const getUsageColor = (percentage: number) => {
    if (percentage < 70) return "bg-green-500";
    if (percentage < 90) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <Card className="border border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">
          Subscription Usage
          <span
            className={`ml-2 text-sm font-normal ${getStatusColor(subscription.status)}`}
          >
            ({subscription.status})
          </span>
        </CardTitle>
        <CardDescription>
          {subscription.plan.charAt(0).toUpperCase() +
            subscription.plan.slice(1)}{" "}
          Plan
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Message Usage</span>
            <span>
              {subscription.messages_used.toLocaleString()} /{" "}
              {subscription.message_limit.toLocaleString()}
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
              <p className="text-sm text-muted-foreground">Trial ends:</p>
              <p>{formatDate(subscription.trial_ends_at)}</p>
            </div>
          )}

          {subscription.renews_at && (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground">Renews:</p>
              <p>{formatDate(subscription.renews_at)}</p>
            </div>
          )}

          <div>
            <p className="text-muted-foreground">Payment Method</p>
            <p>{subscription.payment_method ?? "None"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
