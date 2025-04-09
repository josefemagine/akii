import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, Database, Link2, FileUp, Search, Tag, AlertCircle, Copy, } from "lucide-react";
const TrainingDataSelector = ({ onDataSelected = () => { }, existingData = [], }) => {
    const [selectedData, setSelectedData] = useState(existingData);
    const [searchQuery, setSearchQuery] = useState("");
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    // Mock data for demonstration
    const availableData = [
        {
            id: "doc-1",
            name: "Product Documentation.pdf",
            type: "document",
            size: "2.4 MB",
            status: "ready",
            dateAdded: "2023-06-15",
            tags: ["documentation", "product"],
        },
        {
            id: "doc-2",
            name: "FAQ Knowledge Base.docx",
            type: "document",
            size: "1.8 MB",
            status: "ready",
            dateAdded: "2023-06-10",
            tags: ["faq", "support"],
        },
        {
            id: "db-1",
            name: "Customer Support Tickets",
            type: "database",
            status: "ready",
            dateAdded: "2023-06-05",
            tags: ["support", "tickets"],
        },
        {
            id: "api-1",
            name: "Product API Documentation",
            type: "api",
            status: "ready",
            dateAdded: "2023-05-28",
            tags: ["api", "technical"],
        },
        {
            id: "zap-1",
            name: "Zendesk Support Tickets",
            type: "zapier",
            status: "processing",
            progress: 65,
            dateAdded: "2023-06-18",
            tags: ["zapier", "zendesk"],
        },
    ];
    const filteredData = availableData.filter((item) => {
        var _a;
        return item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ((_a = item.tags) === null || _a === void 0 ? void 0 : _a.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    });
    const handleDataToggle = (item) => {
        setSelectedData((prev) => {
            const isSelected = prev.some((i) => i.id === item.id);
            if (isSelected) {
                return prev.filter((i) => i.id !== item.id);
            }
            else {
                return [...prev, item];
            }
        });
    };
    const handleUpload = () => {
        // Simulate file upload
        setIsUploading(true);
        setUploadProgress(0);
        const interval = setInterval(() => {
            setUploadProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsUploading(false);
                    // Add mock uploaded file to selected data
                    const newFile = {
                        id: `doc-${Date.now()}`,
                        name: "Uploaded Document.pdf",
                        type: "document",
                        size: "3.2 MB",
                        status: "processing",
                        progress: 0,
                        dateAdded: new Date().toISOString().split("T")[0],
                        tags: ["new", "uploaded"],
                    };
                    setSelectedData((prev) => [...prev, newFile]);
                    return 100;
                }
                return prev + 10;
            });
        }, 300);
    };
    const handleSaveSelection = () => {
        onDataSelected(selectedData);
    };
    return (_jsxs("div", { className: "w-full bg-background p-6 rounded-lg border border-border", children: [_jsx("h2", { className: "text-2xl font-bold mb-6", children: "Training Data Selection" }), _jsx("p", { className: "text-muted-foreground mb-6", children: "Select existing data sources or upload new documents to train your AI agent. The more relevant data you provide, the better your agent will perform." }), _jsxs(Tabs, { defaultValue: "existing", className: "w-full", children: [_jsxs(TabsList, { className: "grid grid-cols-4 gap-4 mb-6", children: [_jsxs(TabsTrigger, { value: "existing", className: "flex items-center gap-2", children: [_jsx(Database, { className: "h-4 w-4" }), "Existing Data"] }), _jsxs(TabsTrigger, { value: "upload", className: "flex items-center gap-2", children: [_jsx(Upload, { className: "h-4 w-4" }), "Upload Files"] }), _jsxs(TabsTrigger, { value: "zapier", className: "flex items-center gap-2", children: [_jsx(Link2, { className: "h-4 w-4" }), "Zapier Integration"] }), _jsxs(TabsTrigger, { value: "selected", className: "flex items-center gap-2", children: [_jsx(FileText, { className: "h-4 w-4" }), "Selected (", selectedData.length, ")"] })] }), _jsxs(TabsContent, { value: "existing", className: "space-y-4", children: [_jsxs("div", { className: "flex items-center gap-4 mb-4", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx(Search, { className: "absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" }), _jsx(Input, { placeholder: "Search by name or tag...", className: "pl-9", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value) })] }), _jsx(Button, { variant: "outline", onClick: () => setSearchQuery(""), children: "Clear" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: filteredData.map((item) => {
                                    var _a;
                                    return (_jsxs(Card, { className: `cursor-pointer transition-all ${selectedData.some((i) => i.id === item.id) ? "ring-2 ring-primary" : ""}`, onClick: () => handleDataToggle(item), children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { className: "flex-1", children: [_jsx(CardTitle, { className: "text-base", children: item.name }), _jsxs(CardDescription, { children: [item.type === "document" ? `${item.size} • ` : "", "Added on ", item.dateAdded] })] }), item.status === "processing" && (_jsxs("div", { className: "text-amber-500 text-xs font-medium flex items-center gap-1", children: [_jsx("span", { children: "Processing" }), item.progress && (_jsx(Progress, { value: item.progress, className: "w-16 h-1.5" }))] })), item.status === "error" && (_jsxs("div", { className: "text-destructive text-xs font-medium flex items-center gap-1", children: [_jsx(AlertCircle, { className: "h-3 w-3" }), _jsx("span", { children: "Error" })] }))] }) }), _jsx(CardContent, { className: "pt-0 pb-2", children: _jsx("div", { className: "flex flex-wrap gap-1", children: (_a = item.tags) === null || _a === void 0 ? void 0 : _a.map((tag) => (_jsxs("div", { className: "bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded-full flex items-center gap-1", children: [_jsx(Tag, { className: "h-3 w-3" }), tag] }, tag))) }) }), _jsx(CardFooter, { className: "pt-2", children: _jsxs("div", { className: "flex items-center text-xs text-muted-foreground", children: [item.type === "document" && (_jsx(FileText, { className: "h-3 w-3 mr-1" })), item.type === "database" && (_jsx(Database, { className: "h-3 w-3 mr-1" })), item.type === "api" && (_jsx(FileText, { className: "h-3 w-3 mr-1" })), item.type === "zapier" && (_jsx(Link2, { className: "h-3 w-3 mr-1" })), item.type.charAt(0).toUpperCase() + item.type.slice(1)] }) })] }, item.id));
                                }) }), filteredData.length === 0 && (_jsxs("div", { className: "text-center py-12 text-muted-foreground", children: [_jsx(Search, { className: "h-12 w-12 mx-auto mb-4 opacity-20" }), _jsx("p", { children: "No data sources found matching your search criteria." }), _jsx(Button, { variant: "link", onClick: () => setSearchQuery(""), children: "Clear search" })] }))] }), _jsxs(TabsContent, { value: "upload", className: "space-y-4", children: [_jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "border-2 border-dashed rounded-lg p-12 text-center", children: [_jsx(Upload, { className: "h-12 w-12 mx-auto mb-4 text-muted-foreground" }), _jsx("h3", { className: "text-lg font-medium mb-2", children: "Drag and drop files here" }), _jsx("p", { className: "text-muted-foreground mb-4", children: "Supported formats: PDF, DOCX, TXT, CSV, JSON (Max 50MB)" }), _jsxs("div", { className: "flex justify-center gap-4", children: [_jsxs(Button, { onClick: handleUpload, disabled: isUploading, children: [_jsx(FileUp, { className: "h-4 w-4 mr-2" }), isUploading ? "Uploading..." : "Select Files"] }), _jsx(Button, { variant: "outline", disabled: isUploading, children: "Paste URL" })] }), isUploading && (_jsxs("div", { className: "mt-6", children: [_jsx("p", { className: "text-sm mb-2", children: "Uploading document..." }), _jsx(Progress, { value: uploadProgress, className: "h-2" })] }))] }) }) }), _jsxs("div", { className: "mt-4", children: [_jsx("h3", { className: "text-lg font-medium mb-2", children: "Upload Options" }), _jsx(Card, { children: _jsxs(CardContent, { className: "pt-6 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium", children: "PII Redaction" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Automatically detect and redact personal information" })] }), _jsx(Button, { variant: "outline", children: "Configure" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium", children: "Document Chunking" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Control how documents are split for processing" })] }), _jsx(Button, { variant: "outline", children: "Configure" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium", children: "Auto-tagging" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Automatically generate tags for uploaded content" })] }), _jsx(Button, { variant: "outline", children: "Configure" })] })] }) })] })] }), _jsxs(TabsContent, { value: "zapier", className: "space-y-4", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Connect with Zapier" }), _jsx(CardDescription, { children: "Import data from any of your favorite tools using Zapier integration" })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col items-center justify-center py-6", children: [_jsx(Link2, { className: "h-12 w-12 mb-4 text-primary" }), _jsx("h3", { className: "text-lg font-medium mb-2", children: "Zapier Integration" }), _jsx("p", { className: "text-muted-foreground mb-6 max-w-md text-center", children: "Connect to Zendesk, Intercom, Salesforce, and more to automatically import training data." }), _jsxs("div", { className: "flex gap-3", children: [_jsxs(Button, { children: [_jsx(Link2, { className: "h-4 w-4 mr-2" }), "Connect Zapier"] }), _jsx(Button, { variant: "outline", children: "View Documentation" })] })] }), _jsxs("div", { className: "border rounded-md p-4", children: [_jsx("h4", { className: "font-medium mb-2", children: "Zapier Connection Status" }), _jsxs("div", { className: "flex items-center gap-2 text-amber-500", children: [_jsx("div", { className: "h-2 w-2 rounded-full bg-amber-500" }), _jsx("span", { className: "text-sm", children: "Not Connected" })] }), _jsx("p", { className: "text-xs text-muted-foreground mt-2", children: "Connect your Zapier account to start importing data" })] })] })] }), _jsxs("div", { className: "mt-4", children: [_jsx("h3", { className: "text-lg font-medium mb-2", children: "Popular Integrations" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsx(Card, { children: _jsxs(CardContent, { className: "pt-6 text-center py-6", children: [_jsx("img", { src: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=100&q=80", alt: "Zendesk", className: "w-12 h-12 mx-auto mb-2 rounded" }), _jsx("h4", { className: "font-medium", children: "Zendesk" }), _jsx("p", { className: "text-xs text-muted-foreground mb-4", children: "Import support tickets" }), _jsx(Button, { variant: "outline", size: "sm", children: "Connect" })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "pt-6 text-center py-6", children: [_jsx("img", { src: "https://images.unsplash.com/photo-1611944212129-29977ae1398c?w=100&q=80", alt: "Salesforce", className: "w-12 h-12 mx-auto mb-2 rounded" }), _jsx("h4", { className: "font-medium", children: "Salesforce" }), _jsx("p", { className: "text-xs text-muted-foreground mb-4", children: "Import customer data" }), _jsx(Button, { variant: "outline", size: "sm", children: "Connect" })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "pt-6 text-center py-6", children: [_jsx("img", { src: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=100&q=80", alt: "Intercom", className: "w-12 h-12 mx-auto mb-2 rounded" }), _jsx("h4", { className: "font-medium", children: "Intercom" }), _jsx("p", { className: "text-xs text-muted-foreground mb-4", children: "Import chat history" }), _jsx(Button, { variant: "outline", size: "sm", children: "Connect" })] }) })] })] }), _jsxs(Card, { className: "mt-6", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Configure Zapier Zaps" }), _jsx(CardDescription, { children: "Set up automated workflows to import data from your tools" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "border rounded-md p-4", children: [_jsx("h4", { className: "font-medium mb-2", children: "Create a Zap" }), _jsx("p", { className: "text-sm text-muted-foreground mb-4", children: "Follow these steps to create a Zap that imports data to your AI agent" }), _jsxs("ol", { className: "list-decimal list-inside space-y-2 text-sm", children: [_jsx("li", { children: "Log in to your Zapier account" }), _jsx("li", { children: "Create a new Zap with your desired trigger (e.g., new Zendesk ticket)" }), _jsx("li", { children: "Add Akii as an action app" }), _jsx("li", { children: "Select \"Add Training Data\" as the action" }), _jsx("li", { children: "Configure the data mapping" }), _jsx("li", { children: "Test and activate your Zap" })] })] }), _jsxs("div", { className: "border rounded-md p-4", children: [_jsx("h4", { className: "font-medium mb-2", children: "API Key" }), _jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(Input, { type: "password", value: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", readOnly: true, className: "font-mono" }), _jsx(Button, { variant: "outline", size: "sm", children: _jsx(Copy, { className: "h-4 w-4" }) })] }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Use this API key when connecting Akii in Zapier" })] })] }) })] })] }), _jsx(TabsContent, { value: "selected", className: "space-y-4", children: selectedData.length > 0 ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsxs("h3", { className: "text-lg font-medium", children: [selectedData.length, " Data Sources Selected"] }), _jsx(Button, { variant: "outline", onClick: () => setSelectedData([]), children: "Clear All" })] }), _jsx("div", { className: "space-y-2", children: selectedData.map((item) => (_jsxs(Card, { className: "flex items-center p-4", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "font-medium", children: item.name }), _jsxs("div", { className: "flex items-center text-xs text-muted-foreground", children: [item.type === "document" && (_jsx(FileText, { className: "h-3 w-3 mr-1" })), item.type === "database" && (_jsx(Database, { className: "h-3 w-3 mr-1" })), item.type === "api" && (_jsx(FileText, { className: "h-3 w-3 mr-1" })), item.type === "zapier" && (_jsx(Link2, { className: "h-3 w-3 mr-1" })), item.type.charAt(0).toUpperCase() + item.type.slice(1), item.size && ` • ${item.size}`] })] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleDataToggle(item), children: "Remove" })] }, item.id))) })] })) : (_jsxs("div", { className: "text-center py-12 text-muted-foreground", children: [_jsx(FileText, { className: "h-12 w-12 mx-auto mb-4 opacity-20" }), _jsx("p", { children: "No data sources selected yet." }), _jsx("p", { className: "text-sm", children: "Select data from the Existing Data tab or upload new files." })] })) })] }), _jsxs("div", { className: "mt-8 flex justify-end gap-4", children: [_jsx(Button, { variant: "outline", children: "Cancel" }), _jsx(Button, { onClick: handleSaveSelection, disabled: selectedData.length === 0, children: "Save Selection" })] })] }));
};
export default TrainingDataSelector;
