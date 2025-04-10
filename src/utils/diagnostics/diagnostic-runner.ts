import { ServiceCheckResult } from "@/types/diagnostics";
import { 
  checkSuperActionFunction, 
  checkAuthService, 
  checkDatabaseService, 
  checkStorageService, 
  checkEdgeFunctionsService 
} from "./service-checkers";

/**
 * Runs all diagnostic tests with progress tracking and logging
 * @param onProgress Callback for tracking test progress (0-100)
 * @param onLogMessage Callback for recording log messages
 * @param onServiceResult Callback for individual service test results
 */
export const runAllDiagnosticTests = async (
  onProgress: (progress: number) => void,
  onLogMessage: (message: string, type: "info" | "error" | "success" | "warning") => void,
  onServiceResult: (result: ServiceCheckResult) => void
) => {
  onLogMessage("Starting Supabase diagnostic tests...", "info");
  
  const totalSteps = 5;
  let currentStep = 0;
  
  try {
    // 1. FIRST STEP: Check super-action edge function
    try {
      const superActionResult = await Promise.race([
        checkSuperActionFunction(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error("Super-action check timed out")), 15000)
        )
      ]);
      onServiceResult(superActionResult);
      currentStep++;
      onProgress((currentStep / totalSteps) * 100);
    } catch (error) {
      onLogMessage(`Super-action check failed: ${error instanceof Error ? error.message : String(error)}`, "error");
      currentStep++;
      onProgress((currentStep / totalSteps) * 100);
    }
    
    // 2. Check Auth
    try {
      const authResult = await Promise.race([
        checkAuthService(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error("Auth check timed out")), 10000)
        )
      ]);
      onServiceResult(authResult);
    } catch (error) {
      onLogMessage(`Auth check failed: ${error instanceof Error ? error.message : String(error)}`, "error");
    }
    currentStep++;
    onProgress((currentStep / totalSteps) * 100);
    
    // 3. Check Database
    try {
      const dbResult = await Promise.race([
        checkDatabaseService(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error("Database check timed out")), 10000)
        )
      ]);
      onServiceResult(dbResult);
    } catch (error) {
      onLogMessage(`Database check failed: ${error instanceof Error ? error.message : String(error)}`, "error");
    }
    currentStep++;
    onProgress((currentStep / totalSteps) * 100);
    
    // 4. Check Storage
    try {
      const storageResult = await Promise.race([
        checkStorageService(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error("Storage check timed out")), 10000)
        )
      ]);
      onServiceResult(storageResult);
    } catch (error) {
      onLogMessage(`Storage check failed: ${error instanceof Error ? error.message : String(error)}`, "error");
    }
    currentStep++;
    onProgress((currentStep / totalSteps) * 100);
    
    // 5. Check Edge Functions
    try {
      const functionsResult = await Promise.race([
        checkEdgeFunctionsService(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error("Edge Functions check timed out")), 10000)
        )
      ]);
      onServiceResult(functionsResult);
    } catch (error) {
      onLogMessage(`Edge Functions check failed: ${error instanceof Error ? error.message : String(error)}`, "error");
    }
    currentStep++;
    onProgress((currentStep / totalSteps) * 100);
    
    onLogMessage("All tests completed.", "info");
    
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    onLogMessage(`Error running tests: ${errorMsg}`, "error");
    throw error;
  }
}; 