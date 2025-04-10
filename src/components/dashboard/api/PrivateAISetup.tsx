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
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { Slider } from "@/components/ui/slider.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Progress } from "@/components/ui/progress.tsx";
import { AlertCircle, Check, Info, Server, Shield, Zap } from "lucide-react";
import { useToast } from "@/components/ui/use-toast.ts";
import { supabase } from "@/lib/supabase.tsx";

export default function PrivateAISetup() {
  const [activeTab, setActiveTab] = useState("configuration");
  const [modelType, setModelType] = useState("shared");
  const [selectedModel, setSelectedModel] = useState("akii-standard-1");
  const [customModelUrl, setCustomModelUrl] = useState("");
  const [customModelKey, setCustomModelKey] = useState("");
  const [maxTokens, setMaxTokens] = useState(4096);
  const [temperature, setTemperature] = useState(0.7);
  const [isRateLimitEnabled, setIsRateLimitEnabled] = useState(true);
  const [rateLimitPerMinute, setRateLimitPerMinute] = useState(60);
  const [isLogging, setIsLogging] = useState(true);
  const [isContentFilteringEnabled, setIsContentFilteringEnabled] =
    useState(true);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isDeployed, setIsDeployed] = useState(false);
  const [deploymentProgress, setDeploymentProgress] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Check if already deployed
    const deployed = localStorage.getItem("privateAiDeployed") === "true";
    setIsDeployed(deployed);
  }, []);

  const handleDeploy = async () => {
    // Validate inputs
    if (modelType === "custom" && (!customModelUrl || !customModelKey)) {
      toast({
        title: "Missing Information",
        description:
          "Please provide both URL and API key for your custom model",
        variant: "destructive",
      });
      return;
    }

    setIsDeploying(true);
    setDeploymentProgress(0);

    try {
      // In a real implementation, this would create a private AI instance in Supabase
      // and call the edge function to deploy it

      // Simulate deployment process with progress updates
      const interval = setInterval(() => {
        setDeploymentProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 500);

      // Simulate API call with a timeout
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Store deployment status in localStorage for demo purposes
      localStorage.setItem("privateAiDeployed", "true");
      localStorage.setItem("privateAiModel", selectedModel);
      localStorage.setItem("privateAiTemperature", temperature.toString());
      localStorage.setItem("privateAiMaxTokens", maxTokens.toString());

      setIsDeployed(true);
      clearInterval(interval);
      setDeploymentProgress(100);

      toast({
        title: "Deployment Successful",
        description: "Your private AI instance is now ready to use",
      });
    } catch (error) {
      console.error("Error deploying Private AI:", error);
      toast({
        title: "Deployment Failed",
        description: "There was an error deploying your private AI instance",
        variant: "destructive",
      });
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <Card className="w-full bg-white shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">
              Private AI Setup
            </CardTitle>
            <CardDescription>
              Configure and deploy your own private AI instance.
            </CardDescription>
          </div>
          {isDeployed && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 bg-green-100 text-green-800 border-green-200"
            >
              <Check size={12} />
              Deployed
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="security">Security & Compliance</TabsTrigger>
            <TabsTrigger value="deployment">Deployment</TabsTrigger>
          </TabsList>

          <TabsContent value="configuration" className="space-y-6 pt-4">
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Model Selection</Label>
                <div className="grid grid-cols-1 gap-4 mt-2 md:grid-cols-2">
                  <div
                    className={`flex flex-col p-4 border rounded-lg cursor-pointer transition-all ${modelType === "shared" ? "border-primary bg-primary/5" : "border-muted"}`}
                    onClick={() => setModelType("shared")}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Shared Model</h3>
                      <Server
                        size={20}
                        className={
                          modelType === "shared"
                            ? "text-primary"
                            : "text-muted-foreground"
                        }
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Use Akii's shared AI models. Cost-effective and ready to
                      use immediately.
                    </p>
                  </div>
                  <div
                    className={`flex flex-col p-4 border rounded-lg cursor-pointer transition-all ${modelType === "custom" ? "border-primary bg-primary/5" : "border-muted"}`}
                    onClick={() => setModelType("custom")}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Custom Model</h3>
                      <Shield
                        size={20}
                        className={
                          modelType === "custom"
                            ? "text-primary"
                            : "text-muted-foreground"
                        }
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Connect your own AI model or third-party provider for
                      complete control.
                    </p>
                  </div>
                </div>
              </div>

              {modelType === "shared" ? (
                <div className="space-y-2">
                  <Label htmlFor="model">Select Model</Label>
                  <Select
                    value={selectedModel}
                    onValueChange={setSelectedModel}
                  >
                    <SelectTrigger id="model">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="akii-standard-1">
                        Akii Standard 1 (Balanced)
                      </SelectItem>
                      <SelectItem value="akii-performance-1">
                        Akii Performance 1 (Fast)
                      </SelectItem>
                      <SelectItem value="akii-quality-1">
                        Akii Quality 1 (High Quality)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Info size={14} />
                    <span>
                      Shared models are hosted on Akii's infrastructure and
                      shared among multiple clients.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customModelUrl">Custom Model URL</Label>
                    <Input
                      id="customModelUrl"
                      placeholder="https://api.your-model-provider.com/v1"
                      value={customModelUrl}
                      onChange={(e) => setCustomModelUrl(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customModelKey">API Key</Label>
                    <Input
                      id="customModelKey"
                      type="password"
                      placeholder="Your model provider API key"
                      value={customModelKey}
                      onChange={(e) => setCustomModelKey(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Info size={14} />
                    <span>
                      Custom models connect to your own model provider. You are
                      responsible for any costs from your provider.
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-base font-medium">Model Parameters</h3>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="temperature">
                      Temperature: {temperature}
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      {temperature < 0.3
                        ? "More deterministic"
                        : temperature > 0.7
                          ? "More creative"
                          : "Balanced"}
                    </span>
                  </div>
                  <Slider
                    id="temperature"
                    min={0}
                    max={1}
                    step={0.1}
                    value={[temperature]}
                    onValueChange={(value) => setTemperature(value[0])}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="maxTokens">Max Tokens: {maxTokens}</Label>
                    <span className="text-xs text-muted-foreground">
                      {maxTokens < 2048
                        ? "Shorter responses"
                        : maxTokens > 8192
                          ? "Longer responses"
                          : "Medium length"}
                    </span>
                  </div>
                  <Slider
                    id="maxTokens"
                    min={1024}
                    max={16384}
                    step={1024}
                    value={[maxTokens]}
                    onValueChange={(value) => setMaxTokens(value[0])}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-6 pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Rate Limiting</Label>
                  <p className="text-sm text-muted-foreground">
                    Limit the number of API requests per minute
                  </p>
                </div>
                <Switch
                  checked={isRateLimitEnabled}
                  onCheckedChange={setIsRateLimitEnabled}
                />
              </div>

              {isRateLimitEnabled && (
                <div className="space-y-2 pl-6 border-l-2 border-muted ml-2">
                  <Label htmlFor="rateLimit">
                    Requests per minute: {rateLimitPerMinute}
                  </Label>
                  <Slider
                    id="rateLimit"
                    min={10}
                    max={500}
                    step={10}
                    value={[rateLimitPerMinute]}
                    onValueChange={(value) => setRateLimitPerMinute(value[0])}
                    disabled={!isRateLimitEnabled}
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="space-y-0.5">
                  <Label className="text-base">Content Filtering</Label>
                  <p className="text-sm text-muted-foreground">
                    Filter harmful or inappropriate content
                  </p>
                </div>
                <Switch
                  checked={isContentFilteringEnabled}
                  onCheckedChange={setIsContentFilteringEnabled}
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="space-y-0.5">
                  <Label className="text-base">Request Logging</Label>
                  <p className="text-sm text-muted-foreground">
                    Log all API requests for monitoring and debugging
                  </p>
                </div>
                <Switch checked={isLogging} onCheckedChange={setIsLogging} />
              </div>

              <div className="rounded-md bg-blue-50 p-4 mt-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Info
                      className="h-5 w-5 text-blue-400"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Compliance Information
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        Your private AI instance is configured to be compliant
                        with:
                      </p>
                      <ul className="list-disc space-y-1 mt-2 pl-5">
                        <li>GDPR (General Data Protection Regulation)</li>
                        <li>CCPA (California Consumer Privacy Act)</li>
                        <li>SOC 2 Type II</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="deployment" className="space-y-6 pt-4">
            <div className="space-y-4">
              <div className="rounded-md bg-amber-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle
                      className="h-5 w-5 text-amber-400"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-amber-800">
                      Deployment Information
                    </h3>
                    <div className="mt-2 text-sm text-amber-700">
                      <p>Deploying your private AI instance will:</p>
                      <ul className="list-disc space-y-1 mt-2 pl-5">
                        <li>
                          Create a dedicated API endpoint for your organization
                        </li>
                        <li>Apply all configuration and security settings</li>
                        <li>Generate API keys for accessing your private AI</li>
                        <li>Start billing based on your subscription plan</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-medium">Deployment Summary</h3>
                <div className="rounded-md border p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Model Type
                    </span>
                    <span className="text-sm font-medium">
                      {modelType === "shared" ? "Shared Model" : "Custom Model"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Selected Model
                    </span>
                    <span className="text-sm font-medium">
                      {modelType === "shared"
                        ? selectedModel
                        : "Custom (External)"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Temperature
                    </span>
                    <span className="text-sm font-medium">{temperature}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Max Tokens
                    </span>
                    <span className="text-sm font-medium">{maxTokens}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Rate Limiting
                    </span>
                    <span className="text-sm font-medium">
                      {isRateLimitEnabled
                        ? `${rateLimitPerMinute} req/min`
                        : "Disabled"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Content Filtering
                    </span>
                    <span className="text-sm font-medium">
                      {isContentFilteringEnabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Request Logging
                    </span>
                    <span className="text-sm font-medium">
                      {isLogging ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>
              </div>

              {isDeploying && (
                <div className="space-y-2 mt-4">
                  <div className="flex items-center justify-between">
                    <Label>Deployment Progress</Label>
                    <span className="text-sm">{deploymentProgress}%</span>
                  </div>
                  <Progress value={deploymentProgress} className="h-2" />
                  <p className="text-sm text-muted-foreground">
                    Deploying your private AI instance. This may take a few
                    minutes...
                  </p>
                </div>
              )}

              {isDeployed && (
                <div className="rounded-md bg-green-50 p-4 mt-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Check
                        className="h-5 w-5 text-green-400"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">
                        Deployment Successful
                      </h3>
                      <div className="mt-2 text-sm text-green-700">
                        <p>
                          Your private AI instance is now ready to use. You can
                          access it using the API keys in the API Keys section.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-6">
        <Button
          variant="outline"
          onClick={() =>
            setActiveTab(
              activeTab === "configuration"
                ? "configuration"
                : activeTab === "security"
                  ? "configuration"
                  : "security",
            )
          }
        >
          {activeTab === "configuration" ? "Cancel" : "Back"}
        </Button>
        {activeTab === "deployment" ? (
          <Button
            onClick={handleDeploy}
            disabled={isDeploying || isDeployed}
            className="flex items-center gap-2"
          >
            <Zap size={16} />
            {isDeployed
              ? "Deployed"
              : isDeploying
                ? "Deploying..."
                : "Deploy Private AI"}
          </Button>
        ) : (
          <Button
            onClick={() =>
              setActiveTab(
                activeTab === "configuration" ? "security" : "deployment",
              )
            }
          >
            Next
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
