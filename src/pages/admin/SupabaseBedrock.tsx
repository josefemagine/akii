import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, RefreshCw, Trash2, Code, AlertTriangle, Settings, Loader2, LogIn, Database, TestTube, InfoIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from 'react-router-dom';
import { EnvConfig } from "@/lib/env-config";
import { BedrockClient } from "@/lib/supabase-bedrock-client";
import { createBedrockClient } from "@/lib/aws-bedrock-client";
import { BedrockConfig } from "@/lib/bedrock-config";
// Use the singleton client to avoid duplicate GoTrueClient instances
import supabaseSingleton from "@/lib/supabase-singleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AwsPermissionTester from '../../components/aws-permission-tester';
import { useUser } from '@/contexts/UserContext';
import { initBedrockClientWithSupabaseCredentials } from '@/lib/supabase-aws-credentials';
import { CheckCircle2 } from 'lucide-react';
import { useDirectAuth } from '@/contexts/direct-auth-context';
import AWSTestConnectionModal from "@/components/aws/AWSTestConnectionModal";

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
  // Standard field names we use in the app
  modelId?: string;
  modelName?: string;
  providerName?: string;
  inputModalities?: string[];
  outputModalities?: string[];
  inferenceTypesSupported?: string[];
  customizationsSupported?: string[];
  responseStreamingSupported?: boolean;
  
  // Alternative field names from the API
  id?: string;
  name?: string;
  provider?: string;
  inputs?: string[];
  outputs?: string[];
  inferenceTypes?: string[];
  customizations?: string[];
  
  // Allow any other properties
  [key: string]: any;
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
  testConnection,
  openTestModal
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
              onClick={openTestModal}
              disabled={testingConnection}
            >
              <TestTube className="mr-2 h-4 w-4" />
              Test AWS Connection
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

// Add a banner to explain the AWS credentials warning messages
const AwsCredentialsNotice = ({ clientStatus }) => {
  // Only show this notice when using fallback data
  if (!clientStatus?.usingFallback) return null;
  
  return (
    <Alert className="mb-4 bg-blue-50 border-blue-200">
      <InfoIcon className="h-4 w-4 text-blue-600" />
      <AlertTitle className="text-blue-800 font-medium">AWS Credentials Notice</AlertTitle>
      <AlertDescription className="text-blue-700">
        <p>The warnings about "<code className="bg-blue-100 px-1 rounded">No AWS credentials found in environment variables</code>" are expected.</p>
        <p className="mt-1">AWS credentials should be configured through this interface rather than environment variables. Enter your AWS Access Key and Secret below to configure AWS Bedrock.</p>
      </AlertDescription>
    </Alert>
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
  oldTestModalOpen,
  testData, 
  setTestModalOpen,
  awsTestModalOpen,
  setAwsTestModalOpen,
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
  // User data for auth debugging
  user,
  directUser,
  isAdmin,
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
  setAvailableModels,
  setSelectedModelId,
  setSelectedPlan,
  testConnection,
  openTestModal,
  // Form state
  customInstanceName,
  setCustomInstanceName,
  // Toast
  toast
}) => {
  console.log("[DEBUG] Rendering BedrockDashboardContent with props:", {
    loading,
    refreshing,
    authStatus,
    connectionStatus,
    instances: instances?.length,
    availableModels: availableModels?.length,
    selectedModelId,
    customInstanceName
  });
  
  // Create a wrapper function for button clicks
  const handleFetchModels = (e: React.MouseEvent) => {
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
    // Don't show auth error during initial loading
    if (loading) {
      return (
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Bedrock AI Instances</h1>
          <InstanceSkeleton />
        </div>
      );
    }
    
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
            <div className="bg-red-100 text-red-800 p-4 rounded-md mb-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
                <div>
                  <h3 className="font-semibold">Authentication Error</h3>
                  <p className="text-sm">
                    {error || "You must be logged in with admin privileges to view this page."}
                    <br/>
                    <span className="text-xs mt-1">Auth Status: {authStatus}, Admin: {isAdmin ? 'Yes' : 'No'}, 
                    User Email: {user?.email || directUser?.email || localStorage.getItem('akii-auth-user-email') || 'Unknown'}</span>
                  </p>
                </div>
              </div>
            </div>
            <Button onClick={handleLogin}>
              <LogIn className="mr-2 h-4 w-4" /> Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <>
      <div className="container p-6 space-y-6">
        <h1 className="text-2xl font-bold">AWS Bedrock Settings</h1>
        
        <CombinedApiConfigPanel
          connectionStatus={connectionStatus}
          authStatus={authStatus}
          handleLogin={handleLogin}
          checkAuthStatus={checkAuthStatus}
          refreshInstances={refreshInstances}
          testingConnection={testingConnection}
          refreshing={refreshing}
          credentials={{}} // Provide empty object if needed
          clientStatus={{}} // Provide empty object if needed
          testConnection={testConnection}
          openTestModal={openTestModal} // Pass the AWS test modal opener
        />
        
        <MockDataNotice />
        
        {/* Add the AWS credentials notice */}
        {client && client.clientStatus?.usingFallback && <AwsCredentialsNotice clientStatus={client.clientStatus} />}
        
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
                  <div className="flex justify-between items-center">
                    <Label>Available Models</Label>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => fetchAvailableModels(activeFilters)} 
                        disabled={loadingModels || authStatus !== 'authenticated'}
                      >
                        {loadingModels ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refresh Models
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground flex justify-between mb-2">
                    <span>Select the AI model you want to provision.</span>
                    <span>
                      {availableModels.length > 0 ? (
                        <>Showing {availableModels.length} model{availableModels.length !== 1 ? 's' : ''}</>
                      ) : !loadingModels ? (
                        <>No models found</>
                      ) : null}
                    </span>
                  </div>
                  
                  {loadingModels ? (
                    <div className="py-8 text-center">
                      <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-primary" />
                      <p className="text-muted-foreground">Loading available models...</p>
                    </div>
                  ) : (
                    <div className="border rounded-md overflow-hidden">
                      <div className="max-h-[350px] overflow-y-auto">
                        {availableModels.length > 0 ? (
                          availableModels.filter(model => model && model.modelId).map((model) => (
                            <div 
                              key={model.modelId}
                              onClick={() => setSelectedModelId(model.modelId)}
                              className={`p-4 border-b last:border-b-0 cursor-pointer hover:bg-muted/50 transition-colors ${
                                selectedModelId === model.modelId ? 'bg-primary/10 border-l-4 border-l-primary' : ''
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="font-medium text-base">
                                  {model.providerName || model.modelId?.split('.')[0] || 'Unknown'} - {model.modelName || (model.modelId?.split('.')[1] || model.modelId)}
                                </div>
                                <Badge variant={selectedModelId === model.modelId ? "default" : "outline"}>
                                  {selectedModelId === model.modelId ? "Selected" : "Select"}
                                </Badge>
                              </div>
                              
                              <div className="mt-2 flex flex-wrap gap-2">
                                <span className="inline-flex text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded font-mono">
                                  {model.modelId}
                                </span>
                                
                                {model.inferenceTypesSupported?.length > 0 && (
                                  <span className="inline-flex text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-2 py-1 rounded">
                                    {model.inferenceTypesSupported.join(', ')}
                                  </span>
                                )}
                                
                                {model.customizationsSupported?.includes('FINE_TUNING') && (
                                  <span className="inline-flex text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 px-2 py-1 rounded">
                                    Fine-tunable
                                  </span>
                                )}
                              </div>
                              
                              {(model.inputModalities?.length > 0 || model.outputModalities?.length > 0) && (
                                <div className="mt-2 text-xs text-muted-foreground">
                                  {(model.inputModalities?.length > 0 || model.inputs?.length > 0) && (
                                    <span className="mr-3">
                                      <span className="font-medium">Input:</span> {(model.inputModalities || model.inputs || []).join(', ')}
                                    </span>
                                  )}
                                  
                                  {(model.outputModalities?.length > 0 || model.outputs?.length > 0) && (
                                    <span>
                                      <span className="font-medium">Output:</span> {(model.outputModalities || model.outputs || []).join(', ')}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-center p-8 text-muted-foreground">
                            <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg border border-amber-200 dark:border-amber-800 mb-6">
                              <h3 className="text-amber-800 dark:text-amber-200 font-medium text-lg mb-2">No Models Available</h3>
                              <p className="mb-2 text-amber-700 dark:text-amber-300">
                                AWS Bedrock models could not be loaded. Click the button below to try fetching available models.
                              </p>
                              <div className="text-left text-xs bg-amber-100 dark:bg-amber-900 p-3 rounded mt-3 text-amber-800 dark:text-amber-200">
                                Debug info: 
                                <br/>Models array: {availableModels ? `Array(${availableModels.length})` : 'null'} 
                                <br/>Loading status: {loadingModels ? 'Loading' : 'Not loading'}
                                <br/>Selected model ID: {selectedModelId || 'None'}
                                <br/>Auth status: {authStatus}
                              </div>
                            </div>
                            
                            <div className="flex flex-col gap-3 items-center">
                              <Button 
                                onClick={() => fetchAvailableModels(activeFilters)} 
                                disabled={loadingModels || authStatus !== 'authenticated'}
                                size="lg"
                                className="bg-green-600 hover:bg-green-700 text-white font-medium"
                              >
                                <RefreshCw className="mr-2 h-5 w-5" />
                                Load AWS Bedrock Models
                              </Button>
                              
                              <Button 
                                onClick={() => {
                                  console.log("[FORCE RENDER] Current available models:", availableModels);
                                  // Force re-render by creating a new array reference
                                  if (availableModels && availableModels.length > 0) {
                                    setAvailableModels([...availableModels]);
                                    toast({
                                      title: "Models Refreshed",
                                      description: `Manually refreshed ${availableModels.length} models in the UI`
                                    });
                                  } else {
                                    toast({
                                      title: "No Models to Refresh",
                                      description: "There are no models in memory to display",
                                      variant: "destructive"
                                    });
                                  }
                                }}
                                variant="outline"
                                size="sm"
                                className="mt-2"
                              >
                                Force UI Refresh
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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
                      
                      <div>
                        <span className="text-sm font-medium">Instance Name:</span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Input
                          placeholder="Custom instance name (optional)"
                          className="h-8 text-sm"
                          value={customInstanceName}
                          onChange={(e) => setCustomInstanceName(e.target.value)}
                        />
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
        
        <TestModal 
          isOpen={testModalOpen} 
          setIsOpen={setTestModalOpen}
          testData={testData} 
        />
        
        <AWSTestConnectionModal 
          isOpen={awsTestModalOpen}
          onClose={() => setAwsTestModalOpen(false)}
        />
      </div>
    </>
  );
};

// At the end of the file, add a simple wrapper component for backward compatibility
const SupabaseBedrock = () => {
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
  const [selectedPlan, setSelectedPlan] = useState<string>('starter');
  const [submitting, setSubmitting] = useState(false);
  
  // Models state
  const [availableModels, setAvailableModels] = useState<FoundationModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [customInstanceName, setCustomInstanceName] = useState<string>('');
  
  // Filter state
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);
  
  // Environment diagnostics
  const [envDiagnostics, setEnvDiagnostics] = useState<EnvironmentDiagnostics>({});
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  
  // Test modal state
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [awsTestModalOpen, setAwsTestModalOpen] = useState(false);
  const [testData, setTestData] = useState<any>(null);
  const [testingConnection, setTestingConnection] = useState(false);
  
  // Placeholder functions to satisfy props
  const checkAuthStatus = async () => { return true; };
  const handleLogin = () => {};
  const refreshInstances = async () => {};
  const fetchEnvironmentDiagnostics = async () => {};
  const fetchDetailedTestData = async () => {};
  const fetchAvailableModels = async () => {};
  const handleProvisionInstance = async () => {};
  const handleDeleteInstance = async () => {};
  const testConnection = async () => {};
  const openTestModal = () => {};
  
  return (
    <BedrockDashboardContent
      loading={loading}
      refreshing={refreshing}
      authStatus={authStatus}
      error={error}
      connectionStatus={connectionStatus}
      instances={instances}
      testModalOpen={testModalOpen}
      oldTestModalOpen={testModalOpen}
      testData={testData}
      setTestModalOpen={setTestModalOpen}
      awsTestModalOpen={awsTestModalOpen}
      setAwsTestModalOpen={setAwsTestModalOpen}
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
      client={BedrockClient}
      // User data for auth debugging
      user={user}
      directUser={directUser}
      isAdmin={isAdmin}
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
      setAvailableModels={setAvailableModels}
      setSelectedModelId={setSelectedModelId}
      setSelectedPlan={setSelectedPlan}
      testConnection={testConnection}
      openTestModal={openTestModal}
      // Form state
      customInstanceName={customInstanceName}
      setCustomInstanceName={setCustomInstanceName}
      // Toast
      toast={toast}
    />
  );
};

// Export the wrapper component
export default SupabaseBedrock;