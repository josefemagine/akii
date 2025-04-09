import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, ArrowRight, Check, Clock, Play, Plus, Settings, Workflow, } from "lucide-react";
const N8nWorkflows = () => {
    const [workflows, setWorkflows] = useState([
        {
            id: "wf-1",
            name: "Lead Qualification",
            description: "Automatically qualify leads based on AI analysis of form submissions",
            status: "active",
            lastRun: "2023-10-20T14:22:10Z",
            executions: 128,
            triggers: ["Form Submission"],
            actions: ["AI Analysis", "CRM Update", "Email Notification"],
        },
        {
            id: "wf-2",
            name: "Support Ticket Triage",
            description: "Analyze support tickets and route to appropriate departments",
            status: "active",
            lastRun: "2023-10-21T09:15:30Z",
            executions: 56,
            triggers: ["New Support Ticket"],
            actions: ["AI Analysis", "Ticket Routing", "Slack Notification"],
        },
        {
            id: "wf-3",
            name: "Content Moderation",
            description: "Automatically moderate user-generated content using AI",
            status: "error",
            lastRun: "2023-10-19T11:30:45Z",
            executions: 342,
            triggers: ["New Content"],
            actions: ["AI Moderation", "Content Approval/Rejection"],
        },
        {
            id: "wf-4",
            name: "Customer Onboarding",
            description: "Automate customer onboarding process with personalized AI assistance",
            status: "inactive",
            lastRun: null,
            executions: 0,
            triggers: ["New Customer"],
            actions: ["Welcome Email", "AI Personalization", "Schedule Call"],
        },
    ]);
    const formatDate = (dateString) => {
        if (!dateString)
            return "Never";
        return new Date(dateString).toLocaleString();
    };
    const getStatusBadge = (status) => {
        switch (status) {
            case "active":
                return (_jsxs(Badge, { variant: "outline", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800", children: [_jsx(Check, { className: "h-3 w-3 mr-1" }), " Active"] }));
            case "inactive":
                return (_jsxs(Badge, { variant: "outline", className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700", children: [_jsx(Clock, { className: "h-3 w-3 mr-1" }), " Inactive"] }));
            case "error":
                return (_jsxs(Badge, { variant: "outline", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200 dark:border-red-800", children: [_jsx(AlertCircle, { className: "h-3 w-3 mr-1" }), " Error"] }));
        }
    };
    const toggleWorkflowStatus = (id) => {
        setWorkflows(workflows.map((workflow) => workflow.id === id
            ? Object.assign(Object.assign({}, workflow), { status: workflow.status === "active" ? "inactive" : "active" }) : workflow));
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h1", { className: "text-3xl font-bold", children: "n8n Workflows" }), _jsxs(Button, { children: [_jsx(Plus, { className: "mr-2 h-4 w-4" }), " Create Workflow"] })] }), _jsxs(Tabs, { defaultValue: "workflows", children: [_jsxs(TabsList, { children: [_jsx(TabsTrigger, { value: "workflows", children: "Workflows" }), _jsx(TabsTrigger, { value: "templates", children: "Templates" }), _jsx(TabsTrigger, { value: "executions", children: "Executions" }), _jsx(TabsTrigger, { value: "settings", children: "Settings" })] }), _jsx(TabsContent, { value: "workflows", className: "space-y-6", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Your Workflows" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [workflows.map((workflow) => (_jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg", children: [_jsxs("div", { className: "space-y-2 mb-4 sm:mb-0", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Workflow, { className: "h-4 w-4 text-primary" }), _jsx("span", { className: "font-medium", children: workflow.name }), getStatusBadge(workflow.status)] }), _jsx("p", { className: "text-sm text-muted-foreground", children: workflow.description }), _jsxs("div", { className: "flex flex-wrap gap-1", children: [workflow.triggers.map((trigger, i) => (_jsxs(Badge, { variant: "secondary", className: "text-xs", children: ["Trigger: ", trigger] }, `trigger-${i}`))), workflow.actions.map((action, i) => (_jsxs(Badge, { variant: "outline", className: "text-xs", children: ["Action: ", action] }, `action-${i}`)))] }), _jsxs("div", { className: "text-xs text-muted-foreground", children: ["Last run: ", formatDate(workflow.lastRun), " \u2022 Executions:", " ", workflow.executions] })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-2 w-full sm:w-auto", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-2 sm:mb-0", children: [_jsx(Switch, { id: `toggle-${workflow.id}`, checked: workflow.status === "active", onCheckedChange: () => toggleWorkflowStatus(workflow.id), disabled: workflow.status === "error" }), _jsx(Label, { htmlFor: `toggle-${workflow.id}`, className: "text-sm", children: workflow.status === "active"
                                                                            ? "Enabled"
                                                                            : "Disabled" })] }), _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Play, { className: "h-4 w-4 mr-1" }), " Run"] }), _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Settings, { className: "h-4 w-4 mr-1" }), " Edit"] })] })] }, workflow.id))), workflows.length === 0 && (_jsx("div", { className: "text-center py-6 text-muted-foreground", children: "No workflows found. Create your first workflow to get started." }))] }) })] }) }), _jsx(TabsContent, { value: "templates", className: "space-y-6", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Workflow Templates" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: [_jsx(Card, { className: "border-2 border-primary/20 hover:border-primary/50 transition-colors cursor-pointer", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center", children: _jsx(Workflow, { className: "h-6 w-6 text-primary" }) }), _jsx("h3", { className: "text-lg font-medium", children: "Lead Qualification" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Automatically qualify leads based on AI analysis of form submissions" }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx(Badge, { variant: "outline", children: "Popular" }), _jsxs(Button, { size: "sm", variant: "ghost", children: ["Use Template ", _jsx(ArrowRight, { className: "ml-1 h-4 w-4" })] })] })] }) }) }), _jsx(Card, { className: "border hover:border-primary/20 transition-colors cursor-pointer", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center", children: _jsx(Workflow, { className: "h-6 w-6 text-primary" }) }), _jsx("h3", { className: "text-lg font-medium", children: "Support Ticket Triage" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Analyze support tickets and route to appropriate departments" }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx(Badge, { variant: "outline", children: "Support" }), _jsxs(Button, { size: "sm", variant: "ghost", children: ["Use Template ", _jsx(ArrowRight, { className: "ml-1 h-4 w-4" })] })] })] }) }) }), _jsx(Card, { className: "border hover:border-primary/20 transition-colors cursor-pointer", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center", children: _jsx(Workflow, { className: "h-6 w-6 text-primary" }) }), _jsx("h3", { className: "text-lg font-medium", children: "Content Moderation" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Automatically moderate user-generated content using AI" }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx(Badge, { variant: "outline", children: "Moderation" }), _jsxs(Button, { size: "sm", variant: "ghost", children: ["Use Template ", _jsx(ArrowRight, { className: "ml-1 h-4 w-4" })] })] })] }) }) })] }) })] }) }), _jsx(TabsContent, { value: "executions", className: "space-y-6", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Recent Executions" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "border rounded-lg p-4 flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: "outline", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", children: "Success" }), _jsx("span", { className: "font-medium", children: "Lead Qualification" })] }), _jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: ["Executed: ", new Date().toLocaleString(), " \u2022 Duration: 1.2s"] })] }), _jsx(Button, { variant: "outline", size: "sm", children: "View Details" })] }), _jsxs("div", { className: "border rounded-lg p-4 flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: "outline", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", children: "Success" }), _jsx("span", { className: "font-medium", children: "Support Ticket Triage" })] }), _jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: ["Executed:", " ", new Date(Date.now() - 3600000).toLocaleString(), " \u2022 Duration: 0.8s"] })] }), _jsx(Button, { variant: "outline", size: "sm", children: "View Details" })] }), _jsxs("div", { className: "border rounded-lg p-4 flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: "outline", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", children: "Failed" }), _jsx("span", { className: "font-medium", children: "Content Moderation" })] }), _jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: ["Executed:", " ", new Date(Date.now() - 7200000).toLocaleString(), " \u2022 Duration: 2.5s"] })] }), _jsx(Button, { variant: "outline", size: "sm", children: "View Details" })] })] }) })] }) }), _jsx(TabsContent, { value: "settings", className: "space-y-6", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "n8n Connection Settings" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-6", children: _jsxs("div", { className: "grid gap-4", children: [_jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "n8n-url", children: "n8n Instance URL" }), _jsx(Input, { id: "n8n-url", placeholder: "https://n8n.yourdomain.com", defaultValue: "https://n8n.akii-demo.com" })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "n8n-api-key", children: "API Key" }), _jsx(Input, { id: "n8n-api-key", type: "password", placeholder: "Your n8n API key", defaultValue: "n8n_api_12345abcdef" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Switch, { id: "webhook-active", defaultChecked: true }), _jsx(Label, { htmlFor: "webhook-active", children: "Enable Webhook Triggers" })] }), _jsx(Button, { className: "w-full sm:w-auto mt-2", children: "Save Settings" })] }) }) })] }) })] })] }));
};
export default N8nWorkflows;
