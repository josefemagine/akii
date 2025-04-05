import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, RefreshCw, Trash2, Code, AlertTriangle, Settings, Loader2, LogIn, Database } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from 'react-router-dom';
import { EnvConfig } from "@/lib/env-config";
import { BedrockClient } from "@/lib/supabase-bedrock-client";
import { BedrockConfig } from "@/lib/bedrock-config";
import supabase from "@/lib/supabase-client";

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

// Environment diagnostics interface
interface EnvironmentDiagnostics {
  apiVersion?: string;
  environment?: string;
  awsRegion?: string;
  auth?: string;
  timestamp?: string;
  [key: string]: any;
}

// Connection status states
type ConnectionStatus = 'unknown' | 'checking' | 'connected' | 'error';

// Authentication status states
type AuthStatus = 'unknown' | 'checking' | 'authenticated' | 'unauthenticated' | 'expired';

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

// API connection status badge
const ConnectionStatusBadge = ({ status }: { status: ConnectionStatus }) => {
  let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
  let label = "Unknown";
  
  switch (status) {
    case 'connected':
      variant = "default";
      label = "Connected";
      break;
    case 'checking':
      variant = "secondary";
      label = "Checking...";
      break;
    case 'error':
      variant = "destructive";
      label = "Connection Error";
      break;
    default:
      variant = "outline";
      label = "Not Checked";
  }
  
  return <Badge variant={variant}>{label}</Badge>;
};

// Authentication status badge
const AuthStatusBadge = ({ status }: { status: AuthStatus }) => {
  let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
  let label = "Unknown";
  
  switch (status) {
    case 'authenticated':
      variant = "default";
      label = "Authenticated";
      break;
    case 'checking':
      variant = "secondary";
      label = "Checking Auth...";
      break;
    case 'unauthenticated':
      variant = "destructive";
      label = "Not Authenticated";
      break;
    case 'expired':
      variant = "destructive";
      label = "Session Expired";
      break;
    default:
      variant = "outline";
      label = "Auth Unknown";
  }
  
  return <Badge variant={variant}>{label}</Badge>;
};

// After imports, add this component for the mock data notice
const MockDataNotice = () => {
  if (!BedrockConfig.isLocalDevelopment || !BedrockConfig.useMockData) {
    return null;
  }
  
  return (
    <Alert className="mb-4">
      <Database className="h-4 w-4" />
      <AlertTitle>Using Mock Data</AlertTitle>
      <AlertDescription>
        You're currently viewing mock data in development mode. Real API endpoints will be used in production.
      </AlertDescription>
    </Alert>
  );
};

// Main component
const SupabaseBedrock = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [instances, setInstances] = useState<BedrockInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('unknown');
  const [authStatus, setAuthStatus] = useState<AuthStatus>('unknown');
  
  // Form state
  const [selectedPlan, setSelectedPlan] = useState('starter');
  const [submitting, setSubmitting] = useState(false);
  
  // Environment diagnostics
  const [envDiagnostics, setEnvDiagnostics] = useState<EnvironmentDiagnostics | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  
  // Check authentication status
  const checkAuthStatus = async () => {
    setAuthStatus('checking');
    try {
      const isAuthenticated = await BedrockClient.isAuthenticated();
      
      if (isAuthenticated) {
        setAuthStatus('authenticated');
        return true;
      } else {
        setAuthStatus('unauthenticated');
        return false;
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setAuthStatus('unauthenticated');
      return false;
    }
  };
  
  // Handle login redirect
  const handleLogin = () => {
    // Store the current location to redirect back after login
    localStorage.setItem('auth-redirect', window.location.pathname);
    navigate('/login');
  };
  
  // Refresh auth token
  const refreshToken = async () => {
    setAuthStatus('checking');
    try {
      const token = await BedrockClient.refreshTokenIfNeeded();
      
      if (token) {
        setAuthStatus('authenticated');
        toast({
          title: "Success",
          description: "Authentication refreshed successfully.",
        });
        return true;
      } else {
        setAuthStatus('expired');
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      setAuthStatus('expired');
      return false;
    }
  };
  
  // Fetch instances from the API
  const fetchInstances = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await BedrockClient.listInstances();
      
      if (error) {
        console.error("Error fetching instances:", error);
        setError(`Failed to fetch instances: ${error}`);
        setConnectionStatus('error');
        return;
      }
      
      setConnectionStatus('connected');
      setInstances(data?.instances || []);
    } catch (error) {
      console.error("Exception fetching instances:", error);
      setError(`Exception fetching instances: ${error instanceof Error ? error.message : String(error)}`);
      setConnectionStatus('error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Refresh instances list
  const refreshInstances = async () => {
    setRefreshing(true);
    await fetchInstances();
  };
  
  // Fetch environment diagnostics
  const fetchEnvironmentDiagnostics = async () => {
    setConnectionStatus('checking');
    setError(null);
    
    try {
      const { data, error } = await BedrockClient.testEnvironment();
      
      if (error) {
        console.error("Environment diagnostics error:", error);
        setConnectionStatus('error');
        setError(`Failed to get environment diagnostics: ${error}`);
        return;
      }
      
      setConnectionStatus('connected');
      setEnvDiagnostics(data);
    } catch (error) {
      console.error("Exception getting environment diagnostics:", error);
      setConnectionStatus('error');
      setError(`Exception getting environment diagnostics: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  // Initialize on component mount
  useEffect(() => {
    // Check authentication status on mount
    checkAuthStatus().then(isAuth => {
      if (isAuth) {
        fetchInstances();
        fetchEnvironmentDiagnostics();
      }
    });
  }, []);
  
  // Create a new Bedrock instance
  const handleProvisionInstance = async () => {
    setSubmitting(true);
    setError(null);
    
    try {
      // First authenticate if needed
      const isAuth = await checkAuthStatus();
      if (!isAuth) {
        toast({
          title: "Authentication Required",
          description: "Please log in to provision a Bedrock instance.",
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }
      
      // Get the plan configuration
      const plan = planConfig[selectedPlan as keyof typeof planConfig];
      if (!plan) {
        setError(`Invalid plan selected: ${selectedPlan}`);
        setSubmitting(false);
        return;
      }
      
      // Create instance request
      const { data, error } = await BedrockClient.createInstance({
        modelId: plan.modelId,
        commitmentDuration: plan.commitmentDuration,
        modelUnits: plan.modelUnits
      });
      
      if (error) {
        setError(`Failed to provision instance: ${error}`);
        toast({
          title: "Provisioning Failed",
          description: `Failed to provision Bedrock instance: ${error}`,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Instance Provisioned",
        description: "Your Bedrock instance is being provisioned. This may take a few minutes to complete.",
      });
      
      // Refresh the instances list
      fetchInstances();
    } catch (error) {
      console.error("Provision error:", error);
      setError(`Exception provisioning instance: ${error instanceof Error ? error.message : String(error)}`);
      toast({
        title: "Provisioning Failed",
        description: `An error occurred: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  // Delete a Bedrock instance
  const handleDeleteInstance = async (instanceId: string) => {
    if (!confirm('Are you sure you want to delete this instance? This action cannot be undone.')) {
      return;
    }
    
    setError(null);
    
    try {
      const { data, error } = await BedrockClient.deleteInstance(instanceId);
      
      if (error) {
        setError(`Failed to delete instance: ${error}`);
        toast({
          title: "Deletion Failed",
          description: `Failed to delete Bedrock instance: ${error}`,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Instance Deleted",
        description: "The Bedrock instance has been deleted successfully.",
      });
      
      // Refresh the instances list
      fetchInstances();
    } catch (error) {
      console.error("Delete error:", error);
      setError(`Exception deleting instance: ${error instanceof Error ? error.message : String(error)}`);
      toast({
        title: "Deletion Failed",
        description: `An error occurred: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    }
  };
  
  // Show an API config section in the UI
  const ApiConfiguration = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>API Configuration</CardTitle>
        <CardDescription>Current configuration and connection status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label className="mb-1 block text-sm font-medium">API URL:</Label>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {BedrockConfig.isLocalDevelopment ? '/api/super-action' : BedrockConfig.edgeFunctionUrl}
            </div>
          </div>
          
          <div>
            <Label className="mb-1 block text-sm font-medium">Edge Functions:</Label>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {BedrockConfig.useEdgeFunctions ? 'Enabled' : 'Disabled'}
            </div>
          </div>
          
          <div>
            <Label className="mb-1 block text-sm font-medium">Environment:</Label>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {BedrockConfig.isProduction ? 'Production' : 'Development'}
            </div>
          </div>
          
          <div>
            <Label className="mb-1 block text-sm font-medium">Function Name:</Label>
            <div className="text-sm text-gray-700 dark:text-gray-300">{BedrockConfig.edgeFunctionName}</div>
          </div>
          
          <div>
            <Label className="mb-1 block text-sm font-medium">Authentication:</Label>
            <div className="text-sm text-gray-700 dark:text-gray-300">Supabase JWT</div>
          </div>
          
          <div>
            <Label className="mb-1 block text-sm font-medium">Edge Function URL:</Label>
            <div className="text-sm text-gray-700 dark:text-gray-300">{BedrockConfig.edgeFunctionUrl}</div>
          </div>
        </div>
        
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <Label className="mb-1 block text-sm font-medium">Connection:</Label>
            <ConnectionStatusBadge status={connectionStatus} />
          </div>
          
          <div>
            <Label className="mb-1 block text-sm font-medium">Auth Status:</Label>
            <div className="flex items-center gap-2">
              <AuthStatusBadge status={authStatus} />
              {authStatus === 'unauthenticated' && (
                <Button variant="outline" size="sm" onClick={handleLogin}>
                  <LogIn className="h-4 w-4 mr-2" /> Log In
                </Button>
              )}
              {(authStatus === 'authenticated' || authStatus === 'expired') && (
                <Button variant="outline" size="sm" onClick={refreshToken}>
                  <RefreshCw className="h-4 w-4 mr-2" /> Refresh Token
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={fetchEnvironmentDiagnostics}>
            <Settings className="h-4 w-4 mr-2" /> Test Environment
          </Button>
          <Button variant="outline" size="sm" onClick={refreshInstances} disabled={refreshing}>
            {refreshing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
  
  // Render loading state
  if (loading && !refreshing) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Bedrock AI Instances</h1>
        <InstanceSkeleton />
      </div>
    );
  }
  
  // Render auth required state
  if (authStatus === 'unauthenticated' || authStatus === 'expired') {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Bedrock AI Instances</h1>
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              You need to be logged in to access Bedrock AI instances.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Please log in with your Supabase account to access Bedrock AI instances.
            </p>
            <Button onClick={handleLogin}>
              <LogIn className="mr-2 h-4 w-4" /> Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Bedrock AI Instances</h1>
        
        <div className="flex items-center gap-2">
          <ConnectionStatusBadge status={connectionStatus} />
          <AuthStatusBadge status={authStatus} />
          <Button variant="outline" size="sm" onClick={refreshToken} disabled={authStatus === 'checking'}>
            {authStatus === 'checking' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="sr-only">Refresh Auth</span>
          </Button>
          <Button variant="outline" size="sm" onClick={refreshInstances} disabled={refreshing}>
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
      </div>
      
      <MockDataNotice />
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="instances">
        <TabsList className="mb-4">
          <TabsTrigger value="instances">Instances</TabsTrigger>
          <TabsTrigger value="create">Create Instance</TabsTrigger>
          {showDiagnostics && (
            <TabsTrigger value="diagnostics">API Diagnostics</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="instances">
          <Card>
            <CardHeader>
              <CardTitle>Bedrock Instances</CardTitle>
              <CardDescription>
                Manage your provisioned AWS Bedrock AI models
              </CardDescription>
            </CardHeader>
            <CardContent>
              {instances.length === 0 ? (
                <div className="text-center p-4">
                  <p className="text-muted-foreground">No instances found. Create a new instance to get started.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">ID</th>
                        <th className="text-left p-2">Model</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Units</th>
                        <th className="text-left p-2">Created</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {instances.map((instance) => (
                        <tr key={instance.id} className="border-b hover:bg-muted/50">
                          <td className="p-2">{instance.id}</td>
                          <td className="p-2">{instance.model_id.split('.').pop()}</td>
                          <td className="p-2"><StatusBadge status={instance.status} /></td>
                          <td className="p-2">{instance.model_units}</td>
                          <td className="p-2">{new Date(instance.created_at).toLocaleString()}</td>
                          <td className="p-2">
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteInstance(instance.instance_id)}>
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create Bedrock Instance</CardTitle>
              <CardDescription>
                Provision a new AWS Bedrock AI model
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid w-full gap-2">
                <Label htmlFor="plan">Plan Type</Label>
                <Select defaultValue={selectedPlan} onValueChange={setSelectedPlan}>
                  <SelectTrigger id="plan">
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter">Starter - Titan Text Lite</SelectItem>
                    <SelectItem value="pro">Pro - Titan Text Express</SelectItem>
                    <SelectItem value="business">Business - Claude Instant</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Select the AI model plan you want to provision.
                </p>
              </div>
              
              <div className="grid w-full gap-2">
                <Label htmlFor="model-details">Model Details</Label>
                <div className="bg-muted rounded-md p-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-sm font-medium">Model:</span>
                    </div>
                    <div>
                      <span className="text-sm">{planConfig[selectedPlan as keyof typeof planConfig]?.modelId || 'Unknown'}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium">Commitment:</span>
                    </div>
                    <div>
                      <span className="text-sm">1 Month</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium">Model Units:</span>
                    </div>
                    <div>
                      <span className="text-sm">{planConfig[selectedPlan as keyof typeof planConfig]?.modelUnits || 'Unknown'}</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  These details will be used to provision your Bedrock instance.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleProvisionInstance} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Provisioning...
                  </>
                ) : (
                  'Create Instance'
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {showDiagnostics && (
          <TabsContent value="diagnostics">
            <Card>
              <CardHeader>
                <CardTitle>API Diagnostics</CardTitle>
                <CardDescription>
                  Technical details about the API environment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96">
                  {JSON.stringify(envDiagnostics, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
      
      <ApiConfiguration />
    </div>
  );
};

// Skeleton loader for the instances table
const InstanceSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-full" />
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
      </div>
    </CardContent>
  </Card>
);

export default SupabaseBedrock; 