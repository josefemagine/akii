import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Key, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
const APIKeys = () => {
    const { toast } = useToast();
    const [apiKeys, setApiKeys] = useState([
        {
            id: "key-1",
            name: "Production API Key",
            key: "ak_live_" + Math.random().toString(36).substring(2, 15),
            created: "2023-10-15T10:30:00Z",
            lastUsed: "2023-10-20T14:22:10Z",
            permissions: ["read", "write"],
            enabled: true,
        },
        {
            id: "key-2",
            name: "Development API Key",
            key: "ak_dev_" + Math.random().toString(36).substring(2, 15),
            created: "2023-10-16T09:15:00Z",
            lastUsed: null,
            permissions: ["read"],
            enabled: true,
        },
    ]);
    const [newKeyName, setNewKeyName] = useState("");
    const [newKeyPermissions, setNewKeyPermissions] = useState([
        "read",
    ]);
    const handleCopyKey = (key) => {
        navigator.clipboard.writeText(key);
        toast({
            title: "API Key Copied",
            description: "The API key has been copied to your clipboard.",
        });
    };
    const handleTogglePermission = (permission) => {
        if (newKeyPermissions.includes(permission)) {
            setNewKeyPermissions(newKeyPermissions.filter((p) => p !== permission));
        }
        else {
            setNewKeyPermissions([...newKeyPermissions, permission]);
        }
    };
    const handleCreateKey = () => {
        if (!newKeyName) {
            toast({
                title: "Error",
                description: "Please provide a name for your API key.",
                variant: "destructive",
            });
            return;
        }
        const newKey = {
            id: `key-${apiKeys.length + 1}`,
            name: newKeyName,
            key: `ak_${newKeyPermissions.includes("write") ? "live" : "dev"}_${Math.random().toString(36).substring(2, 15)}`,
            created: new Date().toISOString(),
            lastUsed: null,
            permissions: newKeyPermissions,
            enabled: true,
        };
        setApiKeys([...apiKeys, newKey]);
        setNewKeyName("");
        setNewKeyPermissions(["read"]);
        toast({
            title: "API Key Created",
            description: "Your new API key has been created successfully.",
        });
    };
    const handleRotateKey = (id) => {
        setApiKeys(apiKeys.map((key) => key.id === id
            ? Object.assign(Object.assign({}, key), { key: `ak_${key.permissions.includes("write") ? "live" : "dev"}_${Math.random().toString(36).substring(2, 15)}` }) : key));
        toast({
            title: "API Key Rotated",
            description: "Your API key has been rotated successfully.",
        });
    };
    const handleDeleteKey = (id) => {
        setApiKeys(apiKeys.filter((key) => key.id !== id));
        toast({
            title: "API Key Deleted",
            description: "Your API key has been deleted successfully.",
        });
    };
    const handleToggleKey = (id, enabled) => {
        setApiKeys(apiKeys.map((key) => (key.id === id ? Object.assign(Object.assign({}, key), { enabled }) : key)));
        toast({
            title: enabled ? "API Key Enabled" : "API Key Disabled",
            description: `Your API key has been ${enabled ? "enabled" : "disabled"} successfully.`,
        });
    };
    const formatDate = (dateString) => {
        if (!dateString)
            return "Never";
        return new Date(dateString).toLocaleString();
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "flex items-center justify-between", children: _jsx("h1", { className: "text-3xl font-bold", children: "API Keys" }) }), _jsxs(Tabs, { defaultValue: "keys", children: [_jsxs(TabsList, { children: [_jsx(TabsTrigger, { value: "keys", children: "API Keys" }), _jsx(TabsTrigger, { value: "usage", children: "Usage & Limits" }), _jsx(TabsTrigger, { value: "webhooks", children: "Webhooks" })] }), _jsxs(TabsContent, { value: "keys", className: "space-y-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Create New API Key" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid gap-4", children: [_jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "key-name", children: "Key Name" }), _jsx(Input, { id: "key-name", placeholder: "e.g. Production API Key", value: newKeyName, onChange: (e) => setNewKeyName(e.target.value) })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { children: "Permissions" }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Switch, { id: "read-permission", checked: newKeyPermissions.includes("read"), onCheckedChange: () => handleTogglePermission("read") }), _jsx(Label, { htmlFor: "read-permission", children: "Read" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Switch, { id: "write-permission", checked: newKeyPermissions.includes("write"), onCheckedChange: () => handleTogglePermission("write") }), _jsx(Label, { htmlFor: "write-permission", children: "Write" })] })] })] }), _jsxs(Button, { onClick: handleCreateKey, className: "w-full sm:w-auto", children: [_jsx(Plus, { className: "mr-2 h-4 w-4" }), " Create API Key"] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Your API Keys" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [apiKeys.map((apiKey) => (_jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg", children: [_jsxs("div", { className: "space-y-1 mb-4 sm:mb-0", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Key, { className: "h-4 w-4 mr-2 text-muted-foreground" }), _jsx("span", { className: "font-medium", children: apiKey.name }), !apiKey.enabled && (_jsx("span", { className: "ml-2 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-0.5 rounded", children: "Disabled" }))] }), _jsxs("div", { className: "text-sm text-muted-foreground", children: [apiKey.key.substring(0, 10), "...", " ", _jsx(Button, { variant: "ghost", size: "sm", className: "h-6 px-2", onClick: () => handleCopyKey(apiKey.key), children: _jsx(Copy, { className: "h-3 w-3" }) })] }), _jsxs("div", { className: "text-xs text-muted-foreground", children: ["Created: ", formatDate(apiKey.created), " \u2022 Last used:", " ", formatDate(apiKey.lastUsed)] }), _jsxs("div", { className: "flex gap-1 mt-1", children: [apiKey.permissions.includes("read") && (_jsx("span", { className: "text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-0.5 rounded", children: "Read" })), apiKey.permissions.includes("write") && (_jsx("span", { className: "text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-0.5 rounded", children: "Write" }))] })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-2 w-full sm:w-auto", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-2 sm:mb-0", children: [_jsx(Switch, { id: `toggle-${apiKey.id}`, checked: apiKey.enabled, onCheckedChange: (checked) => handleToggleKey(apiKey.id, checked) }), _jsx(Label, { htmlFor: `toggle-${apiKey.id}`, className: "text-sm", children: apiKey.enabled ? "Enabled" : "Disabled" })] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => handleRotateKey(apiKey.id), children: [_jsx(RefreshCw, { className: "h-4 w-4 mr-1" }), " Rotate"] }), _jsxs(Button, { variant: "destructive", size: "sm", onClick: () => handleDeleteKey(apiKey.id), children: [_jsx(Trash2, { className: "h-4 w-4 mr-1" }), " Delete"] })] })] }, apiKey.id))), apiKeys.length === 0 && (_jsx("div", { className: "text-center py-6 text-muted-foreground", children: "No API keys found. Create your first API key to get started." }))] }) })] })] }), _jsx(TabsContent, { value: "usage", className: "space-y-6", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "API Usage & Limits" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("h3", { className: "text-lg font-medium", children: "Current Plan: Free" }), _jsxs("div", { className: "text-sm text-muted-foreground", children: [_jsx("p", { children: "Your current plan includes:" }), _jsxs("ul", { className: "list-disc list-inside mt-2 space-y-1", children: [_jsx("li", { children: "1,000 API calls per month" }), _jsx("li", { children: "2 API keys" }), _jsx("li", { children: "Basic rate limiting" }), _jsx("li", { children: "Standard support" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("h3", { className: "text-lg font-medium", children: "Usage This Month" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "API Calls" }), _jsx("span", { children: "350 / 1,000" })] }), _jsx("div", { className: "h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden", children: _jsx("div", { className: "h-full bg-primary rounded-full", style: { width: "35%" } }) })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "API Keys" }), _jsxs("span", { children: [apiKeys.length, " / 2"] })] }), _jsx("div", { className: "h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden", children: _jsx("div", { className: "h-full bg-primary rounded-full", style: { width: `${(apiKeys.length / 2) * 100}%` } }) })] })] })] }), _jsx(Button, { variant: "outline", className: "w-full sm:w-auto", children: "Upgrade Plan" })] }) })] }) }), _jsx(TabsContent, { value: "webhooks", className: "space-y-6", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Webhooks" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsx("p", { className: "text-muted-foreground", children: "Webhooks allow your application to receive real-time updates about events in your Akii account." }), _jsxs("div", { className: "border rounded-lg p-6 text-center", children: [_jsx("h3", { className: "text-lg font-medium mb-2", children: "No Webhooks Configured" }), _jsx("p", { className: "text-sm text-muted-foreground mb-4", children: "You haven't set up any webhooks yet. Webhooks let you receive notifications when certain events occur." }), _jsxs(Button, { children: [_jsx(Plus, { className: "mr-2 h-4 w-4" }), " Add Webhook"] })] })] }) })] }) })] })] }));
};
export default APIKeys;
