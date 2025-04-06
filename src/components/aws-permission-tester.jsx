import React, { useState } from 'react';
import { BedrockClient } from '../lib/supabase-bedrock-client';
import { BedrockConfig } from '../lib/bedrock-config';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { CheckCircle, AlertCircle, RotateCw, XCircle, Wrench } from 'lucide-react';

const AwsPermissionTester = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);

  // Log environment variables on component mount
  React.useEffect(() => {
    const envVars = {
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'not set',
      VITE_SUPABASE_KEY: import.meta.env.VITE_SUPABASE_KEY ? 'set' : 'not set',
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'set' : 'not set',
      VITE_BEDROCK_API_URL: import.meta.env.VITE_BEDROCK_API_URL || 'not set',
      MODE: import.meta.env.MODE,
      DEV: import.meta.env.DEV
    };
    
    console.log('[AWS Test] Environment variables:', envVars);
  }, []);

  const addLog = (message) => {
    console.log(`[AWS Test] ${message}`);
    setLogs(prev => [...prev, `${new Date().toISOString().split('T')[1].split('.')[0]} - ${message}`]);
  };

  const runPermissionTests = async () => {
    setIsLoading(true);
    setError(null);
    setLogs([]);
    
    addLog("Starting AWS permission test...");
    
    try {
      addLog("Calling BedrockClient.testAwsPermissions() with real AWS API calls");
      const response = await BedrockClient.testAwsPermissions();
      addLog(`Received response: ${JSON.stringify(response, null, 2)}`);
      
      const { success, test_results, error } = response;
      
      if (!success) {
        addLog(`Error in response: ${error}`);
        setError(error || 'Unknown error testing AWS permissions');
        return;
      }
      
      if (!test_results) {
        addLog("Warning: Received empty test results");
        setError("No test results received from the API. Check that AWS credentials are properly configured.");
        return;
      }
      
      addLog("Test completed successfully");
      setResults(test_results);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      addLog(`Exception caught: ${errorMessage}`);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      addLog("Test operation completed");
    }
  };

  const runManualTest = async () => {
    setIsLoading(true);
    setError(null);
    setLogs([]);
    
    addLog("Starting manual AWS permission test...");
    
    try {
      // Log current environment info
      addLog(`Mode: ${import.meta.env.MODE}`);
      addLog(`Supabase URL: ${import.meta.env.VITE_SUPABASE_URL}`);
      
      // Get auth token
      addLog("Getting auth token...");
      const token = await BedrockClient.getAuthToken();
      
      if (!token) {
        addLog("No auth token available");
        setError("Authentication required. No valid token available.");
        setIsLoading(false);
        return;
      }
      
      addLog(`Token obtained: ${token.substring(0, 5)}...${token.substring(token.length - 5)}`);
      
      // Get the Edge Function URL from config
      const url = BedrockConfig.edgeFunctionUrl;
      addLog(`Edge Function URL from config: ${url}`);
      
      // Check if URL is properly formed
      try {
        new URL(url);
        addLog("URL is valid");
      } catch (e) {
        addLog(`URL validation error: ${e.message}`);
        // If URL is relative, convert to absolute
        if (url.startsWith('/')) {
          const absoluteUrl = `${window.location.origin}${url}`;
          addLog(`Converting to absolute URL: ${absoluteUrl}`);
          const response = await makeRequest(absoluteUrl, token);
          processResponse(response);
          return;
        }
      }
      
      // Make the request with the configured URL
      const response = await makeRequest(url, token);
      processResponse(response);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      addLog(`Exception caught: ${errorMessage}`);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      addLog("Manual test operation completed");
    }
  };
  
  // Helper function to make the request
  const makeRequest = async (url, token) => {
    addLog(`Making direct fetch to: ${url}`);
    
    // If this is a direct call to Supabase Functions endpoint, add query parameter
    const urlObj = new URL(url);
    const isSupabaseEndpoint = urlObj.hostname.includes('supabase.co') && 
                              urlObj.pathname.includes('/functions/');
    
    if (isSupabaseEndpoint) {
      // For Supabase Functions, add action as query parameter
      addLog('Detected Supabase Functions endpoint, using query parameter for action');
      urlObj.searchParams.append('action', 'aws-permission-test');
      
      // Check if anon key is available
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
      if (anonKey) {
        addLog('Found anon key, will include in request headers');
      } else {
        addLog('Warning: No anon key available in environment variables');
      }
      
      return fetch(urlObj.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'apikey': anonKey
        },
        body: JSON.stringify({
          data: {}
        })
      });
    } else {
      // For custom API endpoints (like your own proxy), use body format
      addLog('Using standard API format with action in body');
      return fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'aws-permission-test',
          data: {}
        })
      });
    }
  };
  
  // Helper function to process the response
  const processResponse = async (response) => {
    addLog(`Response status: ${response.status} ${response.statusText}`);
    
    const contentType = response.headers.get('content-type');
    addLog(`Content-Type: ${contentType || 'none'}`);
    
    if (!response.ok) {
      let errorText;
      try {
        if (contentType && contentType.includes('application/json')) {
          const errorJson = await response.json();
          errorText = JSON.stringify(errorJson);
        } else {
          errorText = await response.text();
        }
      } catch (e) {
        errorText = `Could not parse response: ${e.message}`;
      }
      
      addLog(`Fetch error (${response.status}): ${errorText}`);
      setError(`API error: ${response.status} ${response.statusText}`);
      return;
    }
    
    try {
      const responseData = await response.json();
      addLog(`Response received: ${JSON.stringify(responseData, null, 2)}`);
      
      if (responseData?.error) {
        addLog(`API error: ${responseData.error}`);
        setError(responseData.error);
        return;
      }
      
      // Check for empty or mock response
      if (!responseData.test_results && !responseData.success) {
        addLog("Warning: Received response without test results");
        setError("No valid test results received from API. Check AWS configuration.");
        return;
      }
      
      setResults(responseData.test_results || responseData);
    } catch (e) {
      addLog(`Error parsing JSON response: ${e.message}`);
      setError(`Failed to parse response: ${e.message}`);
    }
  };

  // Return the component's JSX
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>AWS Permissions Test</CardTitle>
        <CardDescription>Test your AWS credentials and permissions for Bedrock</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {results && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Test Results</h3>
              <pre className="bg-muted p-4 rounded-md overflow-auto text-sm max-h-60">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          )}
          
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button onClick={runPermissionTests} disabled={isLoading}>
                {isLoading ? (
                  <><RotateCw className="mr-2 h-4 w-4 animate-spin" /> Testing...</>
                ) : (
                  <><CheckCircle className="mr-2 h-4 w-4" /> Test AWS Permissions</>
                )}
              </Button>
              
              <Button variant="outline" onClick={runManualTest} disabled={isLoading}>
                {isLoading ? (
                  <><RotateCw className="mr-2 h-4 w-4 animate-spin" /> Testing...</>
                ) : (
                  <><Wrench className="mr-2 h-4 w-4" /> Manual Test</>
                )}
              </Button>
            </div>
            
            {logs.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Logs</h3>
                <div className="bg-muted p-2 rounded-md overflow-auto text-xs max-h-40">
                  {logs.map((log, index) => (
                    <div key={index} className="whitespace-pre-wrap mb-1">{log}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AwsPermissionTester;