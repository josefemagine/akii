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
import { Switch } from "@/components/ui/switch";
import { EnvConfig } from "@/lib/env-config";
import { 
  getBedrockInstances, 
  createBedrockInstance, 
  deleteBedrockInstance,
  testEnvironment
} from "@/lib/supabase-bedrock-client";

// Plan configuration - maps to AWS Bedrock models and commitment options
const planConfig = {
  starter: {
    modelId: "amazon.titan-text-lite-v1",
    commitmentDuration: "ONE_MONTH",
    modelUnits: 1
  },
  pro: {
    modelId: "amazon.titan-text-express-v1",
    commitmentDuration: "ONE_MONTH",
    modelUnits: 2
  },
  business: {
    modelId: "anthropic.claude-instant-v1",
    commitmentDuration: "ONE_MONTH", 
    modelUnits: 5
  },
};

// Interface for API responses
interface BedrockInstance {
  id: number;
  instance_id: string;
  model_id: string;
  commitment_duration: string;
  model_units: number;
  status: string;
  created_at: string;
  deleted_at: string | null;
}

// Map plan to friendly display format
function getPlanFromModelId(modelId: string): string {
  const planMap: Record<string, string> = {
    'amazon.titan-text-lite-v1': 'starter',
    'amazon.titan-text-express-v1': 'pro',
    'anthropic.claude-instant-v1': 'business',
    'anthropic.claude-v2': 'business'
  };
  
  return planMap[modelId] || 'custom';
}

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
  
  switch (status.toLowerCase()) {
    case 'inservice':
    case 'active':
    case 'creating':
      variant = "default";
      break;
    case 'pending':
      variant = "secondary";
      break;
    case 'failed':
    case 'deleted':
      variant = "destructive";
      break;
  }
  
  return <Badge variant={variant}>{status}</Badge>;
};

// Main component
const SupabaseBedrock = () => {
  const { toast } = useToast();
  const [instances, setInstances] = useState<BedrockInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [selectedPlan, setSelectedPlan] = useState('starter');
  const [submitting, setSubmitting] = useState(false);
  
  // API key state
  const [manualApiKey, setManualApiKey] = useState('');
  const [isUsingManualKey, setIsUsingManualKey] = useState(false);
  
  // Environment diagnostics
  const [envDiagnostics, setEnvDiagnostics] = useState<any>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  
  // Load manual API key from localStorage if available
  useEffect(() => {
    const savedKey = localStorage.getItem('bedrock-api-key');
    if (savedKey) {
      console.log('Found saved API key in localStorage');
      setManualApiKey(savedKey);
      setIsUsingManualKey(true);
    }
    
    // Initial fetch
    fetchInstances();
  }, []);
  
  // API key management
  const handleSaveApiKey = () => {
    if (!manualApiKey) {
      toast({
        title: "Error",
        description: "Please enter an API key",
        variant: "destructive",
      });
      return;
    }
    
    // Save to localStorage
    localStorage.setItem('bedrock-api-key', manualApiKey);
    setIsUsingManualKey(true);
    
    toast({
      title: "Success",
      description: "API key saved successfully. Will be used for future requests.",
    });
    
    // Refresh instances with the new key
    fetchInstances();
  };
  
  // Fetch instances
  const fetchInstances = async () => {
    setLoading(true);
    setRefreshing(true);
    setError(null);
    
    try {
      const data = await getBedrockInstances();
      setInstances(data);
      
      // Calculate stats
      const stats = {
        total: data.length,
        active: data.filter(i => i.status.toLowerCase() === 'inservice').length,
        pending: data.filter(i => i.status.toLowerCase() === 'creating').length,
        failed: data.filter(i => ['failed', 'deleted'].includes(i.status.toLowerCase())).length
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
  
  // Test environment
  const fetchEnvironmentDiagnostics = async () => {
    try {
      const data = await testEnvironment();
      setEnvDiagnostics(data);
      setShowDiagnostics(true);
    } catch (error) {
      console.error('Error testing environment:', error);
      toast({
        title: "Error",
        description: "Failed to test environment. Check console for details.",
        variant: "destructive",
      });
    }
  };
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    failed: 0
  });
  
  // Handle form submission
  const handleProvisionInstance = async () => {
    setSubmitting(true);
    setError(null);
    
    try {
      const planDetails = planConfig[selectedPlan as keyof typeof planConfig];
      
      if (!planDetails) {
        throw new Error(`Invalid plan selected: ${selectedPlan}`);
      }
      
      // Create new instance
      const newInstance = await createBedrockInstance({
        modelId: planDetails.modelId,
        commitmentDuration: planDetails.commitmentDuration,
        modelUnits: planDetails.modelUnits
      });
      
      toast({
        title: "Success",
        description: "New AI instance has been provisioned successfully. It may take a few minutes to become available.",
      });
      
      // Refresh instances
      fetchInstances();
    } catch (err) {
      console.error('Error creating instance:', err);
      setError(err instanceof Error ? err.message : 'Failed to provision instance. Please try again.');
      
      toast({
        title: "Error",
        description: "Failed to provision AI instance. Please check the API configuration.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle instance deletion
  const handleDeleteInstance = async (instanceId: string) => {
    if (!window.confirm("Are you sure you want to delete this instance? This action cannot be undone.")) {
      return;
    }
    
    try {
      await deleteBedrockInstance(instanceId);
      
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
  
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Bedrock AI Instances (Supabase)</h1>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchInstances} 
              disabled={refreshing}
            >
              {refreshing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchEnvironmentDiagnostics}
              disabled={refreshing}
            >
              <Code className="mr-2 h-4 w-4" />
              Test Environment
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
        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>
              Configure the API key for accessing the Bedrock API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="use-manual-key"
                  checked={isUsingManualKey}
                  onCheckedChange={setIsUsingManualKey}
                />
                <Label htmlFor="use-manual-key">Use custom API key</Label>
              </div>
              
              {isUsingManualKey && (
                <div className="grid gap-2">
                  <Label htmlFor="api-key">API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      id="api-key"
                      type="password"
                      placeholder="Enter your Bedrock API key"
                      value={manualApiKey}
                      onChange={(e) => setManualApiKey(e.target.value)}
                    />
                    <Button onClick={handleSaveApiKey}>Save</Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    The API key will be stored in your browser's localStorage for future use.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Environment Diagnostics */}
        {showDiagnostics && envDiagnostics && (
          <Card>
            <CardHeader>
              <CardTitle>Environment Diagnostics</CardTitle>
              <CardDescription>
                Information about the current environment configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                {JSON.stringify(envDiagnostics, null, 2)}
              </pre>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => setShowDiagnostics(false)}>Close</Button>
            </CardFooter>
          </Card>
        )}
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <div className="text-2xl font-bold">{stats.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.failed}</div>
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
            
            {loading ? (
              <div className="space-y-4">
                <InstanceSkeleton />
                <InstanceSkeleton />
              </div>
            ) : instances.length === 0 ? (
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
                          <CardTitle>Model: {instance.model_id.split('/').pop()}</CardTitle>
                          <CardDescription>
                            ID: {instance.instance_id.split('/').pop()}
                          </CardDescription>
                        </div>
                        <StatusBadge status={instance.status} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Type:</span>
                          <span>{getPlanFromModelId(instance.model_id)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Units:</span>
                          <span>{instance.model_units}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Commitment:</span>
                          <span>{instance.commitment_duration}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Created:</span>
                          <span>{new Date(instance.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="ml-auto" 
                        onClick={() => handleDeleteInstance(instance.instance_id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="provision" className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Provision New AI Instance</h2>
            
            <Card>
              <CardHeader>
                <CardTitle>New Bedrock Instance</CardTitle>
                <CardDescription>
                  Configure and provision a new AWS Bedrock AI instance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="plan">Select Plan</Label>
                    <Select
                      value={selectedPlan}
                      onValueChange={setSelectedPlan}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a plan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="starter">Starter - Titan Text Lite</SelectItem>
                        <SelectItem value="pro">Pro - Titan Text Express</SelectItem>
                        <SelectItem value="business">Business - Claude Instant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="pt-2">
                    <h3 className="text-lg font-medium mb-2">Plan Details</h3>
                    {selectedPlan && (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Model:</span>
                          <span>{planConfig[selectedPlan as keyof typeof planConfig]?.modelId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Commitment:</span>
                          <span>{planConfig[selectedPlan as keyof typeof planConfig]?.commitmentDuration}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Units:</span>
                          <span>{planConfig[selectedPlan as keyof typeof planConfig]?.modelUnits}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </form>
              </CardContent>
              <CardFooter>
                <Button 
                  className="ml-auto" 
                  onClick={handleProvisionInstance}
                  disabled={submitting}
                >
                  {submitting ? "Creating..." : "Create Instance"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Skeleton component for loading state
const InstanceSkeleton = () => (
  <Card>
    <CardHeader>
      <div className="flex justify-between items-start">
        <div>
          <Skeleton className="h-6 w-[200px]" />
          <Skeleton className="h-4 w-[150px] mt-2" />
        </div>
        <Skeleton className="h-6 w-[80px]" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    </CardContent>
    <CardFooter>
      <Skeleton className="h-9 w-[100px] ml-auto" />
    </CardFooter>
  </Card>
);

export default SupabaseBedrock; 