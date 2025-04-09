import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, } from "@/components/ui/accordion";
import { CheckCircle, XCircle, Shield, Lock, Database, Server, ShieldCheck, AlertTriangle } from "lucide-react";
const Plans = () => {
    const [billingCycle, setBillingCycle] = useState("monthly");
    const toggleBillingCycle = () => {
        setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly");
    };
    const annualDiscount = 0.16; // 16% discount
    const plans = [
        {
            name: "Free Trial",
            description: "Try Akii without any commitment. No credit card required.",
            monthlyPrice: 0,
            outputMessages: "500 total",
            storage: "10 MB",
            aiInstances: 1,
            features: {
                customTraining: true,
                dedicatedInfra: false,
                apiAccess: false,
                multiChannel: false,
                support: "Email only",
                overageRate: "Upgrade required"
            },
            popularChoice: false,
            ctaText: "Start Free",
            ctaLink: "/signup"
        },
        {
            name: "Starter",
            description: "For individuals and small teams just getting started with AI.",
            monthlyPrice: 49,
            outputMessages: "50,000/mo",
            storage: "1 GB",
            aiInstances: 1,
            features: {
                customTraining: true,
                branding: false,
                accessControl: "Basic",
                dedicatedInfra: false,
                apiAccess: false,
                multiChannel: true,
                support: "Email only",
                overageRate: "$0.02 per 1K tokens"
            },
            popularChoice: false,
            ctaText: "Get Started",
            ctaLink: "/signup"
        },
        {
            name: "Pro",
            description: "For growing businesses ready to scale their AI capabilities.",
            monthlyPrice: 149,
            outputMessages: "250,000/mo",
            storage: "5 GB",
            aiInstances: 3,
            features: {
                customTraining: true,
                branding: true,
                accessControl: "Advanced",
                dedicatedInfra: false,
                apiAccess: true,
                multiChannel: true,
                support: "Chat Support",
                overageRate: "$0.015 per 1K tokens"
            },
            popularChoice: true,
            ctaText: "Get Started",
            ctaLink: "/signup"
        },
        {
            name: "Business",
            description: "For established companies with sophisticated AI needs.",
            monthlyPrice: 499,
            outputMessages: "750,000/mo",
            storage: "20 GB",
            aiInstances: 5,
            features: {
                customTraining: true,
                branding: true,
                accessControl: "Advanced",
                dedicatedInfra: false,
                apiAccess: true,
                multiChannel: true,
                support: "Priority Support",
                overageRate: "$0.012 per 1K tokens"
            },
            popularChoice: false,
            ctaText: "Get Started",
            ctaLink: "/signup"
        },
        {
            name: "Enterprise",
            description: "Custom solutions for large organizations with complex requirements.",
            monthlyPrice: 5000,
            outputMessages: "Unlimited",
            storage: "100+ GB",
            aiInstances: "10+",
            features: {
                customTraining: true,
                branding: true,
                accessControl: "Role-Based",
                dedicatedInfra: true,
                apiAccess: true,
                multiChannel: true,
                support: "Dedicated Slack + SLA",
                overageRate: "Flat rate or custom SLA"
            },
            popularChoice: false,
            ctaText: "Contact Sales",
            ctaLink: "/contact"
        }
    ];
    const securityFeatures = [
        {
            icon: _jsx(Lock, { className: "h-6 w-6 text-green-500" }),
            text: "Zero data retention"
        },
        {
            icon: _jsx(Server, { className: "h-6 w-6 text-green-500" }),
            text: "Hosted on Amazon Bedrock"
        },
        {
            icon: _jsx(Shield, { className: "h-6 w-6 text-green-500" }),
            text: "GDPR-compliant"
        },
        {
            icon: _jsx(Database, { className: "h-6 w-6 text-green-500" }),
            text: "Private AI Instances"
        },
        {
            icon: _jsx(ShieldCheck, { className: "h-6 w-6 text-green-500" }),
            text: "Secure by design"
        }
    ];
    const faqs = [
        {
            question: "Can I switch between monthly and annual?",
            answer: "Yes. You can switch plans at any time from your dashboard. We'll automatically prorate billing."
        },
        {
            question: "Are AI Instances really private?",
            answer: "Yes. Each instance is logically isolated. Enterprise plans offer dedicated infrastructure."
        },
        {
            question: "What happens if I exceed my plan's output message limit?",
            answer: "You'll receive alerts and can top up usage or upgrade easily. No surprise charges."
        },
        {
            question: "Can I try Akii before paying?",
            answer: "Yes. We offer a free trial with no credit card required."
        },
        {
            question: "Do you offer SLAs or enterprise onboarding?",
            answer: "Yes. Enterprise customers get custom SLAs, onboarding, and security reviews."
        },
        {
            question: "Can I host Akii on-premise or in my own cloud?",
            answer: "Contact us to discuss self-hosted or private cloud options for regulated environments."
        }
    ];
    const calculateAnnualPrice = (monthlyPrice) => {
        if (!monthlyPrice)
            return null;
        const annualPrice = monthlyPrice * 12 * (1 - annualDiscount);
        return Math.round(annualPrice);
    };
    return (_jsxs(MainLayout, { children: [_jsx("section", { className: "py-16 bg-gradient-to-b from-background via-background/95 to-muted/30 border-b border-border/40", children: _jsx("div", { className: "container px-4 md:px-6", children: _jsxs("div", { className: "max-w-4xl mx-auto text-center", children: [_jsx("h1", { className: "text-4xl md:text-5xl font-bold tracking-tight mb-6", children: "Secure, Private AI for Your Business" }), _jsx("p", { className: "text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8", children: "Choose a plan that works for your business. All plans include private AI instances with zero data retention and enterprise-grade security." }), _jsxs("div", { className: "bg-green-500/10 rounded-lg p-4 mb-10 max-w-xl mx-auto", children: [_jsxs("div", { className: "flex items-center justify-center gap-2 text-green-500 mb-1", children: [_jsx(ShieldCheck, { className: "h-5 w-5" }), _jsx("span", { className: "font-semibold", children: "Data Privacy Guarantee" })] }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Your data never trains other models. Private instances keep your information secure and compliant." })] })] }) }) }), _jsx("section", { className: "py-12 md:py-16 bg-background", children: _jsxs("div", { className: "container px-4 md:px-6", children: [_jsxs("div", { className: "flex flex-col items-center text-center mb-12", children: [_jsx("h2", { className: "text-3xl font-bold mb-4", children: "Simple, Transparent Pricing" }), _jsx("p", { className: "text-muted-foreground max-w-2xl", children: "Pay monthly or save 16% with annual billing. No hidden fees or surprise charges." }), _jsxs("div", { className: "flex items-center gap-3 mt-6", children: [_jsx("span", { className: `text-sm font-medium ${billingCycle === "monthly" ? "text-foreground" : "text-muted-foreground"}`, children: "Monthly" }), _jsx(Switch, { checked: billingCycle === "annual", onCheckedChange: toggleBillingCycle }), _jsxs("span", { className: `text-sm font-medium flex items-center gap-1 ${billingCycle === "annual" ? "text-foreground" : "text-muted-foreground"}`, children: ["Annual ", _jsx("span", { className: "text-xs bg-green-500/20 text-green-500 px-1 py-0.5 rounded", children: "Save 16%" })] })] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6", children: plans.map((plan, index) => {
                                const priceToShow = billingCycle === "annual" ? calculateAnnualPrice(plan.monthlyPrice) : plan.monthlyPrice;
                                return (_jsxs(Card, { className: `flex flex-col ${plan.popularChoice ? "border-green-500/50 relative shadow-lg" : ""}`, children: [plan.popularChoice && (_jsx("div", { className: "absolute -top-3 left-0 right-0 flex justify-center", children: _jsx("span", { className: "bg-green-500 text-white text-xs px-3 py-1 rounded-full", children: "Most Popular" }) })), _jsxs(CardHeader, { children: [_jsx(CardTitle, { className: "text-xl", children: plan.name }), _jsx(CardDescription, { className: "min-h-[40px]", children: plan.description })] }), _jsxs(CardContent, { className: "flex-grow", children: [_jsxs("div", { className: "mb-4", children: [_jsxs("div", { className: "flex items-baseline", children: [_jsx("span", { className: "text-3xl font-bold", children: priceToShow === 0 ? "Free" : `$${priceToShow}` }), priceToShow !== 0 && (_jsxs("span", { className: "text-muted-foreground ml-1 text-sm", children: ["/", billingCycle === "annual" ? "year" : "month"] }))] }), billingCycle === "annual" && plan.monthlyPrice > 0 && (_jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: ["($", plan.monthlyPrice, "/month value)"] }))] }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-muted-foreground", children: "AI Instances:" }), _jsx("span", { className: "font-medium", children: plan.aiInstances })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-muted-foreground", children: "Output Messages:" }), _jsx("span", { className: "font-medium", children: plan.outputMessages })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-muted-foreground", children: "Storage:" }), _jsx("span", { className: "font-medium", children: plan.storage })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-muted-foreground", children: "Support:" }), _jsx("span", { className: "font-medium", children: plan.features.support })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-muted-foreground", children: "Custom Training:" }), _jsx("span", { children: plan.features.customTraining ? (_jsx(CheckCircle, { className: "h-4 w-4 text-green-500" })) : (_jsx(XCircle, { className: "h-4 w-4 text-red-500" })) })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-muted-foreground", children: "Channels:" }), _jsx("span", { className: "font-medium", children: plan.features.multiChannel ? "Multiple" : "Web only" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-muted-foreground", children: "API Access:" }), _jsx("span", { children: plan.features.apiAccess ? (_jsx(CheckCircle, { className: "h-4 w-4 text-green-500" })) : (_jsx(XCircle, { className: "h-4 w-4 text-red-500" })) })] })] })] }), _jsx(CardFooter, { children: _jsx(Button, { asChild: true, className: "w-full", variant: plan.name === "Enterprise" ? "outline" : "default", children: _jsx(Link, { to: plan.ctaLink, children: plan.ctaText }) }) })] }, index));
                            }) })] }) }), _jsx("section", { className: "py-12 md:py-16 bg-muted/30", children: _jsxs("div", { className: "container px-4 md:px-6", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsx("h2", { className: "text-3xl font-bold mb-4", children: "Compare Plan Features" }), _jsx("p", { className: "text-muted-foreground max-w-2xl mx-auto", children: "Detailed comparison of all available features across our plans" })] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs(Table, { className: "w-full border-collapse", children: [_jsx(TableHeader, { children: _jsxs(TableRow, { className: "bg-muted/50", children: [_jsx(TableHead, { className: "w-1/4", children: "Feature" }), _jsx(TableHead, { children: "Free Trial" }), _jsx(TableHead, { children: "Starter" }), _jsx(TableHead, { children: "Pro" }), _jsx(TableHead, { children: "Business" }), _jsx(TableHead, { children: "Enterprise" })] }) }), _jsxs(TableBody, { children: [_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: "Private AI Instances" }), _jsx(TableCell, { children: "1" }), _jsx(TableCell, { children: "1" }), _jsx(TableCell, { children: "3" }), _jsx(TableCell, { children: "5" }), _jsx(TableCell, { children: "10+" })] }), _jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: "Output Messages" }), _jsx(TableCell, { children: "500 total" }), _jsx(TableCell, { children: "50K/mo" }), _jsx(TableCell, { children: "250K/mo" }), _jsx(TableCell, { children: "750K/mo" }), _jsx(TableCell, { children: "Unlimited" })] }), _jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: "Storage" }), _jsx(TableCell, { children: "10 MB" }), _jsx(TableCell, { children: "1 GB" }), _jsx(TableCell, { children: "5 GB" }), _jsx(TableCell, { children: "20 GB" }), _jsx(TableCell, { children: "100+ GB" })] }), _jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: "Custom Training" }), _jsx(TableCell, { children: _jsx(CheckCircle, { className: "h-4 w-4 text-green-500 mx-auto" }) }), _jsx(TableCell, { children: _jsx(CheckCircle, { className: "h-4 w-4 text-green-500 mx-auto" }) }), _jsx(TableCell, { children: _jsx(CheckCircle, { className: "h-4 w-4 text-green-500 mx-auto" }) }), _jsx(TableCell, { children: _jsx(CheckCircle, { className: "h-4 w-4 text-green-500 mx-auto" }) }), _jsx(TableCell, { children: _jsx(CheckCircle, { className: "h-4 w-4 text-green-500 mx-auto" }) })] }), _jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: "Remove AI Branding" }), _jsx(TableCell, { children: _jsx(XCircle, { className: "h-4 w-4 text-red-500 mx-auto" }) }), _jsx(TableCell, { children: _jsx(XCircle, { className: "h-4 w-4 text-red-500 mx-auto" }) }), _jsx(TableCell, { children: _jsx(CheckCircle, { className: "h-4 w-4 text-green-500 mx-auto" }) }), _jsx(TableCell, { children: _jsx(CheckCircle, { className: "h-4 w-4 text-green-500 mx-auto" }) }), _jsx(TableCell, { children: _jsx(CheckCircle, { className: "h-4 w-4 text-green-500 mx-auto" }) })] }), _jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: "Multi-channel Deployment" }), _jsx(TableCell, { children: _jsx(XCircle, { className: "h-4 w-4 text-red-500 mx-auto" }) }), _jsx(TableCell, { children: _jsx(CheckCircle, { className: "h-4 w-4 text-green-500 mx-auto" }) }), _jsx(TableCell, { children: _jsx(CheckCircle, { className: "h-4 w-4 text-green-500 mx-auto" }) }), _jsx(TableCell, { children: _jsx(CheckCircle, { className: "h-4 w-4 text-green-500 mx-auto" }) }), _jsx(TableCell, { children: _jsx(CheckCircle, { className: "h-4 w-4 text-green-500 mx-auto" }) })] }), _jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: "API Access" }), _jsx(TableCell, { children: _jsx(XCircle, { className: "h-4 w-4 text-red-500 mx-auto" }) }), _jsx(TableCell, { children: _jsx(XCircle, { className: "h-4 w-4 text-red-500 mx-auto" }) }), _jsx(TableCell, { children: _jsx(CheckCircle, { className: "h-4 w-4 text-green-500 mx-auto" }) }), _jsx(TableCell, { children: _jsx(CheckCircle, { className: "h-4 w-4 text-green-500 mx-auto" }) }), _jsx(TableCell, { children: _jsx(CheckCircle, { className: "h-4 w-4 text-green-500 mx-auto" }) })] }), _jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: "Access Control" }), _jsx(TableCell, { children: "None" }), _jsx(TableCell, { children: "Basic" }), _jsx(TableCell, { children: "Advanced" }), _jsx(TableCell, { children: "Advanced" }), _jsx(TableCell, { children: "Role-Based" })] }), _jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: "Dedicated Infrastructure" }), _jsx(TableCell, { children: _jsx(XCircle, { className: "h-4 w-4 text-red-500 mx-auto" }) }), _jsx(TableCell, { children: _jsx(XCircle, { className: "h-4 w-4 text-red-500 mx-auto" }) }), _jsx(TableCell, { children: _jsx(XCircle, { className: "h-4 w-4 text-red-500 mx-auto" }) }), _jsx(TableCell, { children: _jsx(XCircle, { className: "h-4 w-4 text-red-500 mx-auto" }) }), _jsx(TableCell, { children: _jsx(CheckCircle, { className: "h-4 w-4 text-green-500 mx-auto" }) })] }), _jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: "Support" }), _jsx(TableCell, { children: "Email only" }), _jsx(TableCell, { children: "Email only" }), _jsx(TableCell, { children: "Chat Support" }), _jsx(TableCell, { children: "Priority Support" }), _jsx(TableCell, { children: "Dedicated + SLA" })] })] })] }) })] }) }), _jsx("section", { className: "py-12 md:py-16 bg-background", children: _jsxs("div", { className: "container px-4 md:px-6", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsx("h2", { className: "text-3xl font-bold mb-4", children: "Enterprise-Grade Security" }), _jsx("p", { className: "text-muted-foreground max-w-2xl mx-auto", children: "All plans include advanced security features that keep your data private and secure" })] }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-6", children: securityFeatures.map((feature, index) => (_jsxs("div", { className: "bg-muted/20 rounded-lg p-6 text-center flex flex-col items-center", children: [_jsx("div", { className: "mb-4", children: feature.icon }), _jsx("div", { className: "font-medium", children: feature.text })] }, index))) }), _jsxs("div", { className: "mt-12 text-center", children: [_jsxs("div", { className: "inline-flex items-center gap-2 bg-amber-500/10 text-amber-500 p-4 rounded-lg mb-4", children: [_jsx(AlertTriangle, { className: "h-5 w-5" }), _jsx("span", { className: "font-medium", children: "Public AI services can leak your data" })] }), _jsx("p", { className: "text-muted-foreground max-w-2xl mx-auto", children: "Unlike public AI services that use your conversations to train their models, Akii's private AI instances ensure your data never leaves your control." })] })] }) }), _jsx("section", { className: "py-12 md:py-16 bg-muted/20", children: _jsxs("div", { className: "container px-4 md:px-6", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsx("h2", { className: "text-3xl font-bold mb-4", children: "Frequently Asked Questions" }), _jsx("p", { className: "text-muted-foreground max-w-2xl mx-auto", children: "Common questions about our plans and features" })] }), _jsx("div", { className: "max-w-3xl mx-auto", children: _jsx(Accordion, { type: "single", collapsible: true, className: "w-full", children: faqs.map((faq, index) => (_jsxs(AccordionItem, { value: `item-${index}`, children: [_jsx(AccordionTrigger, { className: "text-left", children: faq.question }), _jsx(AccordionContent, { children: faq.answer })] }, index))) }) })] }) }), _jsx("section", { className: "py-16 md:py-24 bg-primary/5", children: _jsx("div", { className: "container px-4 md:px-6", children: _jsxs("div", { className: "max-w-3xl mx-auto text-center", children: [_jsx("h2", { className: "text-3xl font-bold mb-4", children: "Ready to Get Started?" }), _jsx("p", { className: "text-muted-foreground mb-8", children: "Deploy your private AI instance in minutes. Start with our free trial or contact us for a personalized demo." }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-center", children: [_jsx(Button, { size: "lg", asChild: true, children: _jsx(Link, { to: "/signup", children: "Start for Free" }) }), _jsx(Button, { size: "lg", variant: "outline", asChild: true, children: _jsx(Link, { to: "/contact", children: "Contact Sales" }) })] })] }) }) })] }));
};
export default Plans;
