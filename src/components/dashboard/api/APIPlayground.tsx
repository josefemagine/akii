import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { Play, Copy, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast.ts";

export default function APIPlayground() {
  const [endpoint, setEndpoint] = useState("/api/v1/chat");
  const [method, setMethod] = useState("POST");
  const [apiKey, setApiKey] = useState("");
  const [isPrivateAIDeployed, setIsPrivateAIDeployed] = useState(false);
  const [requestBody, setRequestBody] = useState(
    JSON.stringify(
      {
        messages: [
          { role: "system", content: "You are a helpful AI assistant." },
          { role: "user", content: "Hello, can you help me with a question?" },
        ],
        model: "akii-standard-1",
        temperature: 0.7,
        max_tokens: 150,
      },
      null,
      2,
    ),
  );
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

  const handleSendRequest = async () => {
    if (!isPrivateAIDeployed) {
      toast({
        title: "Private AI Not Deployed",
        description:
          "Please deploy your Private AI instance before testing the API",
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
      await new Promise((resolve) => setTimeout(resolve, 1500));

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
              content:
                "Hello! I'm your private AI assistant. I'd be happy to help with your question. What would you like to know?",
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
    } catch (error) {
      console.error("Error making API request:", error);
      setResponse(
        JSON.stringify(
          {
            error: {
              message: "An error occurred while processing your request",
              type: "api_error",
            },
          },
          null,
          2,
        ),
      );

      toast({
        title: "Request Failed",
        description: "Failed to complete API request",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = (text: string) => {
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
    } catch (e) {
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

  return (
    <Card className="w-full bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold">API Playground</CardTitle>
        <CardDescription>
          Test your private AI API endpoints and generate code snippets.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="endpoint">Endpoint</Label>
              <Select value={endpoint} onValueChange={setEndpoint}>
                <SelectTrigger id="endpoint">
                  <SelectValue placeholder="Select endpoint" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="/api/v1/chat">Chat Completion</SelectItem>
                  <SelectItem value="/api/v1/embeddings">Embeddings</SelectItem>
                  <SelectItem value="/api/v1/documents">Documents</SelectItem>
                  <SelectItem value="/api/v1/search">Vector Search</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="method">Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger id="method">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="request">Request</TabsTrigger>
              <TabsTrigger value="response">Response</TabsTrigger>
            </TabsList>
            <TabsContent value="request" className="border rounded-md p-4">
              <Label htmlFor="requestBody">Request Body</Label>
              <Textarea
                id="requestBody"
                className="font-mono h-80 mt-2"
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
              />
            </TabsContent>
            <TabsContent value="response" className="border rounded-md p-4">
              <div className="flex justify-between items-center mb-2">
                <Label>Response</Label>
                {response && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyCode(response)}
                  >
                    <Copy size={16} className="mr-2" />
                    Copy
                  </Button>
                )}
              </div>
              <ScrollArea className="h-80 w-full rounded-md border p-4 bg-muted">
                <pre className="font-mono text-sm">
                  {isLoading
                    ? "Loading..."
                    : response ||
                      "No response yet. Send a request to see the response here."}
                </pre>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end">
            <Button
              onClick={handleSendRequest}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Play size={16} />
              {isLoading ? "Sending..." : "Send Request"}
            </Button>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Code Snippets</h3>
            <Tabs defaultValue="curl">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="curl">cURL</TabsTrigger>
                <TabsTrigger value="nodejs">Node.js</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
              </TabsList>
              <TabsContent value="curl" className="mt-2">
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => handleCopyCode(generateCurlCommand())}
                  >
                    <Copy size={16} />
                  </Button>
                  <ScrollArea className="h-60 w-full rounded-md border p-4 bg-muted">
                    <pre className="font-mono text-sm">
                      {generateCurlCommand()}
                    </pre>
                  </ScrollArea>
                </div>
              </TabsContent>
              <TabsContent value="nodejs" className="mt-2">
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => handleCopyCode(generateNodeJsCode())}
                  >
                    <Copy size={16} />
                  </Button>
                  <ScrollArea className="h-60 w-full rounded-md border p-4 bg-muted">
                    <pre className="font-mono text-sm">
                      {generateNodeJsCode()}
                    </pre>
                  </ScrollArea>
                </div>
              </TabsContent>
              <TabsContent value="python" className="mt-2">
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => handleCopyCode(generatePythonCode())}
                  >
                    <Copy size={16} />
                  </Button>
                  <ScrollArea className="h-60 w-full rounded-md border p-4 bg-muted">
                    <pre className="font-mono text-sm">
                      {generatePythonCode()}
                    </pre>
                  </ScrollArea>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
