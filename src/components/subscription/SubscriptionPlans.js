import { jsx as _jsx } from "react/jsx-runtime";
import { useAuth } from "@/contexts/UnifiedAuthContext";
import SubscriptionPlanCard from "./SubscriptionPlanCard";
export default function SubscriptionPlans({ onSelectPlan, }) {
    var _a;
    const { user: authUser } = useAuth();
    const user = authUser;
    const currentPlan = ((_a = user === null || user === void 0 ? void 0 : user.subscription) === null || _a === void 0 ? void 0 : _a.plan) || "free";
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
    return (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 py-8", children: plans.map((plan) => (_jsx(SubscriptionPlanCard, { name: plan.name, price: plan.price, description: plan.description, features: plan.features, messageLimit: plan.messageLimit, highlighted: plan.highlighted, onSelect: () => onSelectPlan(plan.id), buttonText: plan.buttonText, currentPlan: currentPlan === plan.id }, plan.id))) }));
}
