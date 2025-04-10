/**
 * Types for the diagnostics system
 */

/**
 * Result of a service check operation
 */
export interface ServiceCheckResult {
  name: string;
  status: "success" | "error" | "pending" | "warning";
  message: string;
  details?: string;
  responseTime?: number;
  timestamp: string;
}

/**
 * Configuration data returned from the super-action function
 */
export interface ConfigData {
  success: boolean;
  variables: Record<string, string>;
  error?: string;
}

/**
 * Log entry from an edge function
 */
export interface FunctionLog {
  timestamp: string;
  level: 'info' | 'error' | 'warn';
  message: string;
  function_name: string;
  execution_time?: number;
  status_code?: number;
}

/**
 * Record of a function invocation
 */
export interface FunctionInvocation {
  id: string;
  function_name: string;
  timestamp: string;
  status_code: number;
  execution_time: number;
  request: {
    method: string;
    headers: Record<string, string>;
    body?: any;
  };
  response: {
    headers: Record<string, string>;
    body?: any;
  };
} 