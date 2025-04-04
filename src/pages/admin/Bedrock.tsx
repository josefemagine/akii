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
  // Check environment
  isDevelopment: import.meta.env.DEV,
  
  // Get API key from env config
  apiKey: BedrockConfig.apiKey,
  
  // Get all instances
  async getInstances(manualKey?: string): Promise<AIInstance[]> {
    const apiKeyToUse = manualKey || this.apiKey;
    
    // Log environment context
    if (this.isDevelopment) {
      console.log('[DEV] Using development proxy for instances API');
    } else {
      console.log(`[PROD] Making API request to get instances at ${BedrockConfig.apiUrl}`);
      console.log(`Using ${manualKey ? 'manual' : 'environment'} API key: ${apiKeyToUse ? '✓' : '✗'}`);
    }
    
    try {
      const data = await makeBedrockApiRequest<{instances: AIInstance[]}>(
        '/instances', 
        'GET', 
        undefined, 
        apiKeyToUse || undefined
      );
      
      if (data?.instances) {
        console.log(`Received ${data.instances.length} instances`);
        return data.instances;
      } else {
        console.warn('No instances data in API response:', data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching instances:', error);
      throw error;
    }
  },
  
  // Provision a new instance
  async provisionInstance(name: string, plan: string, manualKey?: string): Promise<any> {
    const planDetails = planConfig[plan as keyof typeof planConfig];
    const apiKeyToUse = manualKey || this.apiKey;
    
    if (!planDetails) {
      throw new Error(`Invalid plan: ${plan}. Valid options are: ${Object.keys(planConfig).join(', ')}`);
    }
    
    if (this.isDevelopment) {
      console.log('[DEV] Using development proxy for provisioning API');
    } else {
      console.log(`[PROD] Making API request to provision instance at ${BedrockConfig.apiUrl}`);
      console.log(`Instance: ${name}, model: ${planDetails.modelId}, throughput: ${planDetails.throughputName}`);
    }
    
    try {
      const data = await makeBedrockApiRequest(
        '/provision-instance',
        'POST',
        {
          name,
          modelId: planDetails.modelId,
          throughputName: planDetails.throughputName
        },
        apiKeyToUse || undefined
      );
      
      return data;
    } catch (error) {
      console.error('Error provisioning instance:', error);
      throw error;
    }
  },
  
  // Delete an instance
  async deleteInstance(instanceId: string, throughputName: string, manualKey?: string): Promise<any> {
    const apiKeyToUse = manualKey || this.apiKey;
    
    if (this.isDevelopment) {
      console.log('[DEV] Using development proxy for deletion API');
    } else {
      console.log(`[PROD] Making API request to delete instance at ${BedrockConfig.apiUrl}`);
      console.log(`Instance ID: ${instanceId}, throughput: ${throughputName}`);
    }
    
    try {
      const data = await makeBedrockApiRequest(
        '/delete-instance',
        'POST',
        {
          instanceId,
          throughputName
        },
        apiKeyToUse || undefined
      );
      
      return data;
    } catch (error) {
      console.error('Error deleting instance:', error);
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
  
  // API configuration state
  const isApiConfigured = BedrockConfig.isConfigured();
  
  // Load manual API key from localStorage if available
  useEffect(() => {
    const savedKey = localStorage.getItem('bedrock-api-key');
    if (savedKey) {
      setManualApiKey(savedKey);
      setIsUsingManualKey(true);
    }
    
    // Remove any stored mock data preference from localStorage
    if (localStorage.getItem('bedrock-use-mock-data')) {
      localStorage.removeItem('bedrock-use-mock-data');
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
    try {
      setRefreshing(true);
      setError(null);
      console.log('Fetching instances...');
      
      // Check API key status
      console.log('API Key Status:', {
        isConfigured: BedrockConfig.isConfigured(),
        isUsingManualKey,
        hasManualKey: Boolean(manualApiKey),
        hasEnvironmentKey: Boolean(BedrockConfig.apiKey)
      });
      
      // Handle API key logic
      const hasManualKey = Boolean(manualApiKey);
      if (hasManualKey && !isUsingManualKey) {
        setIsUsingManualKey(true);
        console.log('Enabling manual API key mode based on key presence');
      }

      const activeKey = isUsingManualKey ? manualApiKey : BedrockConfig.apiKey;
      console.log(`Fetching instances with ${isUsingManualKey ? 'manual' : 'environment'} key, key present: ${Boolean(activeKey)}`);

      // Make the API request with proper parameters
      const data = await BedrockService.getInstances(
        isUsingManualKey ? manualApiKey : undefined
      );
      
      console.log(`Received ${data?.length || 0} instances from API`);
      setInstances(data);
      
      // Calculate stats
      const stats = {
        total: data.length,
        active: data.filter(i => i.status === 'InService').length,
        pending: data.filter(i => i.status === 'Pending').length,
        failed: data.filter(i => ['Failed'].includes(i.status as any)).length
      };
      
      setStats(stats);
    } catch (error) {
      console.error('Error in fetchInstances:', error);
      setError(error instanceof Error ? error.message : 'Failed to load instances. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    failed: 0
  });
  
  // Initial data load
  useEffect(() => {
    fetchInstances();
  }, []);
  
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
      setError(null);
      
      console.log(`Provisioning instance with real data`);
      
      const result = await BedrockService.provisionInstance(
        instanceName, 
        selectedPlan, 
        isUsingManualKey ? manualApiKey : undefined
      );
      
      toast({
        title: "Success",
        description: "AI instance has been provisioned successfully",
        variant: "default",
      });
      
      // Reset form
      setInstanceName('');
      setSelectedPlan('starter');
      
      // Refresh instances
      fetchInstances();
    } catch (err) {
      console.error('Error provisioning instance:', err);
      
      // Extract a better error message
      const errorMessage = err instanceof Error 
        ? err.message
        : 'Failed to provision AI instance. Please try again.';
        
      toast({
        title: "Error",
        description: errorMessage,
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
                    <Button onClick={handleSaveApiKey} disabled={!manualApiKey.trim()}>
                      Save
                    </Button>
                  </div>
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