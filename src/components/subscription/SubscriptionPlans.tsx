import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Check } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  popular?: boolean;
  description: string;
}

interface SubscriptionPlansProps {
  plans?: Plan[];
  currentPlanId?: string;
  onSelectPlan?: (planId: string) => void;
}

export function SubscriptionPlans({
  plans = defaultPlans,
  currentPlanId,
  onSelectPlan,
}: SubscriptionPlansProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(
    currentPlanId || null
  );

  const handlePlanSelect = (planId: string) => {
    setSelectedPlanId(planId);
    if (onSelectPlan) {
      onSelectPlan(planId);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => (
        <Card
          key={plan.id}
          className={`flex flex-col border ${
            plan.popular
              ? "border-primary shadow-md dark:border-primary"
              : "border-border"
          } ${
            selectedPlanId === plan.id
              ? "ring-2 ring-primary ring-offset-2"
              : ""
          }`}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
              {plan.popular && (
                <Badge className="bg-primary">Popular</Badge>
              )}
            </div>
            <div className="mt-2 font-medium">
              <span className="text-3xl">${plan.price}</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {plan.description}
            </p>
          </CardHeader>
          <CardContent className="flex flex-col flex-1">
            <ul className="space-y-2 flex-1">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Button
                className="w-full"
                variant={
                  selectedPlanId === plan.id
                    ? "default"
                    : plan.popular
                    ? "default"
                    : "outline"
                }
                onClick={() => handlePlanSelect(plan.id)}
                disabled={currentPlanId === plan.id}
              >
                {currentPlanId === plan.id
                  ? "Current Plan"
                  : selectedPlanId === plan.id
                  ? "Selected"
                  : "Select Plan"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

const defaultPlans: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    description: "Basic features for personal projects",
    features: [
      "500 messages per month",
      "Basic templates",
      "Community support",
      "1 project",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 29,
    description: "Everything you need for a growing business",
    popular: true,
    features: [
      "10,000 messages per month",
      "Advanced templates",
      "Priority support",
      "Unlimited projects",
      "Team collaboration",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 99,
    description: "Advanced features for large organizations",
    features: [
      "Unlimited messages",
      "Custom templates",
      "Dedicated support",
      "Advanced analytics",
      "Custom integrations",
      "SLA guarantees",
    ],
  },
];
