import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@/components/ui/tooltip";
import { CheckCircle, XCircle, Shield, Lock, Database, Server, ShieldCheck, AlertTriangle, HelpCircle } from "lucide-react";
const Pricing = () => {
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
    return (_jsxs(MainLayout, { children: [_jsx("section", { className: "py-16 bg-gradient-to-b from-background via-background/95 to-muted/30 border-b border-border/40", children: _jsx("div", { className: "container px-4 md:px-6", children: _jsxs("div", { className: "max-w-4xl mx-auto text-center", children: [_jsx("h1", { className: "text-4xl md:text-5xl font-bold tracking-tight mb-6", children: "Secure, Private AI for Your Business" }), _jsx("p", { className: "text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8", children: "Choose a plan that works for your business. All plans include private AI instances with zero data retention and enterprise-grade security." }), _jsxs("div", { className: "bg-green-500/10 rounded-lg p-4 mb-10 max-w-xl mx-auto", children: [_jsxs("div", { className: "flex items-center justify-center gap-2 text-green-500 mb-1", children: [_jsx(ShieldCheck, { className: "h-5 w-5" }), _jsx("span", { className: "font-semibold", children: "Data Privacy Guarantee" })] }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Your data never trains other models. Private instances keep your information secure and compliant." })] })] }) }) }), _jsx("section", { className: "py-12 md:py-16 bg-background", children: _jsxs("div", { className: "container px-4 md:px-6", children: [_jsxs("div", { className: "flex flex-col items-center text-center mb-12", children: [_jsx("h2", { className: "text-3xl font-bold mb-4", children: "Simple, Transparent Pricing" }), _jsx("p", { className: "text-muted-foreground max-w-2xl", children: "Pay monthly or save 16% with annual billing. No hidden fees or surprise charges." }), _jsxs("div", { className: "flex items-center space-x-2 mt-6", children: [_jsx("span", { className: billingCycle === "monthly" ? "font-medium" : "text-muted-foreground", children: "Monthly" }), _jsx(Switch, { checked: billingCycle === "annual", onCheckedChange: toggleBillingCycle }), _jsxs("span", { className: billingCycle === "annual" ? "font-medium" : "text-muted-foreground", children: ["Annual", _jsx("span", { className: "ml-1 text-xs text-green-500", children: "Save 16%" })] })] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 w-full max-w-7xl mx-auto", children: plans.map((plan, index) => (_jsxs(Card, { className: `flex flex-col ${plan.popularChoice ? "border-green-500 shadow-lg relative overflow-visible" : ""}`, children: [plan.popularChoice && (_jsx("div", { className: "bg-green-500 text-white text-xs font-medium px-3 py-1 rounded-t-md text-center", children: "Most Popular" })), _jsxs(CardHeader, { className: plan.popularChoice ? "pt-4" : "", children: [_jsx(CardTitle, { children: plan.name }), _jsx(CardDescription, { className: "min-h-[60px]", children: plan.description }), _jsx("div", { className: "mt-4", children: plan.monthlyPrice !== null ? (_jsxs(_Fragment, { children: [_jsxs("span", { className: "text-4xl font-bold", children: ["$", billingCycle === "monthly" ? plan.monthlyPrice : calculateAnnualPrice(plan.monthlyPrice)] }), _jsx("span", { className: "text-muted-foreground", children: plan.monthlyPrice === 0 ? "" : billingCycle === "monthly" ? "/mo" : "/year" }), billingCycle === "annual" && plan.monthlyPrice > 0 && (_jsxs("p", { className: "text-sm text-green-500 mt-1", children: ["Save $", Math.round(plan.monthlyPrice * 12 * annualDiscount)] }))] })) : (_jsx("span", { className: "text-2xl font-bold", children: "Custom Quote" })) })] }), _jsxs(CardContent, { className: "flex-1 space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsxs("span", { className: "text-muted-foreground flex items-center gap-1", children: ["Messages", _jsx(TooltipProvider, { children: _jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsx(HelpCircle, { className: "h-3 w-3 text-muted-foreground/70" }) }), _jsx(TooltipContent, { children: _jsx("p", { className: "w-56", children: "Number of total AI messages included per month." }) })] }) })] }), _jsx("span", { className: "font-medium", children: plan.outputMessages })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-muted-foreground", children: "Storage" }), _jsx("span", { className: "font-medium", children: plan.storage })] }), plan.name === "Free Trial" && (_jsx("div", { className: "mt-2 text-xs text-green-500 font-medium", children: "No credit card required" }))] }), _jsxs("div", { className: "pt-4 border-t space-y-2", children: [_jsxs("div", { className: "flex items-start gap-2 text-sm", children: [plan.features.customTraining ? (_jsx(CheckCircle, { className: "h-4 w-4 text-green-500 mt-0.5" })) : (_jsx(XCircle, { className: "h-4 w-4 text-muted-foreground mt-0.5" })), _jsx("span", { className: !plan.features.customTraining ? "text-muted-foreground" : "", children: "Custom Training" })] }), _jsxs("div", { className: "flex items-start gap-2 text-sm", children: [_jsx(CheckCircle, { className: "h-4 w-4 text-green-500 mt-0.5" }), _jsxs("span", { children: [plan.name === "Free Trial" ? "1" :
                                                                        plan.name === "Starter" ? "1" :
                                                                            plan.name === "Pro" ? "3" :
                                                                                plan.name === "Business" ? "5" :
                                                                                    "Unlimited", " Team ", plan.name === "Free Trial" || plan.name === "Starter" ? "Seat" : "Seats"] })] }), _jsxs("div", { className: "flex items-start gap-2 text-sm", children: [plan.features.dedicatedInfra ? (_jsx(CheckCircle, { className: "h-4 w-4 text-green-500 mt-0.5" })) : (_jsx(XCircle, { className: "h-4 w-4 text-muted-foreground mt-0.5" })), _jsx("span", { className: !plan.features.dedicatedInfra ? "text-muted-foreground" : "", children: "Dedicated Infrastructure" })] }), _jsxs("div", { className: "flex items-start gap-2 text-sm", children: [plan.features.apiAccess ? (_jsx(CheckCircle, { className: "h-4 w-4 text-green-500 mt-0.5" })) : (_jsx(XCircle, { className: "h-4 w-4 text-muted-foreground mt-0.5" })), _jsx("span", { className: !plan.features.apiAccess ? "text-muted-foreground" : "", children: "API Access" })] }), _jsxs("div", { className: "flex items-start gap-2 text-sm", children: [plan.features.multiChannel ? (_jsx(CheckCircle, { className: "h-4 w-4 text-green-500 mt-0.5" })) : (_jsx(XCircle, { className: "h-4 w-4 text-muted-foreground mt-0.5" })), _jsxs("span", { children: [plan.features.multiChannel ? "Multi-channel" : "Single-channel", " Deployment"] })] }), _jsxs("div", { className: "flex items-start gap-2 text-sm", children: [_jsx(CheckCircle, { className: "h-4 w-4 text-green-500 mt-0.5" }), _jsx("span", { children: plan.features.support })] }), _jsxs("div", { className: "flex items-start gap-2 text-sm", children: [_jsx(AlertTriangle, { className: "h-4 w-4 text-amber-500 mt-0.5" }), _jsxs("span", { className: "text-sm", children: ["Overage: ", plan.features.overageRate] })] })] })] }), _jsx(CardFooter, { children: _jsx(Button, { className: `w-full font-medium ${plan.popularChoice ? "bg-green-500 hover:bg-green-600 text-white" : ""}`, asChild: true, children: _jsx(Link, { to: plan.ctaLink, children: plan.ctaText }) }) })] }, index))) })] }) }), _jsx("section", { className: "py-8 md:py-12 bg-muted/30", children: _jsxs("div", { className: "container px-4 md:px-6", children: [_jsx("div", { className: "text-center mb-6", children: _jsx("h2", { className: "text-xl font-semibold", children: "Enterprise-Grade Security, Standard" }) }), _jsx("div", { className: "flex flex-wrap justify-center items-center gap-6 md:gap-10", children: securityFeatures.map((feature, index) => (_jsxs("div", { className: "flex items-center gap-2", children: [feature.icon, _jsx("span", { className: "text-sm font-medium", children: feature.text })] }, index))) })] }) }), _jsx("section", { className: "py-12 md:py-16 hidden md:block", children: _jsxs("div", { className: "container px-4 md:px-6", children: [_jsx("h2", { className: "text-2xl md:text-3xl font-bold text-center mb-10", children: "Compare All Features" }), _jsxs(Table, { className: "w-full", children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { className: "w-1/6", children: "Feature" }), _jsx(TableHead, { children: "Free Trial" }), _jsx(TableHead, { children: "Starter" }), _jsx(TableHead, { children: "Pro" }), _jsx(TableHead, { children: "Business" }), _jsx(TableHead, { children: "Enterprise" })] }) }), _jsxs(TableBody, { children: [_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: "Price" }), _jsx(TableCell, { children: "Free" }), _jsxs(TableCell, { children: ["$", billingCycle === "monthly" ? "49/mo" : "499/year"] }), _jsxs(TableCell, { children: ["$", billingCycle === "monthly" ? "149/mo" : "1,499/year"] }), _jsxs(TableCell, { children: ["$", billingCycle === "monthly" ? "499/mo" : "4,999/year"] }), _jsxs(TableCell, { children: ["$", billingCycle === "monthly" ? "5,000/mo" : "50,400/year"] })] }), _jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: _jsxs("div", { className: "flex items-center gap-1", children: ["Output Messages", _jsx(TooltipProvider, { children: _jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsx(HelpCircle, { className: "h-3.5 w-3.5 text-muted-foreground/70" }) }), _jsx(TooltipContent, { children: _jsx("p", { className: "w-56", children: "Number of total AI messages included per month." }) })] }) })] }) }), _jsx(TableCell, { children: "500 total" }), _jsx(TableCell, { children: "50,000/mo" }), _jsx(TableCell, { children: "250,000/mo" }), _jsx(TableCell, { children: "750,000/mo" }), _jsx(TableCell, { children: "Unlimited" })] }), _jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: "Storage" }), _jsx(TableCell, { children: "10 MB" }), _jsx(TableCell, { children: "1 GB" }), _jsx(TableCell, { children: "5 GB" }), _jsx(TableCell, { children: "20 GB" }), _jsx(TableCell, { children: "100+ GB" })] }), _jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: "Custom Training" }), _jsx(TableCell, { children: _jsx(CheckCircle, { className: "h-5 w-5 text-green-500" }) }), _jsx(TableCell, { children: _jsx(CheckCircle, { className: "h-5 w-5 text-green-500" }) }), _jsx(TableCell, { children: _jsx(CheckCircle, { className: "h-5 w-5 text-green-500" }) }), _jsx(TableCell, { children: _jsx(CheckCircle, { className: "h-5 w-5 text-green-500" }) }), _jsx(TableCell, { children: _jsx(CheckCircle, { className: "h-5 w-5 text-green-500" }) })] }), _jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: "Team Seats" }), _jsx(TableCell, { children: "1" }), _jsx(TableCell, { children: "1" }), _jsx(TableCell, { children: "3" }), _jsx(TableCell, { children: "5" }), _jsx(TableCell, { children: "Unlimited" })] }), _jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: "Dedicated Infrastructure" }), _jsx(TableCell, { children: _jsx(XCircle, { className: "h-5 w-5 text-muted-foreground" }) }), _jsx(TableCell, { children: _jsx(XCircle, { className: "h-5 w-5 text-muted-foreground" }) }), _jsx(TableCell, { children: _jsx(XCircle, { className: "h-5 w-5 text-muted-foreground" }) }), _jsx(TableCell, { children: _jsx(XCircle, { className: "h-5 w-5 text-muted-foreground" }) }), _jsx(TableCell, { children: _jsx(CheckCircle, { className: "h-5 w-5 text-green-500" }) })] }), _jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: "API Access" }), _jsx(TableCell, { children: _jsx(XCircle, { className: "h-5 w-5 text-muted-foreground" }) }), _jsx(TableCell, { children: _jsx(XCircle, { className: "h-5 w-5 text-muted-foreground" }) }), _jsx(TableCell, { children: _jsx(CheckCircle, { className: "h-5 w-5 text-green-500" }) }), _jsx(TableCell, { children: _jsx(CheckCircle, { className: "h-5 w-5 text-green-500" }) }), _jsx(TableCell, { children: _jsx(CheckCircle, { className: "h-5 w-5 text-green-500" }) })] }), _jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: "Support" }), _jsx(TableCell, { children: "Email only" }), _jsx(TableCell, { children: "Email only" }), _jsx(TableCell, { children: "Chat Support" }), _jsx(TableCell, { children: "Priority Support" }), _jsx(TableCell, { children: "Dedicated Slack + SLA" })] }), _jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: "Overage Rate" }), _jsx(TableCell, { children: "Upgrade required" }), _jsx(TableCell, { children: "$0.02 per 1K tokens" }), _jsx(TableCell, { children: "$0.015 per 1K tokens" }), _jsx(TableCell, { children: "$0.012 per 1K tokens" }), _jsx(TableCell, { children: "Flat rate or custom SLA" })] }), _jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: "Deployment Channels" }), _jsx(TableCell, { children: "Single-channel" }), _jsx(TableCell, { children: "Multi-channel" }), _jsx(TableCell, { children: "Multi-channel" }), _jsx(TableCell, { children: "Multi-channel" }), _jsx(TableCell, { children: "Multi-channel" })] })] })] })] }) }), _jsx("section", { className: "py-12 md:py-16 bg-muted/30", children: _jsxs("div", { className: "container px-4 md:px-6", children: [_jsx("h2", { className: "text-2xl md:text-3xl font-bold text-center mb-10", children: "Frequently Asked Questions" }), _jsx("div", { className: "max-w-3xl mx-auto", children: _jsx(Accordion, { type: "single", collapsible: true, className: "w-full", children: faqs.map((faq, index) => (_jsxs(AccordionItem, { value: `item-${index}`, children: [_jsx(AccordionTrigger, { className: "text-left", children: faq.question }), _jsx(AccordionContent, { className: "text-muted-foreground", children: faq.answer })] }, index))) }) })] }) }), _jsx("section", { className: "py-12 md:py-16 bg-muted/10", children: _jsx("div", { className: "container px-4 md:px-6", children: _jsxs("div", { className: "flex flex-col items-center text-center space-y-4 max-w-2xl mx-auto", children: [_jsx("h2", { className: "text-2xl md:text-3xl font-bold", children: "Ready to get started with Akii?" }), _jsx("p", { className: "text-muted-foreground", children: "Choose a plan above or contact us to discuss your specific requirements." }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4 mt-4", children: [_jsx(Button, { size: "lg", className: "bg-green-500 hover:bg-green-600 text-white", asChild: true, children: _jsx(Link, { to: "/signup", children: "Start Free Trial" }) }), _jsx(Button, { size: "lg", variant: "outline", asChild: true, children: _jsx(Link, { to: "/contact", children: "Contact Sales" }) })] })] }) }) })] }));
};
export default Pricing;
