import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card.tsx';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table.tsx';
import { ScrollArea } from '@/components/ui/scroll-area.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { Alert, AlertDescription } from '@/components/ui/alert.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Loader2, AlertCircle, Info, BarChart2 } from 'lucide-react';
import { FunctionLog, FunctionInvocation } from '@/types/diagnostics.ts';
import { EDGE_FUNCTIONS } from '@/utils/diagnostics.ts';

interface FunctionLogsProps {
  logs: FunctionLog[];
  invocations: FunctionInvocation[];
  selectedFunction: string;
  onSelectFunction: (name: string) => void;
  isLoading: boolean;
  title?: string;
}

export function FunctionLogs({
  logs,
  invocations,
  selectedFunction,
  onSelectFunction,
  isLoading,
  title = "Edge Function Logs"
}: FunctionLogsProps) {
  
  // Color coding for log levels
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'warn': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'info': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };
  
  // Format timestamps
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch (e) {
      return timestamp;
    }
  };
  
  // Format status code colors
  const getStatusColor = (status: number) => {
    if (status < 300) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    if (status < 400) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    if (status < 500) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center">
          <CardTitle className="text-md font-medium">{title}</CardTitle>
          
          <div className="w-full sm:w-64">
            <Select
              value={selectedFunction}
              onValueChange={onSelectFunction}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select function" />
              </SelectTrigger>
              <SelectContent>
                {EDGE_FUNCTIONS.map((func) => (
                  <SelectItem key={func.name} value={func.name}>
                    {func.name} {func.description ? `(${func.description})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {!selectedFunction ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Select a function to view its logs and invocation history.
            </AlertDescription>
          </Alert>
        ) : (
          <Tabs defaultValue="logs">
            <TabsList className="mb-4">
              <TabsTrigger value="logs" className="flex items-center gap-1">
                <Info className="h-4 w-4" /> Logs
              </TabsTrigger>
              <TabsTrigger value="invocations" className="flex items-center gap-1">
                <BarChart2 className="h-4 w-4" /> Invocations
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="logs">
              <ScrollArea className="rounded-md border h-[400px]">
                {isLoading ? (
                  <div className="py-8 flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : logs.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    No logs found for this function.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-40">Timestamp</TableHead>
                        <TableHead className="w-20">Level</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead className="w-24">Execution Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log, index) => (
                        <TableRow key={index}>
                          <TableCell className="text-xs">
                            {formatTimestamp(log.timestamp)}
                          </TableCell>
                          <TableCell>
                            <Badge className={getLevelColor(log.level)}>
                              {log.level}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs whitespace-pre-wrap">
                            {log.message}
                          </TableCell>
                          <TableCell className="text-xs text-right">
                            {log.execution_time !== undefined 
                              ? `${log.execution_time.toFixed(2)}ms` 
                              : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="invocations">
              <ScrollArea className="rounded-md border h-[400px]">
                {isLoading ? (
                  <div className="py-8 flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : invocations.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    No invocation history found for this function.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-40">Timestamp</TableHead>
                        <TableHead className="w-20">Method</TableHead>
                        <TableHead className="w-24">Status</TableHead>
                        <TableHead>Request</TableHead>
                        <TableHead className="w-24">Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invocations.map((invocation) => (
                        <TableRow key={invocation.id}>
                          <TableCell className="text-xs">
                            {formatTimestamp(invocation.timestamp)}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {invocation.request.method}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(invocation.status_code)}>
                              {invocation.status_code}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs truncate max-w-[200px]">
                            {invocation.request.body 
                              ? JSON.stringify(invocation.request.body).substring(0, 50) + (JSON.stringify(invocation.request.body).length > 50 ? '...' : '')
                              : 'No body'}
                          </TableCell>
                          <TableCell className="text-xs text-right">
                            {invocation.execution_time.toFixed(2)}ms
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
} 