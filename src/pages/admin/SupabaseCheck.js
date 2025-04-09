var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/UnifiedAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
const EDGE_FUNCTIONS = [
    { name: 'health-check', description: 'Basic health check endpoint' },
    { name: 'super-action', description: 'Configuration and admin actions' },
    { name: 'chat', description: 'Chat functionality' },
    { name: 'stripe-webhook', description: 'Stripe payment webhook handler' }
];
export default function SupabaseCheck() {
    const { user } = useAuth();
    const [logs, setLogs] = useState([]);
    const [serviceResults, setServiceResults] = useState([]);
    const [isRunningTests, setIsRunningTests] = useState(false);
    const [selectedTab, setSelectedTab] = useState("dashboard");
    const [errorMessage, setErrorMessage] = useState(null);
    const [progress, setProgress] = useState(0);
    const [testHistory, setTestHistory] = useState([]);
    const [storageStatus, setStorageStatus] = useState({ status: "idle", message: "Click to check Storage" });
    const [databaseStatus, setDatabaseStatus] = useState({ status: "idle", message: "Click to check Database" });
    const [functionsStatus, setFunctionsStatus] = useState({ status: "idle", message: "Click to check Functions" });
    const [environmentVars, setEnvironmentVars] = useState({});
    const [configVars, setConfigVars] = useState({});
    const [configData, setConfigData] = useState(null);
    const [functionLogs, setFunctionLogs] = useState([]);
    const [functionInvocations, setFunctionInvocations] = useState([]);
    const [selectedFunction, setSelectedFunction] = useState('');
    const [isLoadingLogs, setIsLoadingLogs] = useState(false);
    // Function to add logs with type
    const addLog = (message, type = "info") => {
        setLogs(prev => [...prev, { message, type }]);
    };
    // Function to update a service check result
    const updateServiceResult = (result) => {
        setServiceResults(prev => {
            const existing = prev.findIndex(r => r.name === result.name);
            if (existing >= 0) {
                const newResults = [...prev];
                newResults[existing] = result;
                return newResults;
            }
            return [...prev, result];
        });
    };
    // Function to run all tests
    const runAllTests = () => __awaiter(this, void 0, void 0, function* () {
        try {
            setIsRunningTests(true);
            setLogs([]);
            setServiceResults([]);
            setErrorMessage(null);
            setProgress(0);
            addLog("Starting Supabase diagnostic tests...", "info");
            const totalSteps = 6; // Including edge functions test
            let currentStep = 0;
            // FIRST STEP: Check super-action edge function
            try {
                yield Promise.race([
                    checkSuperAction(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error("Super-action check timed out")), 15000))
                ]);
                currentStep++;
                setProgress((currentStep / totalSteps) * 100);
            }
            catch (error) {
                addLog(`Super-action check failed: ${error instanceof Error ? error.message : String(error)}`, "error");
                currentStep++;
                setProgress((currentStep / totalSteps) * 100);
            }
            // Run remaining tests in sequence
            const tests = [checkAuth, checkDatabase, checkStorage, checkEdgeFunctions];
            for (const test of tests) {
                try {
                    yield Promise.race([
                        test(),
                        new Promise((_, reject) => setTimeout(() => reject(new Error(`${test.name} timed out after 10 seconds`)), 10000))
                    ]);
                }
                catch (error) {
                    addLog(`${test.name} failed: ${error instanceof Error ? error.message : String(error)}`, "error");
                }
                currentStep++;
                setProgress((currentStep / totalSteps) * 100);
            }
            // Record test history
            const failedServices = serviceResults
                .filter(result => result.status === "error")
                .map(result => result.name);
            setTestHistory(prev => [{
                    timestamp: new Date().toISOString(),
                    success: failedServices.length === 0,
                    failedServices
                }, ...prev.slice(0, 9)]);
            addLog("All tests completed.", "info");
        }
        catch (e) {
            const errorMsg = e instanceof Error ? e.message : String(e);
            setErrorMessage(`Error running tests: ${errorMsg}`);
            addLog(`Error running tests: ${errorMsg}`, "error");
        }
        finally {
            setIsRunningTests(false);
        }
    });
    // Function to check Supabase auth
    const checkAuth = () => __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const startTime = performance.now();
        const name = "Authentication Service";
        updateServiceResult({
            name,
            status: "pending",
            message: "Checking authentication service...",
            timestamp: new Date().toISOString()
        });
        try {
            addLog(`Testing Supabase authentication service...`, "info");
            // First, check if we can reach the Supabase URL at all
            try {
                // Try to use super-action config first, then fall back to env vars
                let supabaseUrl = '';
                let supabaseKey = '';
                // Check if we got values from super-action
                if (((_a = window.__configData) === null || _a === void 0 ? void 0 : _a.variables) && ((_b = configVars['SUPABASE_URL']) === null || _b === void 0 ? void 0 : _b.success) && ((_c = configVars['SUPABASE_ANON_KEY']) === null || _c === void 0 ? void 0 : _c.success)) {
                    supabaseUrl = window.__configData.variables['SUPABASE_URL'];
                    supabaseKey = window.__configData.variables['SUPABASE_ANON_KEY'];
                    addLog(`Using Supabase configuration from super-action`, "info");
                }
                else {
                    // Fall back to environment variables
                    supabaseUrl = typeof import.meta !== 'undefined' && import.meta.env
                        ? import.meta.env.VITE_SUPABASE_URL || ''
                        : '';
                    supabaseKey = typeof import.meta !== 'undefined' && import.meta.env
                        ? import.meta.env.VITE_SUPABASE_ANON_KEY || ''
                        : '';
                    addLog(`Using Supabase configuration from environment variables`, "info");
                }
                if (!supabaseUrl) {
                    throw new Error("Missing Supabase URL in configuration");
                }
                if (!supabaseKey) {
                    throw new Error("Missing Supabase Anon Key in configuration");
                }
                // Check if domain is reachable with a simple fetch - INCLUDE AUTHORIZATION HEADER
                addLog(`Checking connectivity to Supabase Auth API...`, "info");
                const checkResponse = yield fetch(`${supabaseUrl}/auth/v1/`, {
                    method: 'HEAD',
                    mode: 'cors',
                    cache: 'no-cache',
                    credentials: 'omit',
                    headers: {
                        'apikey': supabaseKey,
                        'Authorization': `Bearer ${supabaseKey}`
                    },
                    signal: AbortSignal.timeout(5000) // 5 second timeout
                });
                if (checkResponse.status === 401) {
                    addLog(`⚠️ Supabase Auth API returned 401 Unauthorized. API key is invalid or not correctly configured.`, "error");
                    throw new Error("API key authentication failed (401 Unauthorized)");
                }
                else if (!checkResponse.ok) {
                    addLog(`⚠️ Supabase Auth API returned status ${checkResponse.status}`, "error");
                    throw new Error(`Auth API returned status ${checkResponse.status}`);
                }
                addLog(`✅ Supabase Auth API is reachable (status: ${checkResponse.status})`, "success");
            }
            catch (connError) {
                const errorMessage = connError instanceof Error ? connError.message : String(connError);
                addLog(`❌ Failed to reach Supabase Auth API: ${errorMessage}`, "error");
                if (errorMessage.includes("401")) {
                    addLog(`🔑 Authentication Error: Your API key is invalid or not properly configured.`, "error");
                    addLog(`🔑 Check your VITE_SUPABASE_ANON_KEY in .env and .env.local files.`, "error");
                    addLog(`🔑 Ensure you're using the correct anon key from your Supabase dashboard.`, "error");
                }
                throw new Error(`Cannot connect to Auth API: ${errorMessage}`);
            }
            // Test the session endpoint
            const { data: sessionData, error: sessionError } = yield supabase.auth.getSession();
            if (sessionError) {
                throw sessionError;
            }
            addLog(`Session data retrieved successfully`, "success");
            addLog(`Session status: ${(sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) ? 'Active' : 'No active session'}`, "info");
            // Try to get user
            const { data: userData, error: userError } = yield supabase.auth.getUser();
            if (userError) {
                throw userError;
            }
            const responseTime = Math.round(performance.now() - startTime);
            addLog(`User data retrieved successfully in ${responseTime}ms`, "success");
            const message = userData.user
                ? `Authentication working - logged in as ${userData.user.email}`
                : "Authentication working - not logged in";
            updateServiceResult({
                name,
                status: "success",
                message,
                details: JSON.stringify({
                    session: (sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) ? 'Active' : 'None',
                    user: userData.user ? userData.user.email : 'Not logged in',
                }, null, 2),
                responseTime,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            const responseTime = Math.round(performance.now() - startTime);
            const errorMessage = error instanceof Error ? error.message : String(error);
            addLog(`Authentication check failed: ${errorMessage}`, "error");
            // Add specific troubleshooting guidance based on error type
            let troubleshooting = "";
            if (errorMessage.includes("timeout") || errorMessage.includes("NetworkError")) {
                troubleshooting = `
          Possible network connectivity issues:
          - Check your internet connection
          - Verify Supabase URL is correct (check Environment tab)
          - Check if Supabase service is running
          - Try disabling VPN or proxy if using one
        `;
            }
            else if (errorMessage.includes("401") || errorMessage.includes("Unauthorized")) {
                troubleshooting = `
          Authorization issues:
          - Anon key may be invalid or expired
          - Check the VITE_SUPABASE_ANON_KEY in your .env file
          - Verify credentials in the Supabase dashboard
        `;
            }
            else if (errorMessage.includes("CORS")) {
                troubleshooting = `
          CORS issues:
          - Add your application URL to allowed origins in Supabase dashboard
          - Check browser console for specific CORS errors
        `;
            }
            addLog(`Troubleshooting suggestions: ${troubleshooting}`, "info");
            updateServiceResult({
                name,
                status: "error",
                message: `Authentication error: ${errorMessage}`,
                details: troubleshooting,
                responseTime,
                timestamp: new Date().toISOString()
            });
        }
    });
    // Initialize logs with Supabase client info
    useEffect(() => {
        // Log Supabase configuration status
        try {
            // Check for environment variables
            let supabaseUrl = '';
            let supabaseKey = '';
            let supabaseServiceKey = '';
            // Try to access env vars safely - Vite/Next.js env
            if (typeof import.meta !== 'undefined' && import.meta.env) {
                supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
                supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
                supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY || '';
            }
            // Check window.ENV as fallback
            if (typeof window !== 'undefined' && window.ENV) {
                supabaseUrl = supabaseUrl || window.ENV.VITE_SUPABASE_URL || window.ENV.SUPABASE_URL || '';
                supabaseKey = supabaseKey || window.ENV.VITE_SUPABASE_ANON_KEY || window.ENV.SUPABASE_ANON_KEY || '';
                supabaseServiceKey = supabaseServiceKey || window.ENV.VITE_SUPABASE_SERVICE_KEY || window.ENV.SUPABASE_SERVICE_KEY || '';
            }
            // Process.env (Next.js) - will not be accessible in browser
            if (typeof process !== 'undefined' && process.env) {
                supabaseUrl = supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
                supabaseKey = supabaseKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
            }
            // Store env vars for display
            setEnvironmentVars({
                VITE_SUPABASE_URL: supabaseUrl || 'Not found',
                VITE_SUPABASE_ANON_KEY: supabaseKey ? (supabaseKey.substring(0, 10) + '...') : 'Not found',
                VITE_SUPABASE_SERVICE_KEY: supabaseServiceKey ? (supabaseServiceKey.substring(0, 10) + '...') : 'Not found',
                RUNTIME_ENV: typeof window !== 'undefined' ? 'Browser' : 'Server',
                WINDOW_ENV_AVAILABLE: typeof window !== 'undefined' && window.ENV ? 'Yes' : 'No',
            });
            addLog(`Using Supabase client from application singleton`, "info");
            if (supabaseUrl) {
                addLog(`Found Supabase URL in environment: ${supabaseUrl}`, "info");
            }
            else {
                addLog(`⚠️ Warning: Could not detect Supabase URL from environment variables`, "warning");
            }
            if (supabaseKey) {
                addLog(`Found Supabase Anon Key in environment (masked): ${supabaseKey.substring(0, 10)}...`, "info");
            }
            else {
                addLog(`⚠️ Warning: Could not detect Supabase Anon Key from environment variables`, "warning");
            }
        }
        catch (error) {
            addLog(`Error checking Supabase configuration: ${error instanceof Error ? error.message : String(error)}`, "error");
        }
    }, []);
    // Check storage service
    const checkStorage = () => __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const startTime = performance.now();
        const name = "Storage Service";
        setStorageStatus({ status: "loading", message: "Checking Supabase Storage..." });
        addLog("Testing Supabase Storage service...", "info");
        updateServiceResult({
            name,
            status: "pending",
            message: "Checking storage service...",
            timestamp: new Date().toISOString()
        });
        try {
            // First check connectivity to the storage API endpoint
            try {
                // Try to use super-action config first, then fall back to env vars
                let supabaseUrl = '';
                let supabaseKey = '';
                // Check if we got values from super-action
                if (((_a = window.__configData) === null || _a === void 0 ? void 0 : _a.variables) && ((_b = configVars['SUPABASE_URL']) === null || _b === void 0 ? void 0 : _b.success) && ((_c = configVars['SUPABASE_ANON_KEY']) === null || _c === void 0 ? void 0 : _c.success)) {
                    supabaseUrl = window.__configData.variables['SUPABASE_URL'];
                    supabaseKey = window.__configData.variables['SUPABASE_ANON_KEY'];
                    addLog(`Using Supabase configuration from super-action`, "info");
                }
                else {
                    // Fall back to environment variables
                    supabaseUrl = typeof import.meta !== 'undefined' && import.meta.env
                        ? import.meta.env.VITE_SUPABASE_URL || ''
                        : '';
                    supabaseKey = typeof import.meta !== 'undefined' && import.meta.env
                        ? import.meta.env.VITE_SUPABASE_ANON_KEY || ''
                        : '';
                    addLog(`Using Supabase configuration from environment variables`, "info");
                }
                if (!supabaseUrl) {
                    throw new Error("Missing Supabase URL in configuration");
                }
                if (!supabaseKey) {
                    throw new Error("Missing Supabase Anon Key in configuration");
                }
                // Check if storage endpoint is reachable - INCLUDE AUTHORIZATION HEADER
                addLog(`Checking connectivity to storage endpoint`, "info");
                const checkResponse = yield fetch(`${supabaseUrl}/storage/v1/`, {
                    method: 'HEAD',
                    mode: 'cors',
                    credentials: 'omit',
                    headers: {
                        'apikey': supabaseKey,
                        'Authorization': `Bearer ${supabaseKey}`
                    },
                    signal: AbortSignal.timeout(5000) // 5 second timeout
                });
                // For storage, 404 might mean the service isn't enabled
                if (checkResponse.status === 404) {
                    addLog(`⚠️ Storage API returned 404 Not Found. The Storage service may not be enabled for this project.`, "warning");
                    throw new Error("Storage service not found (404) - Service may not be enabled");
                }
                else if (checkResponse.status === 401) {
                    addLog(`⚠️ Storage API returned 401 Unauthorized. API key is invalid or not correctly configured.`, "error");
                    throw new Error("API key authentication failed (401 Unauthorized)");
                }
                else if (!checkResponse.ok) {
                    addLog(`⚠️ Storage API returned status ${checkResponse.status}`, "error");
                    throw new Error(`Storage API returned status ${checkResponse.status}`);
                }
                addLog(`✅ Storage endpoint is reachable`, "success");
            }
            catch (connError) {
                const errorMessage = connError instanceof Error ? connError.message : String(connError);
                addLog(`❌ Failed to reach storage endpoint: ${errorMessage}`, "error");
                if (errorMessage.includes("404")) {
                    addLog(`📂 Storage Service Error: The Storage service might not be enabled for this project.`, "warning");
                    addLog(`📂 Enable Storage in your Supabase dashboard if you need this service.`, "info");
                }
                else if (errorMessage.includes("401")) {
                    addLog(`🔑 Authentication Error: Your API key is invalid or not properly configured.`, "error");
                    addLog(`🔑 Check your VITE_SUPABASE_ANON_KEY in .env and .env.local files.`, "error");
                }
                throw new Error(`Cannot reach storage endpoint: ${errorMessage}`);
            }
            // Add timeout protection
            const { data, error } = yield Promise.race([
                supabase.storage.listBuckets(),
                new Promise((_, reject) => setTimeout(() => reject(new Error("Storage request timed out")), 8000))
            ]);
            if (error)
                throw error;
            const bucketCount = (data === null || data === void 0 ? void 0 : data.length) || 0;
            const responseTime = Math.round(performance.now() - startTime);
            addLog(`✅ Successfully connected to Supabase Storage - Found ${bucketCount} buckets in ${responseTime}ms`, "success");
            addLog(bucketCount > 0
                ? `Buckets: ${data.map((b) => b.name).join(', ')}`
                : 'No storage buckets found', "info");
            setStorageStatus({
                status: "success",
                message: `Storage service is working (${bucketCount} buckets)`,
            });
            updateServiceResult({
                name,
                status: "success",
                message: `Storage service is working`,
                details: JSON.stringify({
                    bucketCount,
                    buckets: data ? data.map((b) => b.name) : []
                }, null, 2),
                responseTime,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            const responseTime = Math.round(performance.now() - startTime);
            const errorMessage = error instanceof Error ? error.message : String(error);
            addLog(`❌ Storage service error: ${errorMessage}`, "error");
            // Add troubleshooting guidance
            let troubleshooting = "";
            if (errorMessage.includes("timeout")) {
                troubleshooting = `
          Storage service timeout:
          - Check network connectivity to Supabase
          - Verify the storage service is enabled in Supabase dashboard
          - Storage might be under heavy load
          - Check if your IP is allowed in Supabase network restrictions
        `;
            }
            else if (errorMessage.includes("permission") || errorMessage.includes("403")) {
                troubleshooting = `
          Storage permission issues:
          - Anon key might not have access to storage
          - Check storage permissions in Supabase dashboard
          - You might need to create a bucket first
        `;
            }
            else if (errorMessage.includes("not enabled") || errorMessage.includes("404")) {
                troubleshooting = `
          Storage service might not be enabled:
          - Enable the Storage service in your Supabase dashboard
          - Create at least one bucket
        `;
            }
            addLog(`Troubleshooting suggestions: ${troubleshooting}`, "info");
            setStorageStatus({
                status: "error",
                message: `Storage error: ${errorMessage.substring(0, 50)}${errorMessage.length > 50 ? '...' : ''}`,
            });
            updateServiceResult({
                name,
                status: "error",
                message: `Storage error: ${errorMessage}`,
                details: troubleshooting,
                responseTime,
                timestamp: new Date().toISOString()
            });
        }
    });
    // Check database service
    const checkDatabase = () => __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const startTime = performance.now();
        const name = "Database Service";
        setDatabaseStatus({ status: "loading", message: "Checking Supabase Database..." });
        addLog("Testing Supabase Database service...", "info");
        updateServiceResult({
            name,
            status: "pending",
            message: "Checking database service...",
            timestamp: new Date().toISOString()
        });
        try {
            // First check connectivity to the REST API endpoint
            try {
                // Try to use super-action config first, then fall back to env vars
                let supabaseUrl = '';
                let supabaseKey = '';
                // Check if we got values from super-action
                if (((_a = window.__configData) === null || _a === void 0 ? void 0 : _a.variables) && ((_b = configVars['SUPABASE_URL']) === null || _b === void 0 ? void 0 : _b.success) && ((_c = configVars['SUPABASE_ANON_KEY']) === null || _c === void 0 ? void 0 : _c.success)) {
                    supabaseUrl = window.__configData.variables['SUPABASE_URL'];
                    supabaseKey = window.__configData.variables['SUPABASE_ANON_KEY'];
                    addLog(`Using Supabase configuration from super-action`, "info");
                }
                else {
                    // Fall back to environment variables
                    supabaseUrl = typeof import.meta !== 'undefined' && import.meta.env
                        ? import.meta.env.VITE_SUPABASE_URL || ''
                        : '';
                    supabaseKey = typeof import.meta !== 'undefined' && import.meta.env
                        ? import.meta.env.VITE_SUPABASE_ANON_KEY || ''
                        : '';
                    addLog(`Using Supabase configuration from environment variables`, "info");
                }
                if (!supabaseUrl) {
                    throw new Error("Missing Supabase URL in configuration");
                }
                if (!supabaseKey) {
                    throw new Error("Missing Supabase Anon Key in configuration");
                }
                // Check if database endpoint is reachable - INCLUDE AUTHORIZATION HEADER
                addLog(`Checking connectivity to database REST endpoint`, "info");
                const checkResponse = yield fetch(`${supabaseUrl}/rest/v1/`, {
                    method: 'HEAD',
                    mode: 'cors',
                    credentials: 'omit',
                    headers: {
                        'apikey': supabaseKey,
                        'Authorization': `Bearer ${supabaseKey}`
                    },
                    signal: AbortSignal.timeout(5000) // 5 second timeout
                });
                if (checkResponse.status === 401) {
                    addLog(`⚠️ Supabase REST API returned 401 Unauthorized. API key is invalid or not correctly configured.`, "error");
                    throw new Error("API key authentication failed (401 Unauthorized)");
                }
                else if (!checkResponse.ok) {
                    addLog(`⚠️ Supabase REST API returned status ${checkResponse.status}`, "error");
                    throw new Error(`REST API returned status ${checkResponse.status}`);
                }
                addLog(`✅ Database REST endpoint is reachable`, "success");
            }
            catch (connError) {
                const errorMessage = connError instanceof Error ? connError.message : String(connError);
                addLog(`❌ Failed to reach database REST endpoint: ${errorMessage}`, "error");
                if (errorMessage.includes("401")) {
                    addLog(`🔑 Authentication Error: Your API key is invalid or not properly configured.`, "error");
                    addLog(`🔑 Check your VITE_SUPABASE_ANON_KEY in .env and .env.local files.`, "error");
                    addLog(`🔑 Ensure you're using the correct anon key from your Supabase dashboard.`, "error");
                }
                throw new Error(`Cannot reach database REST endpoint: ${errorMessage}`);
            }
            // Try a simple query against the profiles table
            addLog(`Attempting to query profiles table...`, "info");
            const { data, error, count } = yield Promise.race([
                supabase.from('profiles').select('*', { count: 'exact' }).limit(1),
                new Promise((_, reject) => setTimeout(() => reject(new Error("Database request timed out")), 8000))
            ]);
            if (error)
                throw error;
            const responseTime = Math.round(performance.now() - startTime);
            addLog(`✅ Successfully queried profiles table in ${responseTime}ms`, "success");
            addLog(`Retrieved ${count || 0} profiles`, "info");
            setDatabaseStatus({
                status: "success",
                message: `Database is working (${count || 0} profiles)`,
            });
            updateServiceResult({
                name,
                status: "success",
                message: `Database service is working`,
                details: JSON.stringify({
                    profileCount: count || 0,
                    sample: data && data.length > 0 ? {
                        id: data[0].id,
                        hasFields: Object.keys(data[0])
                    } : 'No profiles found'
                }, null, 2),
                responseTime,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            const responseTime = Math.round(performance.now() - startTime);
            const errorMessage = error instanceof Error ? error.message : String(error);
            addLog(`❌ Database service error: ${errorMessage}`, "error");
            // Add troubleshooting guidance
            let troubleshooting = "";
            if (errorMessage.includes("timeout")) {
                troubleshooting = `
          The database query timed out:
          - Check network connectivity to Supabase
          - Verify the database is online in Supabase dashboard
          - Database might be under heavy load or experiencing issues
          - Check if your IP is allowed in Supabase network restrictions
        `;
            }
            else if (errorMessage.includes("permission denied") || errorMessage.includes("403")) {
                troubleshooting = `
          Permission issues:
          - Anon key might not have access to the profiles table
          - Check RLS (Row Level Security) policies in Supabase dashboard
          - Verify the user has proper permissions
        `;
            }
            else if (errorMessage.includes("not found") || errorMessage.includes("404")) {
                troubleshooting = `
          Table not found:
          - The 'profiles' table might not exist in your database
          - Check your schema in the Supabase dashboard
          - Migration might be needed to create the table
        `;
            }
            addLog(`Troubleshooting suggestions: ${troubleshooting}`, "info");
            setDatabaseStatus({
                status: "error",
                message: `Database error: ${errorMessage.substring(0, 50)}${errorMessage.length > 50 ? '...' : ''}`,
            });
            updateServiceResult({
                name,
                status: "error",
                message: `Database error: ${errorMessage}`,
                details: troubleshooting,
                responseTime,
                timestamp: new Date().toISOString()
            });
        }
    });
    // Check functions service
    const checkFunctions = () => __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f;
        const startTime = performance.now();
        const name = "Edge Functions Service";
        setFunctionsStatus({ status: "loading", message: "Checking Edge Functions..." });
        addLog("Testing Supabase Edge Functions service...", "info");
        updateServiceResult({
            name,
            status: "pending",
            message: "Checking edge functions service...",
            timestamp: new Date().toISOString()
        });
        try {
            // First check connectivity to the functions API endpoint
            try {
                // Try to use super-action config first, then fall back to env vars
                let supabaseApiUrl = '';
                let supabaseApiKey = '';
                // Check if we got values from super-action
                if (((_a = window.__configData) === null || _a === void 0 ? void 0 : _a.variables) && ((_b = configVars['SUPABASE_URL']) === null || _b === void 0 ? void 0 : _b.success) && ((_c = configVars['SUPABASE_ANON_KEY']) === null || _c === void 0 ? void 0 : _c.success)) {
                    supabaseApiUrl = window.__configData.variables['SUPABASE_URL'];
                    supabaseApiKey = window.__configData.variables['SUPABASE_ANON_KEY'];
                }
                else {
                    // Fall back to environment variables
                    supabaseApiUrl = typeof import.meta !== 'undefined' && import.meta.env
                        ? import.meta.env.VITE_SUPABASE_URL || ''
                        : '';
                    supabaseApiKey = typeof import.meta !== 'undefined' && import.meta.env
                        ? import.meta.env.VITE_SUPABASE_ANON_KEY || ''
                        : '';
                }
                // Check if functions endpoint is reachable - INCLUDE AUTHORIZATION HEADER
                addLog(`Checking connectivity to functions endpoint`, "info");
                const checkResponse = yield fetch(`${supabaseApiUrl}/functions/v1/`, {
                    method: 'HEAD',
                    mode: 'cors',
                    credentials: 'omit',
                    headers: {
                        'apikey': supabaseApiKey,
                        'Authorization': `Bearer ${supabaseApiKey}`
                    },
                    signal: AbortSignal.timeout(5000) // 5 second timeout
                });
                // For functions, 404 is common if no functions are deployed
                if (checkResponse.status === 404) {
                    addLog(`⚠️ Functions API returned 404 Not Found. This is normal if no functions are deployed.`, "warning");
                    // We'll continue to test a specific function anyway
                }
                else if (checkResponse.status === 401) {
                    addLog(`⚠️ Functions API returned 401 Unauthorized. API key is invalid or not correctly configured.`, "error");
                    throw new Error("API key authentication failed (401 Unauthorized)");
                }
                else if (!checkResponse.ok && checkResponse.status !== 404) {
                    addLog(`⚠️ Functions API returned status ${checkResponse.status}`, "error");
                    throw new Error(`Functions API returned status ${checkResponse.status}`);
                }
                else {
                    addLog(`✅ Functions endpoint is reachable`, "success");
                }
            }
            catch (connError) {
                const errorMessage = connError instanceof Error ? connError.message : String(connError);
                addLog(`❌ Failed to reach functions endpoint: ${errorMessage}`, "error");
                if (errorMessage.includes("404")) {
                    addLog(`λ Edge Functions Note: The 404 error is normal if you haven't deployed any functions.`, "warning");
                    addLog(`λ You can safely ignore this error if you don't need Edge Functions.`, "info");
                }
                else if (errorMessage.includes("401")) {
                    addLog(`🔑 Authentication Error: Your API key is invalid or not properly configured.`, "error");
                    addLog(`🔑 Check your VITE_SUPABASE_ANON_KEY in .env and .env.local files.`, "error");
                }
                // For functions, we don't throw on 404 because it's expected
                if (!errorMessage.includes("404")) {
                    throw new Error(`Cannot reach functions endpoint: ${errorMessage}`);
                }
            }
            // Try to list available functions - this might not be supported via API
            // but we can still check if the endpoint responds
            const functionName = 'health-check'; // Try a common health check function name
            addLog(`Attempting to invoke function: ${functionName}`, "info");
            // Add timeout protection
            try {
                // Try to use super-action config first, then fall back to env vars
                let supabaseApiUrl = '';
                let supabaseApiKey = '';
                // Check if we got values from super-action
                if (((_d = window.__configData) === null || _d === void 0 ? void 0 : _d.variables) && ((_e = configVars['SUPABASE_URL']) === null || _e === void 0 ? void 0 : _e.success) && ((_f = configVars['SUPABASE_ANON_KEY']) === null || _f === void 0 ? void 0 : _f.success)) {
                    supabaseApiUrl = window.__configData.variables['SUPABASE_URL'];
                    supabaseApiKey = window.__configData.variables['SUPABASE_ANON_KEY'];
                    addLog(`Using Supabase configuration from super-action`, "info");
                }
                else {
                    // Fall back to environment variables
                    supabaseApiUrl = typeof import.meta !== 'undefined' && import.meta.env
                        ? import.meta.env.VITE_SUPABASE_URL || ''
                        : '';
                    supabaseApiKey = typeof import.meta !== 'undefined' && import.meta.env
                        ? import.meta.env.VITE_SUPABASE_ANON_KEY || ''
                        : '';
                    addLog(`Using Supabase configuration from environment variables`, "info");
                }
                // Construct the functions URL manually
                const functionsUrl = `${supabaseApiUrl}/functions/v1/${functionName}`;
                addLog(`Testing Edge Function URL: ${functionsUrl}`, "info");
                const response = yield Promise.race([
                    fetch(functionsUrl, {
                        headers: {
                            'apikey': supabaseApiKey,
                            'Authorization': `Bearer ${supabaseApiKey}`
                        }
                    }),
                    new Promise((_, reject) => setTimeout(() => reject(new Error("Edge function request timed out")), 8000))
                ]);
                const responseTime = Math.round(performance.now() - startTime);
                if (response.status === 404) {
                    addLog(`Function '${functionName}' does not exist. This is normal if you haven't created this function.`, "warning");
                    // Not finding the specific function is expected - we're mainly testing connectivity
                    setFunctionsStatus({
                        status: "success",
                        message: `Edge Functions endpoint is reachable, but '${functionName}' not found`,
                    });
                    updateServiceResult({
                        name,
                        status: "success",
                        message: `Edge Functions service is reachable`,
                        details: `The Edge Functions service is reachable, but the test function '${functionName}' was not found. This is normal if you haven't specifically created this function.`,
                        responseTime,
                        timestamp: new Date().toISOString()
                    });
                }
                else {
                    addLog(`✅ Successfully connected to function in ${responseTime}ms with status ${response.status}`, "success");
                    let functionResponse;
                    try {
                        functionResponse = yield response.text();
                    }
                    catch (e) {
                        functionResponse = `Could not parse response: ${e instanceof Error ? e.message : String(e)}`;
                    }
                    setFunctionsStatus({
                        status: "success",
                        message: `Edge Functions are working`,
                    });
                    updateServiceResult({
                        name,
                        status: "success",
                        message: `Edge Functions service is working`,
                        details: JSON.stringify({
                            status: response.status,
                            response: functionResponse.substring(0, 100) + (functionResponse.length > 100 ? '...' : '')
                        }, null, 2),
                        responseTime,
                        timestamp: new Date().toISOString()
                    });
                }
            }
            catch (error) {
                throw error;
            }
        }
        catch (error) {
            const responseTime = Math.round(performance.now() - startTime);
            const errorMessage = error instanceof Error ? error.message : String(error);
            addLog(`❌ Functions service error: ${errorMessage}`, "error");
            // Add troubleshooting guidance
            let troubleshooting = "";
            if (errorMessage.includes("timeout")) {
                troubleshooting = `
          Edge Functions timeout:
          - Check network connectivity to Supabase
          - Verify the Edge Functions service is enabled in Supabase dashboard
          - Function might be taking too long to respond
          - You may need to deploy at least one function
        `;
            }
            else if (errorMessage.includes("permission") || errorMessage.includes("403")) {
                troubleshooting = `
          Edge Functions permission issues:
          - Anon key might not have access to invoke functions
          - Check function permissions in Supabase dashboard
        `;
            }
            else if (errorMessage.includes("not found") || errorMessage.includes("404")) {
                troubleshooting = `
          Edge Functions might not be configured:
          - Deploy at least one function in your Supabase project
          - Check the function name used in the test
        `;
            }
            addLog(`Troubleshooting suggestions: ${troubleshooting}`, "info");
            setFunctionsStatus({
                status: "error",
                message: `Functions error: ${errorMessage.substring(0, 50)}${errorMessage.length > 50 ? '...' : ''}`,
            });
            updateServiceResult({
                name,
                status: "error",
                message: `Edge Functions error: ${errorMessage}`,
                details: troubleshooting,
                responseTime,
                timestamp: new Date().toISOString()
            });
        }
    });
    // Check super-action edge function to retrieve configuration
    const checkSuperAction = () => __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const startTime = performance.now();
        const name = "Configuration Variables";
        updateServiceResult({
            name,
            status: "pending",
            message: "Retrieving configuration from super-action...",
            timestamp: new Date().toISOString()
        });
        try {
            addLog(`Step 1: Checking super-action edge function for configuration variables`, "info");
            const superActionUrl = "https://injxxchotrvgvvzelhvj.supabase.co/functions/v1/super-action";
            addLog(`Fetching variables from ${superActionUrl}`, "info");
            // Get the anon key from environment variables
            const supabaseKey = typeof import.meta !== 'undefined' && import.meta.env
                ? import.meta.env.VITE_SUPABASE_ANON_KEY || ''
                : '';
            if (!supabaseKey) {
                addLog('⚠️ Warning: No Supabase anon key found in environment variables', "warning");
            }
            const response = yield Promise.race([
                fetch(superActionUrl, {
                    method: 'POST',
                    mode: 'cors',
                    credentials: 'omit',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'apikey': supabaseKey,
                        'Authorization': `Bearer ${supabaseKey}`
                    },
                    body: JSON.stringify({
                        action: 'get-config-variables',
                        auth: {
                            userId: (user === null || user === void 0 ? void 0 : user.id) || '',
                        }
                    })
                }),
                new Promise((_, reject) => setTimeout(() => reject(new Error("Super-action request timed out")), 10000))
            ]);
            if (!response.ok) {
                throw new Error(`Super-action returned status ${response.status} - ${response.statusText}`);
            }
            const data = yield response.json();
            if (!data || !data.success) {
                throw new Error(`Failed to retrieve configuration: ${(data === null || data === void 0 ? void 0 : data.error) || 'Unknown error'}`);
            }
            // Store the config data both in state and window for cross-function access
            setConfigData(data);
            if (typeof window !== 'undefined') {
                window.__configData = data;
            }
            addLog(`✅ Successfully connected to super-action edge function`, "success");
            // Process and display retrieved variables
            const varsList = [
                'SUPABASE_URL',
                'SUPABASE_ANON_KEY',
                'SUPABASE_SERVICE_ROLE_KEY',
                'SUPABASE_DB_URL',
                'AWS_REGION',
                'BEDROCK_API_KEY',
                'VITE_SUPABASE_ANON_KEY',
                'USE_REAL_AWS',
                'AWS_ACCESS_KEY_ID',
                'AWS_SECRET_ACCESS_KEY'
            ];
            const retrievedVars = {};
            let varCount = 0;
            varsList.forEach(varName => {
                const hasValue = data.variables && data.variables[varName] !== undefined;
                retrievedVars[varName] = {
                    value: hasValue ? maskSecret(data.variables[varName]) : 'Not found',
                    success: hasValue
                };
                if (hasValue) {
                    varCount++;
                    addLog(`✅ Retrieved ${varName} successfully`, "success");
                }
                else {
                    addLog(`❌ Could not retrieve ${varName}`, "error");
                }
            });
            setConfigVars(retrievedVars);
            const responseTime = Math.round(performance.now() - startTime);
            updateServiceResult({
                name,
                status: varCount > 0 ? "success" : "error",
                message: `Retrieved ${varCount}/${varsList.length} configuration variables`,
                details: JSON.stringify({
                    retrievedVars: Object.fromEntries(Object.entries(retrievedVars).map(([key, { value, success }]) => [key, success ? 'Retrieved' : 'Not found'])),
                    source: 'super-action edge function'
                }, null, 2),
                responseTime,
                timestamp: new Date().toISOString()
            });
            // If we got the Supabase URL and anon key, update our environment vars
            if (((_a = retrievedVars['SUPABASE_URL']) === null || _a === void 0 ? void 0 : _a.success) && ((_b = retrievedVars['SUPABASE_ANON_KEY']) === null || _b === void 0 ? void 0 : _b.success)) {
                addLog(`🔗 Using Supabase configuration from super-action for subsequent tests`, "info");
                // Store env vars for display
                setEnvironmentVars(prev => {
                    var _a;
                    return (Object.assign(Object.assign({}, prev), { SUPER_ACTION_VITE_SUPABASE_URL: retrievedVars['SUPABASE_URL'].value, SUPER_ACTION_VITE_SUPABASE_ANON_KEY: retrievedVars['SUPABASE_ANON_KEY'].value, SUPER_ACTION_VITE_SUPABASE_SERVICE_KEY: ((_a = retrievedVars['SUPABASE_SERVICE_ROLE_KEY']) === null || _a === void 0 ? void 0 : _a.value) || 'Not found' }));
                });
            }
        }
        catch (error) {
            const responseTime = Math.round(performance.now() - startTime);
            const errorMessage = error instanceof Error ? error.message : String(error);
            addLog(`❌ Super-action check failed: ${errorMessage}`, "error");
            updateServiceResult({
                name,
                status: "error",
                message: `Error retrieving configuration: ${errorMessage}`,
                details: `Unable to retrieve configuration variables from the super-action edge function. Ensure the function is deployed and accessible.`,
                responseTime,
                timestamp: new Date().toISOString()
            });
        }
    });
    // Helper function to mask secrets
    const maskSecret = (value) => {
        if (!value)
            return 'Not found';
        if (value.length <= 8)
            return '********';
        return `${value.slice(0, 4)}...${value.slice(-4)}`;
    };
    // Enhanced Edge Functions check
    const checkEdgeFunctions = () => __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const startTime = performance.now();
        const name = "Edge Functions Service";
        updateServiceResult({
            name,
            status: "pending",
            message: "Checking edge functions service...",
            timestamp: new Date().toISOString()
        });
        try {
            addLog("Testing Edge Functions service...", "info");
            // Get configuration
            let supabaseUrl = '';
            let supabaseKey = '';
            if (((_a = window.__configData) === null || _a === void 0 ? void 0 : _a.variables) && ((_b = configVars['SUPABASE_URL']) === null || _b === void 0 ? void 0 : _b.success) && ((_c = configVars['SUPABASE_ANON_KEY']) === null || _c === void 0 ? void 0 : _c.success)) {
                supabaseUrl = window.__configData.variables['SUPABASE_URL'];
                supabaseKey = window.__configData.variables['SUPABASE_ANON_KEY'];
                addLog("Using configuration from super-action", "info");
            }
            else {
                supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
                supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
                addLog("Using configuration from environment variables", "info");
            }
            if (!supabaseUrl || !supabaseKey) {
                throw new Error("Missing Supabase configuration");
            }
            // Test each edge function
            const functionResults = yield Promise.all(EDGE_FUNCTIONS.map((func) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const functionUrl = `${supabaseUrl}/functions/v1/${func.name}`;
                    addLog(`Testing ${func.name}...`, "info");
                    const response = yield fetch(functionUrl, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${supabaseKey}`,
                            'apikey': supabaseKey,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ action: 'health-check' })
                    });
                    if (!response.ok) {
                        return {
                            name: func.name,
                            status: response.status === 404 ? "warning" : "error",
                            message: `Status ${response.status}: ${response.statusText}`
                        };
                    }
                    const data = yield response.json();
                    return {
                        name: func.name,
                        status: "success",
                        message: "Function is operational",
                        details: JSON.stringify(data, null, 2)
                    };
                }
                catch (error) {
                    return {
                        name: func.name,
                        status: "error",
                        message: error instanceof Error ? error.message : String(error)
                    };
                }
            })));
            const responseTime = Math.round(performance.now() - startTime);
            const successCount = functionResults.filter(r => r.status === "success").length;
            const warningCount = functionResults.filter(r => r.status === "warning").length;
            const errorCount = functionResults.filter(r => r.status === "error").length;
            updateServiceResult({
                name,
                status: errorCount === functionResults.length ? "error" :
                    warningCount > 0 ? "warning" : "success",
                message: `${successCount} operational, ${warningCount} not deployed, ${errorCount} errors`,
                details: JSON.stringify(functionResults, null, 2),
                responseTime,
                timestamp: new Date().toISOString()
            });
            addLog(`Edge Functions check completed: ${successCount} operational, ${warningCount} not deployed, ${errorCount} errors`, errorCount > 0 ? "error" : warningCount > 0 ? "warning" : "success");
        }
        catch (error) {
            const responseTime = Math.round(performance.now() - startTime);
            const errorMessage = error instanceof Error ? error.message : String(error);
            addLog(`Edge Functions check failed: ${errorMessage}`, "error");
            updateServiceResult({
                name,
                status: "error",
                message: `Edge Functions error: ${errorMessage}`,
                responseTime,
                timestamp: new Date().toISOString()
            });
        }
    });
    // Add new function to fetch logs
    const fetchFunctionLogs = (functionName) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        setIsLoadingLogs(true);
        try {
            let supabaseUrl = '';
            let supabaseKey = '';
            if (((_a = window.__configData) === null || _a === void 0 ? void 0 : _a.variables) && ((_b = configVars['SUPABASE_URL']) === null || _b === void 0 ? void 0 : _b.success) && ((_c = configVars['SUPABASE_ANON_KEY']) === null || _c === void 0 ? void 0 : _c.success)) {
                supabaseUrl = window.__configData.variables['SUPABASE_URL'];
                supabaseKey = window.__configData.variables['SUPABASE_ANON_KEY'];
            }
            else {
                supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
                supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
            }
            if (!supabaseUrl || !supabaseKey) {
                throw new Error("Missing Supabase configuration");
            }
            // Fetch both logs and invocations
            const [logsResponse, invocationsResponse] = yield Promise.all([
                fetch(`${supabaseUrl}/functions/v1/${functionName}/logs`, {
                    headers: {
                        'Authorization': `Bearer ${supabaseKey}`,
                        'apikey': supabaseKey
                    }
                }),
                fetch(`${supabaseUrl}/functions/v1/${functionName}/invocations`, {
                    headers: {
                        'Authorization': `Bearer ${supabaseKey}`,
                        'apikey': supabaseKey
                    }
                })
            ]);
            if (!logsResponse.ok || !invocationsResponse.ok) {
                throw new Error(`Failed to fetch logs: ${logsResponse.status} ${invocationsResponse.status}`);
            }
            const logs = yield logsResponse.json();
            const invocations = yield invocationsResponse.json();
            setFunctionLogs(logs);
            setFunctionInvocations(invocations);
            addLog(`Retrieved ${logs.length} logs and ${invocations.length} invocations for ${functionName}`, "success");
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            addLog(`Failed to fetch function logs: ${errorMessage}`, "error");
        }
        finally {
            setIsLoadingLogs(false);
        }
    });
    return (_jsxs("div", { className: "container mx-auto p-4 space-y-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: "Supabase Configuration Diagnostics" }), _jsx(CardDescription, { children: "Check the status of your Supabase services and troubleshoot issues" })] }), _jsx(Badge, { variant: "outline", className: "ml-2", children: (user === null || user === void 0 ? void 0 : user.id) ? `User: ${user.id.slice(0, 8)}...` : 'Not logged in' })] }) }), _jsxs(CardContent, { children: [errorMessage && (_jsx(Alert, { variant: "destructive", className: "mb-4", children: _jsx(AlertDescription, { children: errorMessage }) })), _jsxs("div", { className: "flex items-center gap-4 mb-6", children: [_jsx(Button, { onClick: runAllTests, disabled: isRunningTests, size: "lg", className: "min-w-[200px]", children: isRunningTests ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Running Tests..."] })) : ("Run All Tests") }), isRunningTests && (_jsxs("div", { className: "flex-1", children: [_jsx(Progress, { value: progress, className: "h-2" }), _jsxs("p", { className: "text-sm text-muted-foreground mt-1", children: [Math.round(progress), "% complete"] })] }))] }), _jsxs(Tabs, { value: selectedTab, onValueChange: setSelectedTab, children: [_jsxs(TabsList, { className: "grid w-full grid-cols-5 mb-4", children: [_jsx(TabsTrigger, { value: "dashboard", children: "Dashboard" }), _jsx(TabsTrigger, { value: "logs", children: "System Logs" }), _jsx(TabsTrigger, { value: "function-logs", children: "Function Logs" }), _jsx(TabsTrigger, { value: "history", children: "History" }), _jsx(TabsTrigger, { value: "config", children: "Config" })] }), _jsx(TabsContent, { value: "dashboard", children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: serviceResults.map((result) => (_jsxs(Card, { className: cn("transition-shadow hover:shadow-md", result.status === "error" && "border-red-200", result.status === "warning" && "border-yellow-200", result.status === "success" && "border-green-200"), children: [_jsx(CardHeader, { className: "py-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [result.status === "success" && _jsx(CheckCircle2, { className: "h-4 w-4 text-green-500" }), result.status === "error" && _jsx(XCircle, { className: "h-4 w-4 text-red-500" }), result.status === "warning" && _jsx(AlertCircle, { className: "h-4 w-4 text-yellow-500" }), result.status === "pending" && _jsx(Loader2, { className: "h-4 w-4 animate-spin" }), result.name] }), _jsx(Badge, { variant: result.status === "success" ? "default" :
                                                                        result.status === "error" ? "destructive" :
                                                                            result.status === "warning" ? "outline" :
                                                                                "secondary", children: result.status === "pending" ? "Checking..." :
                                                                        result.status === "success" ? "Operational" :
                                                                            result.status === "warning" ? "Warning" :
                                                                                "Error" })] }) }), _jsxs(CardContent, { className: "py-2", children: [_jsx("p", { className: "text-sm mb-2", children: result.message }), result.responseTime && (_jsxs("p", { className: "text-xs text-muted-foreground", children: ["Response time: ", result.responseTime, "ms"] })), result.details && (_jsx(ScrollArea, { className: "mt-2 h-32", children: _jsx("pre", { className: "p-2 bg-muted rounded-md text-xs whitespace-pre-wrap", children: result.details }) }))] })] }, result.name))) }) }), _jsx(TabsContent, { value: "logs", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Diagnostic Logs" }) }), _jsx(CardContent, { children: _jsx(ScrollArea, { className: "h-[400px] w-full rounded-md border p-4", children: logs.map((log, i) => (_jsx("div", { className: cn("font-mono text-sm mb-1", log.type === "error" && "text-red-500", log.type === "success" && "text-green-500", log.type === "warning" && "text-yellow-500"), children: log.message }, i))) }) })] }) }), _jsx(TabsContent, { value: "function-logs", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Edge Function Logs" }), _jsx(CardDescription, { children: "View logs and invocations for deployed edge functions" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("select", { className: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", value: selectedFunction, onChange: (e) => {
                                                                            setSelectedFunction(e.target.value);
                                                                            if (e.target.value) {
                                                                                fetchFunctionLogs(e.target.value);
                                                                            }
                                                                        }, children: [_jsx("option", { value: "", children: "Select a function" }), EDGE_FUNCTIONS.map((func) => (_jsx("option", { value: func.name, children: func.name }, func.name)))] }), _jsx(Button, { variant: "outline", onClick: () => selectedFunction && fetchFunctionLogs(selectedFunction), disabled: !selectedFunction || isLoadingLogs, children: isLoadingLogs ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Loading..."] })) : ('Refresh Logs') })] }), _jsxs(Tabs, { defaultValue: "logs", className: "w-full", children: [_jsxs(TabsList, { children: [_jsx(TabsTrigger, { value: "logs", children: "Function Logs" }), _jsx(TabsTrigger, { value: "invocations", children: "Invocations" })] }), _jsx(TabsContent, { value: "logs", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-sm", children: "Log Events" }) }), _jsx(CardContent, { children: _jsx(ScrollArea, { className: "h-[400px] w-full rounded-md border", children: _jsx("div", { className: "p-4 space-y-2", children: functionLogs.length > 0 ? (functionLogs.map((log, index) => (_jsxs("div", { className: cn("p-2 rounded-md text-sm font-mono", log.level === "error" && "bg-red-50 text-red-700", log.level === "warn" && "bg-yellow-50 text-yellow-700", log.level === "info" && "bg-blue-50 text-blue-700"), children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-xs opacity-75", children: new Date(log.timestamp).toLocaleString() }), _jsx(Badge, { variant: log.level === "error" ? "destructive" :
                                                                                                                    log.level === "warn" ? "outline" :
                                                                                                                        "default", children: log.level })] }), _jsx("div", { className: "mt-1", children: log.message }), log.execution_time && (_jsxs("div", { className: "text-xs opacity-75 mt-1", children: ["Execution time: ", log.execution_time, "ms"] }))] }, index)))) : (_jsx("div", { className: "text-center text-muted-foreground py-8", children: isLoadingLogs ? (_jsxs("div", { className: "flex items-center justify-center gap-2", children: [_jsx(Loader2, { className: "h-4 w-4 animate-spin" }), "Loading logs..."] })) : (selectedFunction ? 'No logs found' : 'Select a function to view logs') })) }) }) })] }) }), _jsx(TabsContent, { value: "invocations", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-sm", children: "Recent Invocations" }) }), _jsx(CardContent, { children: _jsx(ScrollArea, { className: "h-[400px] w-full rounded-md border", children: _jsx("div", { className: "p-4 space-y-4", children: functionInvocations.length > 0 ? (functionInvocations.map((invocation) => (_jsxs(Card, { children: [_jsx(CardHeader, { className: "py-2", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: invocation.status_code >= 200 && invocation.status_code < 300 ? "default" :
                                                                                                                                invocation.status_code >= 400 ? "destructive" :
                                                                                                                                    "outline", children: invocation.status_code }), _jsx("span", { className: "text-sm font-mono", children: invocation.request.method })] }), _jsx("span", { className: "text-xs text-muted-foreground", children: new Date(invocation.timestamp).toLocaleString() })] }) }), _jsx(CardContent, { className: "py-2", children: _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium mb-1", children: "Request Headers" }), _jsx("pre", { className: "text-xs bg-muted p-2 rounded-md", children: JSON.stringify(invocation.request.headers, null, 2) })] }), invocation.request.body && (_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium mb-1", children: "Request Body" }), _jsx("pre", { className: "text-xs bg-muted p-2 rounded-md", children: JSON.stringify(invocation.request.body, null, 2) })] })), _jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium mb-1", children: "Response Headers" }), _jsx("pre", { className: "text-xs bg-muted p-2 rounded-md", children: JSON.stringify(invocation.response.headers, null, 2) })] }), invocation.response.body && (_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium mb-1", children: "Response Body" }), _jsx("pre", { className: "text-xs bg-muted p-2 rounded-md", children: JSON.stringify(invocation.response.body, null, 2) })] })), _jsxs("div", { className: "text-xs text-muted-foreground", children: ["Execution time: ", invocation.execution_time, "ms"] })] }) })] }, invocation.id)))) : (_jsx("div", { className: "text-center text-muted-foreground py-8", children: isLoadingLogs ? (_jsxs("div", { className: "flex items-center justify-center gap-2", children: [_jsx(Loader2, { className: "h-4 w-4 animate-spin" }), "Loading invocations..."] })) : (selectedFunction ? 'No invocations found' : 'Select a function to view invocations') })) }) }) })] }) })] })] }) })] }) }), _jsx(TabsContent, { value: "history", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Test History" }), _jsx(CardDescription, { children: "Recent diagnostic test results" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: testHistory.map((test, i) => (_jsxs("div", { className: "flex items-center justify-between p-4 rounded-lg bg-muted", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium", children: new Date(test.timestamp).toLocaleString() }), test.failedServices.length > 0 && (_jsxs("p", { className: "text-sm text-muted-foreground mt-1", children: ["Failed services: ", test.failedServices.join(", ")] }))] }), _jsx(Badge, { variant: test.success ? "default" : "destructive", children: test.success ? "All Passed" : `${test.failedServices.length} Failed` })] }, i))) }) })] }) }), _jsx(TabsContent, { value: "config", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Configuration" }), _jsx(CardDescription, { children: "Environment and configuration variables" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "rounded-lg border p-4", children: [_jsx("h3", { className: "text-sm font-medium mb-2", children: "API Configuration" }), _jsx("div", { className: "space-y-2", children: _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium", children: "Supabase URL" }), _jsx("p", { className: "text-sm font-mono text-muted-foreground break-all", children: maskSecret(environmentVars.VITE_SUPABASE_URL || '') })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium", children: "Anon Key" }), _jsx("p", { className: "text-sm font-mono text-muted-foreground break-all", children: maskSecret(environmentVars.VITE_SUPABASE_ANON_KEY || '') })] })] }) })] }), _jsxs("div", { className: "rounded-lg border p-4", children: [_jsx("h3", { className: "text-sm font-medium mb-2", children: "Edge Functions" }), _jsx("div", { className: "space-y-2", children: EDGE_FUNCTIONS.map((func) => {
                                                                            var _a;
                                                                            return (_jsxs("div", { className: "flex items-center justify-between py-2", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium", children: func.name }), _jsx("p", { className: "text-sm text-muted-foreground", children: func.description })] }), _jsx(Badge, { variant: "outline", children: ((_a = serviceResults.find(r => r.name === func.name)) === null || _a === void 0 ? void 0 : _a.status) || "Not tested" })] }, func.name));
                                                                        }) })] })] }) })] }) })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Quick Troubleshooting Guide" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("h3", { className: "text-sm font-medium", children: "Common Issues" }), _jsxs("ul", { className: "text-sm space-y-1", children: [_jsx("li", { children: "\u2022 401 Unauthorized: Check your API key configuration" }), _jsx("li", { children: "\u2022 404 Not Found: Service might not be enabled or deployed" }), _jsx("li", { children: "\u2022 CORS errors: Add your domain to allowed origins" }), _jsx("li", { children: "\u2022 Timeouts: Check network connectivity and service status" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("h3", { className: "text-sm font-medium", children: "Helpful Links" }), _jsxs("div", { className: "space-y-2", children: [_jsx(Button, { variant: "outline", size: "sm", className: "w-full justify-start", onClick: () => window.open('https://supabase.com/dashboard', '_blank'), children: "Open Supabase Dashboard" }), _jsx(Button, { variant: "outline", size: "sm", className: "w-full justify-start", onClick: () => window.open('https://supabase.com/docs', '_blank'), children: "View Documentation" })] })] })] }) })] })] }));
}
