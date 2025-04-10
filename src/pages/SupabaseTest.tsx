import React, { useEffect, useState } from 'react';
import { supabase } from "@/lib/supabase.tsx";
import { Button } from '@/components/ui/button.tsx';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card.tsx';

// Implement verifySupabaseConnection directly in this file to avoid dependency issues
async function verifySupabaseConnection() {
  try {
    const start = Date.now();
    const { data, error } = await supabase.auth.getSession();
    const latency = Date.now() - start;
    
    return {
      success: !error,
      latency,
      sessionExists: !!data?.session,
      error: error ? error.message : null
    };
  } catch (error) {
    return {
      success: false,
      latency: 0,
      sessionExists: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

export default function SupabaseTest() {
  const [status, setStatus] = useState<{
    success: boolean;
    message: string;
    details: {
      connection: boolean;
      profile: boolean;
      service: boolean;
    };
  } | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await verifySupabaseConnection();
      
      // Transform the result to match the expected status type
      setStatus({
        success: result.success,
        message: result.error ? `Error: ${result.error}` : `Connection successful! Latency: ${result.latency}ms`,
        details: {
          connection: result.success,
          profile: result.sessionExists,
          service: !result.error
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };
  
  // Run the test on initial load
  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="container mx-auto py-10">
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Supabase Connection Test</CardTitle>
          <CardDescription>
            Verify your Supabase connection and auth configuration
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-6">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
              <span className="ml-3">Testing connection...</span>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          ) : status ? (
            <div>
              <div className={`mb-4 p-3 rounded ${status.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <p className="font-semibold">{status.message}</p>
              </div>
              
              <div className="space-y-3 mt-4">
                <div className="flex items-center">
                  <span className={`inline-block w-4 h-4 rounded-full mr-2 ${status.details.connection ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span>Supabase connection: {status.details.connection ? 'OK' : 'Failed'}</span>
                </div>
                
                <div className="flex items-center">
                  <span className={`inline-block w-4 h-4 rounded-full mr-2 ${status.details.profile ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span>Profiles table: {status.details.profile ? 'OK' : 'Failed'}</span>
                </div>
                
                <div className="flex items-center">
                  <span className={`inline-block w-4 h-4 rounded-full mr-2 ${status.details.service ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span>Service role access: {status.details.service ? 'OK' : 'Failed'}</span>
                </div>
              </div>
              
              <div className="mt-6 text-sm">
                <h3 className="font-semibold mb-2">Next steps:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {!status.details.connection && (
                    <li>Check your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env</li>
                  )}
                  {!status.details.profile && (
                    <li>Run the migrations to create the profiles table: <code className="bg-gray-100 px-1 py-0.5 rounded">npm run run-migrations</code></li>
                  )}
                  {!status.details.service && (
                    <li>Verify your VITE_SUPABASE_SERVICE_KEY in .env</li>
                  )}
                  {status.success && (
                    <li>Setup an admin user: <code className="bg-gray-100 px-1 py-0.5 rounded">npm run setup-admin</code></li>
                  )}
                </ul>
              </div>
            </div>
          ) : null}
        </CardContent>
        
        <CardFooter>
          <Button 
            onClick={testConnection} 
            disabled={loading} 
            className="w-full"
          >
            {loading ? 'Testing...' : 'Test Connection Again'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 