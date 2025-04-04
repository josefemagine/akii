/**
 * Auth Lock Fix Utility
 * 
 * This file contains utilities to help manage concurrent auth requests
 * and prevent "loadSession() used outside of an acquired lock" errors.
 */

import { supabase } from './supabase-singleton';
import type { User, Session } from '@supabase/supabase-js';

// Configuration
const CONFIG = {
  LOCK_TIMEOUT: 3000,       // 3 seconds max lock time before forced release (increased from 1s)
  MAX_RETRY_COUNT: 5,       // Maximum number of retries for auth operations (increased from 3)
  RETRY_DELAY_BASE: 100,    // Base delay between retries in ms (increased from 50ms)
  QUEUE_TIMEOUT: 5000,      // Maximum time an operation can wait in queue (increased from 3000ms)
  AUTO_RELEASE_CHECK: 500,  // Check for stuck locks frequency (increased from 250ms)
  CRITICAL_OPS: ['getSession', 'getCurrentUser', 'signOut'], // Critical operations that get priority
  SESSION_CACHE_TIME: 2000, // Time to cache session results in ms (increased from 500ms)
  MAX_QUEUE_LENGTH: 8       // Maximum number of operations allowed in queue (increased from 5)
};

// Lock state tracking
let isAuthOperationInProgress = false;
let authOperationQueue: Array<{
  operation: () => Promise<void>;
  name: string;
  priority: number;
  timestamp: number;
}> = [];
let lastOperationTime = 0;
let lockHolder = 'unknown';
let autoReleaseInterval: number | null = null;
let consecutiveTimeouts = 0; // Track consecutive timeouts to detect systemic issues

// Session cache with more intelligent tracking
let sessionCache: {
  session: any;
  timestamp: number;
  pendingPromise: Promise<any> | null;
  requestCount: number;
} = {
  session: null,
  timestamp: 0,
  pendingPromise: null,
  requestCount: 0
};

// Keep track of operations that have timed out for more intelligent handling
const timedOutOperations = new Set<string>();

// Keep track of pending direct session checks to avoid multiple simultaneous checks
const pendingDirectChecks = {
  promise: null as Promise<any> | null,
  timestamp: 0
};

// Add this function near the top of the file, after the imports
/**
 * Check if an error is an AuthSessionMissingError
 * Used to filter out expected errors from console logs
 */
function isAuthSessionMissingError(error: any): boolean {
  if (!error) return false;
  
  // Check error message content
  const errorMessage = typeof error === 'string' 
    ? error 
    : error.message || error.error_description || String(error);
  
  return typeof errorMessage === 'string' && 
    (errorMessage.includes('Auth session missing') || 
     errorMessage.includes('No session found') ||
     errorMessage.includes('No user found'));
}

// Start auto-release timer to periodically check for stuck locks
function startAutoReleaseTimer() {
  if (autoReleaseInterval === null) {
    autoReleaseInterval = window.setInterval(() => {
      // Only report if there are operations in progress or queued
      if (isAuthOperationInProgress || authOperationQueue.length > 0) {
        const lockHeldDuration = Date.now() - lastOperationTime;
        
        // Force release if the lock has been held too long
        if (isAuthOperationInProgress && lockHeldDuration > CONFIG.LOCK_TIMEOUT) {
          console.warn(`Auth lock auto-release: Lock held by ${lockHolder} for ${lockHeldDuration}ms, releasing`);
          releaseAuthLock();
          
          // If we have many operations in queue, perform emergency reset
          if (authOperationQueue.length > 3 || consecutiveTimeouts > 2) {
            console.warn('Too many queued operations or consecutive timeouts, performing emergency reset');
            emergencySessionReset();
            // Clear the queue after emergency reset
            authOperationQueue = [];
          }
        }
        
        // Log queue status only if it's unusual (more than 2 items)
        if (authOperationQueue.length > 2) {
          console.log(`Auth operation queue status: ${authOperationQueue.length} operations waiting. Lock holder: ${lockHolder}`);
        }
      }
    }, CONFIG.AUTO_RELEASE_CHECK);
  }
}

// Stop the auto-release timer
function stopAutoReleaseTimer() {
  if (autoReleaseInterval !== null) {
    window.clearInterval(autoReleaseInterval);
    autoReleaseInterval = null;
  }
}

// Start the auto-release timer when the module loads
startAutoReleaseTimer();

/**
 * Sleep for a specified time
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calculate retry delay with exponential backoff
 */
const getRetryDelay = (attempt: number) => {
  return Math.min(CONFIG.RETRY_DELAY_BASE * Math.pow(2, attempt), 3000);
};

/**
 * Release the auth lock and process next operation in queue
 */
function releaseAuthLock() {
  isAuthOperationInProgress = false;
  lockHolder = 'none';
  
  // Clear any pending operations that have been waiting too long
  const now = Date.now();
  authOperationQueue = authOperationQueue.filter(op => {
    const waitTime = now - op.timestamp;
    if (waitTime > CONFIG.QUEUE_TIMEOUT) {
      console.warn(`Dropping stale operation ${op.name} that waited for ${waitTime}ms`);
      return false;
    }
    return true;
  });
  
  // Process next operation in queue if any
  if (authOperationQueue.length > 0) {
    // Sort queue by priority (higher first) then by timestamp (older first)
    authOperationQueue.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority; // Higher priority first
      }
      return a.timestamp - b.timestamp; // Older first
    });
    
    const nextOperation = authOperationQueue.shift();
    if (nextOperation) {
      setTimeout(() => {
        if (isAuthOperationInProgress) {
          console.warn(`Lock already acquired when processing queue. Requeuing ${nextOperation.name}`);
          authOperationQueue.unshift(nextOperation);
          return;
        }
        
        isAuthOperationInProgress = true;
        lastOperationTime = Date.now();
        lockHolder = nextOperation.name;
        
        nextOperation.operation().catch(() => {
          // Ensure lock is released even if operation fails
          releaseAuthLock();
        });
      }, 10); // Small delay to ensure clean state
    }
  }
}

/**
 * Execute an operation with retry logic
 */
async function executeWithRetry<T>(
  operation: () => Promise<T>, 
  operationName: string
): Promise<T> {
  let lastError: Error | null = null;
  
  // If this operation has timed out before, use higher initial backoff
  const hasTimedOutBefore = timedOutOperations.has(operationName);
  const initialBackoff = hasTimedOutBefore ? CONFIG.RETRY_DELAY_BASE * 2 : 0;
  
  for (let attempt = 0; attempt <= CONFIG.MAX_RETRY_COUNT; attempt++) {
    try {
      // If not first attempt or has timed out before, add delay with exponential backoff
      if (attempt > 0 || hasTimedOutBefore) {
        const delay = hasTimedOutBefore && attempt === 0 
          ? initialBackoff 
          : getRetryDelay(attempt - 1);
          
        console.log(`${hasTimedOutBefore ? 'Previously timed out operation' : 'Retrying'} ${operationName} (attempt ${attempt}/${CONFIG.MAX_RETRY_COUNT}) after ${delay}ms`);
        await sleep(delay);
      }
      
      // Execute the operation
      const result = await operation();
      
      // If succeeded and previously timed out, remove from timed out set
      if (hasTimedOutBefore) {
        timedOutOperations.delete(operationName);
      }
      
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      lastError = error instanceof Error ? error : new Error(errorMsg);
      
      // Only retry if it's a lock-related error
      const isLockError = 
        errorMsg.includes('lock') || 
        errorMsg.includes('concurrent') ||
        errorMsg.includes('_loadSession') ||
        errorMsg.includes('429'); // Rate limit errors
      
      if (!isLockError || attempt >= CONFIG.MAX_RETRY_COUNT) {
        break;
      }
      
      console.warn(`Auth lock error in ${operationName}: ${errorMsg}`);
    }
  }
  
  throw lastError || new Error(`Operation ${operationName} failed after ${CONFIG.MAX_RETRY_COUNT} retries`);
}

/**
 * Direct session check that bypasses locks for emergency situations
 * This should be used very sparingly, and only when regular methods are failing
 */
async function directSessionCheck() {
  try {
    const now = Date.now();
    
    // Generate a unique request ID for this check
    const requestId = `direct-${now}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Check if we already have a fresh session in cache
    if (sessionCache.session && (now - sessionCache.timestamp < CONFIG.SESSION_CACHE_TIME)) {
      return { 
        data: { session: sessionCache.session }, 
        error: null 
      };
    }
    
    // Check if we already have a pending direct check in progress
    if (pendingDirectChecks.promise && (now - pendingDirectChecks.timestamp < 1000)) {
      // Reuse the existing promise to avoid multiple simultaneous direct checks
      return pendingDirectChecks.promise;
    }
    
    // Create a new direct check promise
    const checkPromise = (async () => {
      try {
        // Always try localStorage check first as it's faster
        const tokenKey = Object.keys(localStorage).find(key => 
          key.startsWith('sb-') && key.includes('-auth-token')
        );
        
        if (tokenKey) {
          try {
            const tokenData = JSON.parse(localStorage.getItem(tokenKey) || '{}');
            // If we have an active token, use it immediately
            if (tokenData?.access_token) {
              // Check for expiry
              const isExpired = tokenData.expires_at && 
                tokenData.expires_at * 1000 < Date.now();
                
              if (!isExpired) {
                // Extract user info from token if available
                let userId = 'pending';
                let email = '';
                
                // Check for user details in localStorage first (most reliable)
                const storedUserId = localStorage.getItem('akii-auth-user-id');
                const storedEmail = localStorage.getItem('akii-auth-user-email');
                
                if (storedUserId) {
                  userId = storedUserId;
                  email = storedEmail || '';
                } else {
                  // Try to extract user info from JWT if possible
                  try {
                    const tokenParts = tokenData.access_token.split('.');
                    if (tokenParts.length === 3) {
                      const tokenPayload = JSON.parse(atob(tokenParts[1]));
                      if (tokenPayload.sub) {
                        userId = tokenPayload.sub;
                        email = tokenPayload.email || '';
                        
                        // Store for future use
                        localStorage.setItem('akii-auth-user-id', userId);
                        if (email) localStorage.setItem('akii-auth-user-email', email);
                      }
                    }
                  } catch (e) {
                    console.warn('Could not parse JWT token:', e);
                  }
                }
                
                // Also check if this user is admin directly in the DB
                try {
                  // Create a minimal session with the user ID to use right away
                  console.log(`Direct session check (${requestId}) using token from localStorage with user ID: ${userId}`);
                  
                  // We'll determine if user is admin and set the appropriate user data
                  // in the component that uses this session
                  return { 
                    data: { 
                      session: { 
                        access_token: tokenData.access_token,
                        refresh_token: tokenData.refresh_token,
                        // Create a full session object with more complete user data
                        user: { 
                          id: userId,
                          email: email,
                          app_metadata: {},
                          user_metadata: {},
                          aud: 'authenticated',
                          created_at: ''
                        },
                        expires_at: tokenData.expires_at
                      } 
                    }, 
                    error: null 
                  };
                } catch (e) {
                  console.warn("Error creating session object:", e);
                  throw e;
                }
              }
            }
          } catch (e) {
            // Continue with API call if token parsing fails
          }
        }
        
        // Use a timeout promise as fallback
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error('Direct session check timed out after 3s'));
          }, 3000);
        });
        
        // Make direct Supabase call
        const sessionPromise = supabase.auth.getSession()
          .then(result => {
            // Cache successful results
            if (result?.data?.session) {
              sessionCache.session = result.data.session;
              sessionCache.timestamp = Date.now();
            }
            return result;
          })
          .catch(err => {
            console.warn(`Direct session check (${requestId}) failed with error:`, err);
            throw err;
          });
        
        // Race against timeout
        try {
          const result = await Promise.race([sessionPromise, timeoutPromise]);
          return result;
        } catch (raceError) {
          // If timeout won the race and we found a token earlier, use it as fallback
          if (raceError.message?.includes('timed out') && tokenKey) {
            try {
              const tokenData = JSON.parse(localStorage.getItem(tokenKey) || '{}');
              if (tokenData?.access_token) {
                // Extract user info from token if available
                let userId = 'pending';
                let email = '';
                
                // Check for user details in localStorage first (most reliable)
                const storedUserId = localStorage.getItem('akii-auth-user-id');
                const storedEmail = localStorage.getItem('akii-auth-user-email');
                
                if (storedUserId) {
                  userId = storedUserId;
                  email = storedEmail || '';
                } else {
                  // Try to extract user info from JWT if possible
                  try {
                    const tokenParts = tokenData.access_token.split('.');
                    if (tokenParts.length === 3) {
                      const tokenPayload = JSON.parse(atob(tokenParts[1]));
                      if (tokenPayload.sub) {
                        userId = tokenPayload.sub;
                        email = tokenPayload.email || '';
                        
                        // Store for future use
                        localStorage.setItem('akii-auth-user-id', userId);
                        if (email) localStorage.setItem('akii-auth-user-email', email);
                      }
                    }
                  } catch (e) {
                    console.warn('Could not parse JWT token:', e);
                  }
                }
                
                console.log(`Direct session check (${requestId}) using token from localStorage after timeout with user ID: ${userId}`);
                return { 
                  data: { 
                    session: { 
                      access_token: tokenData.access_token,
                      refresh_token: tokenData.refresh_token,
                      // Create more complete session object
                      user: { 
                        id: userId,
                        email: email,
                        app_metadata: {},
                        user_metadata: {},
                        aud: 'authenticated',
                        created_at: ''
                      },
                      expires_at: tokenData.expires_at
                    } 
                  }, 
                  error: null 
                };
              }
            } catch (e) {
              // Continue to error case
            }
          }
          
          // Standard error case
          throw raceError;
        }
      } finally {
        // Always clear the pending promise reference when done
        setTimeout(() => {
          if (pendingDirectChecks.promise === checkPromise) {
            pendingDirectChecks.promise = null;
          }
        }, 100);
      }
    })();
    
    // Store the promise for reuse
    pendingDirectChecks.promise = checkPromise;
    pendingDirectChecks.timestamp = now;
    
    return checkPromise;
  } catch (error) {
    // Provide structured error response
    console.warn('Direct session check failed:', error instanceof Error ? error.message : String(error));
    return { 
      data: { session: null },
      error: error instanceof Error ? error : new Error('Unknown error in direct session check')
    };
  }
}

/**
 * Wraps auth operations in a queue to prevent concurrent operations
 * which can cause the session locking errors with Supabase
 */
export async function withAuthLock<T>(
  operation: () => Promise<T>,
  operationName = 'auth-operation'
): Promise<T> {
  // Auto-release lock if it's been held too long
  const now = Date.now();
  if (isAuthOperationInProgress && (now - lastOperationTime > CONFIG.LOCK_TIMEOUT)) {
    // Only log if it's been significantly over the timeout to reduce console spam
    if (now - lastOperationTime > CONFIG.LOCK_TIMEOUT * 1.5) {
      console.warn(`Auth lock timeout detected (held by ${lockHolder}), forcing release`);
    }
    releaseAuthLock();
  }

  // If too many timeouts have occurred recently, force a full reset
  if (consecutiveTimeouts > 3) {
    console.warn('Too many consecutive timeouts detected, forcing emergency session reset');
    emergencySessionReset();
    consecutiveTimeouts = 0;
  }

  // If queue is getting too large, clear it to prevent memory issues
  if (authOperationQueue.length > CONFIG.MAX_QUEUE_LENGTH) {
    console.warn(`Auth operation queue too large (${authOperationQueue.length}), clearing oldest items`);
    // Keep only the most recent operations and prioritize critical ones
    authOperationQueue = authOperationQueue
      .sort((a, b) => {
        if (a.priority !== b.priority) return b.priority - a.priority;
        return b.timestamp - a.timestamp; // Keep newest
      })
      .slice(0, Math.floor(CONFIG.MAX_QUEUE_LENGTH / 2));
  }

  // Set priority based on operation type
  const isPriority = CONFIG.CRITICAL_OPS.includes(operationName);
  const priority = isPriority ? 10 : 0;

  // Special case for getSession - use cached result if available and recent
  if (operationName === 'getSession' && sessionCache.session && (now - sessionCache.timestamp < CONFIG.SESSION_CACHE_TIME)) {
    // For repeated getSession calls within a short timeframe, return cached result
    // Only log occasionally to reduce console spam
    if (sessionCache.requestCount % 10 === 0) {
      console.debug('Using cached session result');
    }
    sessionCache.requestCount++;
    return Promise.resolve({ data: { session: sessionCache.session }, error: null }) as Promise<T>;
  }
  
  // If no operation in progress, execute immediately
  if (!isAuthOperationInProgress) {
    isAuthOperationInProgress = true;
    lastOperationTime = Date.now();
    lockHolder = operationName;
    
    try {
      const result = await executeWithRetry(operation, operationName);
      
      // Cache session results
      if (operationName === 'getSession') {
        const typedResult = result as any;
        if (typedResult?.data?.session) {
          sessionCache.session = typedResult.data.session;
          sessionCache.timestamp = Date.now();
          sessionCache.requestCount = 0;
        }
      }
      
      return result;
    } catch (error) {
      // If operation throws, ensure we release lock
      console.error(`Auth operation ${operationName} failed:`, error);
      throw error;
    } finally {
      releaseAuthLock();
    }
  }
  
  // Special case for getSession to reduce queue contention
  if (operationName === 'getSession') {
    // Counter to limit log spam - only log every Nth call
    sessionCache.requestCount++;
    const shouldLog = sessionCache.requestCount % 10 === 0;
    
    // If another getSession is in progress or queued, use direct approach
    if (lockHolder === 'getSession' || authOperationQueue.some(op => op.name === 'getSession')) {
      // Limit log messages to reduce console spam
      if (shouldLog) {
        console.debug('Multiple getSession calls detected, sharing result');
      }
      
      try {
        // Use our dedicated direct session check function
        return directSessionCheck() as Promise<T>;
      } catch (directError) {
        if (shouldLog) {
          console.warn('Direct session fetch failed:', directError);
        }
        // Fall through to normal queueing if direct fetch fails
      }
    }
  }
  
  // Otherwise queue the operation with a timeout
  return new Promise((resolve, reject) => {
    // Set a timeout for queued operations
    const queueTimeoutId = setTimeout(() => {
      // Remove the operation from the queue if it's still there
      const index = authOperationQueue.findIndex(op => op.operation === queuedOperation);
      if (index !== -1) {
        authOperationQueue.splice(index, 1);
        
        // Track this operation as having timed out for smarter future handling
        timedOutOperations.add(operationName);
        consecutiveTimeouts++;
        
        const timeoutError = new Error(`Auth operation ${operationName} timed out in queue after ${CONFIG.QUEUE_TIMEOUT}ms`);
        console.error(`Queue timeout for ${operationName}:`, timeoutError);
        
        // For getSession operations that timeout, try emergency reset
        if (operationName === 'getSession') {
          try {
            console.warn('Attempting emergency session reset due to getSession timeout');
            emergencySessionReset();
          } catch (resetError) {
            console.error('Emergency reset also failed:', resetError);
          }
        }
        
        reject(timeoutError);
      }
    }, CONFIG.QUEUE_TIMEOUT);
    
    const queuedOperation = async () => {
      clearTimeout(queueTimeoutId);
      isAuthOperationInProgress = true;
      lastOperationTime = Date.now();
      lockHolder = operationName;
      
      try {
        const result = await executeWithRetry(operation, operationName);
        consecutiveTimeouts = 0; // Reset timeout counter on success
        
        // Cache session results
        if (operationName === 'getSession') {
          const typedResult = result as any;
          if (typedResult?.data?.session) {
            sessionCache.session = typedResult.data.session;
            sessionCache.timestamp = Date.now();
          }
        }
        
        resolve(result);
      } catch (error) {
        reject(error);
      } finally {
        releaseAuthLock();
      }
    };
    
    // Add operation to queue with priority information
    authOperationQueue.push({
      operation: queuedOperation,
      name: operationName,
      priority: priority,
      timestamp: Date.now()
    });
  });
}

// Type definitions
interface UserResponse {
  data: {
    user: User | null;
  };
  error: Error | null;
}

interface SessionResponse {
  data: {
    session: Session | null;
  };
  error: Error | null;
}

/**
 * Get the current session with lock protection
 */
export async function getSessionSafely(): Promise<SessionResponse> {
  try {
    return await withAuthLock(() => supabase.auth.getSession(), 'getSession');
  } catch (error) {
    console.error('Error in getSessionSafely:', error);
    
    // If session operation keeps failing, return a standard error response
    return {
      data: { session: null },
      error: error instanceof Error ? error : new Error(String(error))
    };
  }
}

/**
 * Safe method to get user with proper lock handling
 */
export async function getUserSafely(): Promise<UserResponse> {
  return await withAuthLock(async () => {
    try {
      // Use proper session checking first
      const sessionResult = await supabase.auth.getSession();
      if (!sessionResult.data.session) {
        return { data: { user: null }, error: null };
      }
      
      // Now get the user with confidence that session exists
      const result = await supabase.auth.getUser();
      return {
        data: { user: result.data.user },
        error: result.error
      };
    } catch (error) {
      // Don't log AuthSessionMissingError as it's expected in many cases
      if (!isAuthSessionMissingError(error)) {
        console.error('Error in getUserSafely:', error);
      }
      
      return {
        data: { user: null },
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  }, 'getUserSafely');
}

/**
 * Sign out with lock protection
 */
export async function signOutSafely(options?: { scope?: 'global' | 'local' | 'others' }) {
  try {
    return await withAuthLock(() => supabase.auth.signOut(options), 'signOut');
  } catch (error) {
    console.error('Error in signOutSafely:', error);
    return { error: error instanceof Error ? error : new Error(String(error)) };
  }
}

/**
 * Sign in with email/password with lock protection
 */
export async function signInWithEmailSafely(email: string, password: string) {
  try {
    return await withAuthLock(
      () => supabase.auth.signInWithPassword({ email, password }),
      'signInWithEmail'
    );
  } catch (error) {
    console.error('Error in signInWithEmailSafely:', error);
    return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
}

/**
 * Sign up with email/password with lock protection
 */
export async function signUpSafely(email: string, password: string, options?: Record<string, any>) {
  try {
    return await withAuthLock(
      () => supabase.auth.signUp({ 
        email, 
        password, 
        options: options || {} 
      }),
      'signUp'
    );
  } catch (error) {
    console.error('Error in signUpSafely:', error);
    return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
}

/**
 * Clear any auth locks
 */
export function clearAuthLocks() {
  console.log('Auth locks cleared');
  
  // Clear the lock state
  isAuthOperationInProgress = false;
  lockHolder = 'none';
  
  // Clear queued operations to prevent stale operations from executing
  const queueLength = authOperationQueue.length;
  authOperationQueue = [];
  
  if (queueLength > 0) {
    console.warn(`Cleared ${queueLength} queued auth operations`);
  }
  
  // Reset the auto-release timer
  stopAutoReleaseTimer();
  startAutoReleaseTimer();
  
  return { cleared: true, queueLength };
}

/**
 * Get the current state of the lock system
 */
export function getAuthLockStatus() {
  return {
    isLocked: isAuthOperationInProgress,
    lockHolder,
    queueLength: authOperationQueue.length,
    lockHeldDuration: isAuthOperationInProgress ? Date.now() - lastOperationTime : 0,
    timedOutOperationCount: timedOutOperations.size,
    timedOutOperations: Array.from(timedOutOperations)
  };
}

/**
 * Emergency reset for auth session
 * This is a last resort when other methods fail
 */
export function emergencySessionReset() {
  console.warn('Performing emergency session reset');
  
  // Log diagnostic information to help debug the issue
  console.info('Auth lock diagnostic information:');
  console.info('- Current lock holder:', lockHolder);
  console.info('- Lock held for:', Date.now() - lastOperationTime, 'ms');
  console.info('- Queue length:', authOperationQueue.length);
  console.info('- Consecutive timeouts:', consecutiveTimeouts);
  console.info('- Session cache age:', Date.now() - sessionCache.timestamp, 'ms');
  
  // Try to collect browser performance metrics
  if (typeof window !== 'undefined' && window.performance) {
    try {
      const navTiming = window.performance.timing;
      console.info('Performance metrics:');
      console.info('- Network latency:', navTiming.responseEnd - navTiming.requestStart, 'ms');
      console.info('- DOM load time:', navTiming.domComplete - navTiming.domLoading, 'ms');
    } catch (e) {
      console.warn('Could not collect performance metrics:', e);
    }
  }
  
  // Try to collect network status
  if (typeof navigator !== 'undefined') {
    try {
      // Check if navigator.connection exists (not standard in all browsers)
      const connection = (navigator as any).connection;
      if (connection) {
        console.info('Network information:');
        console.info('- Effective connection type:', connection.effectiveType);
        console.info('- Downlink:', connection.downlink, 'Mbps');
        console.info('- Round trip time:', connection.rtt, 'ms');
      }
    } catch (e) {
      console.warn('Could not collect network information:', e);
    }
  }
  
  try {
    // First clear any locks
    isAuthOperationInProgress = false;
    lockHolder = 'none';
    
    // Clear the queue
    authOperationQueue = [];
    
    // Reset timedout operations
    timedOutOperations.clear();
    consecutiveTimeouts = 0;
    
    // Reset the session cache
    sessionCache = {
      session: null,
      timestamp: 0,
      pendingPromise: null,
      requestCount: 0
    };
    
    // Reset the pending direct checks
    pendingDirectChecks.promise = null;
    pendingDirectChecks.timestamp = 0;
    
    // Force reset the supabase js client
    if (typeof window !== 'undefined') {
      try {
        console.log('Attempting to reset supabase auth instance');
        supabase.auth.initialize();
      } catch (e) {
        console.error('Error resetting supabase auth instance:', e);
      }
    }
    
    console.log('Emergency session reset completed');
    
    // Restart the auto-release timer
    stopAutoReleaseTimer();
    startAutoReleaseTimer();
  } catch (e) {
    console.error('Error in emergency session reset:', e);
  }
}

// Cleanup function to be called when the app is shutting down
export function cleanupAuthLocks() {
  stopAutoReleaseTimer();
  clearAuthLocks();
}

// Add cleanup event listener
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', cleanupAuthLocks);
}

/**
 * Force a new session check - use in rare cases where you need 
 * to bypass the queue and get the current session
 */
export async function forceSessionCheck(): Promise<{
  data: { session: Session | null };
  error: Error | null;
}> {
  console.log('Forcing direct session check');
  
  try {
    // Use a timeout promise to ensure we don't wait forever
    const timeoutPromise = new Promise<{
      data: { session: Session | null };
      error: Error;
    }>((resolve) => {
      setTimeout(() => {
        resolve({
          data: { session: null },
          error: new Error('Session check timed out')
        });
      }, 3000); // 3 second timeout
    });
    
    // Attempt to directly get session
    const sessionPromise = directSessionCheck();
    
    // Race the actual request against the timeout
    const result = await Promise.race([sessionPromise, timeoutPromise]);
    
    return result;
  } catch (error) {
    // Don't log AuthSessionMissingError as it's expected in many cases
    if (!isAuthSessionMissingError(error)) {
      console.error('Error in forceSessionCheck:', error);
    }
    
    return {
      data: { session: null },
      error: error instanceof Error ? error : new Error(String(error))
    };
  }
}

/**
 * Force a direct user check - use in rare cases where you need 
 * to bypass the queue and get the current user
 */
export async function forceUserCheck(): Promise<{
  data: { user: User | null };
  error: Error | null;
}> {
  console.log('Forcing direct user check');
  
  try {
    // First try to get a valid session
    const sessionResult = await forceSessionCheck();
    if (!sessionResult.data.session) {
      return {
        data: { user: null },
        error: new Error('No valid session found')
      };
    }

    // Try to get user directly from Supabase
    const { data, error } = await supabase.auth.getUser();
    
    // If we have a valid user, return it
    if (!error && data?.user) {
      return { data, error: null };
    }
    
    // If direct method failed but we have a session, create a fallback user from session
    if (sessionResult.data.session) {
      console.log('Using fallback user extraction from session token');
      const session = sessionResult.data.session;
      
      // Extract user ID from session
      const userId = session.user?.id;
      
      if (userId) {
        // Create minimal user object from session data
        const fallbackUser: User = {
          id: userId,
          email: session.user?.email || '',
          app_metadata: session.user?.app_metadata || {},
          user_metadata: session.user?.user_metadata || {},
          aud: 'authenticated',
          created_at: ''
        };
        
        // Store user info in localStorage for emergency recovery
        try {
          localStorage.setItem('akii-auth-user-id', userId);
          if (session.user?.email) {
            localStorage.setItem('akii-auth-user-email', session.user.email);
          }
        } catch (e) {
          console.warn('Could not store user info in localStorage:', e);
        }
        
        return {
          data: { user: fallbackUser },
          error: null
        };
      }
    }
    
    // No valid user could be found or created
    return {
      data: { user: null },
      error: error || new Error('Failed to get user')
    };
  } catch (error) {
    console.error('Error in forceUserCheck:', error);
    
    return {
      data: { user: null },
      error: error instanceof Error ? error : new Error(String(error))
    };
  }
}

export default {
  withAuthLock,
  getSessionSafely,
  getUserSafely,
  signOutSafely,
  signInWithEmailSafely,
  signUpSafely,
  clearAuthLocks,
  getAuthLockStatus,
  emergencySessionReset,
  cleanupAuthLocks,
  forceSessionCheck,
  forceUserCheck
}; 