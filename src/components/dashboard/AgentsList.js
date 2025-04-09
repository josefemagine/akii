import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Play, Pause, Copy, Trash2, ExternalLink, Plus, } from "lucide-react";
const AgentsList = ({ agents = [
    {
        id: "1",
        name: "Sales Assistant",
        description: "Handles product inquiries and sales questions",
        status: "active",
        type: "Sales",
        platform: "Website",
        lastUpdated: "2023-06-15",
        messageCount: 1243,
        avatar: "https://injxxchotrvgvvzelhvj.supabase.co/storage/v1/object/public/images//green-robot-icon.png",
    },
    {
        id: "2",
        name: "Support Bot",
        description: "Provides technical support and troubleshooting",
        status: "active",
        type: "Support",
        platform: "WhatsApp",
        lastUpdated: "2023-06-10",
        messageCount: 856,
        avatar: "https://injxxchotrvgvvzelhvj.supabase.co/storage/v1/object/public/images//green-robot-icon.png",
    },
    {
        id: "3",
        name: "Product Recommender",
        description: "Suggests products based on customer preferences",
        status: "paused",
        type: "Sales",
        platform: "Shopify",
        lastUpdated: "2023-06-05",
        messageCount: 421,
        avatar: "https://injxxchotrvgvvzelhvj.supabase.co/storage/v1/object/public/images//green-robot-icon.png",
    },
    {
        id: "4",
        name: "FAQ Assistant",
        description: "Answers frequently asked questions",
        status: "draft",
        type: "Support",
        platform: "Telegram",
        lastUpdated: "2023-06-01",
        messageCount: 0,
        avatar: "https://injxxchotrvgvvzelhvj.supabase.co/storage/v1/object/public/images//green-robot-icon.png",
    },
], onEdit = () => { }, onDelete = () => { }, onToggleStatus = () => { }, onDuplicate = () => { }, onView = () => { }, }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case "active":
                return "bg-green-100 text-green-800 border-green-200";
            case "paused":
                return "bg-amber-100 text-amber-800 border-amber-200";
            case "draft":
                return "bg-slate-100 text-slate-800 border-slate-200";
            default:
                return "";
        }
    };
    const getPlatformIcon = (platform) => {
        switch (platform.toLowerCase()) {
            case "website":
                return "🌐";
            case "whatsapp":
                return "📱";
            case "shopify":
                return "🛒";
            case "telegram":
                return "📨";
            case "wordpress":
                return "📝";
            case "mobile":
                return "📲";
            default:
                return "💬";
        }
    };
    return (_jsxs(Card, { className: "w-full bg-white shadow-sm border-gray-100", children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between pb-2", children: [_jsx(CardTitle, { className: "text-xl font-bold", children: "AI Agents" }), _jsx(Button, { size: "sm", className: "bg-primary hover:bg-primary/90", asChild: true, children: _jsxs(Link, { to: "/dashboard/ai-instances/new", children: [_jsx(Plus, { className: "mr-2 h-4 w-4" }), " Create New Agent"] }) })] }), _jsx(CardContent, { children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-gray-100", children: [_jsx("th", { className: "text-left py-3 px-4 text-sm font-medium text-gray-500", children: "Name" }), _jsx("th", { className: "text-left py-3 px-4 text-sm font-medium text-gray-500", children: "Status" }), _jsx("th", { className: "text-left py-3 px-4 text-sm font-medium text-gray-500", children: "Type" }), _jsx("th", { className: "text-left py-3 px-4 text-sm font-medium text-gray-500", children: "Platform" }), _jsx("th", { className: "text-left py-3 px-4 text-sm font-medium text-gray-500", children: "Last Updated" }), _jsx("th", { className: "text-left py-3 px-4 text-sm font-medium text-gray-500", children: "Messages" }), _jsx("th", { className: "text-right py-3 px-4 text-sm font-medium text-gray-500", children: "Actions" })] }) }), _jsx("tbody", { children: agents.map((agent) => (_jsxs("tr", { className: "border-b border-gray-50 hover:bg-gray-50/50", children: [_jsxs("td", { className: "py-3 px-4", children: [_jsx("div", { className: "font-medium", children: agent.name }), _jsx("div", { className: "text-sm text-muted-foreground", children: agent.description })] }), _jsx("td", { className: "py-3 px-4", children: _jsx(Badge, { className: `${getStatusColor(agent.status)} capitalize`, children: agent.status }) }), _jsx("td", { className: "py-3 px-4", children: agent.type }), _jsx("td", { className: "py-3 px-4", children: _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("span", { children: getPlatformIcon(agent.platform) }), _jsx("span", { children: agent.platform })] }) }), _jsx("td", { className: "py-3 px-4 text-gray-500", children: agent.lastUpdated }), _jsx("td", { className: "py-3 px-4 text-gray-500", children: agent.messageCount.toLocaleString() }), _jsx("td", { className: "py-3 px-4 text-right", children: _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", children: [_jsx(MoreHorizontal, { className: "h-4 w-4" }), _jsx("span", { className: "sr-only", children: "Open menu" })] }) }), _jsxs(DropdownMenuContent, { align: "end", children: [_jsxs(DropdownMenuItem, { onClick: () => onView(agent.id), children: [_jsx(ExternalLink, { className: "mr-2 h-4 w-4" }), _jsx("span", { children: "View" })] }), _jsxs(DropdownMenuItem, { onClick: () => onEdit(agent.id), children: [_jsx(Edit, { className: "mr-2 h-4 w-4" }), _jsx("span", { children: "Edit" })] }), agent.status !== "draft" && (_jsx(DropdownMenuItem, { onClick: () => onToggleStatus(agent.id, agent.status === "active" ? "paused" : "active"), children: agent.status === "active" ? (_jsxs(_Fragment, { children: [_jsx(Pause, { className: "mr-2 h-4 w-4" }), _jsx("span", { children: "Pause" })] })) : (_jsxs(_Fragment, { children: [_jsx(Play, { className: "mr-2 h-4 w-4" }), _jsx("span", { children: "Activate" })] })) })), _jsxs(DropdownMenuItem, { onClick: () => onDuplicate(agent.id), children: [_jsx(Copy, { className: "mr-2 h-4 w-4" }), _jsx("span", { children: "Duplicate" })] }), _jsx(DropdownMenuSeparator, {}), _jsxs(DropdownMenuItem, { onClick: () => onDelete(agent.id), className: "text-red-600 focus:text-red-600", children: [_jsx(Trash2, { className: "mr-2 h-4 w-4" }), _jsx("span", { children: "Delete" })] })] })] }) })] }, agent.id))) })] }) }) })] }));
};
export default AgentsList;
