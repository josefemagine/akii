import React from "react";
import { useAuth } from "@/contexts/UnifiedAuthContext";
import SubscriptionPlanCard from "./SubscriptionPlanCard";
import { User } from "@/types/custom-types";

type SubscriptionPlansProps = {
  onSelectPlan: (planId: string) => void;
};

export default function SubscriptionPlans({
  onSelectPlan,
}: SubscriptionPlansProps) {
  const { user: authUser } = useAuth();
  const user = authUser as User | null;
  const currentPlan = user?.subscription?.plan || "free";

  const plans = [
    {
      id: "pro",
      name: "Pro",
      price: "$99",
      description: "Great for daily AI workflows",
      messageLimit: 5000,
      features: [
        { name: "Full API Access", included: true },
        { name: "All integrations", included: true },
        { name: "Pooled GPU-hosted Mistral 7B", included: true },
      ],
      highlighted: false,
    },
    {
      id: "scale",
      name: "Scale",
      price: "$499",
      description: "Designed for high-traffic or multi-agent use",
      messageLimit: 25000,
      features: [
        { name: "Full API Access", included: true },
        { name: "All integrations + advanced tuning", included: true },
        { name: "Pooled A100 GPU with LLaMA 2 13B", included: true },
      ],
      highlighted: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "Custom",
      description: "For organizations with advanced needs",
      messageLimit: 50000,
      features: [
        { name: "Full API Access", included: true },
        { name: "SDKs, custom support", included: true },
        { name: "Dedicated GPU infrastructure", included: true },
        { name: "VPC, SLAs, compliance options", included: true },
      ],
      highlighted: false,
      buttonText: "Contact Sales",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
      {plans.map((plan) => (
        <SubscriptionPlanCard
          key={plan.id}
          name={plan.name}
          price={plan.price}
          description={plan.description}
          features={plan.features}
          messageLimit={plan.messageLimit}
          highlighted={plan.highlighted}
          onSelect={() => onSelectPlan(plan.id)}
          buttonText={plan.buttonText}
          currentPlan={currentPlan === plan.id}
        />
      ))}
    </div>
  );
}
