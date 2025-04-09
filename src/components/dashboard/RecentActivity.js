import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { MessageSquare, Bell, FileText, AlertCircle, CheckCircle2, } from "lucide-react";
const getActivityIcon = (type) => {
    switch (type) {
        case "message":
            return _jsx(MessageSquare, { className: "h-4 w-4" });
        case "notification":
            return _jsx(Bell, { className: "h-4 w-4" });
        case "document":
            return _jsx(FileText, { className: "h-4 w-4" });
        case "alert":
            return _jsx(AlertCircle, { className: "h-4 w-4" });
        case "success":
            return _jsx(CheckCircle2, { className: "h-4 w-4" });
        default:
            return _jsx(Bell, { className: "h-4 w-4" });
    }
};
const getStatusColor = (status) => {
    switch (status) {
        case "warning":
            return "bg-yellow-500";
        case "error":
            return "bg-red-500";
        case "success":
            return "bg-green-500";
        case "info":
        default:
            return "bg-blue-500";
    }
};
const RecentActivity = ({ activities = defaultActivities, maxItems = 5, }) => {
    const displayActivities = activities.slice(0, maxItems);
    return (_jsxs(Card, { className: "h-full bg-white dark:bg-gray-800", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg font-medium", children: "Recent Activity" }) }), _jsx(CardContent, { className: "space-y-4 overflow-auto max-h-[320px] pb-2", children: displayActivities.map((activity) => (_jsxs("div", { className: "flex items-start space-x-4 pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0", children: [_jsx("div", { className: "flex-shrink-0", children: activity.user ? (_jsx(Avatar, { children: activity.user.avatar ? (_jsx(AvatarImage, { src: activity.user.avatar, alt: activity.user.name })) : (_jsx(AvatarFallback, { children: activity.user.initials })) })) : (_jsx("div", { className: `flex items-center justify-center w-10 h-10 rounded-full ${getStatusColor(activity.status)}`, children: getActivityIcon(activity.type) })) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100 truncate", children: activity.title }), _jsx("span", { className: "text-xs text-gray-500 dark:text-gray-400", children: activity.time })] }), _jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400 mt-1", children: activity.description }), activity.status && (_jsx("div", { className: "mt-2", children: _jsx(Badge, { variant: activity.status === "error"
                                            ? "destructive"
                                            : activity.status === "success"
                                                ? "default"
                                                : activity.status === "warning"
                                                    ? "secondary"
                                                    : "outline", className: "text-xs", children: activity.status.charAt(0).toUpperCase() +
                                            activity.status.slice(1) }) }))] })] }, activity.id))) })] }));
};
const defaultActivities = [
    {
        id: "1",
        type: "message",
        title: "New conversation started",
        description: "Customer initiated a chat with Sales Agent",
        time: "5 min ago",
        user: {
            name: "John Doe",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
            initials: "JD",
        },
        status: "info",
    },
    {
        id: "2",
        type: "document",
        title: "Document uploaded",
        description: "Product catalog added to training data",
        time: "1 hour ago",
        status: "success",
    },
    {
        id: "3",
        type: "alert",
        title: "Agent training completed",
        description: "Support Agent v2 is ready for deployment",
        time: "3 hours ago",
        status: "success",
    },
    {
        id: "4",
        type: "notification",
        title: "Subscription update",
        description: "Your plan will renew in 3 days",
        time: "Yesterday",
        status: "warning",
    },
    {
        id: "5",
        type: "message",
        title: "WhatsApp integration",
        description: "WhatsApp channel connected successfully",
        time: "2 days ago",
        user: {
            name: "Sarah Miller",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
            initials: "SM",
        },
    },
    {
        id: "6",
        type: "alert",
        title: "API rate limit reached",
        description: "Consider upgrading your plan for higher limits",
        time: "3 days ago",
        status: "error",
    },
];
export default RecentActivity;
