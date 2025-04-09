import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { useAuth } from "@/contexts/UnifiedAuthContext";
export default function SubscriptionUsageDisplay() {
    var _a;
    const { user: authUser } = useAuth();
    const user = authUser;
    const subscription = (user === null || user === void 0 ? void 0 : user.subscription) || null;
    // If no subscription data is available, show a default view
    if (!subscription) {
        return (_jsxs(Card, { className: "border border-border", children: [_jsxs(CardHeader, { className: "pb-2", children: [_jsx(CardTitle, { className: "text-xl", children: "Subscription Usage" }), _jsx(CardDescription, { children: "No subscription data available" })] }), _jsx(CardContent, { className: "space-y-4", children: _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Message Usage" }), _jsx("span", { children: "0 / 0" })] }), _jsx(Progress, { value: 0, className: "h-2" })] }) })] }));
    }
    // Calculate usage percentage
    const usagePercentage = Math.min(100, Math.round((subscription.messages_used / subscription.message_limit) * 100));
    // Format dates
    const formatDate = (dateString) => {
        if (!dateString)
            return "N/A";
        return new Date(dateString).toLocaleDateString();
    };
    // Determine status color
    const getStatusColor = (status) => {
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
    const getUsageColor = (percentage) => {
        if (percentage < 70)
            return "bg-green-500";
        if (percentage < 90)
            return "bg-amber-500";
        return "bg-red-500";
    };
    return (_jsxs(Card, { className: "border border-border", children: [_jsxs(CardHeader, { className: "pb-2", children: [_jsxs(CardTitle, { className: "text-xl", children: ["Subscription Usage", _jsxs("span", { className: `ml-2 text-sm font-normal ${getStatusColor(subscription.status)}`, children: ["(", subscription.status, ")"] })] }), _jsxs(CardDescription, { children: [subscription.plan.charAt(0).toUpperCase() +
                                subscription.plan.slice(1), " ", "Plan"] })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Message Usage" }), _jsxs("span", { children: [subscription.messages_used.toLocaleString(), " /", " ", subscription.message_limit.toLocaleString()] })] }), _jsx(Progress, { value: usagePercentage, className: "h-2", indicatorClassName: getUsageColor(usagePercentage) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [subscription.trial_ends_at && (_jsxs("div", { className: "mt-2", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Trial ends:" }), _jsx("p", { children: formatDate(subscription.trial_ends_at) })] })), subscription.renews_at && (_jsxs("div", { className: "mt-2", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Renews:" }), _jsx("p", { children: formatDate(subscription.renews_at) })] })), _jsxs("div", { children: [_jsx("p", { className: "text-muted-foreground", children: "Payment Method" }), _jsx("p", { children: (_a = subscription.payment_method) !== null && _a !== void 0 ? _a : "None" })] })] })] })] }));
}
