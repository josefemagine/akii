import React from "react";
interface request-lockProps {}

/**
 * Request Lock Utility
 *
 * Prevents multiple simultaneous requests for the same resource by
 * implementing a global request lock mechanism.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Track active requests
const activeRequests = {};
const timeoutIds = {};
/**
 * Execute a request with lock protection to prevent duplicate in-flight requests
 *
 * @param key Unique key identifying the request
 * @param requestFn Function that returns a promise for the request
 * @param lockTimeout Timeout in ms after which the lock is automatically released (default: 10000ms)
 * @param fallbackFn Optional function to call if the request times out
 */
export function withRequestLock(key_1, requestFn_1) {
    return __awaiter(this, arguments, void 0, function* (key, requestFn, lockTimeout = 10000, fallbackFn) {
        // If there's already a request in flight for this key, return that promise
        if (activeRequests[key]) {
            console.log(`[RequestLock] Using existing request for ${key}`);
            try {
                return yield activeRequests[key];
            }
            catch (error) {
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
        const wrappedPromise = (() => __awaiter(this, void 0, void 0, function* () {
            var _a;
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
                const result = yield requestPromise;
                // Clear the timeout
                if (timeoutIds[key]) {
                    clearTimeout(timeoutIds[key]);
                    delete timeoutIds[key];
                }
                // Clear the lock once the request completes successfully
                delete activeRequests[key];
                return result;
            }
            catch (error) {
                // Clear the timeout
                if (timeoutIds[key]) {
                    clearTimeout(timeoutIds[key]);
                    delete timeoutIds[key];
                }
                // Clear the lock on error
                delete activeRequests[key];
                // If we have a timeout error and fallback function, use it
                if (((_a = error.message) === null || _a === void 0 ? void 0 : _a.includes('timeout')) && fallbackFn) {
                    console.log(`[RequestLock] Request for ${key} timed out, using fallback`);
                    try {
                        return yield fallbackFn();
                    }
                    catch (fallbackError) {
                        console.log(`[RequestLock] Fallback for ${key} also failed:`, fallbackError);
                        throw fallbackError;
                    }
                }
                throw error;
            }
        }))();
        // Store the promise
        activeRequests[key] = wrappedPromise;
        return wrappedPromise;
    });
}
/**
 * Check if a request is currently locked
 */
export function isRequestLocked(key) {
    return key in activeRequests;
}
/**
 * Force release a request lock
 */
export function releaseRequestLock(key) {
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
export function clearAllRequestLocks() {
    Object.keys(activeRequests).forEach(key => {
        delete activeRequests[key];
        if (timeoutIds[key]) {
            clearTimeout(timeoutIds[key]);
            delete timeoutIds[key];
        }
    });
}
