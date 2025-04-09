import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Edit, Trash2, Eye, Settings, } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { useState } from "react";
// Sample blog post data
const blogPosts = [
    {
        id: "1",
        title: "Getting Started with AI Chat Agents",
        status: "published",
        category: "Tutorials",
        date: "2023-10-15",
        views: 1245,
    },
    {
        id: "2",
        title: "5 Ways to Optimize Your AI Agent for Sales",
        status: "published",
        category: "Sales",
        date: "2023-10-10",
        views: 982,
    },
    {
        id: "3",
        title: "The Future of Customer Support with AI",
        status: "draft",
        category: "Insights",
        date: "2023-10-05",
        views: 0,
    },
    {
        id: "4",
        title: "How to Train Your AI Agent with Custom Data",
        status: "scheduled",
        category: "Tutorials",
        date: "2023-10-20",
        views: 0,
    },
];
// Column definitions for the data table
const columns = [
    {
        accessorKey: "title",
        header: "Title",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status");
            return (_jsxs("div", { className: "flex items-center", children: [_jsx("span", { className: `h-2 w-2 rounded-full mr-2 ${status === "published" ? "bg-green-500" : status === "draft" ? "bg-yellow-500" : "bg-blue-500"}` }), _jsx("span", { className: "capitalize", children: status })] }));
        },
    },
    {
        accessorKey: "category",
        header: "Category",
    },
    {
        accessorKey: "date",
        header: "Date",
    },
    {
        accessorKey: "views",
        header: "Views",
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const post = row.original;
            return (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Button, { variant: "ghost", size: "icon", children: _jsx(Eye, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "icon", children: _jsx(Edit, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "icon", children: _jsx(Trash2, { className: "h-4 w-4" }) })] }));
        },
    },
];
export default function AdminBlog() {
    const [activeTab, setActiveTab] = useState("posts");
    return (_jsxs("div", { className: "container mx-auto py-6 space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h1", { className: "text-3xl font-bold", children: "Blog Management" }), _jsxs(Button, { children: [_jsx(PlusCircle, { className: "mr-2 h-4 w-4" }), "New Post"] })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsx(TabsTrigger, { value: "posts", children: "Posts" }), _jsx(TabsTrigger, { value: "categories", children: "Categories" }), _jsx(TabsTrigger, { value: "auto-generation", children: "Auto Generation" }), _jsx(TabsTrigger, { value: "settings", children: "Settings" })] }), _jsx(TabsContent, { value: "posts", className: "space-y-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "All Posts" }), _jsx(CardDescription, { children: "Manage your blog posts, edit content, and track performance." })] }), _jsx(CardContent, { children: _jsx(DataTable, { columns: columns, data: blogPosts }) })] }) }), _jsx(TabsContent, { value: "categories", className: "space-y-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Categories" }), _jsx(CardDescription, { children: "Manage blog categories and tags for better organization." })] }), _jsx(CardContent, { children: _jsx("p", { children: "Category management interface will be implemented here." }) })] }) }), _jsx(TabsContent, { value: "auto-generation", className: "space-y-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Auto Content Generation" }), _jsx(CardDescription, { children: "Configure AI-powered blog post generation settings." })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Content Source" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "radio", id: "industry-news", name: "content-source", className: "h-4 w-4", defaultChecked: true }), _jsx("label", { htmlFor: "industry-news", children: "Industry News" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "radio", id: "seo-topics", name: "content-source", className: "h-4 w-4" }), _jsx("label", { htmlFor: "seo-topics", children: "SEO Topics" })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Generation Frequency" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "radio", id: "daily", name: "frequency", className: "h-4 w-4", defaultChecked: true }), _jsx("label", { htmlFor: "daily", children: "Daily" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "radio", id: "weekly", name: "frequency", className: "h-4 w-4" }), _jsx("label", { htmlFor: "weekly", children: "Weekly" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "radio", id: "monthly", name: "frequency", className: "h-4 w-4" }), _jsx("label", { htmlFor: "monthly", children: "Monthly" })] })] }) })] })] }), _jsxs(Button, { className: "w-full", children: [_jsx(Settings, { className: "mr-2 h-4 w-4" }), "Save Auto-Generation Settings"] })] })] }) }), _jsx(TabsContent, { value: "settings", className: "space-y-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Blog Settings" }), _jsx(CardDescription, { children: "Configure general blog settings and defaults." })] }), _jsx(CardContent, { children: _jsx("p", { children: "Blog settings interface will be implemented here." }) })] }) })] })] }));
}
