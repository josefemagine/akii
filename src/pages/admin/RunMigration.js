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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { runMigration } from "@/lib/run-migration";
import { Loader2, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";
export default function RunMigration() {
    const [sql, setSql] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [result, setResult] = useState(null);
    const [isCheckingCredentials, setIsCheckingCredentials] = useState(false);
    const [credentialsStatus, setCredentialsStatus] = useState(null);
    const [availableMigrations, setAvailableMigrations] = useState([]);
    // Fetch available migrations on component mount
    useEffect(() => {
        const fetchMigrations = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch("/supabase/migrations/");
                if (response.ok) {
                    const data = yield response.json();
                    setAvailableMigrations(data.files || []);
                }
            }
            catch (error) {
                console.error("Error fetching migrations:", error);
            }
        });
        fetchMigrations();
        // Set project ID in UI for reference
        setCredentialsStatus((prev) => (Object.assign(Object.assign({}, prev), { projectInfo: {
                projectId: "injxxchotrvgvvzelhvj",
                timestamp: new Date().toISOString(),
            } })));
    }, []);
    const handleRunMigration = () => __awaiter(this, void 0, void 0, function* () {
        if (!sql.trim())
            return;
        setIsRunning(true);
        setResult(null);
        try {
            const { success, error } = yield runMigration(sql);
            if (success) {
                setResult({
                    success: true,
                    message: "Migration completed successfully",
                });
            }
            else {
                setResult({
                    success: false,
                    message: `Error: ${(error === null || error === void 0 ? void 0 : error.message) || "Unknown error"}`,
                });
            }
        }
        catch (error) {
            setResult({
                success: false,
                message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
            });
        }
        finally {
            setIsRunning(false);
        }
    });
    const checkCredentials = () => __awaiter(this, void 0, void 0, function* () {
        setIsCheckingCredentials(true);
        setCredentialsStatus(null);
        setResult(null);
        try {
            // First check if we can connect to Supabase directly
            const { data: directCheck, error: directError } = yield supabase
                .from("profiles")
                .select("count")
                .limit(1);
            if (directError) {
                console.error("Direct Supabase connection failed:", directError);
                // Continue with the edge function check even if direct check fails
            }
            else {
                console.log("Direct Supabase connection successful");
            }
            // Then check the edge function credentials
            const { data, error } = yield supabase.functions.invoke("check-credentials", {
                method: "POST",
            });
            if (error) {
                throw new Error(`Edge function error: ${error.message}`);
            }
            setCredentialsStatus(data);
            // If the connection test failed, show a more specific error
            if ((data === null || data === void 0 ? void 0 : data.connectionTest) && !data.connectionTest.working) {
                setResult({
                    success: false,
                    message: `Connection test failed with status ${data.connectionTest.status}. This may indicate permission issues.`,
                });
            }
            else if ((data === null || data === void 0 ? void 0 : data.status) === "success") {
                setResult({
                    success: true,
                    message: "Credentials check completed successfully.",
                });
            }
        }
        catch (error) {
            console.error("Credential check error:", error);
            setResult({
                success: false,
                message: `Credential check error: ${error instanceof Error ? error.message : String(error)}`,
            });
            // Try to get basic environment variable status even if the function fails
            try {
                const basicStatus = {
                    credentials: {
                        url: process.env.VITE_SUPABASE_URL
                            ? "Available in frontend"
                            : "Missing in frontend",
                        anonKey: process.env.VITE_SUPABASE_ANON_KEY
                            ? "Available in frontend"
                            : "Missing in frontend",
                        serviceKey: "Cannot check from frontend",
                        projectId: process.env.SUPABASE_PROJECT_ID
                            ? "Available"
                            : "Missing",
                    },
                };
                setCredentialsStatus(basicStatus);
            }
            catch (statusError) {
                console.error("Failed to get basic status:", statusError);
            }
        }
        finally {
            setIsCheckingCredentials(false);
        }
    });
    const handleFixMissingTables = () => __awaiter(this, void 0, void 0, function* () {
        // Read the SQL from the migration file
        const response = yield fetch("/supabase/migrations/20240607000001_fix_missing_tables.sql");
        const migrationSql = yield response.text();
        setSql(migrationSql);
    });
    const handleLoadCompletePermissionsFix = () => __awaiter(this, void 0, void 0, function* () {
        try {
            // Read the SQL from the complete permissions fix migration file
            const response = yield fetch("/supabase/migrations/20240608000004_fix_edge_function_permissions_complete.sql");
            if (response.ok) {
                const migrationSql = yield response.text();
                setSql(migrationSql);
                setResult({
                    success: true,
                    message: "Complete permissions fix loaded. Click 'Run Migration' to apply it.",
                });
            }
            else {
                throw new Error(`Failed to fetch migration file: ${response.status}`);
            }
        }
        catch (error) {
            console.error("Error loading migration file:", error);
            setResult({
                success: false,
                message: `Error loading migration file: ${error instanceof Error ? error.message : String(error)}`,
            });
        }
    });
    const handleFixEdgeFunctionPermissions = () => __awaiter(this, void 0, void 0, function* () {
        // Read the SQL from the migration file
        const response = yield fetch("/supabase/migrations/20240608000002_fix_edge_function_permissions.sql");
        const migrationSql = yield response.text();
        setSql(migrationSql);
    });
    return (_jsxs("div", { className: "container mx-auto py-6", children: [_jsxs(Card, { className: "w-full mb-6", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: "Check Supabase Credentials" }), _jsx(CardDescription, { children: "Verify that your Supabase credentials are properly configured for edge functions" })] }), _jsx("div", { className: "text-sm bg-muted px-3 py-1 rounded-md font-mono", children: "Project ID: injxxchotrvgvvzelhvj" })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx(Button, { onClick: checkCredentials, disabled: isCheckingCredentials, variant: "outline", className: "w-full md:w-auto", children: isCheckingCredentials ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Checking Credentials..."] })) : (_jsxs(_Fragment, { children: [_jsx(RefreshCw, { className: "mr-2 h-4 w-4" }), "Check Credentials"] })) }), _jsxs(Button, { onClick: handleLoadCompletePermissionsFix, variant: "secondary", className: "w-full md:w-auto", children: [_jsx(CheckCircle, { className: "mr-2 h-4 w-4" }), "Load Complete Permissions Fix"] }), _jsx(Button, { onClick: handleRunMigration, variant: "destructive", className: "w-full md:w-auto", disabled: isRunning || !sql.trim(), children: isRunning ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Applying Fix..."] })) : ("Apply Permissions Fix") })] }), credentialsStatus && (_jsxs("div", { className: "p-4 bg-green-50 border border-green-200 rounded-md", children: [_jsx("h3", { className: "text-sm font-medium text-green-800 mb-2", children: "Credential Check Result" }), _jsx("pre", { className: "text-xs text-green-700 whitespace-pre-wrap overflow-auto max-h-[300px]", children: JSON.stringify(credentialsStatus, null, 2) })] }))] }) })] }), _jsxs(Card, { className: "w-full", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Run Database Migration" }), _jsx(CardDescription, { children: "Execute SQL migrations directly from the admin panel" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx(Button, { variant: "outline", onClick: handleFixMissingTables, disabled: isRunning, children: "Load Fix Missing Tables Migration" }), _jsx(Button, { variant: "outline", onClick: handleFixEdgeFunctionPermissions, disabled: isRunning, children: "Load Edge Function Permissions Fix" })] }), _jsx(Textarea, { placeholder: "Enter SQL migration here...", className: "min-h-[300px] font-mono", value: sql, onChange: (e) => setSql(e.target.value), disabled: isRunning }), result && (_jsxs(Alert, { variant: result.success ? "default" : "destructive", children: [_jsx(AlertTitle, { children: result.success ? (_jsxs("div", { className: "flex items-center", children: [_jsx(CheckCircle, { className: "h-4 w-4 mr-2" }), "Success"] })) : (_jsxs("div", { className: "flex items-center", children: [_jsx(AlertCircle, { className: "h-4 w-4 mr-2" }), "Error"] })) }), _jsx(AlertDescription, { children: result.message })] }))] }) }), _jsx(CardFooter, { children: _jsx(Button, { onClick: handleRunMigration, disabled: isRunning || !sql.trim(), className: "w-full", children: isRunning ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Running Migration..."] })) : ("Run Migration") }) })] }), _jsxs(Card, { className: "my-4", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Available Migrations" }), _jsx(CardDescription, { children: "Select a migration to run" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: _jsx("div", { className: "border p-4 rounded-md hover:bg-gray-50 cursor-pointer", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium", children: "Subscription Tables" }), _jsx("p", { className: "text-sm text-gray-500", children: "Create tables for subscriptions, plans, payment methods, and invoices" })] }), _jsx(Button, { onClick: () => runMigration('20230501000000_create_subscription_tables.sql'), variant: "outline", children: "Run Migration" })] }) }) }) })] })] }));
}
