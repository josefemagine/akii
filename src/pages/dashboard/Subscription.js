var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/UnifiedAuthContext";
import { toast } from "@/components/ui/use-toast";
import { invokeServerFunction } from "@/utils/supabase/functions";
import { DashboardPageContainer } from "@/components/layout/DashboardPageContainer";
const SubscriptionPage = () => {
    const { user, hasUser, isLoading } = useAuth();
    const [plans, setPlans] = useState([]);
    const [currentPlan, setCurrentPlan] = useState("free");
    const [isLoadingPlans, setIsLoadingPlans] = useState(true);
    useEffect(() => {
        if (hasUser) {
            fetchSubscriptionPlans();
            fetchCurrentSubscription();
        }
    }, [hasUser]);
    const fetchSubscriptionPlans = () => __awaiter(void 0, void 0, void 0, function* () {
        setIsLoadingPlans(true);
        try {
            const plansData = yield invokeServerFunction("get_subscription_plans", {});
            setPlans((plansData === null || plansData === void 0 ? void 0 : plansData.plans) || []);
        }
        catch (error) {
            console.error("Error fetching subscription plans:", error);
            toast({
                title: "Error",
                description: "Failed to load subscription plans",
                variant: "destructive"
            });
        }
        finally {
            setIsLoadingPlans(false);
        }
    });
    const fetchCurrentSubscription = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!user)
            return;
        try {
            const subscriptionData = yield invokeServerFunction("get_user_subscription", {
                userId: user.id
            });
            if (subscriptionData === null || subscriptionData === void 0 ? void 0 : subscriptionData.subscription) {
                setCurrentPlan(subscriptionData.subscription.plan_id);
            }
        }
        catch (error) {
            console.error("Error fetching current subscription:", error);
            toast({
                title: "Error",
                description: "Failed to load your subscription details",
                variant: "destructive"
            });
        }
    });
    const handleSubscribe = (planId, isAnnual) => __awaiter(void 0, void 0, void 0, function* () {
        if (!user) {
            toast({
                title: "Error",
                description: "You need to be logged in to subscribe",
                variant: "destructive"
            });
            return;
        }
        try {
            // Call subscription_create function
            const result = yield invokeServerFunction("subscription_create", {
                userId: user.id,
                planId,
                isAnnual,
            });
            if (result === null || result === void 0 ? void 0 : result.checkoutUrl) {
                // Redirect to checkout
                window.location.href = result.checkoutUrl;
            }
            else {
                toast({
                    title: "Success",
                    description: "Subscription updated successfully!"
                });
                // Refresh subscription data
                fetchCurrentSubscription();
            }
        }
        catch (error) {
            console.error("Error subscribing:", error);
            toast({
                title: "Error",
                description: "Failed to process subscription",
                variant: "destructive"
            });
        }
    });
    if (isLoading) {
        return (_jsx(DashboardPageContainer, { children: _jsx("div", { className: "flex justify-center items-center h-64", children: _jsx("p", { children: "Loading subscription data..." }) }) }));
    }
    if (!hasUser) {
        return (_jsx(DashboardPageContainer, { children: _jsx("div", { className: "flex justify-center items-center h-64", children: _jsx("p", { children: "Please log in to view subscription options" }) }) }));
    }
    return (_jsx(DashboardPageContainer, { children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col", children: [_jsx("h2", { className: "text-3xl font-bold mb-2", children: "Subscription Plans" }), _jsx("p", { className: "text-muted-foreground mb-6", children: "Choose the plan that works best for your business" })] }), _jsxs(Tabs, { defaultValue: "monthly", className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full max-w-md grid-cols-2 mb-8", children: [_jsx(TabsTrigger, { value: "monthly", children: "Monthly" }), _jsx(TabsTrigger, { value: "annual", children: "Annual (20% off)" })] }), isLoadingPlans ? (_jsx("div", { className: "flex justify-center items-center h-64", children: _jsx("p", { children: "Loading plans..." }) })) : (_jsxs(_Fragment, { children: [_jsxs(TabsContent, { value: "monthly", className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Free" }), _jsx(CardDescription, { children: "For individuals just getting started" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-3xl font-bold mb-4", children: "$0" }), _jsxs("ul", { className: "space-y-2", children: [_jsxs("li", { className: "flex items-start", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" }), _jsx("span", { children: "1,000 messages per month" })] }), _jsxs("li", { className: "flex items-start", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" }), _jsx("span", { children: "1 AI agent" })] }), _jsxs("li", { className: "flex items-start", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" }), _jsx("span", { children: "Web integration only" })] }), _jsxs("li", { className: "flex items-start", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" }), _jsx("span", { children: "Basic analytics" })] })] })] }), _jsx(CardFooter, { children: _jsx(Button, { variant: "outline", className: "w-full", disabled: currentPlan === "free" || isLoading, children: currentPlan === "free" ? "Current Plan" : "Downgrade" }) })] }), _jsxs(Card, { className: "border-primary", children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx(CardTitle, { children: "Professional" }), _jsx(Badge, { children: "Popular" })] }), _jsx(CardDescription, { children: "For small to medium businesses" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-3xl font-bold mb-4", children: "$99" }), _jsxs("ul", { className: "space-y-2", children: [_jsxs("li", { className: "flex items-start", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" }), _jsx("span", { children: "5,000 messages per month" })] }), _jsxs("li", { className: "flex items-start", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" }), _jsx("span", { children: "Up to 10 AI agents" })] }), _jsxs("li", { className: "flex items-start", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" }), _jsx("span", { children: "Web, mobile, and WhatsApp integration" })] }), _jsxs("li", { className: "flex items-start", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" }), _jsx("span", { children: "Advanced analytics" })] }), _jsxs("li", { className: "flex items-start", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" }), _jsx("span", { children: "Team collaboration (up to 5 members)" })] })] })] }), _jsx(CardFooter, { children: _jsx(Button, { className: "w-full", disabled: currentPlan === "professional" || isLoading, onClick: () => handleSubscribe("pro", false), children: isLoading ? "Loading..." : currentPlan === "professional" ? "Current Plan" : "Upgrade" }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Enterprise" }), _jsx(CardDescription, { children: "For large organizations with advanced needs" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-3xl font-bold mb-4", children: "$499" }), _jsxs("ul", { className: "space-y-2", children: [_jsxs("li", { className: "flex items-start", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" }), _jsx("span", { children: "50,000 messages per month" })] }), _jsxs("li", { className: "flex items-start", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" }), _jsx("span", { children: "Unlimited AI agents" })] }), _jsxs("li", { className: "flex items-start", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" }), _jsx("span", { children: "All platform integrations" })] }), _jsxs("li", { className: "flex items-start", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" }), _jsx("span", { children: "Advanced analytics and reporting" })] }), _jsxs("li", { className: "flex items-start", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" }), _jsx("span", { children: "Unlimited team members" })] }), _jsxs("li", { className: "flex items-start", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" }), _jsx("span", { children: "Dedicated support" })] }), _jsxs("li", { className: "flex items-start", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" }), _jsx("span", { children: "Custom AI model training" })] })] })] }), _jsx(CardFooter, { children: _jsx(Button, { className: "w-full", variant: "secondary", onClick: () => handleSubscribe("scale", false), disabled: currentPlan === "business" || isLoading, children: isLoading ? "Loading..." : currentPlan === "business" ? "Current Plan" : "Upgrade" }) })] })] }), _jsxs("div", { className: "bg-muted p-4 rounded-lg flex items-center", children: [_jsx(AlertCircle, { className: "h-5 w-5 text-muted-foreground mr-2" }), _jsx("span", { className: "text-sm text-muted-foreground", children: "Need a custom plan? Contact our sales team for a tailored solution." }), _jsxs(Button, { variant: "link", className: "ml-auto", children: ["Contact Sales ", _jsx(ArrowRight, { className: "h-4 w-4 ml-1" })] })] })] }), _jsxs(TabsContent, { value: "annual", className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Free" }), _jsx(CardDescription, { children: "For individuals just getting started" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-3xl font-bold mb-4", children: "$0" }), _jsxs("ul", { className: "space-y-2", children: [_jsxs("li", { className: "flex items-start", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" }), _jsx("span", { children: "1,000 messages per month" })] }), _jsxs("li", { className: "flex items-start", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" }), _jsx("span", { children: "1 AI agent" })] }), _jsxs("li", { className: "flex items-start", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" }), _jsx("span", { children: "Web integration only" })] }), _jsxs("li", { className: "flex items-start", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" }), _jsx("span", { children: "Basic analytics" })] })] })] }), _jsx(CardFooter, { children: _jsx(Button, { variant: "outline", className: "w-full", disabled: currentPlan === "free" || isLoading, children: currentPlan === "free" ? "Current Plan" : "Downgrade" }) })] }), _jsxs(Card, { className: "border-primary", children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx(CardTitle, { children: "Professional" }), _jsx(Badge, { children: "Popular" })] }), _jsx(CardDescription, { children: "For small to medium businesses" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "flex items-baseline", children: [_jsx("div", { className: "text-3xl font-bold", children: "$79" }), _jsx("div", { className: "text-sm text-muted-foreground ml-2", children: "/month" })] }), _jsx("div", { className: "text-sm text-muted-foreground mb-4", children: "$948 billed annually" }), _jsxs("ul", { className: "space-y-2", children: [_jsxs("li", { className: "flex items-start", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" }), _jsx("span", { children: "5,000 messages per month" })] }), _jsxs("li", { className: "flex items-start", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" }), _jsx("span", { children: "Up to 10 AI agents" })] }), _jsxs("li", { className: "flex items-start", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" }), _jsx("span", { children: "Web, mobile, and WhatsApp integration" })] }), _jsxs("li", { className: "flex items-start", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" }), _jsx("span", { children: "Advanced analytics" })] }), _jsxs("li", { className: "flex items-start", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" }), _jsx("span", { children: "Team collaboration (up to 5 members)" })] })] })] }), _jsx(CardFooter, { children: _jsx(Button, { className: "w-full", disabled: currentPlan === "professional" || isLoading, onClick: () => handleSubscribe("pro", true), children: isLoading ? "Loading..." : currentPlan === "professional" ? "Current Plan" : "Upgrade" }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Enterprise" }), _jsx(CardDescription, { children: "For large organizations with advanced needs" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "flex items-baseline", children: [_jsx("div", { className: "text-3xl font-bold", children: "$399" }), _jsx("div", { className: "text-sm text-muted-foreground ml-2", children: "/month" })] }), _jsx("div", { className: "text-sm text-muted-foreground mb-4", children: "$4,788 billed annually" }), _jsxs("ul", { className: "space-y-2", children: [_jsxs("li", { className: "flex items-start", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" }), _jsx("span", { children: "50,000 messages per month" })] }), _jsxs("li", { className: "flex items-start", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" }), _jsx("span", { children: "Unlimited AI agents" })] }), _jsxs("li", { className: "flex items-start", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" }), _jsx("span", { children: "All platform integrations" })] }), _jsxs("li", { className: "flex items-start", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" }), _jsx("span", { children: "Advanced analytics and reporting" })] }), _jsxs("li", { className: "flex items-start", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" }), _jsx("span", { children: "Unlimited team members" })] }), _jsxs("li", { className: "flex items-start", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" }), _jsx("span", { children: "Dedicated support" })] }), _jsxs("li", { className: "flex items-start", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" }), _jsx("span", { children: "Custom AI model training" })] })] })] }), _jsx(CardFooter, { children: _jsx(Button, { className: "w-full", variant: "secondary", onClick: () => handleSubscribe("scale", true), disabled: currentPlan === "business" || isLoading, children: isLoading ? "Loading..." : currentPlan === "business" ? "Current Plan" : "Upgrade" }) })] })] }), _jsxs("div", { className: "bg-muted p-4 rounded-lg flex items-center", children: [_jsx(AlertCircle, { className: "h-5 w-5 text-muted-foreground mr-2" }), _jsx("span", { className: "text-sm text-muted-foreground", children: "Need a custom plan? Contact our sales team for a tailored solution." }), _jsxs(Button, { variant: "link", className: "ml-auto", children: ["Contact Sales ", _jsx(ArrowRight, { className: "h-4 w-4 ml-1" })] })] })] })] }))] })] }) }));
};
export default SubscriptionPage;
