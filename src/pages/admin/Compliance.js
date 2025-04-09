import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Download, FileText, Shield, UserCheck } from "lucide-react";
export default function Compliance() {
    const [activeTab, setActiveTab] = useState("privacy");
    // Sample data rights requests
    const dataRequests = [
        {
            id: 1,
            user: "john.doe@example.com",
            type: "Access",
            status: "Completed",
            submitted: "2024-03-15",
            completed: "2024-03-18",
        },
        {
            id: 2,
            user: "sarah.smith@example.com",
            type: "Deletion",
            status: "In Progress",
            submitted: "2024-03-20",
            completed: null,
        },
        {
            id: 3,
            user: "michael.brown@example.com",
            type: "Correction",
            status: "Pending",
            submitted: "2024-03-22",
            completed: null,
        },
        {
            id: 4,
            user: "emily.jones@example.com",
            type: "Access",
            status: "Completed",
            submitted: "2024-03-10",
            completed: "2024-03-14",
        },
        {
            id: 5,
            user: "david.wilson@example.com",
            type: "Deletion",
            status: "Completed",
            submitted: "2024-03-05",
            completed: "2024-03-09",
        },
    ];
    // Sample audit logs
    const auditLogs = [
        {
            id: 1,
            action: "User data exported",
            performer: "admin@akii.ai",
            timestamp: "2024-03-22 14:35:22",
            details: "Exported data for user ID 12345",
        },
        {
            id: 2,
            action: "Privacy policy updated",
            performer: "admin@akii.ai",
            timestamp: "2024-03-20 10:12:45",
            details: "Updated GDPR compliance section",
        },
        {
            id: 3,
            action: "Data deletion request processed",
            performer: "system",
            timestamp: "2024-03-19 08:30:11",
            details: "Processed deletion request for user ID 10982",
        },
        {
            id: 4,
            action: "Consent settings modified",
            performer: "admin@akii.ai",
            timestamp: "2024-03-18 16:45:33",
            details: "Updated cookie consent options",
        },
        {
            id: 5,
            action: "Data retention policy changed",
            performer: "admin@akii.ai",
            timestamp: "2024-03-15 11:20:05",
            details: "Changed conversation history retention to 90 days",
        },
    ];
    return (_jsxs("div", { className: "container mx-auto py-6 space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h1", { className: "text-3xl font-bold", children: "Compliance Management" }), _jsxs(Button, { children: [_jsx(FileText, { className: "mr-2 h-4 w-4" }), " Generate Compliance Report"] })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsx(TabsTrigger, { value: "privacy", children: "Privacy Settings" }), _jsx(TabsTrigger, { value: "data-requests", children: "Data Rights Requests" }), _jsx(TabsTrigger, { value: "audit", children: "Audit Trails" }), _jsx(TabsTrigger, { value: "documents", children: "Compliance Documents" })] }), _jsx(TabsContent, { value: "privacy", className: "space-y-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Privacy & Consent Settings" }), _jsx(CardDescription, { children: "Configure privacy settings and user consent options." })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-medium", children: "Data Collection" }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "space-y-0.5", children: [_jsx(Label, { htmlFor: "analytics", children: "Usage Analytics" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Collect anonymous usage data to improve service" })] }), _jsx(Switch, { id: "analytics", defaultChecked: true })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "space-y-0.5", children: [_jsx(Label, { htmlFor: "conversation-history", children: "Conversation History" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Store chat conversations for training and improvement" })] }), _jsx(Switch, { id: "conversation-history", defaultChecked: true })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "space-y-0.5", children: [_jsx(Label, { htmlFor: "third-party", children: "Third-Party Data Sharing" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Share data with trusted third-party services" })] }), _jsx(Switch, { id: "third-party" })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-medium", children: "Data Retention" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "user-data", children: "User Account Data" }), _jsxs("div", { className: "flex space-x-2", children: [_jsx(Input, { id: "user-data", type: "number", defaultValue: "365", className: "w-20" }), _jsx("span", { className: "flex items-center text-sm", children: "days after account deletion" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "conversation-data", children: "Conversation Data" }), _jsxs("div", { className: "flex space-x-2", children: [_jsx(Input, { id: "conversation-data", type: "number", defaultValue: "90", className: "w-20" }), _jsx("span", { className: "flex items-center text-sm", children: "days" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "analytics-data", children: "Analytics Data" }), _jsxs("div", { className: "flex space-x-2", children: [_jsx(Input, { id: "analytics-data", type: "number", defaultValue: "180", className: "w-20" }), _jsx("span", { className: "flex items-center text-sm", children: "days" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "log-data", children: "System Logs" }), _jsxs("div", { className: "flex space-x-2", children: [_jsx(Input, { id: "log-data", type: "number", defaultValue: "30", className: "w-20" }), _jsx("span", { className: "flex items-center text-sm", children: "days" })] })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-medium", children: "Compliance Frameworks" }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "space-y-0.5", children: [_jsx(Label, { htmlFor: "gdpr", children: "GDPR Compliance" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Enable features required for GDPR compliance" })] }), _jsx(Switch, { id: "gdpr", defaultChecked: true })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "space-y-0.5", children: [_jsx(Label, { htmlFor: "ccpa", children: "CCPA Compliance" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Enable features required for CCPA compliance" })] }), _jsx(Switch, { id: "ccpa", defaultChecked: true })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "space-y-0.5", children: [_jsx(Label, { htmlFor: "hipaa", children: "HIPAA Compliance" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Enable features required for HIPAA compliance" })] }), _jsx(Switch, { id: "hipaa" })] })] }), _jsx(Button, { children: "Save Privacy Settings" })] })] }) }), _jsx(TabsContent, { value: "data-requests", className: "space-y-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Data Rights Request Management" }), _jsx(CardDescription, { children: "Handle user requests for data access, deletion, and correction." })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "flex justify-between mb-4", children: [_jsxs("div", { className: "relative w-64", children: [_jsx(Search, { className: "absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" }), _jsx(Input, { placeholder: "Search requests...", className: "pl-8" })] }), _jsxs(Button, { variant: "outline", children: [_jsx(Download, { className: "mr-2 h-4 w-4" }), " Export"] })] }), _jsx("div", { className: "rounded-md border", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "User" }), _jsx(TableHead, { children: "Request Type" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { children: "Submitted" }), _jsx(TableHead, { children: "Completed" }), _jsx(TableHead, { children: "Actions" })] }) }), _jsx(TableBody, { children: dataRequests.map((request) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: request.user }), _jsx(TableCell, { children: request.type }), _jsx(TableCell, { children: _jsx(Badge, { variant: request.status === "Completed"
                                                                            ? "default"
                                                                            : request.status === "In Progress"
                                                                                ? "outline"
                                                                                : "secondary", children: request.status }) }), _jsx(TableCell, { children: request.submitted }), _jsx(TableCell, { children: request.completed || "-" }), _jsx(TableCell, { children: _jsx(Button, { variant: "ghost", size: "sm", children: "Process" }) })] }, request.id))) })] }) })] })] }) }), _jsx(TabsContent, { value: "audit", className: "space-y-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Audit Trails" }), _jsx(CardDescription, { children: "Review system activity logs for compliance and security." })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "flex justify-between mb-4", children: [_jsxs("div", { className: "relative w-64", children: [_jsx(Search, { className: "absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" }), _jsx(Input, { placeholder: "Search audit logs...", className: "pl-8" })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsxs(Button, { variant: "outline", children: [_jsx(Download, { className: "mr-2 h-4 w-4" }), " Export"] }), _jsx(Button, { variant: "outline", children: "Filter" })] })] }), _jsx("div", { className: "rounded-md border", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Action" }), _jsx(TableHead, { children: "Performed By" }), _jsx(TableHead, { children: "Timestamp" }), _jsx(TableHead, { children: "Details" }), _jsx(TableHead, { children: "Actions" })] }) }), _jsx(TableBody, { children: auditLogs.map((log) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: log.action }), _jsx(TableCell, { children: log.performer }), _jsx(TableCell, { children: log.timestamp }), _jsx(TableCell, { className: "max-w-xs truncate", children: log.details }), _jsx(TableCell, { children: _jsx(Button, { variant: "ghost", size: "sm", children: "View" }) })] }, log.id))) })] }) })] })] }) }), _jsx(TabsContent, { value: "documents", className: "space-y-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Compliance Documents" }), _jsx(CardDescription, { children: "Manage legal and compliance documentation." })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { className: "pb-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { className: "text-lg", children: "Privacy Policy" }), _jsx(Shield, { className: "h-5 w-5 text-blue-500" })] }), _jsx(CardDescription, { children: "Last updated: March 15, 2024" })] }), _jsxs(CardContent, { className: "pt-0", children: [_jsx("p", { className: "text-sm text-muted-foreground mb-4", children: "Comprehensive privacy policy detailing data collection, usage, and user rights." }), _jsxs("div", { className: "flex space-x-2", children: [_jsx(Button, { size: "sm", variant: "outline", children: "View" }), _jsx(Button, { size: "sm", children: "Edit" })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "pb-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { className: "text-lg", children: "Terms of Service" }), _jsx(FileText, { className: "h-5 w-5 text-blue-500" })] }), _jsx(CardDescription, { children: "Last updated: March 15, 2024" })] }), _jsxs(CardContent, { className: "pt-0", children: [_jsx("p", { className: "text-sm text-muted-foreground mb-4", children: "Terms governing the use of the platform and services provided." }), _jsxs("div", { className: "flex space-x-2", children: [_jsx(Button, { size: "sm", variant: "outline", children: "View" }), _jsx(Button, { size: "sm", children: "Edit" })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "pb-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { className: "text-lg", children: "Cookie Policy" }), _jsx(Shield, { className: "h-5 w-5 text-blue-500" })] }), _jsx(CardDescription, { children: "Last updated: February 28, 2024" })] }), _jsxs(CardContent, { className: "pt-0", children: [_jsx("p", { className: "text-sm text-muted-foreground mb-4", children: "Details on cookies used, their purpose, and how users can control them." }), _jsxs("div", { className: "flex space-x-2", children: [_jsx(Button, { size: "sm", variant: "outline", children: "View" }), _jsx(Button, { size: "sm", children: "Edit" })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "pb-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { className: "text-lg", children: "Data Processing Agreement" }), _jsx(UserCheck, { className: "h-5 w-5 text-blue-500" })] }), _jsx(CardDescription, { children: "Last updated: January 10, 2024" })] }), _jsxs(CardContent, { className: "pt-0", children: [_jsx("p", { className: "text-sm text-muted-foreground mb-4", children: "Agreement for processing personal data in compliance with regulations." }), _jsxs("div", { className: "flex space-x-2", children: [_jsx(Button, { size: "sm", variant: "outline", children: "View" }), _jsx(Button, { size: "sm", children: "Edit" })] })] })] })] }), _jsxs(Button, { children: [_jsx(FileText, { className: "mr-2 h-4 w-4" }), " Add New Document"] })] })] }) })] })] }));
}
