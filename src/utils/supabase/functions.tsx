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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { createClient } from '@supabase/supabase-js';
// Get Supabase URL and anon key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
// Try to import the singleton client if available
let supabaseClient;
try {
    // Dynamic import to prevent circular dependencies
    const getOrCreateClient = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { default: supabase } = yield import('@/lib/supabase-singleton');
            return supabase;
        }
        catch (error) {
            console.warn('Could not import supabase singleton, creating local client:', error);
interface functionsProps {}

            return createClient(supabaseUrl, supabaseAnonKey);
        }
    });
    // Initialize the client
    getOrCreateClient().then(client => {
        supabaseClient = client;
    });
}
catch (error) {
    console.warn('Error initializing Supabase client, will create on demand:', error);
}
/**
 * Invokes a Supabase Edge Function
 * @param functionName Name of the edge function to call
 * @param payload Data to send to the function
 * @returns Promise resolving to the function's response data
 */
export function invokeServerFunction(functionName, payload) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!supabaseUrl || !supabaseAnonKey) {
            throw new Error('Missing Supabase configuration. Please check environment variables.');
        }
        // Get or create client if not already available
        const client = supabaseClient || createClient(supabaseUrl, supabaseAnonKey);
        try {
            console.log(`Invoking function: ${functionName}`, payload);
            // Call the edge function
            const { data, error } = yield client.functions.invoke(functionName, {
                body: payload,
            });
            if (error) {
                console.error(`Error calling ${functionName}:`, error);
                throw new Error(error.message || 'Error calling server function');
            }
            if ((data === null || data === void 0 ? void 0 : data.status) === 'error' && (data === null || data === void 0 ? void 0 : data.message)) {
                console.error(`Error response from ${functionName}:`, data.message);
                throw new Error(data.message);
            }
            // If the response follows the { status: 'ok', ...rest } pattern, return the rest
            if ((data === null || data === void 0 ? void 0 : data.status) === 'ok') {
                const { status } = data, rest = __rest(data, ["status"]);
                return rest;
            }
            return data;
        }
        catch (error) {
            console.error(`Error invoking function ${functionName}:`, error);
            throw error;
        }
    });
}
