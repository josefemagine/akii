import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
const TopAgentsTable = ({ agents = [
    {
        id: "agent-1",
        name: "Sales Assistant",
        avatar_url: "https://injxxchotrvgvvzelhvj.supabase.co/storage/v1/object/public/images//green-robot-icon.png",
        messages: 3650,
        conversations: 842,
        rating: 4.8,
        type: "Sales",
    },
    {
        id: "agent-2",
        name: "Support Helper",
        avatar_url: "https://injxxchotrvgvvzelhvj.supabase.co/storage/v1/object/public/images//green-robot-icon.png",
        messages: 2980,
        conversations: 756,
        rating: 4.7,
        type: "Support",
    },
    {
        id: "agent-3",
        name: "Product Guide",
        avatar_url: "https://injxxchotrvgvvzelhvj.supabase.co/storage/v1/object/public/images//green-robot-icon.png",
        messages: 2450,
        conversations: 624,
        rating: 4.6,
        type: "Product",
    },
    {
        id: "agent-4",
        name: "Onboarding Agent",
        avatar_url: "https://injxxchotrvgvvzelhvj.supabase.co/storage/v1/object/public/images//green-robot-icon.png",
        messages: 1980,
        conversations: 512,
        rating: 4.9,
        type: "Onboarding",
    },
], period = "Last 30 days", }) => {
    return (_jsxs(Card, { className: "w-full", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Top Performing Agents" }) }), _jsx(CardContent, { children: agents.length === 0 ? (_jsx("div", { className: "text-center py-6", children: _jsx("p", { className: "text-sm text-muted-foreground", children: "No agent data available" }) })) : (_jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Agent" }), _jsx(TableHead, { className: "text-right", children: "Messages" }), _jsx(TableHead, { className: "text-right", children: "Conversations" }), _jsx(TableHead, { className: "text-right", children: "Rating" })] }) }), _jsx(TableBody, { children: agents.map((agent) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Avatar, { className: "h-8 w-8", children: _jsx(AvatarImage, { src: agent.avatar_url || undefined, alt: agent.name }) }), _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: agent.name }), _jsx("div", { className: "text-sm text-muted-foreground", children: agent.type })] })] }) }), _jsx(TableCell, { className: "text-right", children: agent.messages.toLocaleString() }), _jsx(TableCell, { className: "text-right", children: agent.conversations.toLocaleString() }), _jsx(TableCell, { className: "text-right", children: agent.rating.toFixed(1) })] }, agent.id))) })] })) })] }));
};
export default TopAgentsTable;
