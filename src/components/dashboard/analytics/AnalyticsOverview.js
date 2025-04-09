import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Users, Zap, BarChart3 } from "lucide-react";
const AnalyticsOverview = ({ totalMessages = 0, activeAgents = 0, totalConversations = 0, averageRating = 0, }) => {
    const stats = [
        {
            title: "Total Messages",
            value: totalMessages.toLocaleString(),
            icon: _jsx(MessageSquare, { className: "h-5 w-5 text-blue-500" }),
            description: "Messages processed by your agents",
        },
        {
            title: "Active Agents",
            value: activeAgents.toLocaleString(),
            icon: _jsx(Zap, { className: "h-5 w-5 text-purple-500" }),
            description: "Agents currently deployed",
        },
        {
            title: "Conversations",
            value: totalConversations.toLocaleString(),
            icon: _jsx(Users, { className: "h-5 w-5 text-green-500" }),
            description: "Total user conversations",
        },
        {
            title: "Average Rating",
            value: averageRating.toFixed(1) + "/5",
            icon: _jsx(BarChart3, { className: "h-5 w-5 text-yellow-500" }),
            description: "User satisfaction rating",
        },
    ];
    return (_jsx("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4", children: stats.map((stat, index) => (_jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: stat.title }), stat.icon] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: stat.value }), _jsx("p", { className: "text-xs text-muted-foreground", children: stat.description })] })] }, index))) }));
};
export default AnalyticsOverview;
