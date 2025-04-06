import React, { useState, useEffect, useRef } from "react";
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
import supabase from "@/lib/supabase";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AwsPermissionTester from '../../components/aws-permission-tester';
import { useUser } from '@/contexts/UserContext';
import { initBedrockClientWithSupabaseCredentials } from '@/lib/supabase-aws-credentials';
import { CheckCircle2 } from 'lucide-react';
import { useDirectAuth } from '@/contexts/direct-auth-context';

// Error boundary component to catch React errors
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error information
    console.error("Error in Supabase Bedrock component:", error);
    console.error("Error details:", errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Custom error UI
      return (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Something went wrong</CardTitle>
            <CardDescription>
              There was an error loading the Bedrock dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {this.state.error?.message || "Unknown error"}
              </AlertDescription>
            </Alert>
            <div className="mt-4">
              <Button 
                variant="outline" 
                onClick={() => this.setState({ hasError: false, error: null })}
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

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

// Server error notice component to display information about Edge Function errors
const ServerErrorNotice = ({ errorDetails }: { errorDetails: any }) => {
  if (!errorDetails) return null;
  
  // Handle different types of errors
  const isModuleError = errorDetails.code === 'EDGE_FUNCTION_MODULE_ERROR';
  const isBootError = errorDetails.code === 'EDGE_FUNCTION_BOOT_ERROR' || 
                      (errorDetails.original && errorDetails.original.includes('BOOT_ERROR'));
  const isMissingExport = errorDetails.code === 'EDGE_FUNCTION_MISSING_EXPORT';
  
  if (!isModuleError && !isBootError && !isMissingExport) return null;
  
  // Extract the AWS documentation link if available
  const docLink = isMissingExport && 
                 errorDetails.details?.suggestion && 
                 errorDetails.details.suggestion.includes('https://') ? 
                 errorDetails.details.suggestion.match(/(https:\/\/[^\s]+)/)?.[1] : null;
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Server-Side Error Detected</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>
          {isModuleError ? (
            <>
              The Supabase Edge Function has a module import error. It's trying to import 
              <code className="px-1 mx-1 bg-red-900/20 rounded">
                {errorDetails.details?.missingExport || 'unknown export'}
              </code> 
              from 
              <code className="px-1 mx-1 bg-red-900/20 rounded">
                {errorDetails.details?.module || 'unknown module'}
              </code> 
              but that export doesn't exist.
            </>
          ) : isMissingExport ? (
            <>
              The Supabase Edge Function is looking for the function 
              <code className="px-1 mx-1 bg-red-900/20 rounded">
                {errorDetails.details?.missingExport}
              </code> 
              in the module 
              <code className="px-1 mx-1 bg-red-900/20 rounded">
                {errorDetails.details?.module}
              </code> 
              but it's not available.
            </>
          ) : (
            'The Supabase Edge Function is failing to initialize.'
          )}
        </p>
        
        <div className="text-sm bg-red-900/10 p-2 rounded">
          <div className="font-semibold mb-1">Resolution:</div>
          <p>
            {isModuleError || isMissingExport ? (
              <>
                {errorDetails.details?.resolution || 
                  `This requires updating the server-side Edge Function code to correct the ${isModuleError ? 'module import' : 'missing function'}.`}
                
                {isMissingExport && errorDetails.details?.suggestion && (
                  <div className="mt-1 text-xs">
                    <strong>Suggestion:</strong> {docLink ? (
                      <span>
                        Use <code className="px-1 bg-red-900/20 rounded">ListFoundationModels</code> instead. 
                        See <a 
                          href={docLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline"
                        >
                          AWS Bedrock API Reference
                        </a>
                      </span>
                    ) : (
                      errorDetails.details.suggestion
                    )}
                  </div>
                )}
              </>
            ) : (
              'Check the Supabase Edge Function logs for detailed error information.'
            )}
          </p>
        </div>
        
        <div className="pt-1 mt-1 border-t border-red-800/20 text-xs text-red-300">
          Error Code: {errorDetails.code || 'UNKNOWN'}
        </div>
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

// Create a component for model filters
const ModelFilters = ({ activeFilters, setActiveFilters, loadingModels, fetchAvailableModels }) => {
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

// Replace the separate ApiConfiguration and AWS Connection section with this:
const CombinedApiConfigPanel = ({
  connectionStatus,
  authStatus,
  handleLogin,
  checkAuthStatus,
  refreshInstances,
  testingConnection,
  refreshing,
  credentials,
  clientStatus,
  testConnection
}) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>AWS Bedrock Connection</CardTitle>
            <CardDescription>
              API configuration and AWS credentials status
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant={clientStatus?.success ? "default" : "destructive"}
              className={clientStatus?.success ? "bg-green-100 text-green-800 border-green-200" : ""}
            >
              {clientStatus?.success ? "Connected" : "Not Connected"}
            </Badge>
            <Badge 
              variant={authStatus === 'authenticated' ? "outline" : "destructive"}
              className={authStatus === 'authenticated' ? "bg-blue-50 text-blue-800 border-blue-200" : ""}
            >
              {authStatus === 'authenticated' ? "Authenticated" : "Auth Error"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Supabase API</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">API URL:</p>
                  <p className="font-mono bg-muted p-1 rounded">/api/super-action</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Environment:</p>
                  <p className="font-medium">Production</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Authentication:</p>
                  <p className="font-medium">Supabase JWT</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Edge Functions:</p>
                  <p className="font-medium">Enabled</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">AWS Credentials</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Region:</p>
                  <p className="font-medium">{credentials?.region || 'Not Configured'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Access Key:</p>
                  <p className="font-medium">
                    {credentials?.hasCredentials ? 
                      '••••••••••••••••' : 
                      <span className="text-amber-600">Not Configured</span>
                    }
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Status:</p>
                  <p className={`font-medium ${clientStatus.usingFallback ? 'text-amber-600' : 'text-green-600'}`}>
                    {clientStatus.usingFallback ? 'Using Fallback Data' : 'Using AWS API'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Message:</p>
                  <p className="font-medium text-xs">{clientStatus.message}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="h-px bg-border"></div>
        
        <div className="flex flex-col sm:flex-row justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={testConnection}
              disabled={testingConnection}
            >
              {testingConnection ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <TestTube className="mr-2 h-4 w-4" />
              )}
              Test AWS Connection
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => checkAuthStatus()}
              disabled={authStatus === 'checking'}
            >
              {authStatus === 'checking' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Check Auth Status
            </Button>
          </div>
          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshInstances}
              disabled={refreshing}
            >
              {refreshing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Refresh Data
            </Button>
            {authStatus !== 'authenticated' && (
              <Button 
                variant="default" 
                size="sm"
                onClick={handleLogin}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Extract the main content into a separate component to simplify rendering logic
const BedrockDashboardContent = ({ 
  loading, 
  refreshing, 
  authStatus, 
  error, 
  connectionStatus, 
  instances, 
  testModalOpen, 
  testData, 
  setTestModalOpen, 
  showDiagnostics, 
  envDiagnostics, 
  testingConnection, 
  submitting, 
  selectedPlan, 
  selectedModelId, 
  availableModels, 
  loadingModels, 
  showFilters, 
  activeFilters, 
  planConfig,
  client,
  // Functions
  checkAuthStatus,
  handleLogin,
  refreshInstances,
  fetchEnvironmentDiagnostics,
  fetchDetailedTestData,
  fetchAvailableModels,
  handleProvisionInstance,
  handleDeleteInstance,
  setShowFilters,
  setActiveFilters,
  setSelectedModelId,
  setSelectedPlan,
  testConnection
}) => {
  
  // Create a wrapper function for button clicks
  const handleFetchModels = (e) => {
    if (e) e.preventDefault();
    fetchAvailableModels(activeFilters);
  };
  
  // Check if we have edge function errors to display
  const hasEdgeFunctionError = envDiagnostics?.errorDetails || 
                              (envDiagnostics?.standardEndpoint?.error && 
                               typeof envDiagnostics.standardEndpoint.error === 'object');
  
  // Get the error details for the ServerErrorNotice
  const serverErrorDetails = hasEdgeFunctionError ? 
                            (envDiagnostics?.errorDetails || envDiagnostics?.standardEndpoint?.error) : 
                            null;
  
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
      
      {/* Display server error notice if environmental diagnostics show an Edge Function error */}
      {serverErrorDetails && <ServerErrorNotice errorDetails={serverErrorDetails} />}
      
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
              
              {showFilters && 
                <ModelFilters 
                  activeFilters={activeFilters}
                  setActiveFilters={setActiveFilters}
                  loadingModels={loadingModels}
                  fetchAvailableModels={fetchAvailableModels}
                />
              }
              
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
      
      <CombinedApiConfigPanel
        connectionStatus={connectionStatus}
        authStatus={authStatus}
        handleLogin={handleLogin}
        checkAuthStatus={checkAuthStatus}
        refreshInstances={refreshInstances}
        testingConnection={testingConnection}
        refreshing={refreshing}
        credentials={client?.clientStatus?.credentials || null}
        clientStatus={client?.clientStatus || {
          success: false,
          usingFallback: true,
          message: 'Not initialized',
          credentials: null
        }}
        testConnection={testConnection}
      />
      
      {/* Add the test modal */}
      <TestModal 
        isOpen={testModalOpen} 
        setIsOpen={setTestModalOpen} 
        testData={testData} 
      />
    </div>
  );
};

// Main component with simplified render method
const SupabaseBedrock = () => {
  console.log("[DEBUG] Starting SupabaseBedrock component initialization");
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useUser();
  const { isAdmin, user: directUser } = useDirectAuth();
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
  
  // Credentials state
  const [client, setClient] = useState(null);
  const [clientStatus, setClientStatus] = useState({
    success: false,
    usingFallback: true,
    message: 'Initializing...',
    credentials: null
  });
  const [credentials, setCredentials] = useState({
    aws_access_key_id: '',
    aws_secret_access_key: '',
    aws_region: 'us-east-1'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  
  // Check authentication status
  const checkAuthStatus = async () => {
    try {
      setAuthStatus('checking');
      
      // Also check localStorage for admin status (for direct navigation)
      const localStorageAdmin = localStorage.getItem('akii-is-admin') === 'true';
      const isJosefUser = 
        directUser?.email === 'josef@holm.com' || 
        localStorage.getItem('akii-auth-user-email') === 'josef@holm.com';
        
      // Combine all admin sources
      const hasAdminPrivileges = isAdmin || localStorageAdmin || isJosefUser;
      
      console.log("[DEBUG] Auth status:", { 
        directUser: directUser ? { id: directUser.id, email: directUser.email } : null,
        isAdmin,
        localStorageAdmin,
        isJosefUser,
        hasAdminPrivileges,
        pathname: window.location.pathname
      });
      
      // Check auth using direct auth context instead of custom method
      if (!directUser || !hasAdminPrivileges) {
        console.log("[DEBUG] User is not authenticated or not admin", { 
          directUser, 
          isAdmin, 
          localStorageAdmin,
          isJosefUser,
          isAuthenticated: !!directUser 
        });
        setAuthStatus('unauthenticated');
        toast({
          title: "Authentication Required",
          description: "Please log in with admin privileges to manage Bedrock instances",
          variant: "destructive"
        });
        return false;
      }
      
      // User is authenticated and admin
      setAuthStatus('authenticated');
      console.log("[DEBUG] User is authenticated and has admin privileges");
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
      
      // Get the JWT token from direct auth context
      const token = directUser?.access_token;
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
      setError(null); // Clear the main error
      
      // Call the API to fetch models with any active filters
      const { data, error } = await BedrockClient.listFoundationModels(filters);

      // Handle error but still process data if available (for fallbacks)
      if (error) {
        console.error("Error fetching foundation models:", error);
        setError(error); // Set the main error state
        
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
  
  // Initialize on component mount - use a ref to ensure it only runs once
  useEffect(() => {
    console.log("[DEBUG] Running initial useEffect");
    let isMounted = true;
    
    const initialize = async () => {
      try {
        console.log("[DEBUG] Initializing component");
        
        // Also check localStorage for admin status (for direct navigation)
        const localStorageAdmin = localStorage.getItem('akii-is-admin') === 'true';
        const isJosefUser = 
          directUser?.email === 'josef@holm.com' || 
          localStorage.getItem('akii-auth-user-email') === 'josef@holm.com';
          
        // Combine all admin sources
        const hasAdminPrivileges = isAdmin || localStorageAdmin || isJosefUser;
        
        console.log("[DEBUG] Auth status:", { 
          directUser: directUser ? { id: directUser.id, email: directUser.email } : null,
          isAdmin,
          localStorageAdmin,
          isJosefUser,
          hasAdminPrivileges,
          pathname: window.location.pathname
        });
        
        // Check auth using direct auth context instead of custom method
        if (!directUser || !hasAdminPrivileges) {
          console.log("[DEBUG] User is not authenticated or not admin", { 
            directUser, 
            isAdmin, 
            localStorageAdmin,
            isJosefUser,
            isAuthenticated: !!directUser 
          });
          setAuthStatus('unauthenticated');
          setLoading(false);
          
          // Add a slight delay before redirecting to ensure state is properly updated
          const REDIRECT_DELAY_MS = 50;
          setTimeout(() => {
            if (!directUser) {
              console.log("[DEBUG] Redirecting to login page due to missing user");
              navigate('/login', { replace: true });
            } else if (!hasAdminPrivileges) {
              console.log("[DEBUG] Redirecting to dashboard due to missing admin privileges");
              navigate('/dashboard', { replace: true });
            }
          }, REDIRECT_DELAY_MS);
          return;
        }
        
        // User is authenticated and admin
        setAuthStatus('authenticated');
        console.log("[DEBUG] User is authenticated and admin, proceeding to load page");
        
        // Only proceed if component is still mounted
        if (!isMounted) return;
        
        console.log("[DEBUG] User is authenticated and admin, fetching data");
        
        await fetchInstances();
        await fetchEnvironmentDiagnostics();
        await fetchAvailableModels();
      } catch (err) {
        console.error("[DEBUG] Error in initialization:", err);
        setLoading(false);
        if (isMounted) {
          setError(err instanceof Error ? err.message : String(err));
        }
      }
    };
    
    initialize();
    
    // Cleanup function to prevent state updates if unmounted
    return () => {
      isMounted = false;
    };
  }, [directUser, isAdmin, navigate]);
  
  // Update effect to fetch models when filters change
  useEffect(() => {
    // Skip this effect on first render, let the initialization useEffect handle it
    if (authStatus === 'unknown' || loading) {
      return;
    }
    
    console.log("[DEBUG] Filter change detected, authStatus:", authStatus);
    
    // Only fetch models if we're authenticated and not already loading
    if (authStatus === 'authenticated') {
      console.log("[DEBUG] Fetching models due to filter change:", activeFilters);
      
      let isMounted = true;
      const fetchModels = async () => {
        try {
          await fetchAvailableModels(activeFilters);
        } catch (err) {
          console.error("[DEBUG] Error fetching models on filter change:", err);
          // Only update state if still mounted
          if (isMounted) {
            setError(err instanceof Error ? err.message : String(err));
          }
        }
      };
      
      fetchModels();
      
      return () => {
        isMounted = false;
      };
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
  
  // Initialize client with Supabase credentials
  useEffect(() => {
    async function initializeClient() {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const result = await initBedrockClientWithSupabaseCredentials({
          userId: user.id,
          useFallbackOnError: true
        });
        
        setClient(result.client);
        setClientStatus({
          success: result.success,
          usingFallback: result.usingFallback,
          message: result.message,
          credentials: result.credentials
        });
        
        // Pre-fill form if credentials exist
        if (result.credentials?.hasCredentials) {
          // Fetch raw credentials to pre-fill form
          const { data } = await supabase
            .from('bedrock_credentials')
            .select('aws_access_key_id, aws_secret_access_key, aws_region')
            .eq('user_id', user.id)
            .single();
            
          if (data) {
            setCredentials({
              aws_access_key_id: data.aws_access_key_id || '',
              aws_secret_access_key: data.aws_secret_access_key || '',
              aws_region: data.aws_region || 'us-east-1'
            });
          }
        }
        
        // Fetch models
        await fetchModels(result.client);
      } catch (err) {
        console.error('Error initializing Bedrock client:', err);
        setError(err.message || 'Failed to initialize AWS Bedrock client');
      } finally {
        setLoading(false);
      }
    }
    
    initializeClient();
  }, [user?.id]);
  
  // Fetch models
  async function fetchModels(bedrockClient = client) {
    if (!bedrockClient) return;
    
    try {
      setLoadingModels(true);
      const result = await bedrockClient.listFoundationModels();
      setAvailableModels(result.models || []);
    } catch (err) {
      console.error('Error fetching models:', err);
      setError(err.message || 'Failed to fetch foundation models');
    } finally {
      setLoadingModels(false);
    }
  }
  
  // Test connection
  async function testConnection() {
    if (!client) return;
    
    try {
      setLoading(true);
      const result = await client.testConnection();
      
      if (result.success) {
        setClientStatus(prev => ({
          ...prev,
          success: true,
          message: 'Connection successful'
        }));
      } else {
        throw new Error(result.message || 'Connection test failed');
      }
    } catch (err) {
      console.error('Connection test failed:', err);
      setError(err.message || 'Connection test failed');
    } finally {
      setLoading(false);
    }
  }
  
  // Save credentials
  async function saveCredentials(e) {
    e.preventDefault();
    
    if (!user?.id) {
      setError('User ID not available');
      return;
    }
    
    try {
      setIsSaving(true);
      setSaveMessage(null);
      setError(null);
      
      // Save to Supabase
      const { error } = await supabase
        .from('bedrock_credentials')
        .upsert({
          user_id: user.id,
          aws_access_key_id: credentials.aws_access_key_id,
          aws_secret_access_key: credentials.aws_secret_access_key,
          aws_region: credentials.aws_region
        }, { onConflict: 'user_id' });
      
      if (error) throw error;
      
      setSaveMessage('Credentials saved successfully');
      
      // Reinitialize client with new credentials
      const result = await initBedrockClientWithSupabaseCredentials({
        userId: user.id,
        useFallbackOnError: true
      });
      
      setClient(result.client);
      setClientStatus({
        success: result.success,
        usingFallback: result.usingFallback,
        message: result.message,
        credentials: result.credentials
      });
      
      // Refresh models list
      await fetchModels(result.client);
    } catch (err) {
      console.error('Error saving credentials:', err);
      setError(err.message || 'Failed to save credentials');
    } finally {
      setIsSaving(false);
    }
  }
  
  // Handle input change
  function handleInputChange(e) {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  }
  
  if (loading && !client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Initializing AWS Bedrock client...</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <BedrockDashboardContent
        loading={loading}
        refreshing={refreshing}
        authStatus={authStatus}
        error={error}
        connectionStatus={connectionStatus}
        instances={instances}
        testModalOpen={testModalOpen}
        testData={testData}
        setTestModalOpen={setTestModalOpen}
        showDiagnostics={showDiagnostics}
        envDiagnostics={envDiagnostics}
        testingConnection={testingConnection}
        submitting={submitting}
        selectedPlan={selectedPlan}
        selectedModelId={selectedModelId}
        availableModels={availableModels}
        loadingModels={loadingModels}
        showFilters={showFilters}
        activeFilters={activeFilters}
        planConfig={planConfig}
        client={client}
        // Functions
        checkAuthStatus={checkAuthStatus}
        handleLogin={handleLogin}
        refreshInstances={refreshInstances}
        fetchEnvironmentDiagnostics={fetchEnvironmentDiagnostics}
        fetchDetailedTestData={fetchDetailedTestData}
        fetchAvailableModels={fetchAvailableModels}
        handleProvisionInstance={handleProvisionInstance}
        handleDeleteInstance={handleDeleteInstance}
        setShowFilters={setShowFilters}
        setActiveFilters={setActiveFilters}
        setSelectedModelId={setSelectedModelId}
        setSelectedPlan={setSelectedPlan}
        testConnection={testConnection}
      />
    </ErrorBoundary>
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