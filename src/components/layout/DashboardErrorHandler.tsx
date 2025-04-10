import React from 'react';
import { Button } from '@/components/ui/button.tsx';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface DashboardErrorHandlerProps {
  connectionError: Error | null;
  onRetry: () => void;
  children: React.ReactNode;
}

const DashboardErrorHandler: React.FC<DashboardErrorHandlerProps> = ({
  connectionError,
  onRetry,
  children
}) => {
  if (!connectionError) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex flex-col items-center justify-center flex-1 p-4">
        <Alert className="max-w-md border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/20 mb-4">
          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertTitle className="text-red-600 dark:text-red-400">Connection Error</AlertTitle>
          <AlertDescription className="text-red-600/90 dark:text-red-400/90">
            We're having trouble establishing a connection to the server. This might be due to network issues or a browser extension.
          </AlertDescription>
        </Alert>
        
        <div className="text-sm text-muted-foreground mb-4 max-w-md">
          <p className="mb-2"><strong>Error details:</strong> {connectionError.message}</p>
          <p>Try disabling browser extensions that might be interfering with the connection, or check your network connection.</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={onRetry} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry Connection
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardErrorHandler; 