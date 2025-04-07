import React from "react";
import { AlertCircle, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { BedrockClient } from "@/lib/supabase-bedrock-client";

// Type definitions for test results
interface PermissionTest {
  success: boolean;
  message?: string;
  error?: string;
}

interface TestResult {
  timestamp: string;
  credentials: {
    success: boolean;
    message: string;
    region: string;
    hasAccessKey: boolean;
    hasSecretAccessKey: boolean;
  };
  permissions: {
    [key: string]: PermissionTest;
  };
  diagnostics: {
    environment: {
      runtime: string;
      region: string;
      function_name: string;
    };
  };
}

interface AWSTestConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AWSTestConnectionModal: React.FC<AWSTestConnectionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [testing, setTesting] = React.useState(false);
  const [testResults, setTestResults] = React.useState<TestResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // Run the tests when the modal opens
  React.useEffect(() => {
    if (isOpen) {
      runTests();
    }
  }, [isOpen]);

  const runTests = async () => {
    setTesting(true);
    setError(null);
    setTestResults(null);
    
    try {
      const results = await BedrockClient.testAwsPermissions();
      
      if (results.success && results.test_results) {
        setTestResults(results.test_results as TestResult);
      } else {
        setError(results.error || "Unknown error occurred during testing");
        console.error("AWS test error:", results);
      }
    } catch (err) {
      console.error("Error running AWS tests:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setTesting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col dark:bg-slate-900 dark:border-slate-800">
        <DialogHeader className="dark:text-slate-100">
          <DialogTitle>AWS Connection Test Results</DialogTitle>
          <DialogDescription className="dark:text-slate-300">
            Detailed results from testing your AWS Bedrock connection
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-1">
          {testing ? (
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <Loader2 className="h-8 w-8 mb-4 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground dark:text-slate-400">
                Testing AWS Bedrock connection...
              </p>
            </div>
          ) : error ? (
            <div className="py-6 flex flex-col items-center justify-center text-center">
              <AlertCircle className="h-8 w-8 mb-4 text-destructive" />
              <h3 className="font-semibold text-lg mb-2 dark:text-slate-100">Test Failed</h3>
              <p className="text-sm text-muted-foreground dark:text-slate-300 max-w-md">
                {error}
              </p>
              <Button 
                variant="outline" 
                onClick={runTests} 
                className="mt-4 dark:text-slate-200 dark:border-slate-700"
              >
                Retry Test
              </Button>
            </div>
          ) : testResults ? (
            <div className="space-y-6 py-4">
              {/* Credentials section */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg flex items-center dark:text-slate-100">
                  {testResults.credentials.success ? (
                    <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 dark:text-green-400" />
                  ) : (
                    <XCircle className="h-5 w-5 mr-2 text-destructive" />
                  )}
                  Credentials
                </h3>
                <div className="rounded-md border p-4 space-y-2 dark:bg-slate-800 dark:border-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium dark:text-slate-200">Status</span>
                    <span className={cn(
                      "text-sm",
                      testResults.credentials.success 
                        ? "text-green-500 dark:text-green-400" 
                        : "text-destructive"
                    )}>
                      {testResults.credentials.message}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium dark:text-slate-200">Region</span>
                    <span className="text-sm dark:text-slate-300">
                      {testResults.credentials.region}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium dark:text-slate-200">Access Key</span>
                    <span className="text-sm dark:text-slate-300">
                      {testResults.credentials.hasAccessKey ? "✓ Present" : "✗ Missing"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium dark:text-slate-200">Secret Key</span>
                    <span className="text-sm dark:text-slate-300">
                      {testResults.credentials.hasSecretAccessKey ? "✓ Present" : "✗ Missing"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Permissions section */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg dark:text-slate-100">API Permissions</h3>
                <div className="rounded-md border p-4 space-y-2 dark:bg-slate-800 dark:border-slate-700">
                  {testResults.permissions && Object.entries(testResults.permissions).map(([key, test]) => (
                    <div key={key} className="flex justify-between items-center py-1">
                      <span className="text-sm font-medium capitalize dark:text-slate-200">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <div className="flex items-center">
                        {test.success ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-500 dark:text-green-400" />
                            <span className="text-sm text-green-500 dark:text-green-400">Passed</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 mr-2 text-destructive" />
                            <span className="text-sm text-destructive">Failed</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Environment section */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg dark:text-slate-100">Diagnostic Information</h3>
                <div className="rounded-md border p-4 space-y-2 text-xs font-mono bg-muted/50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                  <div className="flex justify-between items-center">
                    <span>Runtime</span>
                    <span>{testResults.diagnostics?.environment?.runtime || "unknown"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Region</span>
                    <span>{testResults.diagnostics?.environment?.region || "unknown"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Function</span>
                    <span>{testResults.diagnostics?.environment?.function_name || "unknown"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Timestamp</span>
                    <span>{new Date(testResults.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <AlertCircle className="h-8 w-8 mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground dark:text-slate-400">
                No test results available
              </p>
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="pt-4">
          <Button
            variant="outline"
            onClick={runTests}
            disabled={testing}
            className="mr-2 dark:text-slate-200 dark:border-slate-700"
          >
            {testing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              "Run Tests Again"
            )}
          </Button>
          <Button onClick={onClose} className="dark:bg-green-600 dark:hover:bg-green-700">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AWSTestConnectionModal; 