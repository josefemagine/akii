import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { PlusCircle, Upload, MessageSquare, Settings, BarChart, Zap, } from "lucide-react";
import { cn } from "@/lib/utils";
const QuickAction = ({ title = "Action Title", description = "Action description goes here", icon = _jsx(PlusCircle, { className: "h-6 w-6" }), variant = "outline", onClick = () => { }, }) => {
    return (_jsxs(Button, { variant: variant, onClick: onClick, className: cn("flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-left", "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"), children: [_jsx("div", { className: "flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary", children: icon }), _jsxs("div", { className: "text-center", children: [_jsx("h3", { className: "font-medium text-base", children: title }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: description })] })] }));
};
const QuickActions = ({ actions }) => {
    const defaultActions = [
        {
            title: "Create New Agent",
            description: "Set up a new AI agent for your business",
            icon: _jsx(PlusCircle, { className: "h-6 w-6" }),
            variant: "outline",
            onClick: () => console.log("Create New Agent clicked"),
        },
        {
            title: "Upload Training Data",
            description: "Add documents to train your AI agents",
            icon: _jsx(Upload, { className: "h-6 w-6" }),
            variant: "outline",
            onClick: () => console.log("Upload Training Data clicked"),
        },
        {
            title: "View Conversations",
            description: "Review recent agent conversations",
            icon: _jsx(MessageSquare, { className: "h-6 w-6" }),
            variant: "outline",
            onClick: () => console.log("View Conversations clicked"),
        },
        {
            title: "Configure API Access",
            description: "Set up and manage your Private AI API",
            icon: _jsx(Settings, { className: "h-6 w-6" }),
            variant: "outline",
            onClick: () => console.log("Configure API Access clicked"),
        },
        {
            title: "Analytics Dashboard",
            description: "View performance metrics and insights",
            icon: _jsx(BarChart, { className: "h-6 w-6" }),
            variant: "outline",
            onClick: () => console.log("Analytics Dashboard clicked"),
        },
        {
            title: "Deploy to Platform",
            description: "Deploy your agent to any supported platform",
            icon: _jsx(Zap, { className: "h-6 w-6" }),
            variant: "outline",
            onClick: () => console.log("Deploy to Platform clicked"),
        },
    ];
    const displayActions = actions || defaultActions;
    return (_jsxs("div", { className: "w-full bg-card p-6 rounded-lg border shadow-sm", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Quick Actions" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: displayActions.map((action, index) => (_jsx(QuickAction, Object.assign({}, action), index))) })] }));
};
export default QuickActions;
