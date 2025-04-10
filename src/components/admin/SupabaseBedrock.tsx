import React, { useState, useEffect } from 'react';
import { BedrockClient } from '../../lib/supabase-bedrock-client.tsx';
import { BedrockConfig } from '../../lib/bedrock-config.tsx';
import { Button } from '../ui/button.tsx';
import { Input } from '../ui/input.tsx';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card.tsx';
import { Label } from '../ui/label.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select.tsx';
import { useToast } from '../../hooks/use-toast';
import { useAuth } from '../../contexts/auth-context';
interface SupabaseBedrockProps {}


const modelOptions = [
  { id: 'anthropic.claude-v2', name: 'Claude V2', provider: 'Anthropic' },
  { id: 'anthropic.claude-v2:1', name: 'Claude V2.1', provider: 'Anthropic' },
  { id: 'anthropic.claude-instant-v1', name: 'Claude Instant V1', provider: 'Anthropic' },
  { id: 'amazon.titan-text-express-v1', name: 'Titan Text Express V1', provider: 'Amazon' },
  { id: 'amazon.titan-text-lite-v1', name: 'Titan Text Lite V1', provider: 'Amazon' },
  { id: 'cohere.command-text-v14', name: 'Command Text V14', provider: 'Cohere' },
  { id: 'meta.llama2-13b-chat-v1', name: 'Llama 2 13B Chat', provider: 'Meta' }
];

const commitmentOptions = [
  { id: 'MONTH_1', name: '1 Month' },
  { id: 'MONTH_6', name: '6 Months' }
];

export default function SupabaseBedrock() {
  const [instances, setInstances] = useState<any>([]);
  const [loading, setLoading] = useState<any>(true);
  const [error, setError] = useState<any>(null);
  const [apiKey, setApiKey] = useState<any>('');
  const [environment, setEnvironment] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<any>('instances');
  const [authStatus, setAuthStatus] = useState<any>(null);
  
  // Form state for new instance
  const [modelId, setModelId] = useState<any>(BedrockConfig.defaultModel);
  const [commitmentDuration, setCommitmentDuration] = useState<any>(BedrockConfig.defaultCommitmentDuration);
  const [modelUnits, setModelUnits] = useState<any>(BedrockConfig.defaultModelUnits);
  
  const { toast } = useToast();
  const { user } = useAuth();

  // Load saved API key on initial render
  useEffect(() => {
    const savedKey = localStorage.getItem('bedrock-api-key');
    if (savedKey) {
      setApiKey(savedKey);
    }
    
    // Check auth status
    checkAuthStatus();
    
    // Load instances
    loadInstances();
  }, []);
  
  // Load instances when API key changes
  useEffect(() => {
    if (apiKey) {
      loadInstances();
    }
  }, [apiKey]);
  
  // Check authentication status
  const checkAuthStatus = async (): Promise<void> => {
    try {
      // Check if we have a Supabase JWT token
      const token = await BedrockClient.getAuthToken();
      
      if (token) {
        setAuthStatus({
          isAuthenticated: true,
          method: 'jwt',
          message: 'Authenticated with JWT token'
        });
      } else if (apiKey) {
        setAuthStatus({
          isAuthenticated: true,
          method: 'apiKey',
          message: 'Using API key authentication'
        });
      } else {
        setAuthStatus({
          isAuthenticated: false,
          method: null,
          message: 'No authentication method available'
        });
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setAuthStatus({
        isAuthenticated: false,
        method: null,
        message: `Authentication error: ${error.message}`
      });
    }
  };
  
  // Load instances from the API
  const loadInstances = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const { instances, error } = await BedrockClient.listInstances();
      
      if (error) {
        throw new Error(error);
      }
      
      setInstances(instances);
    } catch (err) {
      console.error('Error loading instances:', err);
      setError(`Failed to load instances: ${err.message}`);
      
      toast({
        title: 'Error',
        description: `Failed to load instances: ${err.message}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle API key save
  const saveApiKey = (): void => {
    if (apiKey) {
      localStorage.setItem('bedrock-api-key', apiKey);
      toast({
        title: 'API Key Saved',
        description: 'Your API key has been saved to localStorage.'
      });
      
      // Refresh auth status and instances
      checkAuthStatus();
      loadInstances();
    }
  };
  
  // Handle instance creation
  const createInstance = async (): Promise<void> => {
    if (!modelId || !commitmentDuration) {
      toast({
        title: 'Validation Error',
        description: 'Please select a model and commitment duration.',
        variant: 'destructive'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const { instance, error } = await BedrockClient.createInstance({
        modelId,
        commitmentDuration,
        modelUnits: parseInt(modelUnits, 10)
      });
      
      if (error) {
        throw new Error(error);
      }
      
      toast({
        title: 'Instance Created',
        description: `Successfully created instance for ${modelId}`
      });
      
      // Refresh instances
      await loadInstances();
      
      // Reset form
      setModelId(BedrockConfig.defaultModel);
      setCommitmentDuration(BedrockConfig.defaultCommitmentDuration);
      setModelUnits(BedrockConfig.defaultModelUnits);
      
      // Switch to instances tab
      setActiveTab('instances');
    } catch (err) {
      console.error('Error creating instance:', err);
      toast({
        title: 'Error',
        description: `Failed to create instance: ${err.message}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle instance deletion
  const deleteInstance = async (instanceId): Promise<void> => {
    if (!confirm('Are you sure you want to delete this instance?')) {
      return;
    }
    
    setLoading(true);
    
    try {
      const { success, error } = await BedrockClient.deleteInstance(instanceId);
      
      if (error) {
        throw new Error(error);
      }
      
      if (success) {
        toast({
          title: 'Instance Deleted',
          description: 'Successfully deleted the instance.'
        });
        
        // Refresh instances
        await loadInstances();
      } else {
        throw new Error('Failed to delete instance: Unknown error');
      }
    } catch (err) {
      console.error('Error deleting instance:', err);
      toast({
        title: 'Error',
        description: `Failed to delete instance: ${err.message}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Test environment
  const testEnvironment = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const { environment: envData, error } = await BedrockClient.testEnvironment();
      
      if (error) {
        throw new Error(error);
      }
      
      setEnvironment(envData);
      toast({
        title: 'Environment Test',
        description: 'Successfully retrieved environment information.'
      });
    } catch (err) {
      console.error('Error testing environment:', err);
      setError(`Failed to test environment: ${err.message}`);
      
      toast({
        title: 'Error',
        description: `Failed to test environment: ${err.message}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Get status badge class based on instance status
  const getStatusClass = (status): void => {
    if (!status) return 'bg-gray-300';
    
    switch (status.toLowerCase()) {
      case 'inservice':
        return 'bg-green-500';
      case 'creating':
        return 'bg-blue-500';
      case 'updating':
        return 'bg-blue-300';
      case 'deleting':
        return 'bg-orange-500';
      case 'deleted':
        return 'bg-red-500';
      case 'failed':
        return 'bg-red-600';
      default:
        return 'bg-gray-300';
    }
  };
  
  // Format timestamp for display
  const formatTimestamp = (timestamp): void => {
    if (!timestamp) return 'N/A';
    
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch (e) {
      return timestamp;
    }
  };
  
  // Get model name from ID
  const getModelName = (modelId): void => {
    const model = modelOptions.find(m => m.id === modelId);
    return model ? model.name : modelId;
  };
  
  // Get commitment duration name
  const getCommitmentName = (commitmentId): void => {
    const commitment = commitmentOptions.find(c => c.id === commitmentId);
    return commitment ? commitment.name : commitmentId;
  };

  return (
    <div className="container mx-auto p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="instances">Manage Instances</TabsTrigger>
          <TabsTrigger value="create">Create Instance</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="instances">
          <Card>
            <CardHeader>
              <CardTitle>Bedrock Model Instances</CardTitle>
              <CardDescription>
                Manage your provisioned AWS Bedrock model throughput instances
              </CardDescription>
            </CardHeader>
            <CardContent>
              {authStatus && !authStatus.isAuthenticated && (
                <div className="mb-4 p-4 bg-amber-100 text-amber-800 rounded-md">
                  <p className="font-semibold">Authentication Required</p>
                  <p>Please set an API key in the Settings tab or log in to access instances.</p>
                </div>
              )}
              
              {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-md">
                  <p className="font-semibold">Error</p>
                  <p>{error}</p>
                </div>
              )}
              
              {loading ? (
                <div className="text-center py-8">Loading instances...</div>
              ) : instances.length === 0 ? (
                <div className="text-center py-8">
                  <p>No instances found.</p>
                  <Button
                    onClick={() => setActiveTab('create')}
                    className="mt-4"
                  >
                    Create your first instance
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-2 text-left">Model</th>
                        <th className="p-2 text-left">Status</th>
                        <th className="p-2 text-left">Created</th>
                        <th className="p-2 text-left">Units</th>
                        <th className="p-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {instances.map((instance) => (
                        <tr key={instance.instance_id || instance.id} className="border-t">
                          <td className="p-2">{getModelName(instance.model_id)}</td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded-full text-white text-xs ${getStatusClass(instance.status)}`}>
                              {instance.status || 'Unknown'}
                            </span>
                          </td>
                          <td className="p-2">{formatTimestamp(instance.created_at)}</td>
                          <td className="p-2">{instance.model_units || '1'}</td>
                          <td className="p-2">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteInstance(instance.instance_id || instance.id)}
                              disabled={loading || instance.status === 'DELETED' || instance.status === 'DELETING'}
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button onClick={loadInstances} disabled={loading}>
                Refresh
              </Button>
              <Button onClick={() => setActiveTab('create')}>
                Create Instance
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create Bedrock Instance</CardTitle>
              <CardDescription>
                Provision a new AWS Bedrock model throughput instance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {authStatus && !authStatus.isAuthenticated && (
                <div className="mb-4 p-4 bg-amber-100 text-amber-800 rounded-md">
                  <p className="font-semibold">Authentication Required</p>
                  <p>Please set an API key in the Settings tab or log in to create instances.</p>
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="model">Model</Label>
                  <Select value={modelId} onValueChange={setModelId}>
                    <SelectTrigger id="model">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      {modelOptions.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name} ({model.provider})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="commitment">Commitment Duration</Label>
                  <Select value={commitmentDuration} onValueChange={setCommitmentDuration}>
                    <SelectTrigger id="commitment">
                      <SelectValue placeholder="Select commitment duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {commitmentOptions.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="units">Model Units</Label>
                  <Input
                    id="units"
                    type="number"
                    min="1"
                    max="10"
                    value={modelUnits}
                    onChange={(e) => setModelUnits(e.target.value)}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Number of model units to provision (1-10)
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab('instances')}>
                Cancel
              </Button>
              <Button onClick={createInstance} disabled={loading || !authStatus?.isAuthenticated}>
                Create Instance
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>API Settings</CardTitle>
              <CardDescription>
                Configure authentication for Bedrock API access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {user ? (
                  <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-md">
                    <p className="font-semibold">You are logged in</p>
                    <p>Using JWT token for authentication as: {user.email || user.id}</p>
                  </div>
                ) : (
                  <div className="mb-4 p-4 bg-amber-100 text-amber-800 rounded-md">
                    <p className="font-semibold">Not logged in</p>
                    <p>For enhanced security, consider logging in rather than using an API key.</p>
                  </div>
                )}
                
                <div>
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="Enter your Bedrock API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    This key will be saved in your browser's localStorage
                  </p>
                </div>
                
                <div>
                  <Button onClick={saveApiKey} disabled={!apiKey}>
                    Save API Key
                  </Button>
                </div>
                
                {authStatus && (
                  <div className={`mt-4 p-4 rounded-md ${
                    authStatus.isAuthenticated 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    <p className="font-semibold">Authentication Status</p>
                    <p>{authStatus.message}</p>
                    {authStatus.method && (
                      <p>Method: {authStatus.method}</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="diagnostics">
          <Card>
            <CardHeader>
              <CardTitle>Diagnostics</CardTitle>
              <CardDescription>
                Test your Bedrock API connection and view environment details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={testEnvironment} disabled={loading}>
                  Test Environment
                </Button>
                
                {error && (
                  <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-md">
                    <p className="font-semibold">Error</p>
                    <p>{error}</p>
                  </div>
                )}
                
                {environment && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Environment Information</h3>
                    <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                      {JSON.stringify(environment, null, 2)}
                    </pre>
                  </div>
                )}
                
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">Configuration</h3>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                    {JSON.stringify({
                      apiUrl: BedrockConfig.apiUrl,
                      useEdgeFunctions: BedrockConfig.useEdgeFunctions,
                      isLocalDevelopment: BedrockConfig.isLocalDevelopment,
                      debug: BedrockConfig.debug
                    }, null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 