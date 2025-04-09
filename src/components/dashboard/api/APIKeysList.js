var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Copy, Key, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
export default function APIKeysList() {
    const [apiKeys, setApiKeys] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newKeyName, setNewKeyName] = useState("");
    const [newKeyPermissions, setNewKeyPermissions] = useState([
        "read",
    ]);
    const [newlyCreatedKey, setNewlyCreatedKey] = useState(null);
    const { toast } = useToast();
    // Mock data for demonstration
    const mockApiKeys = [
        {
            id: "1",
            name: "Production API Key",
            prefix: "ak_prod_",
            created_at: "2023-10-15T14:30:00Z",
            last_used: "2023-10-28T09:15:22Z",
            permissions: ["read", "write"],
        },
        {
            id: "2",
            name: "Development API Key",
            prefix: "ak_dev_",
            created_at: "2023-10-20T11:45:00Z",
            last_used: "2023-10-27T16:30:45Z",
            permissions: ["read"],
        },
        {
            id: "3",
            name: "Testing API Key",
            prefix: "ak_test_",
            created_at: "2023-10-25T08:20:00Z",
            permissions: ["read", "write", "admin"],
        },
    ];
    useEffect(() => {
        // In a real implementation, fetch API keys from Supabase
        // For now, use mock data
        const isDeployed = localStorage.getItem("privateAiDeployed") === "true";
        if (isDeployed) {
            setApiKeys(mockApiKeys);
        }
        else {
            setApiKeys([]);
        }
        setIsLoading(false);
    }, []);
    const handleCreateKey = () => __awaiter(this, void 0, void 0, function* () {
        const isDeployed = localStorage.getItem("privateAiDeployed") === "true";
        if (!isDeployed) {
            toast({
                title: "Error",
                description: "You need to deploy your Private AI instance first",
                variant: "destructive",
            });
            return;
        }
        if (!newKeyName.trim()) {
            toast({
                title: "Error",
                description: "Please provide a name for your API key",
                variant: "destructive",
            });
            return;
        }
        setIsLoading(true);
        try {
            // In a real implementation, create API key in Supabase
            // For now, simulate API key creation
            const newKeyPrefix = `ak_${Math.random().toString(36).substring(2, 8)}_`;
            const fullKey = `${newKeyPrefix}${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
            const newKey = {
                id: (apiKeys.length + 1).toString(),
                name: newKeyName,
                prefix: newKeyPrefix,
                created_at: new Date().toISOString(),
                permissions: newKeyPermissions,
            };
            setApiKeys([...apiKeys, newKey]);
            setNewlyCreatedKey(fullKey);
            setNewKeyName("");
            setNewKeyPermissions(["read"]);
            // Store the API key in localStorage for the API Playground to use
            localStorage.setItem("lastCreatedApiKey", fullKey);
            toast({
                title: "Success",
                description: "API key created successfully",
            });
        }
        catch (error) {
            console.error("Error creating API key:", error);
            toast({
                title: "Error",
                description: "Failed to create API key",
                variant: "destructive",
            });
        }
        finally {
            setIsLoading(false);
        }
    });
    const handleCopyKey = (key) => {
        navigator.clipboard.writeText(key);
        toast({
            title: "Copied",
            description: "API key copied to clipboard",
        });
    };
    const handleDeleteKey = (id) => __awaiter(this, void 0, void 0, function* () {
        setIsLoading(true);
        try {
            // In a real implementation, delete API key from Supabase
            setApiKeys(apiKeys.filter((key) => key.id !== id));
            toast({
                title: "Success",
                description: "API key deleted successfully",
            });
        }
        catch (error) {
            console.error("Error deleting API key:", error);
            toast({
                title: "Error",
                description: "Failed to delete API key",
                variant: "destructive",
            });
        }
        finally {
            setIsLoading(false);
        }
    });
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };
    return (_jsxs(Card, { className: "w-full bg-white shadow-sm", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: "text-xl font-bold", children: "API Keys" }), _jsx(CardDescription, { children: "Create and manage API keys for your private AI instance." })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "mb-4 flex justify-end", children: _jsxs(Dialog, { open: isCreateDialogOpen, onOpenChange: setIsCreateDialogOpen, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { className: "flex items-center gap-2", children: [_jsx(Plus, { size: 16 }), "Create New API Key"] }) }), _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Create New API Key" }), _jsx(DialogDescription, { children: "Create a new API key to access your private AI instance." })] }), _jsxs("div", { className: "grid gap-4 py-4", children: [_jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "name", children: "Key Name" }), _jsx(Input, { id: "name", placeholder: "e.g., Production API Key", value: newKeyName, onChange: (e) => setNewKeyName(e.target.value) })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { children: "Permissions" }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx(Badge, { variant: newKeyPermissions.includes("read")
                                                                        ? "default"
                                                                        : "outline", className: "cursor-pointer", onClick: () => {
                                                                        if (newKeyPermissions.includes("read")) {
                                                                            setNewKeyPermissions(newKeyPermissions.filter((p) => p !== "read"));
                                                                        }
                                                                        else {
                                                                            setNewKeyPermissions([...newKeyPermissions, "read"]);
                                                                        }
                                                                    }, children: "Read" }), _jsx(Badge, { variant: newKeyPermissions.includes("write")
                                                                        ? "default"
                                                                        : "outline", className: "cursor-pointer", onClick: () => {
                                                                        if (newKeyPermissions.includes("write")) {
                                                                            setNewKeyPermissions(newKeyPermissions.filter((p) => p !== "write"));
                                                                        }
                                                                        else {
                                                                            setNewKeyPermissions([...newKeyPermissions, "write"]);
                                                                        }
                                                                    }, children: "Write" }), _jsx(Badge, { variant: newKeyPermissions.includes("admin")
                                                                        ? "default"
                                                                        : "outline", className: "cursor-pointer", onClick: () => {
                                                                        if (newKeyPermissions.includes("admin")) {
                                                                            setNewKeyPermissions(newKeyPermissions.filter((p) => p !== "admin"));
                                                                        }
                                                                        else {
                                                                            setNewKeyPermissions([...newKeyPermissions, "admin"]);
                                                                        }
                                                                    }, children: "Admin" })] })] })] }), newlyCreatedKey && (_jsx("div", { className: "mb-4 rounded-md bg-yellow-50 p-4", children: _jsxs("div", { className: "flex items-start", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx(AlertCircle, { className: "h-5 w-5 text-yellow-400", "aria-hidden": "true" }) }), _jsxs("div", { className: "ml-3", children: [_jsx("h3", { className: "text-sm font-medium text-yellow-800", children: "Important" }), _jsxs("div", { className: "mt-2 text-sm text-yellow-700", children: [_jsx("p", { children: "This is the only time you'll see this API key. Please copy it now:" }), _jsxs("div", { className: "mt-2 flex items-center justify-between rounded-md bg-yellow-100 p-2", children: [_jsx("code", { className: "text-sm font-mono", children: newlyCreatedKey }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleCopyKey(newlyCreatedKey), children: _jsx(Copy, { size: 16 }) })] })] })] })] }) })), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => {
                                                        setIsCreateDialogOpen(false);
                                                        setNewlyCreatedKey(null);
                                                    }, children: "Close" }), !newlyCreatedKey && (_jsx(Button, { onClick: handleCreateKey, disabled: isLoading, children: isLoading ? "Creating..." : "Create API Key" }))] })] })] }) }), _jsx("div", { className: "rounded-md border", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Name" }), _jsx(TableHead, { children: "Key Prefix" }), _jsx(TableHead, { children: "Created" }), _jsx(TableHead, { children: "Last Used" }), _jsx(TableHead, { children: "Permissions" }), _jsx(TableHead, { className: "text-right", children: "Actions" })] }) }), _jsx(TableBody, { children: apiKeys.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 6, className: "text-center py-6 text-muted-foreground", children: "No API keys found. Create your first API key to get started." }) })) : (apiKeys.map((key) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: key.name }), _jsx(TableCell, { children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Key, { size: 16, className: "text-muted-foreground" }), _jsxs("code", { className: "bg-muted px-1 py-0.5 rounded text-xs", children: [key.prefix, "***"] })] }) }), _jsx(TableCell, { children: formatDate(key.created_at) }), _jsx(TableCell, { children: key.last_used ? formatDate(key.last_used) : "Never used" }), _jsx(TableCell, { children: _jsx("div", { className: "flex flex-wrap gap-1", children: key.permissions.map((permission) => (_jsx(Badge, { variant: "secondary", className: "text-xs", children: permission }, permission))) }) }), _jsx(TableCell, { className: "text-right", children: _jsx("div", { className: "flex justify-end gap-2", children: _jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleDeleteKey(key.id), disabled: isLoading, children: _jsx(Trash2, { size: 16, className: "text-red-500" }) }) }) })] }, key.id)))) })] }) })] })] }));
}
