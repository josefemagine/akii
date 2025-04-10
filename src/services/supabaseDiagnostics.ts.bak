/**
 * Supabase Diagnostics Service
 * 
 * This service provides functions for diagnosing and monitoring Supabase services.
 * Utility functions have been extracted to src/utils/diagnostics/ for better organization.
 */

// Re-export all types from the types file
export type {
  ServiceCheckResult,
  ConfigData,
  FunctionLog,
  FunctionInvocation
} from '@/types/diagnostics';

// Re-export utility functions from the utils directory
export {
  // Secret masking utilities
  maskSecret,
  isSensitiveKey,
  maskSensitiveData,
  
  // Service check functions
  checkAuthService,
  checkStorageService,
  checkDatabaseService,
  checkEdgeFunctionsService,
  checkSuperActionFunction,
  
  // Edge function utilities
  EDGE_FUNCTIONS,
  fetchFunctionLogs,
  fetchFunctionInvocations,
  
  // Main diagnostic runner
  runAllDiagnosticTests
} from '@/utils/diagnostics'; 