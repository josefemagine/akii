import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ArrowUpRight, MessageSquare, Users, Zap } from "lucide-react";
const StatCard = ({ title = "Stat", value = "0", change, changeType = "neutral", icon = _jsx(Zap, { className: "h-4 w-4" }), }) => {
    return (_jsxs(Card, { className: "bg-white dark:bg-gray-950", children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: title }), _jsx("div", { className: "rounded-full bg-gray-100 p-2 dark:bg-gray-800", children: icon })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: value }), change && (_jsxs("p", { className: "mt-1 flex items-center text-xs", children: [_jsx("span", { className: `mr-1 ${changeType === "increase"
                                    ? "text-green-500"
                                    : changeType === "decrease"
                                        ? "text-red-500"
                                        : "text-gray-500"}`, children: change }), changeType === "increase" && (_jsx(ArrowUpRight, { className: "h-3 w-3 text-green-500" })), changeType === "decrease" && (_jsx(ArrowUpRight, { className: "h-3 w-3 rotate-180 text-red-500" })), _jsx("span", { className: "text-gray-500 dark:text-gray-400", children: "from last month" })] }))] })] }));
};
const StatCards = ({ stats = {
    activeAgents: 3,
    totalMessages: 1248,
    activeUsers: 36,
    usagePercentage: 68,
}, }) => {
    return (_jsxs("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4", children: [_jsx(StatCard, { title: "Active Agents", value: stats.activeAgents.toString(), change: "+1", changeType: "increase", icon: _jsx(Zap, { className: "h-4 w-4" }) }), _jsx(StatCard, { title: "Total Messages", value: stats.totalMessages.toLocaleString(), change: "+12.5%", changeType: "increase", icon: _jsx(MessageSquare, { className: "h-4 w-4" }) }), _jsx(StatCard, { title: "Active Users", value: stats.activeUsers.toString(), change: "-4", changeType: "decrease", icon: _jsx(Users, { className: "h-4 w-4" }) }), _jsx(StatCard, { title: "Usage", value: `${stats.usagePercentage}%`, change: "+5%", changeType: "increase", icon: _jsx(Zap, { className: "h-4 w-4" }) })] }));
};
export default StatCards;
