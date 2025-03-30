import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function SupabaseTest() {
  const [authStatus, setAuthStatus] = useState<string>('Testing...');
  const [dbStatus, setDbStatus] = useState<string>('Testing...');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Test Auth connection
      const { data: authData, error: authError } = await supabase.auth.getSession();
      
      if (authError) {
        setAuthStatus(`Error: ${authError.message}`);
      } else {
        setAuthStatus(`Connected ${authData?.session ? '(Active session)' : '(No active session)'}`);
      }
      
      // Test DB connection
      const { data, error: dbError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (dbError) {
        setDbStatus(`Error: ${dbError.message}`);
      } else {
        setDbStatus(`Connected (Found data: ${JSON.stringify(data)})`);
      }
      
    } catch (err) {
      setError(`Unexpected error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Supabase Connection Test</CardTitle>
          <CardDescription>Tests your connection to Supabase authentication and database</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-800 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Authentication Status:</h3>
              <p>{isLoading ? 'Testing...' : authStatus}</p>
            </div>
            
            <div>
              <h3 className="font-medium">Database Status:</h3>
              <p>{isLoading ? 'Testing...' : dbStatus}</p>
            </div>
            
            <Button onClick={testConnection} disabled={isLoading}>
              {isLoading ? 'Testing...' : 'Test Connection Again'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 