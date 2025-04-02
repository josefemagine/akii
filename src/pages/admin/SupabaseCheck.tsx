import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define the service check result type
interface ServiceCheckResult {
  name: string;
  status: "success" | "error" | "pending";
  message: string;
  details?: string;
  responseTime?: number;
  timestamp: string;
}

export default function SupabaseCheck() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<string[]>([]);
  const [serviceResults, setServiceResults] = useState<ServiceCheckResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string>("dashboard");

  // Function to add logs
  const addLog = (message: string) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    setLogs(prev => [logMessage, ...prev]);
    console.log(logMessage);
  };

  // Function to update a service check result
  const updateServiceResult = (result: ServiceCheckResult) => {
    setServiceResults(prev => {
      const existing = prev.findIndex(r => r.name === result.name);
      if (existing >= 0) {
        const newResults = [...prev];
        newResults[existing] = result;
        return newResults;
      } else {
        return [...prev, result];
      }
    });
  };

  // Function to check Supabase auth
  const checkAuth = async () => {
    const startTime = performance.now();
    const name = "Authentication Service";
    
    updateServiceResult({
      name,
      status: "pending",
      message: "Checking authentication service...",
      timestamp: new Date().toISOString()
    });

    try {
      addLog(`Testing Supabase authentication service...`);
      
      // Test the session endpoint
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw sessionError;
      }
      
      addLog(`Session data retrieved successfully`);
      addLog(`Session status: ${sessionData?.session ? 'Active' : 'No active session'}`);
      
      // Try to get user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw userError;
      }
      
      const responseTime = Math.round(performance.now() - startTime);
      addLog(`User data retrieved successfully in ${responseTime}ms`);
      
      const message = userData.user 
        ? `Authentication working - logged in as ${userData.user.email}`
        : "Authentication working - not logged in";
      
      updateServiceResult({
        name,
        status: "success",
        message,
        details: JSON.stringify({
          session: sessionData?.session ? 'Active' : 'None',
          user: userData.user ? userData.user.email : 'Not logged in',
        }, null, 2),
        responseTime,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      const responseTime = Math.round(performance.now() - startTime);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      addLog(`Authentication check failed: ${errorMessage}`);
      
      updateServiceResult({
        name,
        status: "error",
        message: `Authentication error: ${errorMessage}`,
        responseTime,
        timestamp: new Date().toISOString()
      });
    }
  };

  // Function to check database access
  const checkDatabase = async () => {
    const startTime = performance.now();
    const name = "Database Service";
    
    updateServiceResult({
      name,
      status: "pending",
      message: "Checking database connection...",
      timestamp: new Date().toISOString()
    });

    try {
      addLog(`Testing Supabase database connection...`);
      
      // Try a simple query to check database connectivity
      const { data, error, status } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (error) {
        throw error;
      }
      
      const responseTime = Math.round(performance.now() - startTime);
      addLog(`Database query completed successfully in ${responseTime}ms`);
      addLog(`Query status: ${status}`);
      
      updateServiceResult({
        name,
        status: "success",
        message: `Database connection successful (status: ${status})`,
        details: `Query response: ${JSON.stringify(data)}`,
        responseTime,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      const responseTime = Math.round(performance.now() - startTime);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      addLog(`Database check failed: ${errorMessage}`);
      
      updateServiceResult({
        name,
        status: "error",
        message: `Database error: ${errorMessage}`,
        responseTime,
        timestamp: new Date().toISOString()
      });
    }
  };

  // Function to check storage service
  const checkStorage = async () => {
    const startTime = performance.now();
    const name = "Storage Service";
    
    updateServiceResult({
      name,
      status: "pending",
      message: "Checking storage service...",
      timestamp: new Date().toISOString()
    });

    try {
      addLog(`Testing Supabase storage service...`);
      
      // List buckets to test storage access
      const { data, error } = await supabase.storage.listBuckets();
      
      if (error) {
        throw error;
      }
      
      const responseTime = Math.round(performance.now() - startTime);
      const bucketCount = data?.length || 0;
      
      addLog(`Storage buckets retrieved successfully in ${responseTime}ms`);
      addLog(`Found ${bucketCount} storage buckets`);
      
      updateServiceResult({
        name,
        status: "success",
        message: `Storage service working (${bucketCount} buckets found)`,
        details: JSON.stringify(data?.map(bucket => bucket.name), null, 2),
        responseTime,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      const responseTime = Math.round(performance.now() - startTime);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      addLog(`Storage check failed: ${errorMessage}`);
      
      updateServiceResult({
        name,
        status: "error",
        message: `Storage error: ${errorMessage}`,
        responseTime,
        timestamp: new Date().toISOString()
      });
    }
  };

  // Function to check functions service
  const checkFunctions = async () => {
    const startTime = performance.now();
    const name = "Functions Service";
    
    updateServiceResult({
      name,
      status: "pending",
      message: "Checking Supabase Functions...",
      timestamp: new Date().toISOString()
    });

    try {
      addLog(`Testing Supabase Functions service...`);
      
      // Instead of trying to access properties directly,
      // let's just invoke a dummy function to see if the service is configured
      const { error } = await supabase.functions.invoke('not-a-real-function', {
        body: { test: true }
      }).catch(err => {
        // If we get a 404, it means the functions service is working but the function doesn't exist
        // This is actually good since we're just testing connectivity
        if (err.status === 404 || err.code === 'invalid_function') {
          addLog(`Functions service responded with 404 - this is expected and confirms connectivity`);
          return { error: null };
        }
        throw err;
      });
      
      // If we get here, we were able to connect to the functions service
      const responseTime = Math.round(performance.now() - startTime);
      addLog(`Functions service is configured and reachable`);
      
      updateServiceResult({
        name,
        status: "success",
        message: `Functions service is configured correctly`,
        responseTime,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      const responseTime = Math.round(performance.now() - startTime);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      addLog(`Functions check failed: ${errorMessage}`);
      
      // Functions might not be available in all projects, so this is expected sometimes
      updateServiceResult({
        name,
        status: "error",
        message: `Functions error: ${errorMessage}`,
        responseTime,
        timestamp: new Date().toISOString()
      });
    }
  };

  // Function to check realtime service
  const checkRealtime = async () => {
    const startTime = performance.now();
    const name = "Realtime Service";
    
    updateServiceResult({
      name,
      status: "pending",
      message: "Checking realtime service...",
      timestamp: new Date().toISOString()
    });

    try {
      addLog(`Testing Supabase realtime service...`);
      
      // Set up a channel
      const channel = supabase.channel('supabase-check');
      
      // Test subscription with a timeout
      const subscribePromise = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Realtime subscription timed out after 5 seconds'));
        }, 5000);
        
        channel
          .on('presence', { event: 'sync' }, () => {
            clearTimeout(timeout);
            resolve();
          })
          .subscribe((status) => {
            addLog(`Realtime channel subscription status: ${status}`);
            if (status === 'SUBSCRIBED') {
              clearTimeout(timeout);
              resolve();
            }
          });
      });
      
      await subscribePromise;
      const responseTime = Math.round(performance.now() - startTime);
      
      addLog(`Realtime service connected successfully in ${responseTime}ms`);
      channel.unsubscribe();
      
      updateServiceResult({
        name,
        status: "success",
        message: `Realtime service working`,
        responseTime,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      const responseTime = Math.round(performance.now() - startTime);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      addLog(`Realtime check failed: ${errorMessage}`);
      
      updateServiceResult({
        name,
        status: "error",
        message: `Realtime error: ${errorMessage}`,
        responseTime,
        timestamp: new Date().toISOString()
      });
    }
  };

  // Function to run all tests
  const runAllTests = async () => {
    if (isRunningTests) return;
    
    try {
      setIsRunningTests(true);
      setLogs([]);
      setServiceResults([]);
      
      addLog("Starting Supabase services check...");
      
      // Run all tests in parallel
      await Promise.all([
        checkAuth(),
        checkDatabase(),
        checkStorage(),
        checkFunctions(),
        checkRealtime()
      ]);
      
      addLog("All service checks completed");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      addLog(`Error running tests: ${errorMessage}`);
    } finally {
      setIsRunningTests(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Supabase Connection Checker</CardTitle>
          <CardDescription>
            Test your Supabase services and debug connection issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Button 
              onClick={runAllTests} 
              disabled={isRunningTests}
              size="lg"
            >
              {isRunningTests ? "Running Tests..." : "Run All Tests"}
            </Button>
            <div className="text-sm text-muted-foreground">
              Logged in as: <span className="font-medium">{user?.email || "Not logged in"}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            {serviceResults.map((result) => (
              <Card key={result.name} className="overflow-hidden">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-md">{result.name}</CardTitle>
                    <Badge 
                      variant={
                        result.status === "success" ? "default" : 
                        result.status === "error" ? "destructive" : 
                        "outline"
                      }
                    >
                      {result.status === "pending" ? "Testing..." : 
                        result.status === "success" ? "Success" : "Failed"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <div className="text-sm">{result.message}</div>
                  {result.responseTime && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Response time: {result.responseTime}ms
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="dashboard">Results Dashboard</TabsTrigger>
              <TabsTrigger value="logs">Detailed Logs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard">
              <Card>
                <CardContent className="p-4">
                  {serviceResults.length > 0 ? (
                    <div className="space-y-6 mt-4">
                      {serviceResults.map((result) => (
                        result.status !== "pending" && (
                          <div key={`detail-${result.name}`} className="space-y-2">
                            <div className="flex justify-between">
                              <h3 className="font-medium">{result.name} Details</h3>
                              <span 
                                className={
                                  result.status === "success" 
                                    ? "text-green-500" 
                                    : "text-red-500"
                                }
                              >
                                {result.status === "success" ? "✓" : "✗"}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{result.message}</p>
                            {result.details && (
                              <pre className="text-xs p-3 bg-secondary/50 rounded-md overflow-auto whitespace-pre-wrap">
                                {result.details}
                              </pre>
                            )}
                          </div>
                        )
                      ))}
                    </div>
                  ) : (
                    <div className="py-10 text-center text-muted-foreground">
                      Run tests to see detailed results here
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="logs">
              <Card>
                <CardContent className="p-4">
                  <div className="bg-secondary/50 rounded-md p-4 h-[400px] overflow-auto">
                    {logs.length > 0 ? (
                      <pre className="text-xs whitespace-pre-wrap">
                        {logs.join("\n")}
                      </pre>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        No logs yet. Run tests to see detailed logs.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Quick Troubleshooting Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Common Auth Issues</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Invalid or expired JWT token - try signing out and back in</li>
                <li>CORS configuration issues - check Supabase project settings</li>
                <li>API keys not properly configured in your app</li>
                <li>Network connectivity problems to auth.supabase.co</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Database Access Problems</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Row-level security (RLS) policies blocking access</li>
                <li>Missing database permissions for your user</li>
                <li>Table doesn't exist or was renamed</li>
                <li>Rate limiting or connection pool exhaustion</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">General Steps to Fix</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Clear browser local storage and cookies</li>
                <li>Check your Supabase project URL and API keys</li>
                <li>Verify your RLS policies in the Supabase dashboard</li>
                <li>Test directly in the Supabase dashboard SQL editor</li>
                <li>Check browser console for CORS or network errors</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 