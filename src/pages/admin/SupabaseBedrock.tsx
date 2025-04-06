import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, RefreshCw, Trash2, Code, AlertTriangle, Settings, Loader2, LogIn, Database, TestTube } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from 'react-router-dom';
import { EnvConfig } from "@/lib/env-config";
import { BedrockClient } from "@/lib/supabase-bedrock-client";
import { BedrockConfig } from "@/lib/bedrock-config";
import supabase from "@/lib/supabase-client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AwsPermissionTester from '../../components/aws-permission-tester';

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
type AuthStatus = 'unknown' | 'checking' | 'authenticated' | 'unauthenticated' | 'expired' | 'error';

// After imports, add this interface for model data
interface FoundationModel {
  modelId: string;
  modelName: string;
  modelArn: string;
  providerName: string;
  inputModalities: string[];
  outputModalities: string[];
  inferenceTypesSupported: string[];
  customizationsSupported: string[];
  responseStreamingSupported: boolean;
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

// Test modal component
const TestModal = ({ isOpen, setIsOpen, testData }: { 
  isOpen: boolean, 
  setIsOpen: (open: boolean) => void, 
  testData: any 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Edge Function Details</DialogTitle>
          <DialogDescription>
            Raw values from the super-action Edge Function
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <div className="mb-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Environment Details</AlertTitle>
              <AlertDescription>
                These values show the current configuration of your Edge Function environment.
              </AlertDescription>
            </Alert>
          </div>
          <div className="bg-muted rounded-md p-4">
            <pre className="whitespace-pre-wrap overflow-auto">{JSON.stringify(testData, null, 2)}</pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Add interfaces for model filtering
interface ModelFilter {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

// Define the available filters
const modelFilters: ModelFilter[] = [
  {
    key: 'byProvider',
    label: 'Provider',
    options: [
      { value: 'amazon', label: 'Amazon' },
      { value: 'anthropic', label: 'Anthropic' },
      { value: 'ai21labs', label: 'AI21 Labs' },
      { value: 'cohere', label: 'Cohere' },
      { value: 'meta', label: 'Meta' },
      { value: 'stability', label: 'Stability AI' }
    ]
  },
  {
    key: 'byOutputModality',
    label: 'Output Type',
    options: [
      { value: 'TEXT', label: 'Text' },
      { value: 'IMAGE', label: 'Image' },
      { value: 'EMBEDDING', label: 'Embedding' }
    ]
  },
  {
    key: 'byInferenceType',
    label: 'Inference Type',
    options: [
      { value: 'ON_DEMAND', label: 'On-Demand' },
      { value: 'PROVISIONED', label: 'Provisioned' }
    ]
  }
];

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
  
  // Models state
  const [availableModels, setAvailableModels] = useState<FoundationModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState('');
  
  // Filter state
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);
  
  // Environment diagnostics
  const [envDiagnostics, setEnvDiagnostics] = useState<EnvironmentDiagnostics | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  
  // Test modal state
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testData, setTestData] = useState<any>(null);
  const [testingConnection, setTestingConnection] = useState(false);
  
  // Check authentication status
  const checkAuthStatus = async () => {
    try {
      if (authStatus !== 'authenticated') {
        setAuthStatus('unauthenticated');
        return false;
      }
      
      // Get the current token
      const token = await BedrockClient.getAuthToken();
      
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please log in to manage Bedrock instances",
          variant: "destructive"
        });
        setAuthStatus('unauthenticated');
        return false;
      }
      
      setAuthStatus('authenticated');
      return true;
    } catch (error) {
      console.error("Error checking auth status:", error);
      setAuthStatus('error');
      setError(error instanceof Error ? error.message : String(error));
      return false;
    }
  };
  
  // Handle login redirect
  const handleLogin = () => {
    // Store the current location to redirect back after login
    localStorage.setItem('auth-redirect', window.location.pathname);
    navigate('/login');
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
        
        // Even with error, we still might have fallback data
        if (data && data.instances) {
          console.log("Received fallback instance data despite error");
          setInstances(data.instances || []);
        } else {
          setInstances([]);
        }
        
        // Show a more user-friendly error message
        toast({
          title: "Connection Issue",
          description: "Could not connect to the API. Showing limited functionality.",
          variant: "destructive"
        });
        return;
      }
      
      setConnectionStatus('connected');
      setInstances(data?.instances || []);
    } catch (error) {
      console.error("Exception fetching instances:", error);
      setError(`Exception fetching instances: ${error instanceof Error ? error.message : String(error)}`);
      setConnectionStatus('error');
      setInstances([]);
      
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching instances",
        variant: "destructive"
      });
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
  
  // New function to fetch detailed test data from edge function
  const fetchDetailedTestData = async () => {
    setTestingConnection(true);
    setError(null);
    
    try {
      // First authenticate if needed
      const isAuth = await checkAuthStatus();
      if (!isAuth) {
        toast({
          title: "Authentication Required",
          description: "Please log in to test the Edge Function.",
          variant: "destructive",
        });
        setTestingConnection(false);
        return;
      }
      
      // Get the JWT token - we'll need it for direct API calls
      const token = await BedrockClient.getAuthToken();
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Could not retrieve authentication token.",
          variant: "destructive",
        });
        setTestingConnection(false);
        return;
      }
      
      // Call test diagnostics endpoint
      const { data: testEnvData, error: testEnvError } = await BedrockClient.testEnvironment();
      
      if (testEnvError) {
        setError(`Failed to run diagnostics: ${testEnvError}`);
        toast({
          title: "Diagnostics Failed",
          description: `Failed to retrieve environment details: ${testEnvError}`,
          variant: "destructive",
        });
        setTestingConnection(false);
        return;
      }
      
      // Call AWS credential test endpoint
      const awsCredUrl = `${BedrockConfig.edgeFunctionUrl}`;
      const awsCredResponse = await fetch(awsCredUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'aws-credential-test'
        })
      });
      
      let awsCredData = {};
      if (awsCredResponse.ok) {
        awsCredData = await awsCredResponse.json();
      } else {
        awsCredData = { error: `Status ${awsCredResponse.status}: ${await awsCredResponse.text()}` };
      }
      
      // Also try the verify AWS credentials endpoint
      const verifyCredResponse = await fetch(awsCredUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'verify-aws-credentials'
        })
      });
      
      let verifyCredData = {};
      if (verifyCredResponse.ok) {
        verifyCredData = await verifyCredResponse.json();
      } else {
        verifyCredData = { error: `Status ${verifyCredResponse.status}: ${await verifyCredResponse.text()}` };
      }
      
      // Call emergency-debug endpoint for full key details (admin only)
      const emergencyDebugResponse = await fetch(awsCredUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'emergency-debug'
        })
      });
      
      let emergencyDebugData = {};
      if (emergencyDebugResponse.ok) {
        emergencyDebugData = await emergencyDebugResponse.json();
      } else {
        // Silently fail - this endpoint may be disabled for security
        console.log("Emergency debug endpoint not available or restricted");
        emergencyDebugData = { 
          note: "Emergency debug endpoint not available (this is normal for security)",
          status: emergencyDebugResponse.status
        };
      }
      
      // Combine all the test data
      const combinedTestData = {
        timestamp: new Date().toISOString(),
        environment: testEnvData,
        awsCredentials: awsCredData,
        verifyCredentials: verifyCredData,
        emergencyDebug: emergencyDebugData,
        config: {
          functionUrl: BedrockConfig.edgeFunctionUrl,
          functionName: BedrockConfig.edgeFunctionName,
          useEdgeFunctions: BedrockConfig.useEdgeFunctions,
          useMockData: BedrockConfig.useMockData,
          isProduction: BedrockConfig.isProduction,
          isLocalDevelopment: BedrockConfig.isLocalDevelopment
        },
        // Add a simple custom utility to decode credentials from the output
        keyHelp: {
          note: "AWS keys are intentionally masked for security reasons",
          accessKeyPrefix: "The first 4-5 characters of access key should be AKIA",
          secretKeyHints: "Secret key should be 40+ characters and a complex mix of chars",
          expectedFormat: {
            accessKey: "AKIA********EXAMPLE",
            secretKey: "wJal*************************Example"
          }
        }
      };
      
      setTestData(combinedTestData);
      setTestModalOpen(true);
      setShowDiagnostics(true);
      
      toast({
        title: "Edge Function Test Complete",
        description: "Successfully retrieved data from the Edge Function.",
      });
    } catch (error) {
      console.error("Test connection error:", error);
      setError(`Exception in edge function test: ${error instanceof Error ? error.message : String(error)}`);
      toast({
        title: "Test Failed",
        description: `An error occurred: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    } finally {
      setTestingConnection(false);
    }
  };
  
  // Update fetchAvailableModels function to handle API errors better
  const fetchAvailableModels = async (filters: Partial<ModelFilter> = {}) => {
    try {
      // Check if authenticated before fetching
      if (authStatus !== 'authenticated') {
        toast({
          title: "Authentication Required",
          description: "You must be logged in to view available models",
          variant: "destructive"
        });
        return;
      }

      setLoadingModels(true);
      setError(null);
      
      // Call the API to fetch models with any active filters
      const { data, error } = await BedrockClient.listFoundationModels(filters);

      // Handle error but still process data if available (for fallbacks)
      if (error) {
        console.error("Error fetching foundation models:", error);
        setError(error);
        
        // Only show toast for real errors, not for fallbacks
        if (!data || !data.models || data.models.length === 0) {
          toast({
            title: "Error Fetching Models",
            description: error,
            variant: "destructive"
          });
        } else {
          // For fallbacks, show a less severe message
          toast({
            title: "API Connection Issue",
            description: "Using fallback model data due to API limitations",
            variant: "default"
          });
        }
      }

      // Process data if available, even if there was an error (fallback data)
      if (data && data.models) {
        const models = data.models || [];
        console.log(`Fetched ${models.length} models from AWS Bedrock${data.note ? ` (${data.note})` : ''}`);

        // Sort models by provider and name for better usability
        const sortedModels = [...models].sort((a, b) => {
          // Sort by provider first
          const providerA = a.providerName || '';
          const providerB = b.providerName || '';
          if (providerA !== providerB) {
            return providerA.localeCompare(providerB);
          }
          
          // Then by model name/ID
          return (a.modelName || a.modelId || '').localeCompare(b.modelName || b.modelId || '');
        });

        setAvailableModels(sortedModels);
        setSelectedModelId(sortedModels.length > 0 ? sortedModels[0].modelId : '');
      } else {
        console.warn("No models returned from API");
        setAvailableModels([]);
      }
    } catch (err) {
      console.error("Error in fetchAvailableModels:", err);
      setError(err instanceof Error ? err.message : String(err));
      setAvailableModels([]);
      
      toast({
        title: "Error",
        description: "Failed to fetch available models",
        variant: "destructive"
      });
    } finally {
      setLoadingModels(false);
    }
  };
  
  // Initialize on component mount
  useEffect(() => {
    checkAuthStatus().then(isAuth => {
      if (isAuth) {
        fetchInstances();
        fetchEnvironmentDiagnostics();
        fetchAvailableModels();
      }
    });
  }, []);
  
  // Update effect to fetch models when filters change
  useEffect(() => {
    if (authStatus === 'authenticated' && !loading) {
      // This wraps the fetchAvailableModels call to avoid the type error
      const fetchModels = () => {
        fetchAvailableModels(activeFilters);
      };
      fetchModels();
    }
  }, [activeFilters, authStatus, loading]);
  
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
      
      // Get the model information
      const modelId = selectedModelId || planConfig[selectedPlan as keyof typeof planConfig]?.modelId;
      
      if (!modelId) {
        setError(`No model selected. Please select a model before provisioning.`);
        setSubmitting(false);
        return;
      }
      
      // Set default commitment duration and model units
      const commitmentDuration = "1m"; // 1 month commitment
      const modelUnits = 1; // Default to 1 unit
      
      // Create instance request
      const { data, error } = await BedrockClient.createInstance({
        modelId,
        commitmentDuration,
        modelUnits
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
                <Button variant="outline" size="sm" onClick={checkAuthStatus}>
                  <RefreshCw className="h-4 w-4 mr-2" /> Refresh Auth
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchDetailedTestData} 
            disabled={testingConnection || authStatus !== 'authenticated'}
          >
            {testingConnection ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <TestTube className="h-4 w-4 mr-2" />
            )}
            Test Edge Function
          </Button>
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
  
  // Create a component for model filters
  const ModelFilters = () => {
    const handleFilterChange = (filterKey: string, value: string) => {
      setActiveFilters(prev => {
        // If value is empty, remove the filter
        if (!value) {
          const newFilters = { ...prev };
          delete newFilters[filterKey];
          return newFilters;
        }
        // Otherwise set the new filter value
        return { ...prev, [filterKey]: value };
      });
    };

    const clearFilters = () => {
      setActiveFilters({});
    };

    return (
      <div className="p-4 border rounded-md mb-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Filter Models</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearFilters}
            disabled={Object.keys(activeFilters).length === 0}
          >
            Clear Filters
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {modelFilters.map(filter => (
            <div key={filter.key} className="space-y-2">
              <Label htmlFor={filter.key}>{filter.label}</Label>
              <Select
                value={activeFilters[filter.key] || ''}
                onValueChange={(value) => handleFilterChange(filter.key, value)}
              >
                <SelectTrigger id={filter.key}>
                  <SelectValue placeholder={`All ${filter.label}s`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All {filter.label}s</SelectItem>
                  {filter.options.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
        
        <div className="mt-4 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            disabled={loadingModels}
            onClick={(e) => {
              e.preventDefault();
              fetchAvailableModels(activeFilters);
            }}
          >
            {loadingModels ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };
  
  // Create a wrapper function for button clicks
  const handleFetchModels = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    fetchAvailableModels(activeFilters);
  };
  
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
          <Button variant="outline" size="sm" onClick={checkAuthStatus} disabled={authStatus === 'checking'}>
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
              <div className="flex justify-between items-center">
                <h3 className="text-md font-medium">Model Selection</h3>
                <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </Button>
              </div>
              
              {showFilters && <ModelFilters />}
              
              <div className="grid w-full gap-2">
                <Label htmlFor="plan">Model</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Select 
                      value={selectedModelId || planConfig[selectedPlan as keyof typeof planConfig]?.modelId} 
                      onValueChange={setSelectedModelId}
                    >
                      <SelectTrigger id="model">
                        <SelectValue placeholder={loadingModels ? "Loading models..." : "Select a model"} />
                      </SelectTrigger>
                      <SelectContent className="max-h-80 overflow-auto">
                        {loadingModels ? (
                          <SelectItem value="loading" disabled>Loading available models...</SelectItem>
                        ) : availableModels.length > 0 ? (
                          availableModels.map((model) => (
                            <SelectItem key={model.modelId} value={model.modelId}>
                              {model.providerName} - {model.modelName}
                            </SelectItem>
                          ))
                        ) : (
                          <>
                            <SelectItem value="amazon.titan-text-lite-v1">Amazon - Titan Text Lite</SelectItem>
                            <SelectItem value="amazon.titan-text-express-v1">Amazon - Titan Text Express</SelectItem>
                            <SelectItem value="anthropic.claude-instant-v1">Anthropic - Claude Instant</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleFetchModels} 
                    disabled={loadingModels || authStatus !== 'authenticated'}
                    title="Refresh model list"
                  >
                    {loadingModels ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground flex justify-between">
                  <span>Select the AI model you want to provision.</span>
                  <span>
                    {availableModels.length > 0 ? (
                      <>Showing {availableModels.length} model{availableModels.length !== 1 ? 's' : ''}</>
                    ) : !loadingModels ? (
                      <>No models found</>
                    ) : null}
                  </span>
                </div>
              </div>
              
              <div className="grid w-full gap-2">
                <Label htmlFor="model-details">Model Details</Label>
                <div className="bg-muted rounded-md p-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-sm font-medium">Model:</span>
                    </div>
                    <div>
                      <span className="text-sm">
                        {selectedModelId || planConfig[selectedPlan as keyof typeof planConfig]?.modelId || 'None selected'}
                      </span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium">Provider:</span>
                    </div>
                    <div>
                      <span className="text-sm">
                        {selectedModelId ? selectedModelId.split('.')[0] : 'Unknown'}
                      </span>
                    </div>
                    
                    {selectedModelId && availableModels.length > 0 && (
                      <>
                        <div>
                          <span className="text-sm font-medium">Input Types:</span>
                        </div>
                        <div>
                          <span className="text-sm">
                            {availableModels.find(m => m.modelId === selectedModelId)?.inputModalities?.join(', ') || 'Not specified'}
                          </span>
                        </div>
                        
                        <div>
                          <span className="text-sm font-medium">Output Types:</span>
                        </div>
                        <div>
                          <span className="text-sm">
                            {availableModels.find(m => m.modelId === selectedModelId)?.outputModalities?.join(', ') || 'Not specified'}
                          </span>
                        </div>
                      </>
                    )}
                    
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
                      <span className="text-sm">1</span>
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
      
      {/* Add the AWS Permission Tester component */}
      <AwsPermissionTester />
      
      {/* Add the test modal */}
      <TestModal 
        isOpen={testModalOpen} 
        setIsOpen={setTestModalOpen} 
        testData={testData} 
      />
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