import { toast } from "@/components/ui/use-toast.ts";

interface ErrorOptions {
  title?: string;
  fallbackMessage?: string;
  logToConsole?: boolean;
  showToast?: boolean;
  context?: string;
}

/**
 * A unified error handler for consistent error handling across components
 * 
 * @param error The error object to handle
 * @param options Configuration options for error handling
 * @returns The error message extracted from the error
 */
export function handleError(error: unknown, options: ErrorOptions = {}): string {
  const {
    title = "Error",
    fallbackMessage = "An unexpected error occurred",
    logToConsole = true,
    showToast = true,
    context = ""
  } = options;

  // Extract error message
  let errorMessage: string;
  
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    errorMessage = error.message;
  } else {
    errorMessage = fallbackMessage;
  }

  // Log error to console if enabled
  if (logToConsole) {
    if (context) {
      console.error(`[${context}]`, error);
    } else {
      console.error(error);
    }
  }

  // Show toast notification if enabled
  if (showToast) {
    toast({
      title,
      description: errorMessage,
      variant: "destructive",
    });
  }

  return errorMessage;
}

/**
 * A wrapper that handles errors in async functions
 * 
 * @param fn The async function to execute
 * @param options Error handling options
 * @returns A function that will catch and handle errors
 */
export function withErrorHandling<T, Args extends any[]>(
  fn: (...args: Args) => Promise<T>,
  options: ErrorOptions = {}
): (...args: Args) => Promise<{ data: T | null; error: string | null }> {
  return async (...args: Args) => {
    try {
      const result = await fn(...args);
      return { data: result, error: null };
    } catch (error) {
      const errorMessage = handleError(error, options);
      return { data: null, error: errorMessage };
    }
  };
}

/**
 * Show a success toast notification
 * 
 * @param title Title of the success message
 * @param description Description of the success message
 */
export function showSuccess(title: string, description: string): void {
  toast({
    title,
    description,
  });
} 