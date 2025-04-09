import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Download, ExternalLink, QrCode, Check, Code as CodeIcon, } from "lucide-react";
const DeploymentOptions = ({ agentId = "agent-123", agentName = "Sales Assistant", platforms = [
    "Website",
    "Mobile",
    "WhatsApp",
    "Telegram",
    "Shopify",
    "WordPress",
], integrationCode = {
    Website: `<script src="https://akii.io/embed.js" data-agent-id="agent-123"></script>`,
    Mobile: `import AkiiChat from 'akii-react-native';

export default function App() {
  return (
    <AkiiChat agentId="agent-123" theme="light" />
  );
}`,
    WhatsApp: `1. Send a message to +1 (555) 123-4567
2. Include the code: AKII-agent-123
3. Follow the activation instructions`,
    Telegram: `1. Search for @AkiiAIBot on Telegram
2. Start a conversation
3. Send the command: /connect agent-123`,
    Shopify: `{% section 'akii-chat-widget' %}

<!-- In your theme settings -->
{
  "agent_id": "agent-123",
  "position": "bottom-right",
  "theme": "light"
}`,
    WordPress: `// Install the Akii AI Chat plugin
// Navigate to Akii settings
// Enter your Agent ID: agent-123
// Save changes`,
}, qrCodes = {
    Website: "https://api.dicebear.com/7.x/avataaars/svg?seed=website",
    Mobile: "https://api.dicebear.com/7.x/avataaars/svg?seed=mobile",
    WhatsApp: "https://api.dicebear.com/7.x/avataaars/svg?seed=whatsapp",
    Telegram: "https://api.dicebear.com/7.x/avataaars/svg?seed=telegram",
    Shopify: "https://api.dicebear.com/7.x/avataaars/svg?seed=shopify",
    WordPress: "https://api.dicebear.com/7.x/avataaars/svg?seed=wordpress",
}, }) => {
    const [activeTab, setActiveTab] = useState(platforms[0]);
    const [copied, setCopied] = useState({});
    const handleCopy = (platform) => {
        navigator.clipboard.writeText(integrationCode[platform]);
        setCopied(Object.assign(Object.assign({}, copied), { [platform]: true }));
        setTimeout(() => {
            setCopied(Object.assign(Object.assign({}, copied), { [platform]: false }));
        }, 2000);
    };
    return (_jsxs("div", { className: "w-full bg-background p-6 rounded-lg border", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h2", { className: "text-2xl font-bold mb-2", children: "Deploy Your Agent" }), _jsxs("p", { className: "text-muted-foreground", children: ["Your AI agent ", _jsx("span", { className: "font-medium", children: agentName }), " is ready to be deployed. Choose a platform below to get the integration code or QR code for activation."] })] }), _jsxs(Tabs, { defaultValue: activeTab, onValueChange: setActiveTab, className: "w-full", children: [_jsx(TabsList, { className: "w-full justify-start mb-6 overflow-x-auto", children: platforms.map((platform) => (_jsx(TabsTrigger, { value: platform, className: "px-4 py-2", children: platform }, platform))) }), platforms.map((platform) => (_jsx(TabsContent, { value: platform, className: "mt-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { children: [platform, " Integration"] }), _jsxs(CardDescription, { children: ["Follow the instructions below to integrate your AI agent with", " ", platform, "."] })] }), _jsx(CardContent, { children: _jsxs("div", { className: "grid md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "bg-muted p-4 rounded-md relative", children: [_jsx("div", { className: "absolute top-2 right-2", children: _jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleCopy(platform), className: "h-8 w-8 p-0", children: copied[platform] ? (_jsx(Check, { className: "h-4 w-4" })) : (_jsx(Copy, { className: "h-4 w-4" })) }) }), _jsx("pre", { className: "text-xs overflow-x-auto whitespace-pre-wrap", children: integrationCode[platform] })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsxs(Button, { size: "sm", variant: "outline", className: "flex items-center gap-2", children: [_jsx(Download, { className: "h-4 w-4" }), "Download Instructions"] }), _jsxs(Button, { size: "sm", variant: "outline", className: "flex items-center gap-2", children: [_jsx(CodeIcon, { className: "h-4 w-4" }), "View API Docs"] })] })] }), _jsxs("div", { className: "flex flex-col items-center justify-center p-4 border rounded-md", children: [_jsxs("div", { className: "mb-4 text-center", children: [_jsx("h3", { className: "font-medium mb-1", children: "Quick Connect" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Scan this QR code to activate your agent" })] }), _jsx("div", { className: "bg-white p-4 rounded-md mb-4", children: _jsx("img", { src: qrCodes[platform], alt: `QR Code for ${platform}`, className: "w-40 h-40 object-contain" }) }), _jsxs(Button, { variant: "outline", size: "sm", className: "flex items-center gap-2", children: [_jsx(QrCode, { className: "h-4 w-4" }), "Download QR Code"] })] })] }) }), _jsxs(CardFooter, { className: "flex justify-between", children: [_jsxs("p", { className: "text-sm text-muted-foreground", children: ["Agent ID:", " ", _jsx("code", { className: "bg-muted px-1 py-0.5 rounded", children: agentId })] }), _jsxs(Button, { variant: "link", className: "flex items-center gap-1", children: [_jsx(ExternalLink, { className: "h-4 w-4" }), "View Integration Guide"] })] })] }) }, platform)))] }), _jsxs("div", { className: "mt-8 flex justify-end gap-4", children: [_jsx(Button, { variant: "outline", children: "Back to Testing" }), _jsx(Button, { children: "Complete Setup" })] })] }));
};
export default DeploymentOptions;
