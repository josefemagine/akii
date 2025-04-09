/**
 * Request Lock Utility
 * 
 * Prevents multiple simultaneous requests for the same resource by
 * implementing a global request lock mechanism.
 */

// Track active requests
const activeRequests: Record<string, Promise<any>> = {};
const timeoutIds: Record<string, NodeJS.Timeout> = {};

/**
 * Execute a request with lock protection to prevent duplicate in-flight requests
 * 
 * @param key Unique key identifying the request
 * @param requestFn Function that returns a promise for the request
 * @param lockTimeout Timeout in ms after which the lock is automatically released (default: 10000ms)
 * @param fallbackFn Optional function to call if the request times out
 */
export async function withRequestLock<T>(
  key: string,
  requestFn: () => Promise<T>,
  lockTimeout = 10000,
  fallbackFn?: () => Promise<T>
): Promise<T> {
  // If there's already a request in flight for this key, return that promise
  if (activeRequests[key]) {
    console.log(`[RequestLock] Using existing request for ${key}`);
    try {
      return await activeRequests[key];
    } catch (error) {
      console.log(`[RequestLock] Existing request for ${key} failed:`, error);
      // If the shared request fails, we'll try a new one below
      delete activeRequests[key];
      // Also clear any timeout that might be associated with this key
      if (timeoutIds[key]) {
        clearTimeout(timeoutIds[key]);
        delete timeoutIds[key];
      }
    }
  }

  // Create our wrapped promise for this request
  const wrappedPromise = (async () => {
    // Create a timeout promise that will clear the lock after specified time
    if (timeoutIds[key]) {
      clearTimeout(timeoutIds[key]);
    }
    
    timeoutIds[key] = setTimeout(() => {
      console.log(`[RequestLock] Timeout reached for ${key}, releasing lock`);
      delete activeRequests[key];
      delete timeoutIds[key];
    }, lockTimeout);

    try {
      // Create the request promise
      const requestPromise = requestFn();
      
      // Start the request
      const result = await requestPromise;
      
      // Clear the timeout
      if (timeoutIds[key]) {
        clearTimeout(timeoutIds[key]);
        delete timeoutIds[key];
      }
      
      // Clear the lock once the request completes successfully
      delete activeRequests[key];
      
      return result;
    } catch (error) {
      // Clear the timeout
      if (timeoutIds[key]) {
        clearTimeout(timeoutIds[key]);
        delete timeoutIds[key];
      }
      
      // Clear the lock on error
      delete activeRequests[key];
      
      // If we have a timeout error and fallback function, use it
      if (error.message?.includes('timeout') && fallbackFn) {
        console.log(`[RequestLock] Request for ${key} timed out, using fallback`);
        try {
          return await fallbackFn();
        } catch (fallbackError) {
          console.log(`[RequestLock] Fallback for ${key} also failed:`, fallbackError);
          throw fallbackError;
        }
      }
      
      throw error;
    }
  })();

  // Store the promise
  activeRequests[key] = wrappedPromise;
  
  return wrappedPromise;
}

/**
 * Check if a request is currently locked
 */
export function isRequestLocked(key: string): boolean {
  return key in activeRequests;
}

/**
 * Force release a request lock
 */
export function releaseRequestLock(key: string): boolean {
  if (key in activeRequests) {
    delete activeRequests[key];
    if (timeoutIds[key]) {
      clearTimeout(timeoutIds[key]);
      delete timeoutIds[key];
    }
    return true;
  }
  return false;
}

/**
 * Clear all request locks
 */
export function clearAllRequestLocks(): void {
  Object.keys(activeRequests).forEach(key => {
    delete activeRequests[key];
    if (timeoutIds[key]) {
      clearTimeout(timeoutIds[key]);
      delete timeoutIds[key];
    }
  });
} 