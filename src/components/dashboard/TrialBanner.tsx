import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function TrialBanner() {
  const { user } = useAuth();
  const trialEndsAt = user?.subscription?.trial_ends_at;

  // If no trial end date or user is not on trial, don't show banner
  if (!trialEndsAt || user?.subscription?.plan !== "free") {
    return null;
  }

  // Calculate days remaining in trial
  const trialEndDate = new Date(trialEndsAt);
  const today = new Date();
  const daysRemaining = Math.ceil(
    (trialEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  // If trial has ended, show different message
  if (daysRemaining <= 0) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Your free trial has ended</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>Upgrade now to continue using all features of Akii.</span>
          <Button size="sm" variant="destructive">
            Upgrade Now
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Show trial countdown
  return (
    <Alert
      variant={daysRemaining <= 2 ? "destructive" : "default"}
      className="mb-4"
    >
      <Clock className="h-4 w-4" />
      <AlertTitle>
        {daysRemaining === 1
          ? "Last day of your trial"
          : `${daysRemaining} days left in your trial`}
      </AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>
          {user?.subscription?.messages_used} of{" "}
          {user?.subscription?.message_limit || 100} messages used. Upgrade to
          continue using Akii after your trial.
        </span>
        <Button size="sm">Upgrade Now</Button>
      </AlertDescription>
    </Alert>
  );
}

export default TrialBanner;
