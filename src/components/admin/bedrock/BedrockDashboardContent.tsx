import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { AlertCircle, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { BedrockDashboardContentProps } from "@/types/bedrock.ts";
import { StatusBadge } from "./StatusBadges.tsx";
import { AwsCredentialsNotice, MockDataNotice, ServerErrorNotice } from "./NoticeComponents.tsx";
import ApiConfigPanel from "./ApiConfigPanel.tsx";
import TestModal from "./TestModal.tsx";
import ModelFilters from "./ModelFilters.tsx";
import InstanceSkeleton from "./InstanceSkeleton.tsx";

const BedrockDashboardContent: React.FC<BedrockDashboardContentProps> = ({ 
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
              <RefreshCw className="mr-2 h-4 w-4" /> Log In
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
        
        <ApiConfigPanel
          connectionStatus={connectionStatus}
          authStatus={authStatus}
          handleLogin={handleLogin}
          checkAuthStatus={checkAuthStatus}
          refreshInstances={refreshInstances}
          testingConnection={testingConnection}
          refreshing={refreshing}
          testConnection={testConnection}
          openTestModal={openTestModal}
          credentials={{}}
          clientStatus={{}}
        />
        
        <MockDataNotice />
        
        {/* Add the AWS credentials notice with optional chaining */}
        {client?.clientStatus?.usingFallback && <AwsCredentialsNotice clientStatus={client.clientStatus} />}
        
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
                          <tr key={instance.instance_id} className="border-b hover:bg-muted/50">
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
                              key={model.modelId || ''}
                              onClick={() => setSelectedModelId(model.modelId || '')}
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
                                  {model.modelId || ''}
                                </span>
                                
                                {(model.inferenceTypesSupported && model.inferenceTypesSupported.length > 0) && (
                                  <span className="inline-flex text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-2 py-1 rounded">
                                    {model.inferenceTypesSupported?.join(', ')}
                                  </span>
                                )}
                                
                                {model.customizationsSupported?.includes('FINE_TUNING') && (
                                  <span className="inline-flex text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 px-2 py-1 rounded">
                                    Fine-tunable
                                  </span>
                                )}
                              </div>
                              
                              {((model.inputModalities?.length || 0) > 0 || (model.outputModalities?.length || 0) > 0) && (
                                <div className="mt-2 text-xs text-muted-foreground">
                                  {((model.inputModalities?.length || 0) > 0 || (model.inputs?.length || 0) > 0) && (
                                    <span className="mr-3">
                                      <span className="font-medium">Input:</span> {(model.inputModalities || model.inputs || []).join(', ')}
                                    </span>
                                  )}
                                  
                                  {((model.outputModalities?.length || 0) > 0 || (model.outputs?.length || 0) > 0) && (
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
      </div>
    </>
  );
};

export default BedrockDashboardContent; 