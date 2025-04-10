import React from "react";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { toast } from "@/components/ui/use-toast.ts";
interface error-handlerProps {}

/**
 * A unified error handler for consistent error handling across components
 *
 * @param error The error object to handle
 * @param options Configuration options for error handling
 * @returns The error message extracted from the error
 */
export function handleError(error, options = {}) {
    const { title = "Error", fallbackMessage = "An unexpected error occurred", logToConsole = true, showToast = true, context = "" } = options;
    // Extract error message
    let errorMessage;
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    else if (typeof error === 'string') {
        errorMessage = error;
    }
    else if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
        errorMessage = error.message;
    }
    else {
        errorMessage = fallbackMessage;
    }
    // Log error to console if enabled
    if (logToConsole) {
        if (context) {
            console.error(`[${context}]`, error);
        }
        else {
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
export function withErrorHandling(fn, options = {}) {
    return (...args) => __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield fn(...args);
            return { data: result, error: null };
        }
        catch (error) {
            const errorMessage = handleError(error, options);
            return { data: null, error: errorMessage };
        }
    });
}
/**
 * Show a success toast notification
 *
 * @param title Title of the success message
 * @param description Description of the success message
 */
export function showSuccess(title, description) {
    toast({
        title,
        description,
    });
}
