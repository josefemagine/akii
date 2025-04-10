import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Settings, BarChart3, Code, Terminal, Server, Lock } from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";

export default function PrivateAI() {
  const [activeTab, setActiveTab] = useState("setup");
  const [apiStatus, setApiStatus] = useState("draft"); // draft, active
  const [requestCount, setRequestCount] = useState(0);
  const [tokenCount, setTokenCount] = useState(0);
  const [apiKey, setApiKey] = useState("");

  // Simulate loading data
  useState(() => {
    // Check if we have a deployed Private AI
    const isDeployed = localStorage.getItem("privateAIDeployed") === "true";

    if (isDeployed) {
      setApiStatus("active");
      setRequestCount(12458);
      setTokenCount(1250340);
      setApiKey("sk-akii-private-*****************");
    }
  });

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Private AI API</h1>
        <p className="text-muted-foreground">
          Deploy and manage your own private AI API with enhanced security and customization.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">
              API Status
            </CardTitle>
            <CardDescription>
              Current status of your Private AI API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {apiStatus === "draft" && (
                <Badge
                  variant="outline"
                  className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 hover:bg-amber-100 hover:dark:bg-amber-900/30"
                >
                  Not Deployed
                </Badge>
              )}
              {apiStatus === "active" && (
                <Badge
                  variant="outline"
                  className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 hover:bg-green-100 hover:dark:bg-green-900/30"
                >
                  Deployed
                </Badge>
              )}
            </div>
            <Separator className="my-4" />
            <div className="space-y-3">
              {apiKey && (
              <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">API Key</span>
                  <span className="text-sm font-medium">{apiKey}</span>
              </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Requests</span>
                <span className="text-sm font-medium">{requestCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Tokens Used
                </span>
                <span className="text-sm font-medium">{tokenCount.toLocaleString()}</span>
              </div>
              {apiStatus === "active" && (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setActiveTab("setup")}
                  >
                    Manage Configuration
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">API Interface</CardTitle>
            <CardDescription>
              Interact with your Private AI API directly
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64 bg-gray-100 rounded-md p-4 space-y-4">
            {apiStatus === "active" ? (
              <>
                <div className="bg-black rounded-md text-gray-200 font-mono text-xs p-3 h-44 overflow-y-auto">
                  <p className="text-green-400">$ curl https://api.akii.ai/v1/private-ai/completions \</p>
                  <p className="pl-4">-H "Authorization: Bearer {apiKey}" \</p>
                  <p className="pl-4">-H "Content-Type: application/json" \</p>
                  <p className="pl-4">-d '{`{
  "model": "akii-private-1",
  "prompt": "Explain how private AI works",
  "max_tokens": 100
}`}'</p>
                  <br />
                  <p className="text-blue-300">{`{
  "id": "cmpl-12345",
  "object": "text_completion",
  "created": 1677825456,
  "model": "akii-private-1",
  "choices": [
    {
      "text": "Private AI works by deploying AI models in isolated environments that ensure data privacy and security. It uses encryption, secure computing, and dedicated infrastructure to process data without exposing it to external systems or third parties...",
      "index": 0,
      "finish_reason": "length"
    }
  ],
  "usage": {
    "prompt_tokens": 5,
    "completion_tokens": 45,
    "total_tokens": 50
  }
}`}</p>
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" size="sm">
                    Test Connection
                  </Button>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Lock className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">Deploy your Private AI to access the API</p>
              <Button
                    className="mt-4" 
                onClick={() => setActiveTab("setup")}
              >
                    Set Up Now
              </Button>
            </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="setup" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Setup & Configuration
          </TabsTrigger>
          <TabsTrigger value="usage" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Usage & Analytics
          </TabsTrigger>
          <TabsTrigger value="docs" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            API Documentation
          </TabsTrigger>
        </TabsList>
        <TabsContent value="setup" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Private AI Configuration</CardTitle>
              <CardDescription>
                Configure your private AI deployment settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {apiStatus === "draft" ? (
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 rounded-md">
                    <p className="text-sm">
                      Deploy your own private AI API for enhanced security, customization, and dedicated resources.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="deployment-name">Deployment Name</Label>
                      <Input id="deployment-name" placeholder="my-private-ai" />
                      <p className="text-xs text-muted-foreground">A unique identifier for your deployment</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deployment-region">Deployment Region</Label>
                      <Select defaultValue="us-east">
                        <SelectTrigger id="deployment-region">
                          <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="us-east">US East (N. Virginia)</SelectItem>
                          <SelectItem value="us-west">US West (Oregon)</SelectItem>
                          <SelectItem value="eu-west">EU West (Ireland)</SelectItem>
                          <SelectItem value="ap-southeast">Asia Pacific (Singapore)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instance-type">Instance Type</Label>
                      <Select defaultValue="standard">
                        <SelectTrigger id="instance-type">
                          <SelectValue placeholder="Select instance type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Basic (2 vCPU, 8GB RAM)</SelectItem>
                          <SelectItem value="standard">Standard (4 vCPU, 16GB RAM)</SelectItem>
                          <SelectItem value="premium">Premium (8 vCPU, 32GB RAM)</SelectItem>
                          <SelectItem value="enterprise">Enterprise (16 vCPU, 64GB RAM)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="base-model">Base Model</Label>
                      <Select defaultValue="llama-2-7b">
                        <SelectTrigger id="base-model">
                          <SelectValue placeholder="Select base model" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="llama-2-7b">Llama 2 (7B)</SelectItem>
                          <SelectItem value="llama-2-13b">Llama 2 (13B)</SelectItem>
                          <SelectItem value="mistral-7b">Mistral (7B)</SelectItem>
                          <SelectItem value="akii-base">Akii Base Model</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Security & Privacy</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="encryption">Data Encryption</Label>
                          <p className="text-sm text-muted-foreground">
                            Encrypt all data at rest and in transit
                          </p>
                        </div>
                        <Switch id="encryption" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="ip-restriction">IP Restrictions</Label>
                          <p className="text-sm text-muted-foreground">
                            Restrict API access to specific IP addresses
                          </p>
                        </div>
                        <Switch id="ip-restriction" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="network-isolation">Network Isolation</Label>
                          <p className="text-sm text-muted-foreground">
                            Isolate your API in a private network
                          </p>
                        </div>
                        <Switch id="network-isolation" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="audit-logging">Audit Logging</Label>
                          <p className="text-sm text-muted-foreground">
                            Enable detailed logs of all API interactions
                          </p>
                        </div>
                        <Switch id="audit-logging" defaultChecked />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-200 rounded-md">
                    <p className="text-sm">
                      Estimated cost: <span className="font-medium">$750/month</span> based on selected configuration.
                      Actual costs may vary depending on usage.
                    </p>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline">Cancel</Button>
                    <Button onClick={() => {
                      setApiStatus("active");
                      setApiKey("sk-akii-private-*****************");
                    }}>
                      Deploy Private AI
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-4 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-200 rounded-md flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    <p className="text-sm">Your Private AI API is deployed and operational.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="api-key">API Key</Label>
                      <div className="flex">
                        <Input id="api-key" type="password" readOnly value="sk-akii-private-*****************" className="rounded-r-none" />
                        <Button variant="secondary" className="rounded-l-none">
                          Copy
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Lock className="h-3 w-3" /> Keep this key secure and don't share it publicly
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endpoint-url">API Endpoint</Label>
                      <div className="flex">
                        <Input id="endpoint-url" readOnly value="https://api.akii.ai/v1/private-ai" className="rounded-r-none" />
                        <Button variant="secondary" className="rounded-l-none">
                          Copy
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deployment-status">Deployment Status</Label>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                        <span className="text-sm">Healthy</span>
                        <Badge className="ml-auto">v1.2.3</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Last updated: 2 hours ago</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="current-model">Current Model</Label>
                      <div className="flex items-center">
                        <span className="text-sm">akii-private-1 (Based on Llama 2 13B)</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Fine-tuned with your custom data</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Advanced Settings</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="scaling-policy">Scaling Policy</Label>
                        <Select defaultValue="auto">
                          <SelectTrigger id="scaling-policy">
                            <SelectValue placeholder="Select policy" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="auto">Auto (Scale based on demand)</SelectItem>
                            <SelectItem value="fixed">Fixed (No scaling)</SelectItem>
                            <SelectItem value="scheduled">Scheduled (Time-based scaling)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="max-tokens">Max Tokens per Request</Label>
                        <Input id="max-tokens" type="number" defaultValue="4096" />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="rate-limiting">Rate Limiting</Label>
                          <p className="text-sm text-muted-foreground">
                            Limit requests per minute
                          </p>
                        </div>
                        <Switch id="rate-limiting" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="content-filtering">Content Filtering</Label>
                          <p className="text-sm text-muted-foreground">
                            Filter harmful or inappropriate content
                          </p>
                        </div>
                        <Switch id="content-filtering" defaultChecked />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="destructive" onClick={() => {
                      setApiStatus("draft");
                      setApiKey("");
                    }}>
                      Delete Deployment
                    </Button>
                    <Button>
                      Save Changes
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="usage" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>API Usage & Analytics</CardTitle>
              <CardDescription>
                Monitor your Private AI API usage and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{requestCount.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">+32% from last month</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Tokens Used</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{tokenCount.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">+41% from last month</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">120ms</div>
                      <p className="text-xs text-muted-foreground">-15% from last month</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Request Volume</h3>
                  <div className="h-64 bg-muted rounded-md flex items-center justify-center">
                    <p className="text-muted-foreground">Usage chart will appear here</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Top API Endpoints</h3>
                  <Card>
                    <div className="divide-y">
                      <div className="p-4 flex justify-between items-center">
                        <span className="font-medium">/completions</span>
                        <Badge variant="secondary">64%</Badge>
                      </div>
                      <div className="p-4 flex justify-between items-center">
                        <span className="font-medium">/chat/completions</span>
                        <Badge variant="secondary">28%</Badge>
                      </div>
                      <div className="p-4 flex justify-between items-center">
                        <span className="font-medium">/embeddings</span>
                        <Badge variant="secondary">5%</Badge>
                      </div>
                      <div className="p-4 flex justify-between items-center">
                        <span className="font-medium">/fine-tuning</span>
                        <Badge variant="secondary">2%</Badge>
                      </div>
                      <div className="p-4 flex justify-between items-center">
                        <span className="font-medium">/models</span>
                        <Badge variant="secondary">1%</Badge>
                      </div>
                    </div>
                  </Card>
                </div>
                
                <div className="flex justify-end">
                  <Button variant="outline">
                    Download Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="docs" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>API Documentation</CardTitle>
              <CardDescription>
                Learn how to integrate with your Private AI API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Quick Start</h3>
                <div className="p-4 rounded-md bg-muted">
                  <p className="font-mono text-sm mb-2">// Making a request to your Private AI API</p>
                  <pre className="bg-black rounded-md text-gray-200 font-mono text-xs p-3 overflow-x-auto">
{`fetch('https://api.akii.ai/v1/private-ai/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ${apiKey}'
  },
  body: JSON.stringify({
    model: 'akii-private-1',
    prompt: 'Explain how to use the API',
    max_tokens: 150,
    temperature: 0.7
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`}
                  </pre>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Available Endpoints</h3>
                <div className="space-y-3">
                  <div className="bg-gray-50 p-4 rounded-md border">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">POST</Badge>
                      <code className="font-mono text-sm">/v1/private-ai/completions</code>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Create a completion for the provided prompt and parameters.
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md border">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">POST</Badge>
                      <code className="font-mono text-sm">/v1/private-ai/chat/completions</code>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Create a completion for the chat message format.
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md border">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">POST</Badge>
                      <code className="font-mono text-sm">/v1/private-ai/embeddings</code>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Create embeddings for the provided text.
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md border">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">GET</Badge>
                      <code className="font-mono text-sm">/v1/private-ai/models</code>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      List available models in your Private AI.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 rounded-md flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <p className="text-sm">
                  For detailed API documentation, examples, and SDKs, visit our <a href="#" className="underline dark:text-blue-300">Developer Portal</a>.
                </p>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline">
                  Download OpenAPI Spec
                </Button>
                <Button>
                  View Full Documentation
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
