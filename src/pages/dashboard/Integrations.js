import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, MessageCircle, ShoppingBag, FileCode, Link2, Check, ExternalLink, } from "lucide-react";
const integrations = [
    {
        id: "whatsapp",
        name: "WhatsApp",
        description: "Connect your AI agents to WhatsApp for messaging support.",
        icon: _jsx(MessageCircle, { className: "h-8 w-8 text-emerald-500" }),
        status: "connected",
        category: "messaging",
    },
    {
        id: "telegram",
        name: "Telegram",
        description: "Deploy your AI agents as Telegram bots for your customers.",
        icon: _jsx(MessageCircle, { className: "h-8 w-8 text-blue-400" }),
        status: "not_connected",
        category: "messaging",
    },
    {
        id: "shopify",
        name: "Shopify",
        description: "Add your AI agents to your Shopify store for sales assistance.",
        icon: _jsx(ShoppingBag, { className: "h-8 w-8 text-purple-500" }),
        status: "connected",
        category: "ecommerce",
    },
    {
        id: "wordpress",
        name: "WordPress",
        description: "Install your AI agents on your WordPress site with our plugin.",
        icon: _jsx(FileCode, { className: "h-8 w-8 text-orange-500" }),
        status: "not_connected",
        category: "cms",
    },
    {
        id: "zapier",
        name: "Zapier",
        description: "Connect your AI agents to thousands of apps via Zapier.",
        icon: _jsx(Link2, { className: "h-8 w-8 text-red-500" }),
        status: "not_connected",
        category: "other",
    },
    {
        id: "slack",
        name: "Slack",
        description: "Deploy your AI agents in your Slack workspace.",
        icon: _jsx(MessageCircle, { className: "h-8 w-8 text-purple-600" }),
        status: "not_connected",
        category: "messaging",
    },
    {
        id: "woocommerce",
        name: "WooCommerce",
        description: "Add your AI agents to your WooCommerce store.",
        icon: _jsx(ShoppingBag, { className: "h-8 w-8 text-blue-600" }),
        status: "not_connected",
        category: "ecommerce",
    },
    {
        id: "webflow",
        name: "Webflow",
        description: "Add your AI agents to your Webflow site.",
        icon: _jsx(Globe, { className: "h-8 w-8 text-blue-500" }),
        status: "not_connected",
        category: "cms",
    },
];
const Integrations = () => {
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold", children: "Integrations" }), _jsx("p", { className: "text-muted-foreground mt-1", children: "Connect your AI agents to various platforms and services." })] }), _jsxs(Tabs, { defaultValue: "all", children: [_jsxs(TabsList, { children: [_jsx(TabsTrigger, { value: "all", children: "All" }), _jsx(TabsTrigger, { value: "messaging", children: "Messaging" }), _jsx(TabsTrigger, { value: "ecommerce", children: "E-commerce" }), _jsx(TabsTrigger, { value: "cms", children: "CMS" }), _jsx(TabsTrigger, { value: "other", children: "Other" })] }), _jsx(TabsContent, { value: "all", className: "mt-6", children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: integrations.map((integration) => (_jsx(IntegrationCard, { integration: integration }, integration.id))) }) }), _jsx(TabsContent, { value: "messaging", className: "mt-6", children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: integrations
                                .filter((i) => i.category === "messaging")
                                .map((integration) => (_jsx(IntegrationCard, { integration: integration }, integration.id))) }) }), _jsx(TabsContent, { value: "ecommerce", className: "mt-6", children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: integrations
                                .filter((i) => i.category === "ecommerce")
                                .map((integration) => (_jsx(IntegrationCard, { integration: integration }, integration.id))) }) }), _jsx(TabsContent, { value: "cms", className: "mt-6", children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: integrations
                                .filter((i) => i.category === "cms")
                                .map((integration) => (_jsx(IntegrationCard, { integration: integration }, integration.id))) }) }), _jsx(TabsContent, { value: "other", className: "mt-6", children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: integrations
                                .filter((i) => i.category === "other")
                                .map((integration) => (_jsx(IntegrationCard, { integration: integration }, integration.id))) }) })] })] }));
};
const IntegrationCard = ({ integration }) => {
    return (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsx("div", { className: "p-2 rounded-lg bg-background/80", children: integration.icon }), integration.status === "connected" && (_jsxs("div", { className: "flex items-center text-xs font-medium text-green-500", children: [_jsx(Check, { className: "mr-1 h-3 w-3" }), " Connected"] }))] }), _jsx(CardTitle, { className: "mt-4", children: integration.name }), _jsx(CardDescription, { children: integration.description })] }), _jsxs(CardFooter, { className: "flex justify-between", children: [_jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(ExternalLink, { className: "mr-2 h-4 w-4" }), " Learn More"] }), _jsx(Button, { size: "sm", children: integration.status === "connected" ? "Configure" : "Connect" })] })] }));
};
export default Integrations;
