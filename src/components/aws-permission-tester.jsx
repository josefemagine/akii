import React, { useState } from 'react';
import { BedrockClient } from '../lib/supabase-bedrock-client';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { CheckCircle, AlertCircle, RotateCw, XCircle, Wrench } from 'lucide-react';

const AwsPermissionTester = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);

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
      addLog("Calling BedrockClient.testAwsPermissions()");
      const response = await BedrockClient.testAwsPermissions();
      addLog(`Received response: ${JSON.stringify(response, null, 2)}`);
      
      const { success, test_results, error } = response;
      
      if (!success) {
        addLog(`Error in response: ${error}`);
        setError(error || 'Unknown error testing AWS permissions');
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
      
      // Make direct fetch
      const url = `${window.location.origin}/functions/super-action`;
      addLog(`Making direct fetch to: ${url}`);
      
      const response = await fetch(url, {
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
      
      if (!response.ok) {
        const errorText = await response.text();
        addLog(`Fetch error (${response.status}): ${errorText}`);
        setError(`API error: ${response.status} ${errorText}`);
        setIsLoading(false);
        return;
      }
      
      const responseData = await response.json();
      addLog(`Response received: ${JSON.stringify(responseData, null, 2)}`);
      
      if (responseData?.error) {
        addLog(`API error: ${responseData.error}`);
        setError(responseData.error);
        setIsLoading(false);
        return;
      }
      
      setResults(responseData.test_results);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      addLog(`Exception caught: ${errorMessage}`);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      addLog("Manual test operation completed");
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>AWS Permissions Diagnostic</CardTitle>
        <CardDescription>
          Test AWS IAM permissions to identify what operations are allowed with your credentials
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-2">
          <Button 
            onClick={runPermissionTests} 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : 'Test AWS Permissions'}
          </Button>
          
          <Button 
            onClick={runManualTest} 
            disabled={isLoading}
            variant="outline"
          >
            <Wrench className="mr-2 h-4 w-4" />
            Manual Test
          </Button>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {results && (
          <div className="space-y-4">
            <h3 className="font-medium">Test Results</h3>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="mr-2">
                  {results.summary.readPermission ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </span>
                <span>List Foundation Models: {results.summary.readPermission ? 'Allowed' : 'Denied'}</span>
              </div>
              
              <div className="flex items-center">
                <span className="mr-2">
                  {results.summary.listProvisionedPermission ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </span>
                <span>List Provisioned Models: {results.summary.listProvisionedPermission ? 'Allowed' : 'Denied'}</span>
              </div>
              
              <div className="flex items-center">
                <span className="mr-2">
                  {results.summary.createPermission ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </span>
                <span>Create Provisioned Models: {results.summary.createPermission ? 'Allowed' : 'Denied'}</span>
              </div>
            </div>
            
            {!results.summary.createPermission && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Missing Permissions</AlertTitle>
                <AlertDescription>
                  The AWS IAM user lacks necessary permissions to create provisioned models. 
                  Ensure your IAM policy includes <code>bedrock:CreateProvisionedModelThroughput</code> permission.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="mt-4 text-xs text-gray-500">
              <p>AWS Region: {results.region}</p>
              <p>Has Access Key: {results.hasAccessKey ? 'Yes' : 'No'}</p>
              <p>Has Secret Key: {results.hasSecretKey ? 'Yes' : 'No'}</p>
            </div>
          </div>
        )}
        
        {logs.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Debug Logs</h3>
            <pre className="bg-gray-100 p-2 rounded text-xs max-h-40 overflow-auto">
              {logs.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AwsPermissionTester; 