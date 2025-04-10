import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, LogIn, RefreshCw, TestTube } from "lucide-react";
import { ApiConfigPanelProps } from "@/types/bedrock";

const ApiConfigPanel: React.FC<ApiConfigPanelProps> = ({
  connectionStatus,
  authStatus,
  handleLogin,
  checkAuthStatus,
  refreshInstances,
  testingConnection,
  refreshing,
  testConnection,
  openTestModal
}) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>AWS Bedrock Connection</CardTitle>
            <CardDescription>
              API configuration and AWS credentials status
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant={authStatus === 'authenticated' ? "outline" : "destructive"}
              className={authStatus === 'authenticated' ? "bg-blue-50 text-blue-800 border-blue-200" : ""}
            >
              {authStatus === 'authenticated' ? "Authenticated" : "Auth Error"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Supabase API</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">API URL:</p>
                  <p className="font-mono bg-muted p-1 rounded">/api/super-action</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Environment:</p>
                  <p className="font-medium">Production</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Authentication:</p>
                  <p className="font-medium">Supabase JWT</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Edge Functions:</p>
                  <p className="font-medium">Enabled</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">AWS Credentials</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Region:</p>
                  <p className="font-medium">Not Configured</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Access Key:</p>
                  <p className="font-medium">
                    <span className="text-amber-600">Not Configured</span>
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Status:</p>
                  <p className="font-medium">Not Connected</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Message:</p>
                  <p className="font-medium text-xs">Not Connected</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="h-px bg-border"></div>
        
        <div className="flex flex-col sm:flex-row justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={openTestModal}
              disabled={testingConnection}
            >
              <TestTube className="mr-2 h-4 w-4" />
              Test AWS Connection
            </Button>
          </div>
          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshInstances}
              disabled={refreshing}
            >
              {refreshing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Refresh Data
            </Button>
            {authStatus !== 'authenticated' && (
              <Button 
                variant="default" 
                size="sm"
                onClick={handleLogin}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiConfigPanel; 