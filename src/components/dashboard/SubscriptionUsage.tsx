import React from "react";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { AlertCircle, CheckCircle2, BarChart3 } from "lucide-react";
import { User } from "@/types/custom-types";

interface SubscriptionUsageProps {
  className?: string;
}

export function SubscriptionUsage({ className }: SubscriptionUsageProps) {
  const { user: authUser } = useAuth();
  const user = authUser as User | null;
  
  // Default values if user data is not available
  const subscription = user?.subscription || null;
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
                {messagesUsed} / {messageLimit} messages
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
            <Button variant="outline" size="sm">
              View Details
            </Button>
            {usagePercentage > 80 && <Button size="sm">Upgrade Plan</Button>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default SubscriptionUsage;
