import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { runMigration } from "@/lib/run-migration.ts";
import { Loader2, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import { supabase } from "@/lib/supabase.tsx";

export default function RunMigration() {
  const [sql, setSql] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [isCheckingCredentials, setIsCheckingCredentials] = useState(false);
  const [credentialsStatus, setCredentialsStatus] = useState<any>(null);
  const [availableMigrations, setAvailableMigrations] = useState<string[]>([]);

  // Fetch available migrations on component mount
  useEffect(() => {
    const fetchMigrations = async () => {
      try {
        const response = await fetch("/supabase/migrations/");
        if (response.ok) {
          const data = await response.json();
          setAvailableMigrations(data.files || []);
        }
      } catch (error) {
        console.error("Error fetching migrations:", error);
      }
    };

    fetchMigrations();

    // Set project ID in UI for reference
    setCredentialsStatus((prev) => ({
      ...prev,
      projectInfo: {
        projectId: "injxxchotrvgvvzelhvj",
        timestamp: new Date().toISOString(),
      },
    }));
  }, []);

  const handleRunMigration = async () => {
    if (!sql.trim()) return;

    setIsRunning(true);
    setResult(null);

    try {
      const { success, error } = await runMigration(sql);

      if (success) {
        setResult({
          success: true,
          message: "Migration completed successfully",
        });
      } else {
        setResult({
          success: false,
          message: `Error: ${error?.message || "Unknown error"}`,
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const checkCredentials = async () => {
    setIsCheckingCredentials(true);
    setCredentialsStatus(null);
    setResult(null);

    try {
      // First check if we can connect to Supabase directly
      const { data: directCheck, error: directError } = await supabase
        .from("profiles")
        .select("count")
        .limit(1);

      if (directError) {
        console.error("Direct Supabase connection failed:", directError);
        // Continue with the edge function check even if direct check fails
      } else {
        console.log("Direct Supabase connection successful");
      }

      // Then check the edge function credentials
      const { data, error } = await supabase.functions.invoke(
        "check-credentials",
        {
          method: "POST",
        },
      );

      if (error) {
        throw new Error(`Edge function error: ${error.message}`);
      }

      setCredentialsStatus(data);

      // If the connection test failed, show a more specific error
      if (data?.connectionTest && !data.connectionTest.working) {
        setResult({
          success: false,
          message: `Connection test failed with status ${data.connectionTest.status}. This may indicate permission issues.`,
        });
      } else if (data?.status === "success") {
        setResult({
          success: true,
          message: "Credentials check completed successfully.",
        });
      }
    } catch (error) {
      console.error("Credential check error:", error);
      setResult({
        success: false,
        message: `Credential check error: ${error instanceof Error ? error.message : String(error)}`,
      });

      // Try to get basic environment variable status even if the function fails
      try {
        const basicStatus = {
          credentials: {
            url: process.env.VITE_SUPABASE_URL
              ? "Available in frontend"
              : "Missing in frontend",
            anonKey: process.env.VITE_SUPABASE_ANON_KEY
              ? "Available in frontend"
              : "Missing in frontend",
            serviceKey: "Cannot check from frontend",
            projectId: process.env.SUPABASE_PROJECT_ID
              ? "Available"
              : "Missing",
          },
        };
        setCredentialsStatus(basicStatus);
      } catch (statusError) {
        console.error("Failed to get basic status:", statusError);
      }
    } finally {
      setIsCheckingCredentials(false);
    }
  };

  const handleFixMissingTables = async () => {
    // Read the SQL from the migration file
    const response = await fetch(
      "/supabase/migrations/20240607000001_fix_missing_tables.sql",
    );
    const migrationSql = await response.text();
    setSql(migrationSql);
  };

  const handleLoadCompletePermissionsFix = async () => {
    try {
      // Read the SQL from the complete permissions fix migration file
      const response = await fetch(
        "/supabase/migrations/20240608000004_fix_edge_function_permissions_complete.sql",
      );
      if (response.ok) {
        const migrationSql = await response.text();
        setSql(migrationSql);
        setResult({
          success: true,
          message:
            "Complete permissions fix loaded. Click 'Run Migration' to apply it.",
        });
      } else {
        throw new Error(`Failed to fetch migration file: ${response.status}`);
      }
    } catch (error) {
      console.error("Error loading migration file:", error);
      setResult({
        success: false,
        message: `Error loading migration file: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  };

  const handleFixEdgeFunctionPermissions = async () => {
    // Read the SQL from the migration file
    const response = await fetch(
      "/supabase/migrations/20240608000002_fix_edge_function_permissions.sql",
    );
    const migrationSql = await response.text();
    setSql(migrationSql);
  };

  return (
    <div className="container mx-auto py-6">
      <Card className="w-full mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Check Supabase Credentials</CardTitle>
              <CardDescription>
                Verify that your Supabase credentials are properly configured
                for edge functions
              </CardDescription>
            </div>
            <div className="text-sm bg-muted px-3 py-1 rounded-md font-mono">
              Project ID: injxxchotrvgvvzelhvj
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={checkCredentials}
                disabled={isCheckingCredentials}
                variant="outline"
                className="w-full md:w-auto"
              >
                {isCheckingCredentials ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking Credentials...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Check Credentials
                  </>
                )}
              </Button>

              <Button
                onClick={handleLoadCompletePermissionsFix}
                variant="secondary"
                className="w-full md:w-auto"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Load Complete Permissions Fix
              </Button>

              <Button
                onClick={handleRunMigration}
                variant="destructive"
                className="w-full md:w-auto"
                disabled={isRunning || !sql.trim()}
              >
                {isRunning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Applying Fix...
                  </>
                ) : (
                  "Apply Permissions Fix"
                )}
              </Button>
            </div>

            {credentialsStatus && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <h3 className="text-sm font-medium text-green-800 mb-2">
                  Credential Check Result
                </h3>
                <pre className="text-xs text-green-700 whitespace-pre-wrap overflow-auto max-h-[300px]">
                  {JSON.stringify(credentialsStatus, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Run Database Migration</CardTitle>
          <CardDescription>
            Execute SQL migrations directly from the admin panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={handleFixMissingTables}
                disabled={isRunning}
              >
                Load Fix Missing Tables Migration
              </Button>

              <Button
                variant="outline"
                onClick={handleFixEdgeFunctionPermissions}
                disabled={isRunning}
              >
                Load Edge Function Permissions Fix
              </Button>
            </div>
            <Textarea
              placeholder="Enter SQL migration here..."
              className="min-h-[300px] font-mono"
              value={sql}
              onChange={(e) => setSql(e.target.value)}
              disabled={isRunning}
            />
            {result && (
              <Alert variant={result.success ? "default" : "destructive"}>
                <AlertTitle>
                  {result.success ? (
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Success
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Error
                    </div>
                  )}
                </AlertTitle>
                <AlertDescription>{result.message}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleRunMigration}
            disabled={isRunning || !sql.trim()}
            className="w-full"
          >
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Migration...
              </>
            ) : (
              "Run Migration"
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card className="my-4">
        <CardHeader>
          <CardTitle>Available Migrations</CardTitle>
          <CardDescription>Select a migration to run</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border p-4 rounded-md hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Subscription Tables</h3>
                  <p className="text-sm text-gray-500">
                    Create tables for subscriptions, plans, payment methods, and invoices
                  </p>
                </div>
                <Button 
                  onClick={() => runMigration('20230501000000_create_subscription_tables.sql')}
                  variant="outline"
                >
                  Run Migration
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
