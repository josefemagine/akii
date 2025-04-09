var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/UnifiedAuthContext";
import { AlertCircle, CheckCircle2, BarChart3, Loader2 } from "lucide-react";
import { invokeServerFunction } from "@/utils/supabase/functions";
import { useToast } from "@/components/ui/use-toast";
export function SubscriptionUsage({ className }) {
    const { user, hasUser } = useAuth();
    const { toast } = useToast();
    const [subscription, setSubscription] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        if (hasUser && user) {
            fetchSubscriptionData();
        }
        else {
            setIsLoading(false);
        }
    }, [hasUser, user]);
    const fetchSubscriptionData = () => __awaiter(this, void 0, void 0, function* () {
        if (!user)
            return;
        try {
            setIsLoading(true);
            const data = yield invokeServerFunction("get_user_subscription", {
                userId: user.id
            });
            if (data === null || data === void 0 ? void 0 : data.subscription) {
                setSubscription(data.subscription);
            }
            else {
                // Set default values if no subscription is found
                setSubscription({
                    plan: "free",
                    status: "active",
                    messages_used: 0,
                    message_limit: 1000
                });
            }
        }
        catch (error) {
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
        }
        finally {
            setIsLoading(false);
        }
    });
    // Show loading state
    if (isLoading) {
        return (_jsxs(Card, { className: className, children: [_jsxs(CardHeader, { className: "pb-2", children: [_jsxs(CardTitle, { className: "text-xl flex items-center gap-2", children: [_jsx(BarChart3, { className: "h-5 w-5" }), "Subscription Usage"] }), _jsx(CardDescription, { children: "Loading subscription data..." })] }), _jsx(CardContent, { children: _jsx("div", { className: "flex justify-center items-center py-8", children: _jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary" }) }) })] }));
    }
    // Default values if subscription data is not available
    const messagesUsed = (subscription === null || subscription === void 0 ? void 0 : subscription.messages_used) || 0;
    const messageLimit = (subscription === null || subscription === void 0 ? void 0 : subscription.message_limit) || 1000;
    const plan = (subscription === null || subscription === void 0 ? void 0 : subscription.plan) || "free";
    const status = (subscription === null || subscription === void 0 ? void 0 : subscription.status) || "active";
    const renewsAt = (subscription === null || subscription === void 0 ? void 0 : subscription.renews_at)
        ? new Date(subscription.renews_at)
        : null;
    const addons = (subscription === null || subscription === void 0 ? void 0 : subscription.addons) || {};
    // Calculate usage percentage
    const usagePercentage = Math.min(Math.round((messagesUsed / messageLimit) * 100), 100);
    // Determine color based on usage
    const getProgressColor = () => {
        if (usagePercentage < 70)
            return "bg-green-500";
        if (usagePercentage < 90)
            return "bg-yellow-500";
        return "bg-red-500";
    };
    return (_jsxs(Card, { className: className, children: [_jsxs(CardHeader, { className: "pb-2", children: [_jsxs(CardTitle, { className: "text-xl flex items-center gap-2", children: [_jsx(BarChart3, { className: "h-5 w-5" }), "Subscription Usage"] }), _jsxs(CardDescription, { children: ["Your current ", plan.charAt(0).toUpperCase() + plan.slice(1), " plan usage"] })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Message Usage" }), _jsxs("span", { className: "text-sm text-muted-foreground", children: [messagesUsed.toLocaleString(), " / ", messageLimit.toLocaleString(), " messages"] })] }), _jsx(Progress, { value: usagePercentage, className: "h-2", indicatorClassName: getProgressColor() })] }), _jsxs("div", { className: "flex items-center gap-2", children: [status === "active" ? (_jsx(CheckCircle2, { className: "h-5 w-5 text-green-500" })) : (_jsx(AlertCircle, { className: "h-5 w-5 text-red-500" })), _jsx("span", { className: "text-sm", children: status === "active"
                                        ? "Your subscription is active"
                                        : "Your subscription needs attention" })] }), renewsAt && (_jsxs("div", { className: "text-sm text-muted-foreground mt-2", children: ["Renews on ", renewsAt.toLocaleDateString()] })), Object.keys(addons).length > 0 && (_jsxs("div", { className: "mt-2", children: [_jsx("p", { className: "text-sm font-medium mb-1", children: "Add-ons" }), _jsx("div", { className: "text-xs text-muted-foreground space-y-1", children: Object.entries(addons).map(([key, value]) => (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: key }), _jsx("span", { children: String(value) })] }, key))) })] })), _jsxs("div", { className: "pt-2 flex justify-between", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => fetchSubscriptionData(), children: "Refresh" }), usagePercentage > 80 && (_jsx(Button, { size: "sm", onClick: () => window.location.href = '/dashboard/subscription', children: "Upgrade Plan" }))] })] }) })] }));
}
export default SubscriptionUsage;
