import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Bot, Plus, Search, MoreVertical, Edit, Copy, Trash2, Globe, Smartphone, MessageCircle, ShoppingBag, FileCode, } from "lucide-react";
const mockAgents = [
    {
        id: "agent-1",
        name: "Customer Support AI",
        description: "Handles customer inquiries and support tickets",
        platforms: ["website", "mobile"],
        status: "active",
        lastUpdated: "2023-07-01",
        messageCount: 1234,
        avatar: "https://injxxchotrvgvvzelhvj.supabase.co/storage/v1/object/public/images//green-robot-icon.png",
        version: "1.0",
    },
    {
        id: "agent-2",
        name: "Sales Assistant",
        description: "Helps with product recommendations and sales",
        platforms: ["whatsapp", "telegram"],
        status: "active",
        lastUpdated: "2023-06-25",
        messageCount: 856,
        avatar: "https://injxxchotrvgvvzelhvj.supabase.co/storage/v1/object/public/images//green-robot-icon.png",
        version: "1.0",
    },
    {
        id: "agent-3",
        name: "E-commerce Assistant",
        description: "Helps shoppers find products and complete purchases",
        platforms: ["shopify", "website"],
        status: "active",
        lastUpdated: "2023-06-15",
        messageCount: 567,
        avatar: "https://injxxchotrvgvvzelhvj.supabase.co/storage/v1/object/public/images//green-robot-icon.png",
        version: "1.0",
    },
    {
        id: "agent-4",
        name: "Blog Content Helper",
        description: "Assists with content creation and blog management",
        platforms: ["wordpress"],
        status: "draft",
        lastUpdated: "2023-06-18",
        messageCount: 0,
        avatar: "https://injxxchotrvgvvzelhvj.supabase.co/storage/v1/object/public/images//green-robot-icon.png",
        version: "1.0",
    },
    {
        id: "agent-3-clone",
        name: "E-commerce Assistant (Clone)",
        description: "Helps shoppers find products and complete purchases - cloned version",
        platforms: ["shopify", "website"],
        status: "draft",
        lastUpdated: "2023-06-01",
        messageCount: 0,
        avatar: "https://injxxchotrvgvvzelhvj.supabase.co/storage/v1/object/public/images//green-robot-icon.png",
        version: "1.0",
        parentId: "agent-3",
        isCloned: true,
    },
];
const getPlatformIcon = (platform) => {
    switch (platform) {
        case "website":
            return _jsx(Globe, { className: "h-4 w-4 text-blue-500" });
        case "mobile":
            return _jsx(Smartphone, { className: "h-4 w-4 text-green-500" });
        case "whatsapp":
            return _jsx(MessageCircle, { className: "h-4 w-4 text-emerald-500" });
        case "telegram":
            return _jsx(MessageCircle, { className: "h-4 w-4 text-blue-400" });
        case "shopify":
            return _jsx(ShoppingBag, { className: "h-4 w-4 text-purple-500" });
        case "wordpress":
            return _jsx(FileCode, { className: "h-4 w-4 text-orange-500" });
        default:
            return _jsx(Bot, { className: "h-4 w-4" });
    }
};
const getStatusColor = (status) => {
    switch (status) {
        case "active":
            return "bg-green-500";
        case "inactive":
            return "bg-amber-500";
        case "draft":
            return "bg-gray-400";
        default:
            return "bg-gray-400";
    }
};
const Agents = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [agents, setAgents] = useState(mockAgents);
    const filteredAgents = agents.filter((agent) => agent.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const handleDeleteAgent = (agentId) => {
        setAgents(agents.filter((agent) => agent.id !== agentId));
    };
    const handleCloneAgent = (agentId) => {
        const agentToClone = agents.find((agent) => agent.id === agentId);
        if (!agentToClone)
            return;
        const clonedAgent = Object.assign(Object.assign({}, agentToClone), { id: `${agentId}-clone-${Date.now()}`, name: `${agentToClone.name} (Clone)`, status: "draft", lastUpdated: new Date().toISOString().split("T")[0], messageCount: 0, parentId: agentId, isCloned: true });
        setAgents([...agents, clonedAgent]);
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h1", { className: "text-3xl font-bold", children: "AI Agents" }), _jsx(Button, { asChild: true, children: _jsxs(Link, { to: "/dashboard/agent-setup", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), " Create Agent"] }) })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("div", { className: "relative flex-1 max-w-sm", children: [_jsx(Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }), _jsx(Input, { type: "search", placeholder: "Search agents...", className: "pl-8", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value) })] }), _jsxs("select", { className: "bg-background border rounded-md px-3 py-2 text-sm", children: [_jsx("option", { children: "All Statuses" }), _jsx("option", { children: "Active" }), _jsx("option", { children: "Inactive" }), _jsx("option", { children: "Draft" })] }), _jsxs("select", { className: "bg-background border rounded-md px-3 py-2 text-sm", children: [_jsx("option", { children: "All Platforms" }), _jsx("option", { children: "Website" }), _jsx("option", { children: "Mobile" }), _jsx("option", { children: "WhatsApp" }), _jsx("option", { children: "Telegram" }), _jsx("option", { children: "Shopify" }), _jsx("option", { children: "WordPress" })] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: filteredAgents.map((agent) => (_jsxs(Card, { className: "overflow-hidden", children: [_jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("div", { className: "h-12 w-12 rounded-full overflow-hidden bg-primary/10", children: _jsx("img", { src: "https://injxxchotrvgvvzelhvj.supabase.co/storage/v1/object/public/images//green-robot-icon.png", alt: agent.name, className: "h-full w-full object-cover" }) }), _jsxs("div", { children: [_jsx("h3", { className: "font-medium", children: agent.name }), _jsxs("div", { className: "flex items-center space-x-1 mt-1", children: [_jsx("span", { className: `h-2 w-2 rounded-full ${getStatusColor(agent.status)}` }), _jsx("span", { className: "text-xs text-muted-foreground capitalize", children: agent.status })] })] })] }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { variant: "ghost", size: "icon", children: [_jsx(MoreVertical, { className: "h-4 w-4" }), _jsx("span", { className: "sr-only", children: "Menu" })] }) }), _jsxs(DropdownMenuContent, { align: "end", children: [_jsx(DropdownMenuItem, { asChild: true, children: _jsxs(Link, { to: `/dashboard/agent-setup?id=${agent.id}`, children: [_jsx(Edit, { className: "h-4 w-4 mr-2" }), " Edit"] }) }), _jsxs(DropdownMenuItem, { onClick: () => handleCloneAgent(agent.id), children: [_jsx(Copy, { className: "h-4 w-4 mr-2" }), " Clone"] }), _jsxs(DropdownMenuItem, { className: "text-destructive focus:text-destructive", onClick: () => handleDeleteAgent(agent.id), children: [_jsx(Trash2, { className: "h-4 w-4 mr-2" }), " Delete"] })] })] })] }), _jsx("p", { className: "text-sm text-muted-foreground mt-4 line-clamp-2", children: agent.description }), _jsxs("div", { className: "mt-4", children: [_jsx("div", { className: "text-xs text-muted-foreground mb-1", children: "Platforms" }), _jsx("div", { className: "flex flex-wrap gap-1", children: agent.platforms.map((platform) => (_jsxs("div", { className: "flex items-center space-x-1 bg-muted px-2 py-1 rounded-md text-xs", children: [getPlatformIcon(platform), _jsx("span", { className: "capitalize", children: platform })] }, platform))) })] }), agent.languages && agent.languages.length > 0 && (_jsxs("div", { className: "mt-3", children: [_jsx("div", { className: "text-xs text-muted-foreground mb-1", children: "Languages" }), _jsx("div", { className: "flex flex-wrap gap-1", children: agent.languages.map((language) => (_jsx("div", { className: "bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded-md text-xs", children: language }, language))) })] })), agent.industry && (_jsxs("div", { className: "mt-3 text-xs", children: [_jsx("span", { className: "text-muted-foreground", children: "Industry: " }), _jsx("span", { className: "font-medium", children: agent.industry })] })), _jsxs("div", { className: "flex justify-between mt-4 text-xs text-muted-foreground", children: [_jsxs("div", { children: ["Messages: ", agent.messageCount.toLocaleString()] }), _jsxs("div", { className: "flex items-center gap-2", children: [agent.version && (_jsxs("span", { className: "bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded-full text-[10px]", children: ["v", agent.version] })), agent.isCloned && (_jsx("span", { className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-1.5 py-0.5 rounded-full text-[10px]", children: "Clone" })), _jsxs("span", { children: ["Updated: ", agent.lastUpdated] })] })] })] }), _jsxs(CardFooter, { className: "bg-muted/50 p-4 flex justify-between", children: [_jsx(Button, { variant: "outline", size: "sm", asChild: true, children: _jsx(Link, { to: `/dashboard/agent/${agent.id}/analytics`, children: "Analytics" }) }), _jsx(Button, { size: "sm", asChild: true, children: _jsx(Link, { to: `/dashboard/agent/${agent.id}/conversations`, children: "View Conversations" }) })] })] }, agent.id))) }), filteredAgents.length === 0 && (_jsxs("div", { className: "text-center py-12", children: [_jsx(Bot, { className: "h-12 w-12 mx-auto text-muted-foreground opacity-20" }), _jsx("h3", { className: "mt-4 text-lg font-medium", children: "No agents found" }), _jsx("p", { className: "text-muted-foreground mt-2", children: searchQuery
                            ? `No agents matching "${searchQuery}"`
                            : "Create your first AI agent to get started" }), _jsx(Button, { className: "mt-4", asChild: true, children: _jsxs(Link, { to: "/dashboard/agent-setup", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), " Create Agent"] }) })] }))] }));
};
export default Agents;
