import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
export default function APIDocumentation() {
    const [activeTab, setActiveTab] = useState("overview");
    const { toast } = useToast();
    const handleCopyCode = (text) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied",
            description: "Code copied to clipboard",
        });
    };
    return (_jsxs(Card, { className: "w-full bg-white shadow-sm", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: "text-xl font-bold", children: "API Documentation" }), _jsx(CardDescription, { children: "Reference documentation for your private AI API endpoints." })] }), _jsx(CardContent, { children: _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "chat", children: "Chat API" }), _jsx(TabsTrigger, { value: "embeddings", children: "Embeddings" }), _jsx(TabsTrigger, { value: "documents", children: "Documents" })] }), _jsxs(TabsContent, { value: "overview", className: "space-y-4 pt-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Getting Started" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Your private AI API provides a set of endpoints for integrating AI capabilities into your applications. All API requests require authentication using your API key." }), _jsxs("div", { className: "mt-4 rounded-md bg-muted p-4", children: [_jsx("h4", { className: "text-sm font-medium mb-2", children: "Base URL" }), _jsxs("div", { className: "flex items-center justify-between rounded-md bg-background p-2", children: [_jsx("code", { className: "text-xs font-mono", children: "https://injxxchotrvgvvzelhvj.supabase.co/v1/your-org-id" }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleCopyCode("https://injxxchotrvgvvzelhvj.supabase.co/v1/your-org-id"), children: _jsx(Copy, { size: 14 }) })] })] }), _jsxs("div", { className: "mt-4 rounded-md bg-muted p-4", children: [_jsx("h4", { className: "text-sm font-medium mb-2", children: "Authentication" }), _jsx("p", { className: "text-xs text-muted-foreground mb-2", children: "All API requests require an API key to be included in the Authorization header:" }), _jsxs("div", { className: "flex items-center justify-between rounded-md bg-background p-2", children: [_jsx("code", { className: "text-xs font-mono", children: "Authorization: Bearer YOUR_API_KEY" }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleCopyCode("Authorization: Bearer YOUR_API_KEY"), children: _jsx(Copy, { size: 14 }) })] })] })] }), _jsxs("div", { className: "space-y-2 mt-6", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Available Endpoints" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "rounded-md border p-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("span", { className: "inline-flex items-center rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-800 mr-2", children: "POST" }), _jsx("span", { className: "font-mono text-sm", children: "/api/v1/chat" })] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => setActiveTab("chat"), children: "View Details" })] }), _jsx("p", { className: "text-xs text-muted-foreground mt-2", children: "Generate chat completions with your private AI model." })] }), _jsxs("div", { className: "rounded-md border p-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("span", { className: "inline-flex items-center rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-800 mr-2", children: "POST" }), _jsx("span", { className: "font-mono text-sm", children: "/api/v1/embeddings" })] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => setActiveTab("embeddings"), children: "View Details" })] }), _jsx("p", { className: "text-xs text-muted-foreground mt-2", children: "Generate vector embeddings for text inputs." })] }), _jsxs("div", { className: "rounded-md border p-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("span", { className: "inline-flex items-center rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-800 mr-2", children: "POST" }), _jsx("span", { className: "font-mono text-sm", children: "/api/v1/documents" })] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => setActiveTab("documents"), children: "View Details" })] }), _jsx("p", { className: "text-xs text-muted-foreground mt-2", children: "Upload and process documents for your knowledge base." })] })] })] }), _jsx("div", { className: "mt-6", children: _jsxs(Button, { variant: "outline", className: "flex items-center gap-2", children: [_jsx(ExternalLink, { size: 16 }), "Full API Reference"] }) })] }), _jsx(TabsContent, { value: "chat", className: "space-y-4 pt-4", children: _jsxs("div", { className: "space-y-2", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Chat Completions API" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Generate chat completions with your private AI model. This endpoint is compatible with the OpenAI Chat API format." }), _jsx("div", { className: "mt-4 rounded-md bg-muted p-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx("span", { className: "inline-flex items-center rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-800 mr-2", children: "POST" }), _jsx("code", { className: "font-mono text-sm", children: "/api/v1/chat" })] }) }), _jsxs("div", { className: "mt-4", children: [_jsx("h4", { className: "text-sm font-medium mb-2", children: "Request Body" }), _jsx(ScrollArea, { className: "h-60 w-full rounded-md border p-4 bg-muted", children: _jsx("pre", { className: "font-mono text-xs", children: JSON.stringify({
                                                        messages: [
                                                            {
                                                                role: "system",
                                                                content: "You are a helpful AI assistant.",
                                                            },
                                                            {
                                                                role: "user",
                                                                content: "Hello, can you help me with a question?",
                                                            },
                                                        ],
                                                        model: "akii-standard-1",
                                                        temperature: 0.7,
                                                        max_tokens: 150,
                                                    }, null, 2) }) }), _jsxs(Button, { variant: "ghost", size: "sm", className: "mt-2", onClick: () => handleCopyCode(JSON.stringify({
                                                    messages: [
                                                        {
                                                            role: "system",
                                                            content: "You are a helpful AI assistant.",
                                                        },
                                                        {
                                                            role: "user",
                                                            content: "Hello, can you help me with a question?",
                                                        },
                                                    ],
                                                    model: "akii-standard-1",
                                                    temperature: 0.7,
                                                    max_tokens: 150,
                                                }, null, 2)), children: [_jsx(Copy, { size: 14, className: "mr-2" }), "Copy Request"] })] }), _jsxs("div", { className: "mt-4", children: [_jsx("h4", { className: "text-sm font-medium mb-2", children: "Response" }), _jsx(ScrollArea, { className: "h-60 w-full rounded-md border p-4 bg-muted", children: _jsx("pre", { className: "font-mono text-xs", children: JSON.stringify({
                                                        id: "resp_abc123",
                                                        object: "chat.completion",
                                                        created: 1677858242,
                                                        model: "akii-standard-1",
                                                        choices: [
                                                            {
                                                                index: 0,
                                                                message: {
                                                                    role: "assistant",
                                                                    content: "Hello! I'm your private AI assistant. I'd be happy to help with your question. What would you like to know?",
                                                                },
                                                                finish_reason: "stop",
                                                            },
                                                        ],
                                                        usage: {
                                                            prompt_tokens: 29,
                                                            completion_tokens: 24,
                                                            total_tokens: 53,
                                                        },
                                                    }, null, 2) }) }), _jsxs(Button, { variant: "ghost", size: "sm", className: "mt-2", onClick: () => handleCopyCode(JSON.stringify({
                                                    id: "resp_abc123",
                                                    object: "chat.completion",
                                                    created: 1677858242,
                                                    model: "akii-standard-1",
                                                    choices: [
                                                        {
                                                            index: 0,
                                                            message: {
                                                                role: "assistant",
                                                                content: "Hello! I'm your private AI assistant. I'd be happy to help with your question. What would you like to know?",
                                                            },
                                                            finish_reason: "stop",
                                                        },
                                                    ],
                                                    usage: {
                                                        prompt_tokens: 29,
                                                        completion_tokens: 24,
                                                        total_tokens: 53,
                                                    },
                                                }, null, 2)), children: [_jsx(Copy, { size: 14, className: "mr-2" }), "Copy Response"] })] })] }) }), _jsx(TabsContent, { value: "embeddings", className: "space-y-4 pt-4", children: _jsxs("div", { className: "space-y-2", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Embeddings API" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Generate vector embeddings for text inputs. These embeddings can be used for semantic search, clustering, and other NLP tasks." }), _jsx("div", { className: "mt-4 rounded-md bg-muted p-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx("span", { className: "inline-flex items-center rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-800 mr-2", children: "POST" }), _jsx("code", { className: "font-mono text-sm", children: "/api/v1/embeddings" })] }) }), _jsxs("div", { className: "mt-4", children: [_jsx("h4", { className: "text-sm font-medium mb-2", children: "Request Body" }), _jsx(ScrollArea, { className: "h-40 w-full rounded-md border p-4 bg-muted", children: _jsx("pre", { className: "font-mono text-xs", children: JSON.stringify({
                                                        input: "The quick brown fox jumps over the lazy dog",
                                                        model: "akii-embedding-1",
                                                    }, null, 2) }) }), _jsxs(Button, { variant: "ghost", size: "sm", className: "mt-2", onClick: () => handleCopyCode(JSON.stringify({
                                                    input: "The quick brown fox jumps over the lazy dog",
                                                    model: "akii-embedding-1",
                                                }, null, 2)), children: [_jsx(Copy, { size: 14, className: "mr-2" }), "Copy Request"] })] }), _jsxs("div", { className: "mt-4", children: [_jsx("h4", { className: "text-sm font-medium mb-2", children: "Response" }), _jsx(ScrollArea, { className: "h-60 w-full rounded-md border p-4 bg-muted", children: _jsx("pre", { className: "font-mono text-xs", children: JSON.stringify({
                                                        object: "embedding",
                                                        data: [
                                                            {
                                                                object: "embedding",
                                                                embedding: [
                                                                    0.0023064255, -0.009327292, -0.0028842222,
                                                                    // ... (truncated for brevity)
                                                                    0.01851064, 0.008510631, 0.019030416,
                                                                ],
                                                                index: 0,
                                                            },
                                                        ],
                                                        model: "akii-embedding-1",
                                                        usage: {
                                                            prompt_tokens: 8,
                                                            total_tokens: 8,
                                                        },
                                                    }, null, 2) }) })] })] }) }), _jsx(TabsContent, { value: "documents", className: "space-y-4 pt-4", children: _jsxs("div", { className: "space-y-2", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Documents API" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Upload and process documents for your knowledge base. This API allows you to add documents to your private AI's knowledge base for retrieval and context." }), _jsx("div", { className: "mt-4 rounded-md bg-muted p-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx("span", { className: "inline-flex items-center rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-800 mr-2", children: "POST" }), _jsx("code", { className: "font-mono text-sm", children: "/api/v1/documents" })] }) }), _jsxs("div", { className: "mt-4", children: [_jsx("h4", { className: "text-sm font-medium mb-2", children: "Request Body (multipart/form-data)" }), _jsx("p", { className: "text-xs text-muted-foreground mb-2", children: "This endpoint accepts multipart/form-data with the following fields:" }), _jsxs("ul", { className: "list-disc pl-5 text-xs text-muted-foreground space-y-1", children: [_jsxs("li", { children: [_jsx("strong", { children: "file:" }), " The document file (PDF, DOCX, TXT, etc.)"] }), _jsxs("li", { children: [_jsx("strong", { children: "collection_id:" }), " (Optional) The ID of the collection to add the document to"] }), _jsxs("li", { children: [_jsx("strong", { children: "metadata:" }), " (Optional) JSON string with metadata about the document"] })] })] }), _jsxs("div", { className: "mt-4", children: [_jsx("h4", { className: "text-sm font-medium mb-2", children: "Response" }), _jsx(ScrollArea, { className: "h-40 w-full rounded-md border p-4 bg-muted", children: _jsx("pre", { className: "font-mono text-xs", children: JSON.stringify({
                                                        id: "doc_abc123",
                                                        object: "document",
                                                        created: 1677858242,
                                                        filename: "product_manual.pdf",
                                                        size_bytes: 1245678,
                                                        status: "processing",
                                                        collection_id: "col_xyz789",
                                                        metadata: {
                                                            title: "Product Manual",
                                                            category: "Technical Documentation",
                                                        },
                                                    }, null, 2) }) })] })] }) })] }) })] }));
}
