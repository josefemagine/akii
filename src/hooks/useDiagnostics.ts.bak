import { useState, useCallback } from 'react';
import {
  ServiceCheckResult,
  ConfigData,
  FunctionLog,
  FunctionInvocation,
  EDGE_FUNCTIONS,
  runAllDiagnosticTests,
  fetchFunctionLogs,
  fetchFunctionInvocations
} from '@/services/supabaseDiagnostics';

export type LogMessage = {
  message: string;
  type: "info" | "error" | "success" | "warning";
};

export type TestHistoryEntry = {
  timestamp: string;
  success: boolean;
  failedServices: string[];
};

/**
 * Custom hook for managing Supabase diagnostics state and actions
 */
export function useDiagnostics() {
  // General state
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [serviceResults, setServiceResults] = useState<ServiceCheckResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string>("dashboard");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [testHistory, setTestHistory] = useState<TestHistoryEntry[]>([]);

  // Service-specific state
  const [storageStatus, setStorageStatus] = useState<{ status: string; message: string }>({ 
    status: "idle", 
    message: "Click to check Storage" 
  });
  const [databaseStatus, setDatabaseStatus] = useState<{ status: string; message: string }>({ 
    status: "idle", 
    message: "Click to check Database" 
  });
  const [functionsStatus, setFunctionsStatus] = useState<{ status: string; message: string }>({ 
    status: "idle", 
    message: "Click to check Functions" 
  });

  // Environment variables state
  const [environmentVars, setEnvironmentVars] = useState<{[key: string]: string | undefined}>({});
  const [configVars, setConfigVars] = useState<{[key: string]: {value: string; success: boolean}}>({});
  const [configData, setConfigData] = useState<ConfigData | null>(null);

  // Function logs state
  const [functionLogs, setFunctionLogs] = useState<FunctionLog[]>([]);
  const [functionInvocations, setFunctionInvocations] = useState<FunctionInvocation[]>([]);
  const [selectedFunction, setSelectedFunction] = useState<string>('');
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Utility functions
  const addLog = useCallback((message: string, type: "info" | "error" | "success" | "warning" = "info") => {
    setLogs(prev => [...prev, { message, type }]);
  }, []);

  const updateServiceResult = useCallback((result: ServiceCheckResult) => {
    setServiceResults(prev => {
      const existing = prev.findIndex(r => r.name === result.name);
      if (existing >= 0) {
        const newResults = [...prev];
        newResults[existing] = result;
        return newResults;
      }
      return [...prev, result];
    });
  }, []);

  // Main action to run all diagnostic tests
  const runAllTests = useCallback(async () => {
    try {
      setIsRunningTests(true);
      setLogs([]);
      setServiceResults([]);
      setErrorMessage(null);
      setProgress(0);
      
      await runAllDiagnosticTests(
        // Progress callback
        (progressValue) => {
          setProgress(progressValue);
        },
        // Log message callback
        (message, type) => {
          addLog(message, type);
        },
        // Service result callback
        (result) => {
          updateServiceResult(result);
          
          // If this is the super-action result with config data, update that state
          if (
            result.name === "Super Action Function" && 
            'configData' in result && 
            result.configData
          ) {
            const superActionResult = result as ServiceCheckResult & { configData: ConfigData };
            setConfigData(superActionResult.configData);
            
            // Process environment variables
            const variables = superActionResult.configData.variables || {};
            const envVars: {[key: string]: string | undefined} = {};
            const confVars: {[key: string]: {value: string; success: boolean}} = {};
            
            Object.entries(variables).forEach(([key, value]) => {
              const strValue = String(value || '');
              envVars[key] = strValue;
              confVars[key] = {
                value: strValue,
                success: strValue !== undefined && strValue !== ""
              };
            });
            
            setEnvironmentVars(envVars);
            setConfigVars(confVars);
          }
        }
      );
      
      // Record test history
      const failedServices = serviceResults
        .filter(result => result.status === "error")
        .map(result => result.name);
      
      setTestHistory(prev => [{
        timestamp: new Date().toISOString(),
        success: failedServices.length === 0,
        failedServices
      }, ...prev.slice(0, 9)]);
      
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      setErrorMessage(`Error running tests: ${errorMsg}`);
      addLog(`Error running tests: ${errorMsg}`, "error");
    } finally {
      setIsRunningTests(false);
    }
  }, [addLog, updateServiceResult, serviceResults]);

  // Function to load function logs
  const loadFunctionLogs = useCallback(async (functionName: string) => {
    if (!functionName) return;
    
    setIsLoadingLogs(true);
    setSelectedFunction(functionName);
    
    try {
      const logs = await fetchFunctionLogs(functionName);
      setFunctionLogs(logs);
      
      const invocations = await fetchFunctionInvocations(functionName);
      setFunctionInvocations(invocations);
    } catch (error) {
      console.error('Error loading function data:', error);
      addLog(`Failed to load function data: ${error instanceof Error ? error.message : String(error)}`, "error");
    } finally {
      setIsLoadingLogs(false);
    }
  }, [addLog]);

  return {
    // State
    logs,
    serviceResults,
    isRunningTests,
    selectedTab,
    errorMessage,
    progress,
    testHistory,
    storageStatus,
    databaseStatus,
    functionsStatus,
    environmentVars,
    configVars,
    configData,
    functionLogs,
    functionInvocations,
    selectedFunction,
    isLoadingLogs,
    
    // Actions
    setSelectedTab,
    addLog,
    updateServiceResult,
    runAllTests,
    loadFunctionLogs,
    setSelectedFunction,
    
    // Constants
    EDGE_FUNCTIONS
  };
} 