import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Globe, Smartphone, MessageCircle, ShoppingBag, FileCode, ArrowRight, } from "lucide-react";
const PlatformSelector = ({ platforms = [
    {
        id: "website",
        name: "Website",
        description: "Embed your AI agent on your website for instant customer support.",
        icon: _jsx(Globe, { className: "h-8 w-8 text-blue-500" }),
        enabled: true,
    },
    {
        id: "mobile",
        name: "Mobile App",
        description: "Integrate your AI agent into your iOS and Android applications.",
        icon: _jsx(Smartphone, { className: "h-8 w-8 text-green-500" }),
        enabled: false,
    },
    {
        id: "whatsapp",
        name: "WhatsApp",
        description: "Connect your AI agent to WhatsApp for messaging support.",
        icon: _jsx(MessageCircle, { className: "h-8 w-8 text-emerald-500" }),
        enabled: false,
    },
    {
        id: "telegram",
        name: "Telegram",
        description: "Deploy your AI agent as a Telegram bot for your customers.",
        icon: _jsx(MessageCircle, { className: "h-8 w-8 text-blue-400" }),
        enabled: false,
    },
    {
        id: "shopify",
        name: "Shopify",
        description: "Add your AI agent to your Shopify store for sales assistance.",
        icon: _jsx(ShoppingBag, { className: "h-8 w-8 text-purple-500" }),
        enabled: false,
    },
    {
        id: "wordpress",
        name: "WordPress",
        description: "Install your AI agent on your WordPress site with our plugin.",
        icon: _jsx(FileCode, { className: "h-8 w-8 text-orange-500" }),
        enabled: false,
    },
], onPlatformToggle = (platformId, enabled) => {
    console.log(`Platform ${platformId} toggled to ${enabled}`);
}, }) => {
    const handleToggle = (platformId, currentState) => {
        onPlatformToggle(platformId, !currentState);
    };
    return (_jsxs("div", { className: "w-full bg-background p-6 rounded-lg", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h2", { className: "text-2xl font-bold mb-2", children: "Choose Platforms" }), _jsx("p", { className: "text-muted-foreground", children: "Select the platforms where you want to deploy your AI agent. You can enable or disable platforms at any time." })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: platforms.map((platform) => (_jsxs(Card, { className: "overflow-hidden border-2 hover:border-primary/50 transition-all duration-200", children: [_jsxs(CardHeader, { className: "pb-2", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("div", { className: "p-2 rounded-lg bg-background/80", children: platform.icon }), _jsx(Switch, { checked: platform.enabled, onCheckedChange: () => handleToggle(platform.id, platform.enabled), "aria-label": `Enable ${platform.name}` })] }), _jsx(CardTitle, { className: "mt-4", children: platform.name }), _jsx(CardDescription, { children: platform.description })] }), _jsx(CardContent, { children: _jsx("div", { className: "h-12 flex items-center justify-center", children: platform.enabled ? (_jsx("span", { className: "text-sm font-medium text-green-500", children: "Enabled" })) : (_jsx("span", { className: "text-sm font-medium text-muted-foreground", children: "Disabled" })) }) }), _jsx(CardFooter, { className: "border-t bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer", children: _jsxs("div", { className: "flex items-center justify-center w-full text-sm font-medium", children: ["Configure", _jsx(ArrowRight, { className: "ml-2 h-4 w-4" })] }) })] }, platform.id))) }), _jsx("div", { className: "mt-8 flex justify-end", children: _jsx("p", { className: "text-sm text-muted-foreground", children: "You can change these settings later in your agent configuration." }) })] }));
};
export default PlatformSelector;
