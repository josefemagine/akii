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
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import useBilling from '@/hooks/useBilling';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import BillingSection from '@/components/billing/BillingSection';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
// Internal component that uses the hooks
function BillingPageContent() {
    const navigate = useNavigate();
    const { loading, error, billingData } = useBilling();
    const [plans, setPlans] = useState([]);
    const [plansLoading, setPlansLoading] = useState(true);
    // Fetch available plans
    useEffect(() => {
        const fetchPlans = () => __awaiter(this, void 0, void 0, function* () {
            try {
                setPlansLoading(true);
                const { data, error } = yield supabase
                    .from('subscription_plans')
                    .select('id, name, description, message_limit, price_monthly, price_annual')
                    .eq('is_active', true)
                    .order('price_monthly', { ascending: true });
                if (error)
                    throw error;
                setPlans(data.map((plan) => ({
                    id: plan.id,
                    name: plan.name,
                    description: plan.description,
                    messageLimit: plan.message_limit,
                    priceMonthly: plan.price_monthly,
                    priceAnnual: plan.price_annual,
                })));
            }
            catch (err) {
                console.error('Error fetching plans:', err);
            }
            finally {
                setPlansLoading(false);
            }
        });
        fetchPlans();
    }, []);
    // Format current period end date
    const formatDate = (dateString) => {
        if (!dateString)
            return 'N/A';
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(new Date(dateString));
    };
    return (_jsxs("div", { className: "container py-10 space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Billing & Subscription" }), _jsx("p", { className: "text-muted-foreground mt-1", children: "Manage your subscription, billing information, and payments" })] }), loading || plansLoading ? (_jsxs("div", { className: "flex flex-col items-center justify-center h-64", children: [_jsx(Loader2, { className: "h-10 w-10 animate-spin text-primary" }), _jsx("p", { className: "mt-4 text-muted-foreground", children: "Loading billing information..." })] })) : error ? (_jsxs(Alert, { variant: "destructive", children: [_jsx(AlertTitle, { children: "Error" }), _jsx(AlertDescription, { children: "Failed to load your billing information. Please try again later or contact support." }), _jsx("div", { className: "mt-4", children: _jsx(Button, { variant: "outline", onClick: () => window.location.reload(), children: "Retry" }) })] })) : (_jsxs(Tabs, { defaultValue: "subscription", className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-3 mb-8", children: [_jsx(TabsTrigger, { value: "subscription", children: "Subscription" }), _jsx(TabsTrigger, { value: "payment-methods", children: "Payment Methods" }), _jsx(TabsTrigger, { value: "billing-history", children: "Billing History" })] }), _jsxs(TabsContent, { value: "subscription", children: [_jsx(BillingSection, { subscriptionData: {
                                    status: billingData.status,
                                    planId: billingData.planId || '',
                                    planName: billingData.planName || 'Free',
                                    messageLimit: billingData.messageLimit,
                                    billingCycle: billingData.billingCycle || 'monthly',
                                    currentPeriodEnd: billingData.currentPeriodEnd ? new Date(billingData.currentPeriodEnd) : null,
                                    cancelAtPeriodEnd: billingData.cancelAtPeriodEnd,
                                }, plans: plans }), billingData.status === 'trialing' && billingData.trialEndsAt && (_jsxs(Alert, { children: [_jsx(AlertTitle, { children: "Trial Period Active" }), _jsxs(AlertDescription, { children: ["Your trial period ends on ", formatDate(billingData.trialEndsAt), ". Add a payment method to avoid any interruption in service."] })] })), billingData.status === 'past_due' && (_jsxs(Alert, { variant: "destructive", children: [_jsx(AlertTitle, { children: "Payment Issue" }), _jsx(AlertDescription, { children: "There's an issue with your payment method. Please update your payment details to avoid any interruption in service." }), _jsx("div", { className: "mt-4", children: _jsx(Button, { onClick: () => navigate('/dashboard/billing#payment-methods'), children: "Update Payment Method" }) })] }))] }), _jsx(TabsContent, { value: "payment-methods", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Payment Methods" }), _jsx(CardDescription, { children: "Manage your payment methods and billing information" })] }), _jsx(CardContent, { className: "space-y-4", children: _jsxs("div", { className: "text-center py-8", children: [_jsx("p", { className: "text-muted-foreground mb-4", children: "Payment methods can be managed through the Stripe Customer Portal" }), _jsx(Button, { onClick: () => navigate('/dashboard/billing'), children: "Manage in Subscription Tab" })] }) })] }) }), _jsx(TabsContent, { value: "billing-history", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Billing History" }), _jsx(CardDescription, { children: "View your past invoices and payment history" })] }), _jsx(CardContent, { className: "space-y-4", children: _jsxs("div", { className: "text-center py-8", children: [_jsx("p", { className: "text-muted-foreground mb-4", children: "Your billing history can be viewed through the Stripe Customer Portal" }), _jsx(Button, { onClick: () => navigate('/dashboard/billing'), children: "Manage in Subscription Tab" })] }) })] }) })] }))] }));
}
// Main wrapper component that includes the AuthProvider
export default function BillingPage() {
    return _jsx(BillingPageContent, {});
}
