import React, { useState } from 'react';
import { BedrockClient } from '../lib/supabase-bedrock-client';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { CheckCircle, AlertCircle, RotateCw, XCircle } from 'lucide-react';

const AwsPermissionTester = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const runPermissionTests = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { success, test_results, error } = await BedrockClient.testAwsPermissions();
      
      if (!success) {
        setError(error || 'Unknown error testing AWS permissions');
        return;
      }
      
      setResults(test_results);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsLoading(false);
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
        <div className="mb-4">
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
      </CardContent>
    </Card>
  );
};

export default AwsPermissionTester; 