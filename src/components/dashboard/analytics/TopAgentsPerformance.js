import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, MessageSquare, Users } from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
const TopAgentsPerformance = ({ agents = [
    {
        id: "agent-1",
        name: "Sales Assistant",
        conversations: 842,
        messages: 3650,
        rating: 4.8,
        type: "Sales",
        avatar_url: "https://injxxchotrvgvvzelhvj.supabase.co/storage/v1/object/public/images//green-robot-icon.png",
    },
    {
        id: "agent-2",
        name: "Support Helper",
        conversations: 756,
        messages: 2980,
        rating: 4.7,
        type: "Support",
        avatar_url: "https://injxxchotrvgvvzelhvj.supabase.co/storage/v1/object/public/images//green-robot-icon.png",
    },
    {
        id: "agent-3",
        name: "Product Guide",
        conversations: 624,
        messages: 2450,
        rating: 4.6,
        type: "Product",
        avatar_url: "https://injxxchotrvgvvzelhvj.supabase.co/storage/v1/object/public/images//green-robot-icon.png",
    },
    {
        id: "agent-4",
        name: "Onboarding Agent",
        conversations: 512,
        messages: 1980,
        rating: 4.9,
        type: "Onboarding",
        avatar_url: "https://injxxchotrvgvvzelhvj.supabase.co/storage/v1/object/public/images//green-robot-icon.png",
    },
], period = "Last 30 days", }) => {
    return (_jsxs(Card, { className: "bg-card", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { className: "text-lg font-medium", children: "Top Performing Agents" }), _jsx("span", { className: "text-sm text-muted-foreground", children: period })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-5", children: agents.map((agent, index) => (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Avatar, { className: "h-8 w-8", children: _jsx(AvatarImage, { src: agent.avatar_url || undefined, alt: agent.name }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium", children: agent.name }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [agent.type, " Agent"] })] })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Star, { className: "h-4 w-4 fill-yellow-400 text-yellow-400" }), _jsx("span", { className: "text-sm font-medium", children: agent.rating.toFixed(1) })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Users, { className: "h-4 w-4 text-blue-500" }), _jsxs("span", { className: "text-xs", children: [agent.conversations.toLocaleString(), " conversations"] })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(MessageSquare, { className: "h-4 w-4 text-green-500" }), _jsxs("span", { className: "text-xs", children: [agent.messages.toLocaleString(), " messages"] })] })] }), index < agents.length - 1 && (_jsx("div", { className: "h-px w-full bg-border mt-3" }))] }, index))) }) })] }));
};
export default TopAgentsPerformance;
