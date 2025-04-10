import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card.tsx';
import { ScrollArea } from '@/components/ui/scroll-area.tsx';
import { Alert } from '@/components/ui/alert.tsx';
import { CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils.ts';
import { LogMessage } from '@/hooks/useDiagnostics.ts';

interface DiagnosticLogsProps {
  logs: LogMessage[];
  title?: string;
  maxHeight?: string;
}

export function DiagnosticLogs({
  logs,
  title = "Diagnostic Logs",
  maxHeight = "300px"
}: DiagnosticLogsProps) {
  
  // Function to render log icon based on log type
  const renderLogIcon = (type: LogMessage['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500 shrink-0" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500 shrink-0" />;
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-500 shrink-0" />;
    }
  };
  
  // Function to get log item class based on log type
  const getLogItemClass = (type: LogMessage['type']) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-50 dark:bg-green-950/20';
      case 'error':
        return 'border-l-red-500 bg-red-50 dark:bg-red-950/20';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20';
      case 'info':
      default:
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20';
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-medium">{title}</CardTitle>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className={`p-1 rounded-md border max-h-[${maxHeight}]`}>
          {logs.length === 0 ? (
            <div className="py-4 text-center text-sm text-muted-foreground">
              No log entries. Run a test to see diagnostic logs.
            </div>
          ) : (
            <div className="space-y-2 p-1">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-2 text-sm rounded border-l-2 flex items-start gap-2",
                    getLogItemClass(log.type)
                  )}
                >
                  {renderLogIcon(log.type)}
                  <span>{log.message}</span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 