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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Check, Info, Server, Shield, Zap } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
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
    const [isContentFilteringEnabled, setIsContentFilteringEnabled] = useState(true);
    const [isDeploying, setIsDeploying] = useState(false);
    const [isDeployed, setIsDeployed] = useState(false);
    const [deploymentProgress, setDeploymentProgress] = useState(0);
    const { toast } = useToast();
    useEffect(() => {
        // Check if already deployed
        const deployed = localStorage.getItem("privateAiDeployed") === "true";
        setIsDeployed(deployed);
    }, []);
    const handleDeploy = () => __awaiter(this, void 0, void 0, function* () {
        // Validate inputs
        if (modelType === "custom" && (!customModelUrl || !customModelKey)) {
            toast({
                title: "Missing Information",
                description: "Please provide both URL and API key for your custom model",
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
            yield new Promise((resolve) => setTimeout(resolve, 5000));
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
        }
        catch (error) {
            console.error("Error deploying Private AI:", error);
            toast({
                title: "Deployment Failed",
                description: "There was an error deploying your private AI instance",
                variant: "destructive",
            });
        }
        finally {
            setIsDeploying(false);
        }
    });
    return (_jsxs(Card, { className: "w-full bg-white shadow-sm", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(CardTitle, { className: "text-xl font-bold", children: "Private AI Setup" }), _jsx(CardDescription, { children: "Configure and deploy your own private AI instance." })] }), isDeployed && (_jsxs(Badge, { variant: "secondary", className: "flex items-center gap-1 bg-green-100 text-green-800 border-green-200", children: [_jsx(Check, { size: 12 }), "Deployed"] }))] }) }), _jsx(CardContent, { children: _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [_jsxs(TabsList, { className: "grid w-full grid-cols-3", children: [_jsx(TabsTrigger, { value: "configuration", children: "Configuration" }), _jsx(TabsTrigger, { value: "security", children: "Security & Compliance" }), _jsx(TabsTrigger, { value: "deployment", children: "Deployment" })] }), _jsx(TabsContent, { value: "configuration", className: "space-y-6 pt-4", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-base font-medium", children: "Model Selection" }), _jsxs("div", { className: "grid grid-cols-1 gap-4 mt-2 md:grid-cols-2", children: [_jsxs("div", { className: `flex flex-col p-4 border rounded-lg cursor-pointer transition-all ${modelType === "shared" ? "border-primary bg-primary/5" : "border-muted"}`, onClick: () => setModelType("shared"), children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-lg font-medium", children: "Shared Model" }), _jsx(Server, { size: 20, className: modelType === "shared"
                                                                            ? "text-primary"
                                                                            : "text-muted-foreground" })] }), _jsx("p", { className: "text-sm text-muted-foreground mt-2", children: "Use Akii's shared AI models. Cost-effective and ready to use immediately." })] }), _jsxs("div", { className: `flex flex-col p-4 border rounded-lg cursor-pointer transition-all ${modelType === "custom" ? "border-primary bg-primary/5" : "border-muted"}`, onClick: () => setModelType("custom"), children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-lg font-medium", children: "Custom Model" }), _jsx(Shield, { size: 20, className: modelType === "custom"
                                                                            ? "text-primary"
                                                                            : "text-muted-foreground" })] }), _jsx("p", { className: "text-sm text-muted-foreground mt-2", children: "Connect your own AI model or third-party provider for complete control." })] })] })] }), modelType === "shared" ? (_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "model", children: "Select Model" }), _jsxs(Select, { value: selectedModel, onValueChange: setSelectedModel, children: [_jsx(SelectTrigger, { id: "model", children: _jsx(SelectValue, { placeholder: "Select a model" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "akii-standard-1", children: "Akii Standard 1 (Balanced)" }), _jsx(SelectItem, { value: "akii-performance-1", children: "Akii Performance 1 (Fast)" }), _jsx(SelectItem, { value: "akii-quality-1", children: "Akii Quality 1 (High Quality)" })] })] }), _jsxs("div", { className: "flex items-center gap-2 mt-2 text-sm text-muted-foreground", children: [_jsx(Info, { size: 14 }), _jsx("span", { children: "Shared models are hosted on Akii's infrastructure and shared among multiple clients." })] })] })) : (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "customModelUrl", children: "Custom Model URL" }), _jsx(Input, { id: "customModelUrl", placeholder: "https://api.your-model-provider.com/v1", value: customModelUrl, onChange: (e) => setCustomModelUrl(e.target.value) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "customModelKey", children: "API Key" }), _jsx(Input, { id: "customModelKey", type: "password", placeholder: "Your model provider API key", value: customModelKey, onChange: (e) => setCustomModelKey(e.target.value) })] }), _jsxs("div", { className: "flex items-center gap-2 mt-2 text-sm text-muted-foreground", children: [_jsx(Info, { size: 14 }), _jsx("span", { children: "Custom models connect to your own model provider. You are responsible for any costs from your provider." })] })] })), _jsxs("div", { className: "space-y-4 pt-4 border-t", children: [_jsx("h3", { className: "text-base font-medium", children: "Model Parameters" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs(Label, { htmlFor: "temperature", children: ["Temperature: ", temperature] }), _jsx("span", { className: "text-xs text-muted-foreground", children: temperature < 0.3
                                                                    ? "More deterministic"
                                                                    : temperature > 0.7
                                                                        ? "More creative"
                                                                        : "Balanced" })] }), _jsx(Slider, { id: "temperature", min: 0, max: 1, step: 0.1, value: [temperature], onValueChange: (value) => setTemperature(value[0]) })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs(Label, { htmlFor: "maxTokens", children: ["Max Tokens: ", maxTokens] }), _jsx("span", { className: "text-xs text-muted-foreground", children: maxTokens < 2048
                                                                    ? "Shorter responses"
                                                                    : maxTokens > 8192
                                                                        ? "Longer responses"
                                                                        : "Medium length" })] }), _jsx(Slider, { id: "maxTokens", min: 1024, max: 16384, step: 1024, value: [maxTokens], onValueChange: (value) => setMaxTokens(value[0]) })] })] })] }) }), _jsx(TabsContent, { value: "security", className: "space-y-6 pt-4", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "space-y-0.5", children: [_jsx(Label, { className: "text-base", children: "Rate Limiting" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Limit the number of API requests per minute" })] }), _jsx(Switch, { checked: isRateLimitEnabled, onCheckedChange: setIsRateLimitEnabled })] }), isRateLimitEnabled && (_jsxs("div", { className: "space-y-2 pl-6 border-l-2 border-muted ml-2", children: [_jsxs(Label, { htmlFor: "rateLimit", children: ["Requests per minute: ", rateLimitPerMinute] }), _jsx(Slider, { id: "rateLimit", min: 10, max: 500, step: 10, value: [rateLimitPerMinute], onValueChange: (value) => setRateLimitPerMinute(value[0]), disabled: !isRateLimitEnabled })] })), _jsxs("div", { className: "flex items-center justify-between pt-4 border-t", children: [_jsxs("div", { className: "space-y-0.5", children: [_jsx(Label, { className: "text-base", children: "Content Filtering" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Filter harmful or inappropriate content" })] }), _jsx(Switch, { checked: isContentFilteringEnabled, onCheckedChange: setIsContentFilteringEnabled })] }), _jsxs("div", { className: "flex items-center justify-between pt-4 border-t", children: [_jsxs("div", { className: "space-y-0.5", children: [_jsx(Label, { className: "text-base", children: "Request Logging" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Log all API requests for monitoring and debugging" })] }), _jsx(Switch, { checked: isLogging, onCheckedChange: setIsLogging })] }), _jsx("div", { className: "rounded-md bg-blue-50 p-4 mt-6", children: _jsxs("div", { className: "flex", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx(Info, { className: "h-5 w-5 text-blue-400", "aria-hidden": "true" }) }), _jsxs("div", { className: "ml-3", children: [_jsx("h3", { className: "text-sm font-medium text-blue-800", children: "Compliance Information" }), _jsxs("div", { className: "mt-2 text-sm text-blue-700", children: [_jsx("p", { children: "Your private AI instance is configured to be compliant with:" }), _jsxs("ul", { className: "list-disc space-y-1 mt-2 pl-5", children: [_jsx("li", { children: "GDPR (General Data Protection Regulation)" }), _jsx("li", { children: "CCPA (California Consumer Privacy Act)" }), _jsx("li", { children: "SOC 2 Type II" })] })] })] })] }) })] }) }), _jsx(TabsContent, { value: "deployment", className: "space-y-6 pt-4", children: _jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "rounded-md bg-amber-50 p-4", children: _jsxs("div", { className: "flex", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx(AlertCircle, { className: "h-5 w-5 text-amber-400", "aria-hidden": "true" }) }), _jsxs("div", { className: "ml-3", children: [_jsx("h3", { className: "text-sm font-medium text-amber-800", children: "Deployment Information" }), _jsxs("div", { className: "mt-2 text-sm text-amber-700", children: [_jsx("p", { children: "Deploying your private AI instance will:" }), _jsxs("ul", { className: "list-disc space-y-1 mt-2 pl-5", children: [_jsx("li", { children: "Create a dedicated API endpoint for your organization" }), _jsx("li", { children: "Apply all configuration and security settings" }), _jsx("li", { children: "Generate API keys for accessing your private AI" }), _jsx("li", { children: "Start billing based on your subscription plan" })] })] })] })] }) }), _jsxs("div", { className: "space-y-2", children: [_jsx("h3", { className: "text-base font-medium", children: "Deployment Summary" }), _jsxs("div", { className: "rounded-md border p-4 space-y-3", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Model Type" }), _jsx("span", { className: "text-sm font-medium", children: modelType === "shared" ? "Shared Model" : "Custom Model" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Selected Model" }), _jsx("span", { className: "text-sm font-medium", children: modelType === "shared"
                                                                    ? selectedModel
                                                                    : "Custom (External)" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Temperature" }), _jsx("span", { className: "text-sm font-medium", children: temperature })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Max Tokens" }), _jsx("span", { className: "text-sm font-medium", children: maxTokens })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Rate Limiting" }), _jsx("span", { className: "text-sm font-medium", children: isRateLimitEnabled
                                                                    ? `${rateLimitPerMinute} req/min`
                                                                    : "Disabled" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Content Filtering" }), _jsx("span", { className: "text-sm font-medium", children: isContentFilteringEnabled ? "Enabled" : "Disabled" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Request Logging" }), _jsx("span", { className: "text-sm font-medium", children: isLogging ? "Enabled" : "Disabled" })] })] })] }), isDeploying && (_jsxs("div", { className: "space-y-2 mt-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Label, { children: "Deployment Progress" }), _jsxs("span", { className: "text-sm", children: [deploymentProgress, "%"] })] }), _jsx(Progress, { value: deploymentProgress, className: "h-2" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Deploying your private AI instance. This may take a few minutes..." })] })), isDeployed && (_jsx("div", { className: "rounded-md bg-green-50 p-4 mt-4", children: _jsxs("div", { className: "flex", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx(Check, { className: "h-5 w-5 text-green-400", "aria-hidden": "true" }) }), _jsxs("div", { className: "ml-3", children: [_jsx("h3", { className: "text-sm font-medium text-green-800", children: "Deployment Successful" }), _jsx("div", { className: "mt-2 text-sm text-green-700", children: _jsx("p", { children: "Your private AI instance is now ready to use. You can access it using the API keys in the API Keys section." }) })] })] }) }))] }) })] }) }), _jsxs(CardFooter, { className: "flex justify-between border-t p-6", children: [_jsx(Button, { variant: "outline", onClick: () => setActiveTab(activeTab === "configuration"
                            ? "configuration"
                            : activeTab === "security"
                                ? "configuration"
                                : "security"), children: activeTab === "configuration" ? "Cancel" : "Back" }), activeTab === "deployment" ? (_jsxs(Button, { onClick: handleDeploy, disabled: isDeploying || isDeployed, className: "flex items-center gap-2", children: [_jsx(Zap, { size: 16 }), isDeployed
                                ? "Deployed"
                                : isDeploying
                                    ? "Deploying..."
                                    : "Deploy Private AI"] })) : (_jsx(Button, { onClick: () => setActiveTab(activeTab === "configuration" ? "security" : "deployment"), children: "Next" }))] })] }));
}
