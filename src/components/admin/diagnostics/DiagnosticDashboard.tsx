import React from 'react';
import { Button } from '@/components/ui/button.tsx';
import { Progress } from '@/components/ui/progress.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';
import { Loader2 } from 'lucide-react';
import { DiagnosticPanel } from './DiagnosticPanel.tsx';
import { DiagnosticLogs } from './DiagnosticLogs.tsx';
import { EnvironmentVariables } from './EnvironmentVariables.tsx';
import { FunctionLogs } from './FunctionLogs.tsx';
import { useDiagnostics } from '@/hooks/useDiagnostics.ts';

export function DiagnosticDashboard() {
  const {
    logs,
    serviceResults,
    isRunningTests,
    selectedTab,
    errorMessage,
    progress,
    testHistory,
    environmentVars,
    configVars,
    configData,
    functionLogs,
    functionInvocations,
    selectedFunction,
    isLoadingLogs,
    
    setSelectedTab,
    runAllTests,
    loadFunctionLogs,
    setSelectedFunction,
    
    EDGE_FUNCTIONS
  } = useDiagnostics();
  
  // Find service results by name
  const getServiceResult = (name: string) => {
    return serviceResults.find(result => result.name === name) || null;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Supabase Diagnostics</h1>
          <p className="text-muted-foreground">
            Run tests to check Supabase services and configuration.
          </p>
        </div>
        
        <Button 
          onClick={runAllTests} 
          disabled={isRunningTests}
          size="lg"
          className="w-full md:w-auto"
        >
          {isRunningTests ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Diagnostics...
            </>
          ) : (
            'Run All Tests'
          )}
        </Button>
      </div>
      
      {isRunningTests && (
        <Progress value={progress} className="h-2 animate-pulse" />
      )}
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="environment">Environment</TabsTrigger>
          <TabsTrigger value="functions">Functions</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>
        
        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            <DiagnosticPanel 
              title="Authentication Service" 
              service={getServiceResult("Authentication Service")}
              isLoading={isRunningTests}
            />
            
            <DiagnosticPanel 
              title="Database Service" 
              service={getServiceResult("Database Service")}
              isLoading={isRunningTests}
            />
            
            <DiagnosticPanel 
              title="Storage Service" 
              service={getServiceResult("Storage Service")}
              isLoading={isRunningTests}
            />
            
            <DiagnosticPanel 
              title="Edge Functions Service" 
              service={getServiceResult("Edge Functions Service")}
              isLoading={isRunningTests}
            />
            
            <DiagnosticPanel 
              title="Super Action Function" 
              service={getServiceResult("Super Action Function")}
              isLoading={isRunningTests}
            />
          </div>
          
          <DiagnosticLogs logs={logs} maxHeight="300px" />
          
          {testHistory.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Test History</h3>
              <div className="space-y-2">
                {testHistory.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm border rounded-md p-2">
                    <div className={`w-2 h-2 rounded-full ${entry.success ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-muted-foreground">{new Date(entry.timestamp).toLocaleString()}</span>
                    <span className="font-medium">
                      {entry.success 
                        ? 'All tests passed' 
                        : `Failed services: ${entry.failedServices.join(', ')}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
        
        {/* Environment Tab */}
        <TabsContent value="environment" className="space-y-4">
          <EnvironmentVariables 
            variables={configVars} 
            title="Environment Variables"
          />
        </TabsContent>
        
        {/* Functions Tab */}
        <TabsContent value="functions" className="space-y-4">
          <FunctionLogs
            logs={functionLogs}
            invocations={functionInvocations}
            selectedFunction={selectedFunction}
            onSelectFunction={loadFunctionLogs}
            isLoading={isLoadingLogs}
          />
        </TabsContent>
        
        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <DiagnosticLogs 
            logs={logs} 
            title="Diagnostic Logs"
            maxHeight="600px"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
} 