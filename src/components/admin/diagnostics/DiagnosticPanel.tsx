import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card.tsx';
import { Alert, AlertDescription } from '@/components/ui/alert.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils.ts';
import { ServiceCheckResult } from '@/types/diagnostics.ts';

// Define props for the component
interface DiagnosticPanelProps {
  title: string;
  service: ServiceCheckResult | null;
  isLoading?: boolean;
  onRunTest?: () => void;
  actionLabel?: string;
}

export function DiagnosticPanel({
  title,
  service,
  isLoading = false,
  onRunTest,
  actionLabel = 'Run Test'
}: DiagnosticPanelProps) {
  // Determine status icon based on service status
  const renderStatusIcon = () => {
    if (isLoading) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    
    if (!service) {
      return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
    
    switch (service.status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };
  
  // Determine service status badge class
  const getStatusBadgeClass = () => {
    if (!service) return '';
    
    switch (service.status) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'pending':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-md font-medium flex items-center gap-2">
            {renderStatusIcon()} {title}
          </CardTitle>
          
          {onRunTest && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRunTest}
              disabled={isLoading}
              className="h-8"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Running...
                </>
              ) : actionLabel}
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {service ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className={cn("rounded-sm", getStatusBadgeClass())}>
                {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
              </Badge>
              
              {service.responseTime !== undefined && (
                <span className="text-xs text-muted-foreground">
                  {service.responseTime.toFixed(2)}ms
                </span>
              )}
            </div>
            
            <p className="text-sm">{service.message}</p>
            
            {service.details && (
              <Alert variant="default" className="mt-2 py-2">
                <AlertDescription className="text-xs overflow-auto max-h-24">
                  {service.details}
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {isLoading 
              ? 'Running diagnostic test...' 
              : 'No diagnostic data available. Run a test to check service status.'}
          </p>
        )}
      </CardContent>
    </Card>
  );
} 