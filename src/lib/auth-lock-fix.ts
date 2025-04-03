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
  LOCK_TIMEOUT: 2000,       // 2 seconds max lock time before forced release (reduced from 3s)
  MAX_RETRY_COUNT: 3,       // Maximum number of retries for auth operations
  RETRY_DELAY_BASE: 100,    // Base delay between retries in ms (reduced from 150ms)
  QUEUE_TIMEOUT: 5000,      // Maximum time an operation can wait in queue (reduced from 10000ms)
  AUTO_RELEASE_CHECK: 500,  // Check for stuck locks more frequently (reduced from 1000ms)
  CRITICAL_OPS: ['getSession', 'getCurrentUser', 'signOut'], // Critical operations that get priority
  SESSION_CACHE_TIME: 500,  // Time to cache session results in ms
  MAX_QUEUE_LENGTH: 10      // Maximum number of operations allowed in queue
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

// Start auto-release timer to periodically check for stuck locks
function startAutoReleaseTimer() {
  if (autoReleaseInterval === null) {
    autoReleaseInterval = window.setInterval(() => {
      // Only report if there are operations in progress or queued
      if (isAuthOperationInProgress || authOperationQueue.length > 0) {
        const lockHeldDuration = Date.now() - lastOperationTime;
        
        // Force release if the lock has been held too long
        if (isAuthOperationInProgress && lockHeldDuration > CONFIG.LOCK_TIMEOUT) {
          console.warn(`Auto-release: Auth lock held by ${lockHolder} for ${lockHeldDuration}ms, forcing release`);
          releaseAuthLock();
          
          // If we have many operations in queue, perform emergency reset
          if (authOperationQueue.length > 5 || consecutiveTimeouts > 2) {
            console.warn('Too many queued operations or consecutive timeouts, performing emergency reset');
            emergencySessionReset();
          }
        }
        
        // Log queue status periodically
        if (authOperationQueue.length > 0) {
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
        isAuthOperationInProgress = true;
        lastOperationTime = Date.now();
        lockHolder = nextOperation.name;
        
        nextOperation.operation().catch(() => {
          // Ensure lock is released even if operation fails
          releaseAuthLock();
        });
      }, 50); // Small delay to ensure clean state
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
 * Attempt a direct session check, bypassing queue
 * This should be used sparingly and only when necessary
 */
async function directSessionCheck() {
  try {
    // Return the result immediately if we already have a fresh session
    const now = Date.now();
    if (sessionCache.session && (now - sessionCache.timestamp < CONFIG.SESSION_CACHE_TIME)) {
      return { data: { session: sessionCache.session }, error: null };
    }
    
    // If there's already a pending promise, reuse it instead of creating a new one
    if (sessionCache.pendingPromise) {
      console.log('Reusing existing pending session request');
      return sessionCache.pendingPromise;
    }
    
    // Track this attempt
    sessionCache.requestCount++;
    
    // Create a new promise and cache it
    sessionCache.pendingPromise = (async () => {
      try {
        // Direct call to Supabase - intentionally bypassing our queue
        const result = await supabase.auth.getSession();
        
        // Cache the result for future requests
        if (result.data?.session) {
          sessionCache.session = result.data.session;
          sessionCache.timestamp = Date.now();
        }
        
        return result;
      } catch (error) {
        console.error('Error in direct session check:', error);
        return { data: { session: null }, error };
      } finally {
        // Clear the pending promise after a short delay to allow batching of near-simultaneous requests
        setTimeout(() => {
          sessionCache.pendingPromise = null;
          sessionCache.requestCount = 0;
        }, 50);
      }
    })();
    
    return sessionCache.pendingPromise;
  } catch (error) {
    console.error('Fatal error in directSessionCheck:', error);
    return { data: { session: null }, error };
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
    console.warn(`Auth lock timeout detected (held by ${lockHolder}), forcing release`);
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
    const shouldLog = sessionCache.requestCount % 10 === 0;
    
    // If another getSession is in progress or queued, use direct approach
    if (lockHolder === 'getSession' || authOperationQueue.some(op => op.name === 'getSession')) {
      // Limit log messages to reduce console spam
      if (shouldLog) {
        console.log('Multiple getSession calls detected, sharing result');
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
 * Get the current user with lock protection
 */
export async function getUserSafely(): Promise<UserResponse> {
  try {
    return await withAuthLock(() => supabase.auth.getUser(), 'getUser');
  } catch (error) {
    console.error('Error in getUserSafely:', error);
    
    // If user operation keeps failing, return a standard error response
    return {
      data: { user: null },
      error: error instanceof Error ? error : new Error(String(error))
    };
  }
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
 * Emergency session reset - clears all auth-related state
 * Use this when you're absolutely stuck
 */
export function emergencySessionReset() {
  // First clear any auth locks
  clearAuthLocks();
  
  // Clear all timed out operations
  timedOutOperations.clear();
  
  // Reset internal state completely
  isAuthOperationInProgress = false;
  lockHolder = 'none';
  lastOperationTime = 0;
  sessionCache = {
    session: null,
    timestamp: 0,
    pendingPromise: null,
    requestCount: 0
  };
  
  // Try to clear Supabase internal locks with a direct call to empty the session
  try {
    // Force-clear any internal Supabase lock states with a synchronous call
    // This bypasses our locking mechanism intentionally
    console.log('Forcing Supabase internal lock reset');
    setTimeout(() => {
      try {
        // Make a synchronous call to auth.getSession() to clear any internal locks
        supabase.auth.getSession().catch(e => {
          console.warn('Error during forced session check:', e);
        });
      } catch (e) {
        console.warn('Error during forced session check:', e);
      }
    }, 100);
  } catch (e) {
    console.warn('Error attempting to reset internal Supabase locks:', e);
  }
  
  // Try to clear any auth-related localStorage items
  try {
    // Find all localStorage keys related to auth
    const authKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.includes('supabase') || 
        key.includes('sb-') || 
        key.includes('auth') || 
        key.includes('token') ||
        key.includes('akii-auth') ||
        key.includes('_access_token') ||
        key.includes('_refresh_token')
      )) {
        authKeys.push(key);
      }
    }
    
    // Clear all auth-related keys
    if (authKeys.length > 0) {
      console.log(`Clearing ${authKeys.length} auth-related localStorage items`);
      authKeys.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.error(`Error removing localStorage key ${key}:`, e);
        }
      });
    }
  } catch (e) {
    console.error('Error clearing localStorage:', e);
  }
  
  // Force a reload of all auth listeners - done by dispatching a custom event
  // that auth providers might be listening for
  try {
    const resetEvent = new CustomEvent('akii:auth:reset', {
      detail: { timestamp: Date.now() }
    });
    window.dispatchEvent(resetEvent);
    console.log('Dispatched auth reset event');
  } catch (e) {
    console.error('Error dispatching auth reset event:', e);
  }
  
  console.log('Emergency session reset completed');
  
  return { success: true };
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
  // Clear locks first to ensure we can get a fresh state
  clearAuthLocks();
  
  try {
    // Make a direct call to Supabase bypassing our queue
    const result = await supabase.auth.getSession();
    return { 
      data: { session: result.data.session },
      error: result.error
    };
  } catch (error) {
    console.error('Error in forceSessionCheck:', error);
    return { 
      data: { session: null },
      error: error instanceof Error ? error : new Error(String(error))
    };
  }
}

/**
 * Force a new user check - use in rare cases where you need 
 * to bypass the queue and get the current user
 */
export async function forceUserCheck(): Promise<{
  data: { user: User | null };
  error: Error | null;
}> {
  // Clear locks first to ensure we can get a fresh state
  clearAuthLocks();
  
  try {
    // Make a direct call to Supabase bypassing our queue
    const result = await supabase.auth.getUser();
    return { 
      data: { user: result.data.user },
      error: result.error
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