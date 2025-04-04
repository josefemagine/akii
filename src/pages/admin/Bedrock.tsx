import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, RefreshCw, Trash2, Code } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BedrockConfig } from "@/lib/env-config";
import { Switch } from "@/components/ui/switch";
import { makeBedrockApiRequest, getBedrockApiUrl } from "@/lib/api-helpers";

// Plan configuration
const planConfig = {
  starter: {
    modelId: "amazon.titan-text-lite-v1",
    throughputName: "starter-throughput",
  },
  pro: {
    modelId: "amazon.titan-text-express-v1",
    throughputName: "pro-throughput",
  },
  business: {
    modelId: "anthropic.claude-instant-v1",
    throughputName: "business-throughput",
  },
};

// Interface for API responses
interface AIInstance {
  id: string;
  name: string;
  modelId: string;
  throughputName: string;
  status: 'Pending' | 'InService' | 'Failed';
  createdAt: string;
  plan: 'starter' | 'pro' | 'business';
}

// API service functions
const BedrockService = {
  // Get API key from env config
  apiKey: BedrockConfig.apiKey,
  
  // Development mode with mock data
  useMockData: false, // Set to true to use mock data instead of real API calls
  
  // Mock instances for development
  mockInstances: [
    {
      id: "mock-instance-1",
      name: "Development Instance 1",
      modelId: "amazon.titan-text-express-v1",
      throughputName: "pro-throughput",
      status: "InService" as const,
      createdAt: new Date().toISOString(),
      plan: "pro" as const
    },
    {
      id: "mock-instance-2",
      name: "Development Instance 2",
      modelId: "anthropic.claude-instant-v1",
      throughputName: "business-throughput",
      status: "Pending" as const,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      plan: "business" as const
    }
  ],
  
  // Get all instances
  async getInstances(manualKey?: string): Promise<AIInstance[]> {
    // Use mock data if enabled and in development mode
    if (this.useMockData && import.meta.env.DEV) {
      console.log('Using mock instance data for development');
      return new Promise(resolve => {
        // Simulate network delay
        setTimeout(() => resolve(this.mockInstances), 800);
      });
    }
    
    try {
      const data = await makeBedrockApiRequest<{instances: AIInstance[]}>(
        '/instances', 
        'GET', 
        undefined, 
        manualKey || undefined
      );
      
      return data.instances || [];
    } catch (error) {
      console.error('Error fetching instances:', error);
      
      // In development mode, fallback to mock data if real API fails
      if (import.meta.env.DEV) {
        console.log('API request failed, falling back to mock data');
        return this.mockInstances;
      }
      
      throw error;
    }
  },
  
  // Provision a new instance
  async provisionInstance(name: string, plan: string, manualKey?: string): Promise<any> {
    // Use mock data if enabled and in development mode
    if (this.useMockData && import.meta.env.DEV) {
      console.log('Using mock provisioning for development');
      
      // Create a new mock instance
      const planDetails = planConfig[plan as keyof typeof planConfig];
      const newInstance = {
        id: `mock-instance-${Date.now()}`,
        name,
        modelId: planDetails.modelId,
        throughputName: planDetails.throughputName,
        status: "Pending" as const,
        createdAt: new Date().toISOString(),
        plan: plan as 'starter' | 'pro' | 'business'
      };
      
      // Add it to the mock instances
      this.mockInstances.push(newInstance);
      
      return new Promise(resolve => {
        // Simulate network delay
        setTimeout(() => resolve({ success: true, instance: newInstance }), 1000);
      });
    }
    
    const planDetails = planConfig[plan as keyof typeof planConfig];
    
    try {
      const data = await makeBedrockApiRequest(
        '/provision-instance',
        'POST',
        {
          name,
          modelId: planDetails.modelId,
          throughputName: planDetails.throughputName
        },
        manualKey || undefined
      );
      
      return data;
    } catch (error) {
      console.error('Error provisioning instance:', error);
      
      // In development mode, fallback to mock data if real API fails
      if (import.meta.env.DEV) {
        console.log('API request failed, falling back to mock provisioning');
        const newInstance = {
          id: `mock-instance-${Date.now()}`,
          name,
          modelId: planDetails.modelId,
          throughputName: planDetails.throughputName,
          status: "Pending" as const,
          createdAt: new Date().toISOString(),
          plan: plan as 'starter' | 'pro' | 'business'
        };
        this.mockInstances.push(newInstance);
        return { success: true, instance: newInstance };
      }
      
      throw error;
    }
  },
  
  // Delete an instance
  async deleteInstance(instanceId: string, throughputName: string, manualKey?: string): Promise<any> {
    // Use mock data if enabled and in development mode
    if (this.useMockData && import.meta.env.DEV) {
      console.log('Using mock deletion for development');
      
      // Remove the instance from mock instances
      this.mockInstances = this.mockInstances.filter(instance => instance.id !== instanceId);
      
      return new Promise(resolve => {
        // Simulate network delay
        setTimeout(() => resolve({ success: true }), 800);
      });
    }
    
    try {
      const data = await makeBedrockApiRequest(
        '/delete-instance',
        'POST',
        {
          instanceId,
          throughputName
        },
        manualKey || undefined
      );
      
      return data;
    } catch (error) {
      console.error('Error deleting instance:', error);
      
      // In development mode, fallback to mock data if real API fails
      if (import.meta.env.DEV) {
        console.log('API request failed, falling back to mock deletion');
        this.mockInstances = this.mockInstances.filter(instance => instance.id !== instanceId);
        return { success: true };
      }
      
      throw error;
    }
  }
};

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'InService':
      return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>;
    case 'Pending':
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>;
    case 'Failed':
      return <Badge className="bg-red-500 hover:bg-red-600">Failed</Badge>;
    default:
      return <Badge className="bg-gray-500 hover:bg-gray-600">Unknown</Badge>;
  }
};

// Main component
const BedrockDashboard = () => {
  const { toast } = useToast();
  const [instances, setInstances] = useState<AIInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [instanceName, setInstanceName] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('starter');
  const [submitting, setSubmitting] = useState(false);
  
  // API key state
  const [manualApiKey, setManualApiKey] = useState('');
  const [isUsingManualKey, setIsUsingManualKey] = useState(false);
  
  // Mock data toggle for development
  const [useMockData, setUseMockData] = useState(() => {
    // Default to false, only use mock if explicitly enabled in localStorage
    return import.meta.env.DEV && localStorage.getItem('bedrock-use-mock-data') === 'true';
  });
  
  // Update BedrockService mock data setting when the toggle changes
  useEffect(() => {
    if (import.meta.env.DEV) {
      BedrockService.useMockData = useMockData;
      localStorage.setItem('bedrock-use-mock-data', useMockData.toString());
      
      // Log the current state
      console.log('==== Mock Data Settings ====');
      console.log('Mock data enabled:', useMockData);
      console.log('API URL:', getBedrockApiUrl(useMockData));
      console.log('==========================');
      
      if (useMockData) {
        toast({
          title: "Mock Data Mode",
          description: "Using mock data for Bedrock API calls",
        });
      } else {
        fetchInstances();
      }
    }
  }, [useMockData, toast]);
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    failed: 0
  });
  
  // Check if API key is configured
  const isApiConfigured = BedrockConfig.isConfigured();
  
  // Load manual API key from localStorage if available
  useEffect(() => {
    const savedKey = localStorage.getItem('bedrock-api-key');
    if (savedKey) {
      setManualApiKey(savedKey);
      setIsUsingManualKey(true);
    }
  }, []);
  
  // Handle saving the manual API key
  const handleSaveApiKey = () => {
    if (manualApiKey.trim()) {
      console.log('Saving manual API key to localStorage');
      localStorage.setItem('bedrock-api-key', manualApiKey);
      setIsUsingManualKey(true);
      
      toast({
        title: "API Key Saved",
        description: "Your API key has been saved and will be used for Bedrock requests.",
      });
      
      // Force a refresh with the new key
      console.log('Fetching instances with new manual API key');
      fetchInstances();
    } else {
      toast({
        title: "Error",
        description: "Please enter a valid API key.",
        variant: "destructive",
      });
    }
  };
  
  // Fetch instances
  const fetchInstances = async () => {
    if (!isApiConfigured && !isUsingManualKey) {
      console.log('No API key available - environment key not configured and no manual key provided');
      setLoading(false);
      setError('Bedrock API key is not configured. Please add VITE_BEDROCK_AWS_KEY to your environment variables or enter a key below.');
      return;
    }

    const activeKey = isUsingManualKey ? manualApiKey : BedrockConfig.apiKey;
    console.log(`Fetching instances with ${isUsingManualKey ? 'manual' : 'environment'} key, key present: ${Boolean(activeKey)}`);

    try {
      setRefreshing(true);
      setError(null);
      const data = await BedrockService.getInstances(isUsingManualKey ? manualApiKey : null);
      console.log(`Received ${data?.length || 0} instances from API`);
      setInstances(data);
      
      // Calculate stats
      const stats = {
        total: data.length,
        active: data.filter(i => i.status === 'InService').length,
        pending: data.filter(i => i.status === 'Pending').length,
        failed: data.filter(i => i.status === 'Failed').length
      };
      
      setStats(stats);
    } catch (err) {
      console.error('Error fetching instances:', err);
      
      // Provide more helpful error messages based on error type
      let errorMessage = 'Failed to load instances. Please try again.';
      
      if (err instanceof Error) {
        if (err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
          errorMessage = import.meta.env.DEV 
            ? 'Network error: Could not connect to the API. This could be due to the Vite proxy configuration. Check that vite.config.ts has the correct proxy settings and the server is running.'
            : 'Network error: Could not connect to the Bedrock API. This could be due to CORS restrictions or network connectivity issues.';
        } else if (err.message.includes('401') || err.message.includes('403')) {
          errorMessage = 'Authentication error: The API key provided may be invalid or has insufficient permissions.';
        } else if (err.message.includes('404')) {
          errorMessage = import.meta.env.DEV
            ? 'API endpoint not found. Check that the proxy configuration in vite.config.ts has the correct target URL.'
            : 'API endpoint not found. Please check that the URL (https://www.akii.com/bedrock) is correct.';
        } else {
          // Include original error message for debugging
          errorMessage = `API error: ${err.message}`;
        }
      }
      
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: "Could not load AI instances. Please check the console for more details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Initial data load
  useEffect(() => {
    fetchInstances();
  }, [isApiConfigured]);
  
  // Handle instance provision
  const handleProvisionInstance = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!instanceName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide an instance name",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setSubmitting(true);
      await BedrockService.provisionInstance(instanceName, selectedPlan, manualApiKey);
      
      toast({
        title: "Success",
        description: "AI instance has been provisioned successfully",
      });
      
      // Reset form
      setInstanceName('');
      setSelectedPlan('starter');
      
      // Refresh instances
      fetchInstances();
    } catch (err) {
      console.error('Error provisioning instance:', err);
      toast({
        title: "Error",
        description: "Failed to provision AI instance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle instance deletion
  const handleDeleteInstance = async (instanceId: string, throughputName: string) => {
    if (!window.confirm("Are you sure you want to delete this instance? This action cannot be undone.")) {
      return;
    }
    
    try {
      await BedrockService.deleteInstance(instanceId, throughputName, manualApiKey);
      
      toast({
        title: "Success",
        description: "AI instance has been deleted successfully",
      });
      
      // Refresh instances
      fetchInstances();
    } catch (err) {
      console.error('Error deleting instance:', err);
      toast({
        title: "Error",
        description: "Failed to delete AI instance. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Check API configuration and log it
  useEffect(() => {
    console.log('==== Bedrock Dashboard Initialization ====');
    BedrockConfig.logConfig();
    console.log('Development mode:', import.meta.env.DEV);
    console.log('Mock data enabled:', useMockData);
    console.log('Using manual API key:', isUsingManualKey);
    console.log('Manual API key present:', Boolean(manualApiKey));
    console.log('==========================================');
  }, []);
  
  // Render loading state
  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-8">
        <h1 className="text-3xl font-bold">Bedrock AI Instances</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/4" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Bedrock AI Instances</h1>
          <div className="flex items-center gap-4">
            {import.meta.env.DEV && (
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-md">
                <Code size={16} className="text-yellow-600" />
                <Label htmlFor="mock-toggle" className="text-sm font-medium">
                  Dev Mode
                </Label>
                <Switch
                  id="mock-toggle"
                  checked={useMockData}
                  onCheckedChange={setUseMockData}
                />
              </div>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchInstances} 
              disabled={refreshing || (!isApiConfigured && !isUsingManualKey)}
            >
              {refreshing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Refresh
            </Button>
          </div>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {import.meta.env.DEV && (
          <Alert className={useMockData ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800" : "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"}>
            <Code className={`h-4 w-4 ${useMockData ? "text-yellow-600" : "text-blue-600"}`} />
            <AlertTitle>Developer Mode Active</AlertTitle>
            <AlertDescription>
              {useMockData 
                ? "Using mock data for API calls. No actual API requests will be made to the Bedrock service."
                : "Using Vite development proxy to avoid CORS issues. API requests will be sent to /api/bedrock."
              }
            </AlertDescription>
          </Alert>
        )}
        
        {/* API Key Configuration Form */}
        {!isApiConfigured && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>API Key Configuration</CardTitle>
              <CardDescription>
                Your Bedrock API key is not configured in the environment. 
                Enter your API key below to use the Bedrock features.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="apiKey">Bedrock AWS API Key</Label>
                  <div className="flex space-x-2">
                    <Input 
                      id="apiKey" 
                      type="password" 
                      placeholder="Enter your AWS Bedrock API key" 
                      value={manualApiKey} 
                      onChange={(e) => setManualApiKey(e.target.value)}
                    />
                    <Button onClick={handleSaveApiKey}>Save Key</Button>
                  </div>
                  {isUsingManualKey && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ Using saved API key from localStorage
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Stats overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Instances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="instances">
        <TabsList>
          <TabsTrigger value="instances">Instances</TabsTrigger>
          <TabsTrigger value="provision">Provision New Instance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="instances" className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">AI Instances</h2>
          
          {instances.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No AI instances found. Create your first instance using the Provision tab.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {instances.map((instance) => (
                <Card key={instance.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{instance.name}</CardTitle>
                        <CardDescription>
                          Model: {instance.modelId.split('.')[1] || instance.modelId}
                        </CardDescription>
                      </div>
                      <StatusBadge status={instance.status} />
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Plan:</span>{" "}
                        <span className="font-medium capitalize">{instance.plan}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Created:</span>{" "}
                        <span className="font-medium">
                          {new Date(instance.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Instance ID:</span>{" "}
                        <span className="font-medium">{instance.id.slice(0, 8)}...</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Throughput:</span>{" "}
                        <span className="font-medium">{instance.throughputName.split('-')[0]}</span>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      className="ml-auto flex items-center gap-2"
                      onClick={() => handleDeleteInstance(instance.id, instance.throughputName)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Instance
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="provision">
          <Card>
            <CardHeader>
              <CardTitle>Provision New AI Instance</CardTitle>
              <CardDescription>
                Create a new Amazon Bedrock AI instance for your users.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleProvisionInstance} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="instanceName">Instance Name</Label>
                  <Input
                    id="instanceName"
                    placeholder="Enter a name for this instance"
                    value={instanceName}
                    onChange={(e) => setInstanceName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="plan">Plan</Label>
                  <Select
                    value={selectedPlan}
                    onValueChange={setSelectedPlan}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="starter">Starter (Titan Text Lite)</SelectItem>
                      <SelectItem value="pro">Pro (Titan Text Express)</SelectItem>
                      <SelectItem value="business">Business (Claude Instant)</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <p className="text-sm text-muted-foreground mt-2">
                    {selectedPlan === 'starter' && "Basic AI capabilities with Amazon Titan Text Lite model."}
                    {selectedPlan === 'pro' && "Enhanced performance with Amazon Titan Text Express model."}
                    {selectedPlan === 'business' && "Premium capabilities with Anthropic Claude Instant model."}
                  </p>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={submitting}
                >
                  {submitting ? 'Provisioning...' : 'Provision AI Instance'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BedrockDashboard; 