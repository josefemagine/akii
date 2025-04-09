import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Search, Download, BarChart } from "lucide-react";
export default function Affiliates() {
    const [activeTab, setActiveTab] = useState("affiliates");
    // Sample affiliate data
    const affiliates = [
        {
            id: 1,
            name: "John Smith",
            email: "john@example.com",
            referrals: 24,
            earnings: "$1,240.00",
            status: "active",
            joinDate: "2023-10-15",
        },
        {
            id: 2,
            name: "Sarah Johnson",
            email: "sarah@example.com",
            referrals: 18,
            earnings: "$920.00",
            status: "active",
            joinDate: "2023-11-02",
        },
        {
            id: 3,
            name: "Michael Brown",
            email: "michael@example.com",
            referrals: 7,
            earnings: "$350.00",
            status: "pending",
            joinDate: "2024-01-20",
        },
        {
            id: 4,
            name: "Emily Davis",
            email: "emily@example.com",
            referrals: 32,
            earnings: "$1,600.00",
            status: "active",
            joinDate: "2023-09-05",
        },
        {
            id: 5,
            name: "David Wilson",
            email: "david@example.com",
            referrals: 0,
            earnings: "$0.00",
            status: "inactive",
            joinDate: "2024-02-10",
        },
    ];
    // Sample payouts data
    const payouts = [
        {
            id: 1,
            affiliate: "John Smith",
            amount: "$450.00",
            date: "2024-03-01",
            status: "completed",
        },
        {
            id: 2,
            affiliate: "Sarah Johnson",
            amount: "$320.00",
            date: "2024-03-01",
            status: "completed",
        },
        {
            id: 3,
            affiliate: "Emily Davis",
            amount: "$600.00",
            date: "2024-03-01",
            status: "completed",
        },
        {
            id: 4,
            affiliate: "John Smith",
            amount: "$400.00",
            date: "2024-02-01",
            status: "completed",
        },
        {
            id: 5,
            affiliate: "Emily Davis",
            amount: "$500.00",
            date: "2024-02-01",
            status: "completed",
        },
    ];
    return (_jsxs("div", { className: "container mx-auto py-6 space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h1", { className: "text-3xl font-bold", children: "Affiliate Program" }), _jsxs(Button, { children: [_jsx(PlusCircle, { className: "mr-2 h-4 w-4" }), " Add New Affiliate"] })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsx(TabsTrigger, { value: "affiliates", children: "Affiliates" }), _jsx(TabsTrigger, { value: "payouts", children: "Payouts" }), _jsx(TabsTrigger, { value: "reports", children: "Reports" }), _jsx(TabsTrigger, { value: "settings", children: "Settings" })] }), _jsx(TabsContent, { value: "affiliates", className: "space-y-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Manage Affiliates" }), _jsx(CardDescription, { children: "View and manage all your affiliate partners." })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "flex justify-between mb-4", children: [_jsxs("div", { className: "relative w-64", children: [_jsx(Search, { className: "absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" }), _jsx(Input, { placeholder: "Search affiliates...", className: "pl-8" })] }), _jsxs(Button, { variant: "outline", children: [_jsx(Download, { className: "mr-2 h-4 w-4" }), " Export"] })] }), _jsx("div", { className: "rounded-md border", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Name" }), _jsx(TableHead, { children: "Email" }), _jsx(TableHead, { children: "Referrals" }), _jsx(TableHead, { children: "Earnings" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { children: "Join Date" }), _jsx(TableHead, { children: "Actions" })] }) }), _jsx(TableBody, { children: affiliates.map((affiliate) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: affiliate.name }), _jsx(TableCell, { children: affiliate.email }), _jsx(TableCell, { children: affiliate.referrals }), _jsx(TableCell, { children: affiliate.earnings }), _jsx(TableCell, { children: _jsx(Badge, { variant: affiliate.status === "active"
                                                                            ? "default"
                                                                            : affiliate.status === "pending"
                                                                                ? "outline"
                                                                                : "secondary", children: affiliate.status }) }), _jsx(TableCell, { children: affiliate.joinDate }), _jsx(TableCell, { children: _jsx(Button, { variant: "ghost", size: "sm", children: "View" }) })] }, affiliate.id))) })] }) })] })] }) }), _jsx(TabsContent, { value: "payouts", className: "space-y-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Payout Management" }), _jsx(CardDescription, { children: "Manage affiliate payouts and payment history." })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "flex justify-between mb-4", children: [_jsxs("div", { className: "relative w-64", children: [_jsx(Search, { className: "absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" }), _jsx(Input, { placeholder: "Search payouts...", className: "pl-8" })] }), _jsx(Button, { children: "Process New Payouts" })] }), _jsx("div", { className: "rounded-md border", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Affiliate" }), _jsx(TableHead, { children: "Amount" }), _jsx(TableHead, { children: "Date" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { children: "Actions" })] }) }), _jsx(TableBody, { children: payouts.map((payout) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: payout.affiliate }), _jsx(TableCell, { children: payout.amount }), _jsx(TableCell, { children: payout.date }), _jsx(TableCell, { children: _jsx(Badge, { variant: "default", children: payout.status }) }), _jsx(TableCell, { children: _jsx(Button, { variant: "ghost", size: "sm", children: "Details" }) })] }, payout.id))) })] }) })] })] }) }), _jsx(TabsContent, { value: "reports", className: "space-y-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Performance Reports" }), _jsx(CardDescription, { children: "View detailed analytics about your affiliate program." })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "grid grid-cols-3 gap-4 mb-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Total Referrals" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: "81" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "+12% from last month" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Total Earnings" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: "$4,110.00" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "+8% from last month" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Active Affiliates" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: "3" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "+1 from last month" })] })] })] }), _jsx("div", { className: "h-[300px] flex items-center justify-center border rounded-md bg-muted/20", children: _jsxs("div", { className: "text-center", children: [_jsx(BarChart, { className: "h-10 w-10 mx-auto text-muted-foreground" }), _jsx("h3", { className: "mt-2 font-medium", children: "Referral Performance Chart" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Monthly referral and commission data" })] }) })] })] }) }), _jsx(TabsContent, { value: "settings", className: "space-y-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Affiliate Program Settings" }), _jsx(CardDescription, { children: "Configure your affiliate program settings." })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "commission-rate", children: "Default Commission Rate (%)" }), _jsx(Input, { id: "commission-rate", type: "number", defaultValue: "5" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "payout-threshold", children: "Minimum Payout Threshold ($)" }), _jsx(Input, { id: "payout-threshold", type: "number", defaultValue: "50" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "cookie-days", children: "Cookie Duration (Days)" }), _jsx(Input, { id: "cookie-days", type: "number", defaultValue: "30" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "terms", children: "Affiliate Terms & Conditions" }), _jsx("textarea", { id: "terms", className: "w-full min-h-[150px] p-2 border rounded-md", defaultValue: "Standard terms and conditions for the affiliate program..." })] }), _jsx(Button, { children: "Save Settings" })] })] }) })] })] }));
}
