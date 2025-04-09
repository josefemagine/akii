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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Copy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
export default function APIPlayground() {
    const [endpoint, setEndpoint] = useState("/api/v1/chat");
    const [method, setMethod] = useState("POST");
    const [apiKey, setApiKey] = useState("");
    const [isPrivateAIDeployed, setIsPrivateAIDeployed] = useState(false);
    const [requestBody, setRequestBody] = useState(JSON.stringify({
        messages: [
            { role: "system", content: "You are a helpful AI assistant." },
            { role: "user", content: "Hello, can you help me with a question?" },
        ],
        model: "akii-standard-1",
        temperature: 0.7,
        max_tokens: 150,
    }, null, 2));
    const [response, setResponse] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTab, setSelectedTab] = useState("request");
    const [selectedLanguage, setSelectedLanguage] = useState("javascript");
    const { toast } = useToast();
    useEffect(() => {
        // Check if Private AI is deployed
        const isDeployed = localStorage.getItem("privateAiDeployed") === "true";
        setIsPrivateAIDeployed(isDeployed);
        // If deployed, try to get the first API key from localStorage
        if (isDeployed) {
            const storedApiKey = localStorage.getItem("lastCreatedApiKey");
            if (storedApiKey) {
                setApiKey(storedApiKey);
            }
        }
    }, []);
    const handleSendRequest = () => __awaiter(this, void 0, void 0, function* () {
        if (!isPrivateAIDeployed) {
            toast({
                title: "Private AI Not Deployed",
                description: "Please deploy your Private AI instance before testing the API",
                variant: "destructive",
            });
            return;
        }
        if (!apiKey) {
            toast({
                title: "API Key Required",
                description: "Please enter an API key to make a request",
                variant: "destructive",
            });
            return;
        }
        setIsLoading(true);
        setSelectedTab("response");
        try {
            // In a real implementation, this would make an actual API request
            // For now, simulate a response
            yield new Promise((resolve) => setTimeout(resolve, 1500));
            const mockResponse = {
                id: "resp_" + Math.random().toString(36).substring(2, 10),
                object: "chat.completion",
                created: Date.now(),
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
            };
            setResponse(JSON.stringify(mockResponse, null, 2));
            toast({
                title: "Request Successful",
                description: "API request completed successfully",
            });
        }
        catch (error) {
            console.error("Error making API request:", error);
            setResponse(JSON.stringify({
                error: {
                    message: "An error occurred while processing your request",
                    type: "api_error",
                },
            }, null, 2));
            toast({
                title: "Request Failed",
                description: "Failed to complete API request",
                variant: "destructive",
            });
        }
        finally {
            setIsLoading(false);
        }
    });
    const handleCopyCode = (text) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied",
            description: "Code copied to clipboard",
        });
    };
    const generateCurlCommand = () => {
        try {
            const parsedBody = JSON.parse(requestBody);
            return `curl -X ${method} \
  https://injxxchotrvgvvzelhvj.supabase.co${endpoint} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${apiKey || "YOUR_API_KEY"}" \
  -d '${JSON.stringify(parsedBody)}'`;
        }
        catch (e) {
            return `curl -X ${method} \
  https://injxxchotrvgvvzelhvj.supabase.co${endpoint} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${apiKey || "YOUR_API_KEY"}" \
  -d '${requestBody}'`;
        }
    };
    const generateNodeJsCode = () => {
        return `const axios = require('axios');

async function makeRequest() {
  try {
    const response = await axios({
      method: '${method}',
      url: 'https://injxxchotrvgvvzelhvj.supabase.co${endpoint}',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${apiKey || "YOUR_API_KEY"}'
      },
      data: ${requestBody}
    });
    
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

makeRequest();`;
    };
    const generatePythonCode = () => {
        return `import requests
import json

url = "https://injxxchotrvgvvzelhvj.supabase.co${endpoint}"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer ${apiKey || "YOUR_API_KEY"}"
}

payload = ${requestBody}

response = requests.${method.toLowerCase()}(url, headers=headers, json=payload)

print(response.status_code)
print(response.json())`;
    };
    return (_jsxs(Card, { className: "w-full bg-white shadow-sm", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: "text-xl font-bold", children: "API Playground" }), _jsx(CardDescription, { children: "Test your private AI API endpoints and generate code snippets." })] }), _jsx(CardContent, { children: _jsxs("div", { className: "grid gap-6", children: [_jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-3", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "endpoint", children: "Endpoint" }), _jsxs(Select, { value: endpoint, onValueChange: setEndpoint, children: [_jsx(SelectTrigger, { id: "endpoint", children: _jsx(SelectValue, { placeholder: "Select endpoint" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "/api/v1/chat", children: "Chat Completion" }), _jsx(SelectItem, { value: "/api/v1/embeddings", children: "Embeddings" }), _jsx(SelectItem, { value: "/api/v1/documents", children: "Documents" }), _jsx(SelectItem, { value: "/api/v1/search", children: "Vector Search" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "method", children: "Method" }), _jsxs(Select, { value: method, onValueChange: setMethod, children: [_jsx(SelectTrigger, { id: "method", children: _jsx(SelectValue, { placeholder: "Select method" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "GET", children: "GET" }), _jsx(SelectItem, { value: "POST", children: "POST" }), _jsx(SelectItem, { value: "PUT", children: "PUT" }), _jsx(SelectItem, { value: "DELETE", children: "DELETE" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "apiKey", children: "API Key" }), _jsx(Input, { id: "apiKey", type: "password", placeholder: "Enter your API key", value: apiKey, onChange: (e) => setApiKey(e.target.value) })] })] }), _jsxs(Tabs, { value: selectedTab, onValueChange: setSelectedTab, children: [_jsxs(TabsList, { className: "grid w-full grid-cols-2", children: [_jsx(TabsTrigger, { value: "request", children: "Request" }), _jsx(TabsTrigger, { value: "response", children: "Response" })] }), _jsxs(TabsContent, { value: "request", className: "border rounded-md p-4", children: [_jsx(Label, { htmlFor: "requestBody", children: "Request Body" }), _jsx(Textarea, { id: "requestBody", className: "font-mono h-80 mt-2", value: requestBody, onChange: (e) => setRequestBody(e.target.value) })] }), _jsxs(TabsContent, { value: "response", className: "border rounded-md p-4", children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsx(Label, { children: "Response" }), response && (_jsxs(Button, { variant: "ghost", size: "sm", onClick: () => handleCopyCode(response), children: [_jsx(Copy, { size: 16, className: "mr-2" }), "Copy"] }))] }), _jsx(ScrollArea, { className: "h-80 w-full rounded-md border p-4 bg-muted", children: _jsx("pre", { className: "font-mono text-sm", children: isLoading
                                                    ? "Loading..."
                                                    : response ||
                                                        "No response yet. Send a request to see the response here." }) })] })] }), _jsx("div", { className: "flex justify-end", children: _jsxs(Button, { onClick: handleSendRequest, disabled: isLoading, className: "flex items-center gap-2", children: [_jsx(Play, { size: 16 }), isLoading ? "Sending..." : "Send Request"] }) }), _jsxs("div", { className: "mt-6", children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Code Snippets" }), _jsxs(Tabs, { defaultValue: "curl", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-3", children: [_jsx(TabsTrigger, { value: "curl", children: "cURL" }), _jsx(TabsTrigger, { value: "nodejs", children: "Node.js" }), _jsx(TabsTrigger, { value: "python", children: "Python" })] }), _jsx(TabsContent, { value: "curl", className: "mt-2", children: _jsxs("div", { className: "relative", children: [_jsx(Button, { variant: "ghost", size: "sm", className: "absolute top-2 right-2", onClick: () => handleCopyCode(generateCurlCommand()), children: _jsx(Copy, { size: 16 }) }), _jsx(ScrollArea, { className: "h-60 w-full rounded-md border p-4 bg-muted", children: _jsx("pre", { className: "font-mono text-sm", children: generateCurlCommand() }) })] }) }), _jsx(TabsContent, { value: "nodejs", className: "mt-2", children: _jsxs("div", { className: "relative", children: [_jsx(Button, { variant: "ghost", size: "sm", className: "absolute top-2 right-2", onClick: () => handleCopyCode(generateNodeJsCode()), children: _jsx(Copy, { size: 16 }) }), _jsx(ScrollArea, { className: "h-60 w-full rounded-md border p-4 bg-muted", children: _jsx("pre", { className: "font-mono text-sm", children: generateNodeJsCode() }) })] }) }), _jsx(TabsContent, { value: "python", className: "mt-2", children: _jsxs("div", { className: "relative", children: [_jsx(Button, { variant: "ghost", size: "sm", className: "absolute top-2 right-2", onClick: () => handleCopyCode(generatePythonCode()), children: _jsx(Copy, { size: 16 }) }), _jsx(ScrollArea, { className: "h-60 w-full rounded-md border p-4 bg-muted", children: _jsx("pre", { className: "font-mono text-sm", children: generatePythonCode() }) })] }) })] })] })] }) })] }));
}
