import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  Code,
  Key,
  Server,
  Settings,
  ExternalLink,
} from "lucide-react";
import PrivateAISetup from "@/components/dashboard/api/PrivateAISetup";
import APIKeysList from "@/components/dashboard/api/APIKeysList";
import APIPlayground from "@/components/dashboard/api/APIPlayground";
import APIDocumentation from "@/components/dashboard/api/APIDocumentation";
import { useToast } from "@/components/ui/use-toast";

export default function PrivateAI() {
  const [activeTab, setActiveTab] = useState("setup");
  const [instanceStatus, setInstanceStatus] = useState("pending"); // pending, deploying, active
  const [apiKeyCount, setApiKeyCount] = useState(0);
  const [requestCount, setRequestCount] = useState(0);
  const [selectedModel, setSelectedModel] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // In a real implementation, fetch the instance status from Supabase
    // For now, use mock data
    const timer = setTimeout(() => {
      // This simulates checking the status after components mount
      if (localStorage.getItem("privateAiDeployed") === "true") {
        setInstanceStatus("active");
        setApiKeyCount(3);
        setRequestCount(124);
        setSelectedModel("akii-standard-1");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Private AI API</h1>
        <p className="text-muted-foreground">
          Set up, configure, and manage your organization's private AI instance.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">
              Instance Status
            </CardTitle>
            <CardDescription>
              Current status of your private AI instance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {instanceStatus === "pending" && (
                <Badge
                  variant="outline"
                  className="bg-amber-100 text-amber-800 hover:bg-amber-100"
                >
                  Pending Deployment
                </Badge>
              )}
              {instanceStatus === "deploying" && (
                <Badge
                  variant="outline"
                  className="bg-blue-100 text-blue-800 hover:bg-blue-100"
                >
                  Deploying
                </Badge>
              )}
              {instanceStatus === "active" && (
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-800 hover:bg-green-100"
                >
                  Active
                </Badge>
              )}
            </div>
            <Separator className="my-4" />
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Model</span>
                <span className="text-sm font-medium">
                  {instanceStatus === "active"
                    ? selectedModel
                    : "Not Configured"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">API Keys</span>
                <span className="text-sm font-medium">
                  {apiKeyCount} Active
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Requests (30d)
                </span>
                <span className="text-sm font-medium">{requestCount}</span>
              </div>
              {instanceStatus === "active" && (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-between"
                    onClick={() => {
                      toast({
                        title: "API Endpoint",
                        description:
                          "Your private API endpoint has been copied to clipboard.",
                      });
                      navigator.clipboard.writeText(
                        "https://api.akii.com/v1/your-org-id",
                      );
                    }}
                  >
                    <span className="text-xs font-mono">
                      https://api.akii.com/v1/your-org-id
                    </span>
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
            <CardDescription>
              Common tasks for your private AI instance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setActiveTab("setup")}
              >
                <Server className="mr-2 h-4 w-4" />
                Configure Instance
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setActiveTab("keys")}
              >
                <Key className="mr-2 h-4 w-4" />
                Manage API Keys
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setActiveTab("playground")}
              >
                <Code className="mr-2 h-4 w-4" />
                API Playground
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">Documentation</CardTitle>
            <CardDescription>
              Resources to help you integrate with your private AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Getting Started</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Learn how to set up and configure your private AI instance.
                </p>
                <Button variant="link" className="h-auto p-0 mt-1">
                  <span className="text-xs">Read Guide</span>
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
              <div>
                <h3 className="text-sm font-medium">API Reference</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Detailed documentation for all API endpoints and parameters.
                </p>
                <Button variant="link" className="h-auto p-0 mt-1">
                  <span className="text-xs">View Reference</span>
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
              <div>
                <h3 className="text-sm font-medium">Code Examples</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Sample code in various languages to integrate with your AI.
                </p>
                <Button variant="link" className="h-auto p-0 mt-1">
                  <span className="text-xs">See Examples</span>
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="setup" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Setup & Configuration
          </TabsTrigger>
          <TabsTrigger value="keys" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="playground" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            API Playground
          </TabsTrigger>
          <TabsTrigger value="docs" className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            Documentation
          </TabsTrigger>
        </TabsList>
        <TabsContent value="setup" className="mt-6">
          <PrivateAISetup />
        </TabsContent>
        <TabsContent value="keys" className="mt-6">
          <APIKeysList />
        </TabsContent>
        <TabsContent value="playground" className="mt-6">
          <APIPlayground />
        </TabsContent>
        <TabsContent value="docs" className="mt-6">
          <APIDocumentation />
        </TabsContent>
      </Tabs>
    </div>
  );
}
