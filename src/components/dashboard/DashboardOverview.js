import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import StatCards from "./StatCards";
import AgentsList from "./AgentsList";
import RecentActivity from "./RecentActivity";
import QuickActions from "./QuickActions";
import SubscriptionUsage from "./SubscriptionUsage";
const DashboardOverview = ({ stats = {
    activeAgents: 5,
    totalMessages: 1248,
    activeUsers: 36,
    usagePercentage: 68,
}, onCreateAgent = () => { }, onEditAgent = () => { }, onDeleteAgent = () => { }, onToggleAgentStatus = () => { }, onDuplicateAgent = () => { }, onViewAgent = () => { }, }) => {
    return (_jsxs("div", { className: "flex flex-col gap-6 bg-gray-50 dark:bg-gray-900 min-h-screen", children: [_jsxs("div", { className: "flex flex-col gap-2", children: [_jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Dashboard" }), _jsx("p", { className: "text-muted-foreground", children: "Overview of your AI agents and platform activity." })] }), _jsx(StatCards, { stats: stats }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsx("div", { className: "lg:col-span-2", children: _jsx(AgentsList, { onEdit: onEditAgent, onDelete: onDeleteAgent, onToggleStatus: onToggleAgentStatus, onDuplicate: onDuplicateAgent, onView: onViewAgent }) }), _jsxs("div", { className: "lg:col-span-1 space-y-6", children: [_jsx(SubscriptionUsage, {}), _jsx(RecentActivity, {})] })] }), _jsx(QuickActions, {})] }));
};
export default DashboardOverview;
