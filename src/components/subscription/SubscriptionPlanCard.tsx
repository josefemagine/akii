import React from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";

type PlanFeature = {
  name: string;
  included: boolean;
};

type SubscriptionPlanProps = {
  name: string;
  price: string;
  description: string;
  features: PlanFeature[];
  messageLimit: number;
  highlighted?: boolean;
  onSelect: () => void;
  buttonText?: string;
  currentPlan?: boolean;
};

export default function SubscriptionPlanCard({
  name,
  price,
  description,
  features = [],
  messageLimit,
  highlighted = false,
  onSelect,
  buttonText = "Select Plan",
  currentPlan = false,
}: SubscriptionPlanProps) {
  return (
    <Card
      className={`w-full max-w-sm border ${highlighted ? "border-primary shadow-lg" : "border-border"}`}
    >
      <CardHeader>
        <CardTitle className="text-xl font-bold">{name}</CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
        <div className="mt-4">
          <span className="text-3xl font-bold">{price}</span>
          <span className="text-muted-foreground">/month</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center">
            <Check className="mr-2 h-4 w-4 text-primary" />
            <span className="text-sm">
              {messageLimit.toLocaleString()} AI messages per month
            </span>
          </div>
          {features.map((feature, index) => (
            <div key={index} className="flex items-center">
              {feature.included ? (
                <Check className="mr-2 h-4 w-4 text-primary" />
              ) : (
                <div className="mr-2 h-4 w-4" />
              )}
              <span
                className={`text-sm ${!feature.included ? "text-muted-foreground line-through" : ""}`}
              >
                {feature.name}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={onSelect}
          className="w-full"
          variant={highlighted ? "default" : "outline"}
          disabled={currentPlan}
        >
          {currentPlan ? "Current Plan" : buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
}
