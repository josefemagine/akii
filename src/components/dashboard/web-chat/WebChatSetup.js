import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Copy } from "lucide-react";
export default function WebChatSetup() {
    const [activeTab, setActiveTab] = useState("appearance");
    const [chatName, setChatName] = useState("My Web Chat");
    const [welcomeMessage, setWelcomeMessage] = useState("Hello! How can I help you today?");
    const [primaryColor, setPrimaryColor] = useState("#4f46e5");
    const [position, setPosition] = useState("bottom-right");
    const [agentId, setAgentId] = useState("");
    const [isDeployed, setIsDeployed] = useState(false);
    const { toast } = useToast();
    const handleCopyCode = (text) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied",
            description: "Code copied to clipboard",
        });
    };
    const handleDeploy = () => {
        if (!chatName.trim()) {
            toast({
                title: "Error",
                description: "Please provide a name for your web chat",
                variant: "destructive",
            });
            return;
        }
        if (!agentId) {
            toast({
                title: "Error",
                description: "Please select an AI agent for your web chat",
                variant: "destructive",
            });
            return;
        }
        // In a real implementation, this would make an API call to deploy the web chat
        // For now, just simulate deployment
        setTimeout(() => {
            setIsDeployed(true);
            toast({
                title: "Success",
                description: "Web chat deployed successfully",
            });
        }, 1500);
    };
    const generateEmbedCode = () => {
        return `<script>
  (function(w, d, s, o, f, js, fjs) {
    w['AkiiWebChat'] = o;
    w[o] = w[o] || function() { (w[o].q = w[o].q || []).push(arguments) };
    js = d.createElement(s), fjs = d.getElementsByTagName(s)[0];
    js.id = o; js.src = f; js.async = 1; fjs.parentNode.insertBefore(js, fjs);
  }(window, document, 'script', 'akii', 'https://chat.akii.com/loader.js'));
  
  akii('init', {
    chatId: '${isDeployed ? "wc_" + Math.random().toString(36).substring(2, 10) : "YOUR_CHAT_ID"}',
    position: '${position}',
    primaryColor: '${primaryColor}',
    welcomeMessage: '${welcomeMessage}'
  });
</script>`;
    };
    return (_jsxs(Card, { className: "w-full shadow-sm", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: "text-xl font-bold", children: "Web Chat Setup" }), _jsx(CardDescription, { children: "Configure and deploy an AI chat widget for your website." })] }), _jsx(CardContent, { children: _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [_jsxs(TabsList, { className: "grid w-full grid-cols-3", children: [_jsx(TabsTrigger, { value: "appearance", children: "Appearance" }), _jsx(TabsTrigger, { value: "behavior", children: "Behavior" }), _jsx(TabsTrigger, { value: "deployment", children: "Deployment" })] }), _jsxs(TabsContent, { value: "appearance", className: "space-y-4 pt-4", children: [_jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "chatName", children: "Chat Name" }), _jsx(Input, { id: "chatName", value: chatName, onChange: (e) => setChatName(e.target.value), placeholder: "My Web Chat" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "primaryColor", children: "Primary Color" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Input, { id: "primaryColor", value: primaryColor, onChange: (e) => setPrimaryColor(e.target.value), placeholder: "#4f46e5" }), _jsx("div", { className: "h-10 w-10 rounded-md border", style: { backgroundColor: primaryColor } })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "welcomeMessage", children: "Welcome Message" }), _jsx(Textarea, { id: "welcomeMessage", value: welcomeMessage, onChange: (e) => setWelcomeMessage(e.target.value), placeholder: "Hello! How can I help you today?", rows: 3 })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "position", children: "Widget Position" }), _jsxs(Select, { value: position, onValueChange: setPosition, children: [_jsx(SelectTrigger, { id: "position", children: _jsx(SelectValue, { placeholder: "Select position" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "bottom-right", children: "Bottom Right" }), _jsx(SelectItem, { value: "bottom-left", children: "Bottom Left" }), _jsx(SelectItem, { value: "top-right", children: "Top Right" }), _jsx(SelectItem, { value: "top-left", children: "Top Left" })] })] })] }), _jsxs("div", { className: "rounded-md border p-4 mt-4", children: [_jsx("h3", { className: "text-sm font-medium mb-2", children: "Preview" }), _jsx("div", { className: "relative h-64 w-full rounded-md bg-gray-100 dark:bg-gray-800 overflow-hidden", children: _jsx("div", { className: "absolute bottom-4 right-4", children: _jsx("div", { className: "flex h-12 w-12 items-center justify-center rounded-full shadow-lg", style: { backgroundColor: primaryColor }, children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "text-white", children: _jsx("path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" }) }) }) }) })] })] }), _jsxs(TabsContent, { value: "behavior", className: "space-y-4 pt-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "agent", children: "Select AI Agent" }), _jsxs(Select, { value: agentId, onValueChange: setAgentId, children: [_jsx(SelectTrigger, { id: "agent", children: _jsx(SelectValue, { placeholder: "Select an AI agent" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "agent_1", children: "General Assistant" }), _jsx(SelectItem, { value: "agent_2", children: "Technical Support" }), _jsx(SelectItem, { value: "agent_3", children: "Sales Representative" }), _jsx(SelectItem, { value: "agent_4", children: "Customer Service" })] })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "space-y-0.5", children: [_jsx(Label, { htmlFor: "sendToCRM", children: "Send to CRM" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Sync conversations with your CRM system" })] }), _jsx(Switch, { id: "sendToCRM" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "space-y-0.5", children: [_jsx(Label, { htmlFor: "collectEmail", children: "Collect Email" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Ask for visitor's email before starting chat" })] }), _jsx(Switch, { id: "collectEmail" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "space-y-0.5", children: [_jsx(Label, { htmlFor: "autoOpen", children: "Auto Open" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Automatically open chat after 30 seconds" })] }), _jsx(Switch, { id: "autoOpen" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "space-y-0.5", children: [_jsx(Label, { htmlFor: "persistent", children: "Persistent Chat" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Save chat history between page visits" })] }), _jsx(Switch, { id: "persistent", defaultChecked: true })] })] }), _jsxs("div", { className: "space-y-2 mt-4", children: [_jsx(Label, { htmlFor: "targetPages", children: "Pages to Show Chat" }), _jsxs(Select, { defaultValue: "all", children: [_jsx(SelectTrigger, { id: "targetPages", children: _jsx(SelectValue, { placeholder: "Select pages" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Pages" }), _jsx(SelectItem, { value: "homepage", children: "Homepage Only" }), _jsx(SelectItem, { value: "product", children: "Product Pages" }), _jsx(SelectItem, { value: "custom", children: "Custom Selection" })] })] })] })] }), _jsxs(TabsContent, { value: "deployment", className: "space-y-4 pt-4", children: [isDeployed ? (_jsx("div", { className: "rounded-md border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/30 p-4 text-green-800 dark:text-green-200", children: _jsxs("div", { className: "flex", children: [_jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "mr-3", children: [_jsx("path", { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14" }), _jsx("polyline", { points: "22 4 12 14.01 9 11.01" })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-medium", children: "Web Chat Deployed!" }), _jsx("p", { className: "text-sm", children: "Your web chat is now live and ready to use. Add the code below to your website to enable the chat widget." })] })] }) })) : (_jsx("div", { className: "rounded-md border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/30 p-4 text-blue-800 dark:text-blue-200", children: _jsxs("div", { className: "flex", children: [_jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "mr-3", children: [_jsx("circle", { cx: "12", cy: "12", r: "10" }), _jsx("line", { x1: "12", y1: "16", x2: "12", y2: "12" }), _jsx("line", { x1: "12", y1: "8", x2: "12.01", y2: "8" })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-medium", children: "Ready to Deploy" }), _jsx("p", { className: "text-sm", children: "Configure your web chat settings in the Appearance and Behavior tabs, then click the Deploy button below." })] })] }) })), _jsxs("div", { className: "rounded-md bg-muted p-4", children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsx("h3", { className: "text-sm font-medium", children: "Website Embed Code" }), _jsxs(Button, { variant: "ghost", size: "sm", onClick: () => handleCopyCode(generateEmbedCode()), children: [_jsx(Copy, { className: "h-4 w-4 mr-2" }), "Copy"] })] }), _jsx("pre", { className: "bg-slate-950 text-slate-50 p-3 rounded-md overflow-x-auto text-xs", children: generateEmbedCode() })] }), _jsx("div", { className: "rounded-md border p-4 bg-amber-50 dark:bg-amber-900/30 dark:border-amber-700 text-amber-800 dark:text-amber-200", children: _jsxs("div", { className: "flex", children: [_jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "text-amber-500 dark:text-amber-400 mr-2", children: [_jsx("path", { d: "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" }), _jsx("line", { x1: "12", x2: "12", y1: "9", y2: "13" }), _jsx("line", { x1: "12", x2: "12.01", y1: "17", y2: "17" })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium", children: "Important Note" }), _jsx("p", { className: "text-xs text-amber-700 dark:text-amber-300 mt-1", children: "Make sure to deploy your web chat before adding the code to your website. The chat widget will not work until it's deployed." })] })] }) }), _jsx(Button, { onClick: handleDeploy, className: "w-full mt-4", disabled: isDeployed, children: isDeployed ? "Deployed" : "Deploy Web Chat" })] })] }) })] }));
}
