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
import { Switch } from "@/components/ui/switch";
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
  if (!BedrockConfig.isLocalDevelopment || !BedrockConfig.devUseMockApi) {
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
  
  // API key state
  const [manualApiKey, setManualApiKey] = useState('');
  const [isUsingManualKey, setIsUsingManualKey] = useState(false);
  
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
  
  // Load manual API key from localStorage if available
  useEffect(() => {
    const savedKey = localStorage.getItem('bedrock-api-key');
    if (savedKey) {
      console.log('Found saved API key in localStorage');
      setManualApiKey(savedKey);
      setIsUsingManualKey(true);
    }
    
    // Check authentication status
    checkAuthStatus().then(isAuthenticated => {
      if (isAuthenticated) {
        // Initial fetch only if authenticated
        fetchInstances();
      } else if (BedrockConfig.auth.requireAuth) {
        setError('Authentication required. Please log in to access this feature.');
      }
    });
    
    // Check API configuration
    const isConfigured = BedrockClient.validateApiConfiguration();
    if (!isConfigured) {
      setError('API is not properly configured. Check the environment settings and try again.');
      setConnectionStatus('error');
    }
    
    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      if (event === 'SIGNED_IN' && session) {
        setAuthStatus('authenticated');
        fetchInstances();
      } else if (event === 'SIGNED_OUT') {
        setAuthStatus('unauthenticated');
        setInstances([]);
      } else if (event === 'TOKEN_REFRESHED') {
        setAuthStatus('authenticated');
      }
    });
    
    // Cleanup listener
    return () => {
      authListener?.subscription.unsubscribe();
    };
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
  
  // Clear API key
  const handleClearApiKey = () => {
    localStorage.removeItem('bedrock-api-key');
    setManualApiKey('');
    setIsUsingManualKey(false);
    
    toast({
      title: "Success",
      description: "API key has been cleared. Using environment defaults.",
    });
    
    // Refresh instances with default key
    fetchInstances();
  };
  
  // Fetch instances
  const fetchInstances = async () => {
    setLoading(true);
    setRefreshing(true);
    setError(null);
    setConnectionStatus('checking');
    
    try {
      // Check authentication if required
      if (BedrockConfig.auth.requireAuth) {
        const isAuthenticated = await checkAuthStatus();
        if (!isAuthenticated) {
          throw new Error('Authentication required. Please log in to access this feature.');
        }
      }
      
      // Use the direct callEdgeFunction method for more control
      const { data, error } = await BedrockClient.callEdgeFunction({
        action: 'listInstances',
        requireAuth: BedrockConfig.auth.requireAuth,
        useApiKey: isUsingManualKey
      });
      
      if (error) {
        // Check for authentication errors
        if (error.includes('authentication') || error.includes('JWT') || 
            error.includes('sign in') || error.includes('auth')) {
          setAuthStatus('expired');
          throw new Error('Authentication error: ' + error);
        }
        throw new Error(error);
      }
      
      setInstances(data?.instances || []);
      setConnectionStatus('connected');
      
      // Calculate stats
      const stats = {
        total: data?.instances?.length || 0,
        active: data?.instances?.filter(i => i.status.toLowerCase() === 'inservice').length || 0,
        pending: data?.instances?.filter(i => i.status.toLowerCase() === 'creating').length || 0,
        failed: data?.instances?.filter(i => ['failed', 'deleted'].includes(i.status.toLowerCase())).length || 0
      };
      
      setStats(stats);
    } catch (error) {
      console.error('Error in fetchInstances:', error);
      setError(error instanceof Error ? error.message : 'Failed to load instances. Please try again.');
      setConnectionStatus('error');
      
      // Show toast for authentication errors
      if (error instanceof Error && (
          error.message.includes('authentication') || 
          error.message.includes('JWT') || 
          error.message.includes('sign in'))) {
        toast({
          title: "Authentication Error",
          description: "Your session has expired or you're not authenticated. Please log in again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Test environment
  const fetchEnvironmentDiagnostics = async () => {
    try {
      setConnectionStatus('checking');
      
      // Check authentication if required
      if (BedrockConfig.auth.requireAuth) {
        const isAuthenticated = await checkAuthStatus();
        if (!isAuthenticated) {
          throw new Error('Authentication required. Please log in to access this feature.');
        }
      }
      
      // Use the direct callEdgeFunction method
      const { data, error } = await BedrockClient.callEdgeFunction({
        action: 'testEnv',
        requireAuth: BedrockConfig.auth.requireAuth,
        useApiKey: isUsingManualKey
      });
      
      if (error) {
        setConnectionStatus('error');
        setEnvDiagnostics({
          error,
          timestamp: new Date().toISOString()
        });
        setShowDiagnostics(true);
        throw new Error(error);
      }
      
      setConnectionStatus('connected');
      setEnvDiagnostics(data);
      setShowDiagnostics(true);
    } catch (error) {
      console.error('Error testing environment:', error);
      toast({
        title: "Error",
        description: "Failed to test environment. Check diagnostic details.",
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
      // Check authentication if required
      if (BedrockConfig.auth.requireAuth) {
        const isAuthenticated = await checkAuthStatus();
        if (!isAuthenticated) {
          throw new Error('Authentication required. Please log in to access this feature.');
        }
      }
      
      const planDetails = planConfig[selectedPlan as keyof typeof planConfig];
      
      if (!planDetails) {
        throw new Error(`Invalid plan selected: ${selectedPlan}`);
      }
      
      // Use the direct callEdgeFunction method
      const { data, error } = await BedrockClient.callEdgeFunction({
        action: 'provisionInstance',
        payload: {
          modelInfo: {
            modelId: planDetails.modelId,
            commitmentDuration: planDetails.commitmentDuration,
            modelUnits: planDetails.modelUnits
          }
        },
        requireAuth: BedrockConfig.auth.requireAuth,
        useApiKey: isUsingManualKey
      });
      
      if (error) {
        throw new Error(error);
      }
      
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
      // Check authentication if required
      if (BedrockConfig.auth.requireAuth) {
        const isAuthenticated = await checkAuthStatus();
        if (!isAuthenticated) {
          throw new Error('Authentication required. Please log in to access this feature.');
        }
      }
      
      // Use the direct callEdgeFunction method
      const { data, error } = await BedrockClient.callEdgeFunction({
        action: 'deleteInstance',
        payload: { instanceId },
        requireAuth: BedrockConfig.auth.requireAuth,
        useApiKey: isUsingManualKey
      });
      
      if (error) {
        throw new Error(error);
      }
      
      if (!data?.success) {
        throw new Error("Unknown error while deleting instance");
      }
      
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
  
  // Main component render
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">Bedrock AI Instances</h1>
            <ConnectionStatusBadge status={connectionStatus} />
            <AuthStatusBadge status={authStatus} />
            {BedrockConfig.devUseMockApi && (
              <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100">Mock Data</Badge>
            )}
          </div>
          <div className="flex items-center gap-4">
            {/* Authentication actions */}
            {(['unauthenticated', 'expired'].includes(authStatus)) && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogin} 
              >
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            )}
            
            {authStatus === 'authenticated' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshToken} 
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Token
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchInstances} 
              disabled={refreshing || !['authenticated'].includes(authStatus)}
            >
              {refreshing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchEnvironmentDiagnostics}
              disabled={refreshing || !['authenticated'].includes(authStatus)}
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
            {(error.includes('authentication') || error.includes('sign in')) && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogin}
                className="mt-2"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            )}
          </Alert>
        )}
        
        {/* Authentication Status Card - show when not authenticated */}
        {(['unauthenticated', 'expired'].includes(authStatus) && BedrockConfig.auth.requireAuth) && (
          <Card>
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>
                You need to be authenticated to access Bedrock features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                This page requires a valid JWT token. Please sign in to continue.
              </p>
              <Button onClick={handleLogin}>
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            </CardContent>
          </Card>
        )}
        
        {/* API Configuration Info */}
        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>
              Current configuration and connection status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">API URL:</p>
                  <p className="text-sm text-muted-foreground">{BedrockConfig.apiUrl}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Edge Functions:</p>
                  <p className="text-sm text-muted-foreground">
                    {BedrockConfig.useEdgeFunctions ? 
                      (BedrockConfig.edgeFunctionUrl ? 'Enabled' : 'Enabled (but URL missing)') : 
                      'Disabled'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Edge Function URL:</p>
                  <p className="text-sm text-muted-foreground">{BedrockConfig.edgeFunctionUrl || 'Not configured'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Environment:</p>
                  <p className="text-sm text-muted-foreground">
                    {BedrockConfig.isProduction ? 'Production' : 'Development'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Auth Required:</p>
                  <p className="text-sm text-muted-foreground">
                    {BedrockConfig.auth.requireAuth ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Function Name:</p>
                  <p className="text-sm text-muted-foreground">
                    {BedrockConfig.edgeFunctionName}
                  </p>
                </div>
              </div>
              
              <div className="pt-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="use-manual-key"
                    checked={isUsingManualKey}
                    onCheckedChange={setIsUsingManualKey}
                  />
                  <Label htmlFor="use-manual-key">Use custom API key</Label>
                </div>
                
                {isUsingManualKey && (
                  <div className="grid gap-2 mt-2">
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
                      <Button variant="outline" onClick={handleClearApiKey}>Clear</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-xl">Total Instances</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-4 pb-4">
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-xl">Active</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-4 pb-4">
              <div className="text-3xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-xl">Pending</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-4 pb-4">
              <div className="text-3xl font-bold text-amber-600">{stats.pending}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-xl">Failed/Deleted</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-4 pb-4">
              <div className="text-3xl font-bold text-red-600">{stats.failed}</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Environment test results */}
        {showDiagnostics && envDiagnostics && (
          <Card>
            <CardHeader>
              <CardTitle>Environment Diagnostics</CardTitle>
              <CardDescription>
                Results from API environment test
              </CardDescription>
            </CardHeader>
            <CardContent>
              {envDiagnostics.error ? (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Connection Error</AlertTitle>
                  <AlertDescription>{envDiagnostics.error}</AlertDescription>
                </Alert>
              ) : null}
              
              <div className="bg-muted rounded-md p-4 overflow-auto max-h-60">
                <pre className="text-xs">{JSON.stringify(envDiagnostics, null, 2)}</pre>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Main content tabs */}
        <Tabs defaultValue="instances">
          <TabsList>
            <TabsTrigger value="instances">Instances</TabsTrigger>
            <TabsTrigger value="provision">Provision New</TabsTrigger>
          </TabsList>
          
          <TabsContent value="instances">
            <Card>
              <CardHeader>
                <CardTitle>Provisioned Instances</CardTitle>
                <CardDescription>
                  Your active AWS Bedrock model instances
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading && !refreshing ? (
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : error && instances.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No instances available</h3>
                    <p className="text-muted-foreground mb-4">
                      {connectionStatus === 'error' 
                        ? "Could not connect to the API. Check your configuration."
                        : "No Bedrock instances found. You can provision a new instance below."}
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={fetchEnvironmentDiagnostics}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Test Connection
                    </Button>
                  </div>
                ) : instances.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No instances found. You can provision a new instance using the "Provision New" tab.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">ID</th>
                          <th className="text-left p-2">Model</th>
                          <th className="text-left p-2">Plan</th>
                          <th className="text-left p-2">Status</th>
                          <th className="text-left p-2">Created</th>
                          <th className="text-right p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {instances.map((instance) => (
                          <tr key={instance.instance_id} className="border-b hover:bg-muted/50">
                            <td className="p-2 font-mono text-xs">
                              {instance.instance_id.substring(0, 8)}...
                            </td>
                            <td className="p-2">
                              {instance.model_id.split('.')[1] || instance.model_id}
                            </td>
                            <td className="p-2 capitalize">
                              {getPlanFromModelId(instance.model_id)}
                            </td>
                            <td className="p-2">
                              <StatusBadge status={instance.status} />
                            </td>
                            <td className="p-2 text-sm">
                              {new Date(instance.created_at).toLocaleDateString()}
                            </td>
                            <td className="p-2 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteInstance(instance.instance_id)}
                                disabled={instance.status.toLowerCase() === 'deleted'}
                              >
                                <Trash2 className="h-4 w-4" />
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
          
          <TabsContent value="provision">
            <Card>
              <CardHeader>
                <CardTitle>Provision New Instance</CardTitle>
                <CardDescription>
                  Create a new AWS Bedrock model throughput instance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 max-w-md">
                  <div>
                    <Label htmlFor="plan">Select Plan</Label>
                    <Select 
                      value={selectedPlan} 
                      onValueChange={setSelectedPlan}
                    >
                      <SelectTrigger id="plan">
                        <SelectValue placeholder="Select a plan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="starter">Starter - Titan Text Lite</SelectItem>
                        <SelectItem value="pro">Pro - Titan Text Express</SelectItem>
                        <SelectItem value="business">Business - Claude Instant</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground mt-1">
                      Choose a plan based on your throughput and model requirements.
                    </p>
                  </div>
                  
                  <div className="mt-4">
                    <Button 
                      onClick={handleProvisionInstance} 
                      disabled={submitting || connectionStatus === 'error'}
                      className="w-full"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Provisioning...
                        </>
                      ) : (
                        "Provision Instance"
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col items-start">
                <div className="text-sm text-muted-foreground">
                  <h4 className="font-medium mb-1">Important Notes:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Provisioning a new instance may take up to 10 minutes to complete.</li>
                    <li>You will be billed according to AWS Bedrock pricing for provisioned throughput.</li>
                    <li>Instances are billed hourly until deleted.</li>
                  </ul>
                </div>
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