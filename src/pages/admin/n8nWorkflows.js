import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MoreVertical, Plus, Download, Filter, ExternalLink, Edit, Trash2, PlayCircle, AlertCircle, CheckCircle, XCircle, RefreshCcw, Activity, Clock, Settings, Workflow, } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
const mockWorkflows = [
    {
        id: "wf-1",
        name: "Customer Onboarding",
        description: "Automate the customer onboarding process with welcome emails and data synchronization",
        status: "active",
        createdAt: "2023-04-05",
        lastRun: "2023-06-28 15:22",
        totalRuns: 1248,
        successRate: 99.5,
        averageTime: "1.2s",
        owner: "John Doe",
        triggers: ["New User Registration", "Subscription Update"],
        rateLimited: false,
    },
    {
        id: "wf-2",
        name: "Document Processing",
        description: "Extract data from uploaded documents and create training data",
        status: "active",
        createdAt: "2023-04-10",
        lastRun: "2023-06-28 14:47",
        totalRuns: 867,
        successRate: 98.2,
        averageTime: "3.5s",
        owner: "Jane Smith",
        triggers: ["Document Upload", "Manual Trigger"],
        rateLimited: true,
    },
    {
        id: "wf-3",
        name: "AI Training Pipeline",
        description: "Process and prepare data for AI model training",
        status: "error",
        createdAt: "2023-05-12",
        lastRun: "2023-06-27 09:15",
        totalRuns: 152,
        successRate: 87.3,
        averageTime: "12.4s",
        owner: "Robert Johnson",
        triggers: ["Scheduled (Daily)", "Manual Trigger"],
        rateLimited: false,
    },
    {
        id: "wf-4",
        name: "Customer Feedback Analysis",
        description: "Analyze customer feedback and generate reports",
        status: "inactive",
        createdAt: "2023-05-20",
        lastRun: "2023-06-20 11:30",
        totalRuns: 45,
        successRate: 95.5,
        averageTime: "5.7s",
        owner: "Emily Davis",
        triggers: ["Scheduled (Weekly)", "Webhook"],
        rateLimited: false,
    },
    {
        id: "wf-5",
        name: "User Activity Monitoring",
        description: "Track and analyze user activities for security and optimization",
        status: "active",
        createdAt: "2023-06-01",
        lastRun: "2023-06-28 15:05",
        totalRuns: 720,
        successRate: 99.8,
        averageTime: "0.8s",
        owner: "Michael Wilson",
        triggers: ["User Login", "User Action"],
        rateLimited: true,
    },
];
const getStatusBadge = (status) => {
    switch (status) {
        case "active":
            return (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx("div", { className: "h-2 w-2 rounded-full bg-green-500" }), _jsx("span", { className: "font-medium text-green-700 dark:text-green-500", children: "Active" })] }));
        case "inactive":
            return (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx("div", { className: "h-2 w-2 rounded-full bg-gray-400" }), _jsx("span", { className: "font-medium text-gray-600 dark:text-gray-400", children: "Inactive" })] }));
        case "error":
            return (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx("div", { className: "h-2 w-2 rounded-full bg-red-500" }), _jsx("span", { className: "font-medium text-red-700 dark:text-red-500", children: "Error" })] }));
        default:
            return null;
    }
};
const N8nWorkflows = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [workflows, setWorkflows] = useState(mockWorkflows);
    const [selectedTab, setSelectedTab] = useState("all");
    const filteredWorkflows = workflows.filter((workflow) => workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workflow.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workflow.owner.toLowerCase().includes(searchQuery.toLowerCase()));
    const statusFilteredWorkflows = selectedTab === "all"
        ? filteredWorkflows
        : filteredWorkflows.filter(workflow => workflow.status === selectedTab);
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col md:flex-row md:items-center md:justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold", children: "n8n Workflow Manager" }), _jsx("p", { className: "text-muted-foreground mt-1", children: "Manage, monitor, and debug automated workflows across the platform" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Dialog, { children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { children: [_jsx(Plus, { className: "mr-2 h-4 w-4" }), "New Workflow"] }) }), _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Create New Workflow" }), _jsx(DialogDescription, { children: "Start building a new automation workflow for your application" })] }), _jsxs("div", { className: "grid gap-4 py-4", children: [_jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "workflow-name", children: "Workflow Name" }), _jsx(Input, { id: "workflow-name", placeholder: "Enter workflow name" })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "workflow-description", children: "Description" }), _jsx(Input, { id: "workflow-description", placeholder: "Enter workflow description" })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "workflow-owner", children: "Owner" }), _jsx(Input, { id: "workflow-owner", placeholder: "Workflow owner" })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "workflow-trigger", children: "Primary Trigger" }), _jsx(Input, { id: "workflow-trigger", placeholder: "Select trigger type" })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", children: "Cancel" }), _jsx(Button, { children: "Create Workflow" })] })] })] }), _jsxs(Button, { variant: "outline", children: [_jsx(ExternalLink, { className: "mr-2 h-4 w-4" }), "Open n8n Editor"] })] })] }), _jsxs("div", { className: "flex flex-col md:flex-row gap-4 md:items-center justify-between", children: [_jsxs("div", { className: "relative w-full md:w-96", children: [_jsx(Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }), _jsx(Input, { type: "search", placeholder: "Search workflows...", className: "pl-8", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value) })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Filter, { className: "mr-2 h-4 w-4" }), "Filter"] }), _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Download, { className: "mr-2 h-4 w-4" }), "Export"] })] })] }), _jsxs(Tabs, { defaultValue: "all", className: "w-full", onValueChange: setSelectedTab, children: [_jsxs(TabsList, { className: "grid grid-cols-4 w-full max-w-md", children: [_jsx(TabsTrigger, { value: "all", children: "All" }), _jsx(TabsTrigger, { value: "active", children: "Active" }), _jsx(TabsTrigger, { value: "inactive", children: "Inactive" }), _jsx(TabsTrigger, { value: "error", children: "Error" })] }), _jsx(TabsContent, { value: selectedTab, className: "mt-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { className: "px-6 py-4", children: [_jsx(CardTitle, { children: "Workflows" }), _jsx(CardDescription, { children: selectedTab === "all"
                                                ? "All workflows in the system"
                                                : selectedTab === "active"
                                                    ? "Currently active workflows"
                                                    : selectedTab === "inactive"
                                                        ? "Disabled or inactive workflows"
                                                        : "Workflows with errors" })] }), _jsx(CardContent, { className: "p-0", children: _jsx(ScrollArea, { className: "h-[600px]", children: _jsxs(Table, { children: [_jsx(TableHeader, { className: "bg-muted/50", children: _jsxs(TableRow, { children: [_jsx(TableHead, { className: "w-[300px]", children: "Workflow" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { children: "Last Run" }), _jsx(TableHead, { children: "Success Rate" }), _jsx(TableHead, { children: "Avg. Time" }), _jsx(TableHead, { children: "Rate Limited" }), _jsx(TableHead, { className: "text-right", children: "Actions" })] }) }), _jsxs(TableBody, { children: [statusFilteredWorkflows.map((workflow) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: workflow.name }), _jsx("div", { className: "text-sm text-muted-foreground", children: workflow.description.length > 60
                                                                                    ? `${workflow.description.substring(0, 60)}...`
                                                                                    : workflow.description })] }) }), _jsx(TableCell, { children: getStatusBadge(workflow.status) }), _jsx(TableCell, { children: _jsxs("div", { className: "flex items-center gap-1 text-sm", children: [_jsx(Clock, { className: "h-3.5 w-3.5 text-muted-foreground" }), _jsx("span", { children: workflow.lastRun })] }) }), _jsx(TableCell, { children: _jsx("div", { className: "flex items-center gap-1", children: _jsxs("span", { className: `font-medium ${workflow.successRate >= 99
                                                                                ? "text-green-600"
                                                                                : workflow.successRate >= 90
                                                                                    ? "text-amber-600"
                                                                                    : "text-red-600"}`, children: [workflow.successRate, "%"] }) }) }), _jsx(TableCell, { children: _jsxs("div", { className: "flex items-center gap-1 text-sm", children: [_jsx(Activity, { className: "h-3.5 w-3.5 text-muted-foreground" }), _jsx("span", { children: workflow.averageTime })] }) }), _jsx(TableCell, { children: _jsx(Switch, { checked: workflow.rateLimited, onCheckedChange: (checked) => {
                                                                            // Handle rate limit toggle
                                                                            setWorkflows(workflows.map((w) => w.id === workflow.id ? Object.assign(Object.assign({}, w), { rateLimited: checked }) : w));
                                                                        } }) }), _jsx(TableCell, { className: "text-right", children: _jsxs("div", { className: "flex items-center justify-end gap-2", children: [_jsx(Button, { variant: "ghost", size: "icon", title: "Run workflow", children: _jsx(PlayCircle, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "icon", title: "Edit workflow", children: _jsx(Edit, { className: "h-4 w-4" }) }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { variant: "ghost", size: "icon", children: _jsx(MoreVertical, { className: "h-4 w-4" }) }) }), _jsxs(DropdownMenuContent, { align: "end", children: [_jsxs(DropdownMenuItem, { children: [_jsx(ExternalLink, { className: "mr-2 h-4 w-4" }), "Open in Editor"] }), _jsxs(DropdownMenuItem, { children: [_jsx(Settings, { className: "mr-2 h-4 w-4" }), "Configure"] }), _jsxs(DropdownMenuItem, { children: [_jsx(RefreshCcw, { className: "mr-2 h-4 w-4" }), "Reset Statistics"] }), _jsxs(DropdownMenuItem, { className: "text-red-600", children: [_jsx(Trash2, { className: "mr-2 h-4 w-4" }), "Delete"] })] })] })] }) })] }, workflow.id))), statusFilteredWorkflows.length === 0 && (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 7, className: "h-24 text-center", children: _jsxs("div", { className: "flex flex-col items-center justify-center text-muted-foreground", children: [_jsx(Workflow, { className: "h-12 w-12 mb-2 text-muted-foreground/50" }), _jsx("p", { children: "No workflows found" }), _jsx("p", { className: "text-sm", children: "Try adjusting your search or filters" })] }) }) }))] })] }) }) }), _jsxs(CardFooter, { className: "flex justify-between px-6 py-4 border-t", children: [_jsxs("div", { className: "text-sm text-muted-foreground", children: ["Showing ", _jsx("span", { className: "font-medium", children: statusFilteredWorkflows.length }), " of", " ", _jsx("span", { className: "font-medium", children: workflows.length }), " workflows"] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", children: "Previous" }), _jsx(Button, { variant: "outline", size: "sm", children: "Next" })] })] })] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Workflow Activity" }), _jsx(CardDescription, { children: "Recent activity from all workflows" })] }), _jsx(CardContent, { children: _jsx(ScrollArea, { className: "h-[300px]", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-start gap-3 pb-3 border-b", children: [_jsx("div", { className: "h-8 w-8 bg-green-100 rounded-full flex items-center justify-center", children: _jsx(CheckCircle, { className: "h-4 w-4 text-green-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Customer Onboarding - Success" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Workflow completed successfully for user john.doe@example.com" }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "2 minutes ago" })] })] }), _jsxs("div", { className: "flex items-start gap-3 pb-3 border-b", children: [_jsx("div", { className: "h-8 w-8 bg-red-100 rounded-full flex items-center justify-center", children: _jsx(XCircle, { className: "h-4 w-4 text-red-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "AI Training Pipeline - Failed" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Error: Unable to connect to AI training service - timeout" }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "15 minutes ago" })] })] }), _jsxs("div", { className: "flex items-start gap-3 pb-3 border-b", children: [_jsx("div", { className: "h-8 w-8 bg-amber-100 rounded-full flex items-center justify-center", children: _jsx(AlertCircle, { className: "h-4 w-4 text-amber-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Document Processing - Warning" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Workflow completed with warning: Large document (25MB) may cause performance issues" }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "45 minutes ago" })] })] })] }) }) })] })] }));
};
export default N8nWorkflows;
