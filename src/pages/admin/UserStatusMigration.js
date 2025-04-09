var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { toast } from "@/components/ui/use-toast";
import { AlertCircle, Check } from "lucide-react";
const UserStatusMigration = () => {
    const [loading, setLoading] = useState(false);
    const [migrationStatus, setMigrationStatus] = useState(null);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const addStatusColumn = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            setLoading(true);
            setMigrationStatus("Adding status column to profiles table...");
            setError(null);
            // Execute SQL to add the status column if it doesn't exist
            const { error: sqlError } = yield supabaseAdmin.rpc('execute_sql', {
                sql_query: `
          ALTER TABLE profiles
          ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' NOT NULL;
        `
            });
            if (sqlError) {
                console.error("Error adding status column:", sqlError);
                // Try using regular Supabase API if RPC fails
                // Note: This won't work with typical Supabase permissions, but let's try
                try {
                    setMigrationStatus("Attempting to update profiles using API...");
                    // First, let's check if any user has a status column
                    const { data: profiles, error: profilesError } = yield supabaseAdmin
                        .from('profiles')
                        .select('*')
                        .limit(1);
                    if (profilesError) {
                        throw profilesError;
                    }
                    // Check if status exists in the first profile
                    const hasStatus = profiles && profiles.length > 0 && 'status' in profiles[0];
                    if (!hasStatus) {
                        throw new Error("Cannot add column using API. Please run SQL manually in Supabase dashboard: ALTER TABLE profiles ADD COLUMN status VARCHAR(20) DEFAULT 'active' NOT NULL;");
                    }
                    else {
                        setMigrationStatus("Status column already exists in profiles table.");
                    }
                }
                catch (apiError) {
                    throw apiError;
                }
            }
            else {
                setMigrationStatus("Status column added successfully!");
            }
            // Now update all users to have an 'active' status if they don't have one
            setMigrationStatus("Updating existing users with default status...");
            const { error: updateError } = yield supabaseAdmin
                .from('profiles')
                .update({ status: 'active' })
                .is('status', null);
            if (updateError) {
                console.error("Error updating users with default status:", updateError);
                // This might fail for permissions reasons, but it's not critical
                setMigrationStatus("Warning: Could not update existing users. They will use the database default value.");
            }
            else {
                setMigrationStatus("Existing users updated with 'active' status successfully!");
            }
            setSuccess(true);
            toast({
                title: "Migration Successful",
                description: "Status column has been added to profiles table.",
            });
        }
        catch (err) {
            console.error("Error in migration:", err);
            setError(err instanceof Error ? err.message : String(err));
            setSuccess(false);
            toast({
                title: "Migration Failed",
                description: err instanceof Error ? err.message : String(err),
                variant: "destructive",
            });
        }
        finally {
            setLoading(false);
        }
    });
    const resetUserStatus = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            setLoading(true);
            setMigrationStatus("Resetting status for all users to 'active'...");
            setError(null);
            const { error: updateError } = yield supabaseAdmin
                .from('profiles')
                .update({ status: 'active' })
                .neq('status', 'active');
            if (updateError) {
                console.error("Error resetting user status:", updateError);
                throw updateError;
            }
            setMigrationStatus("All users have been reset to 'active' status!");
            setSuccess(true);
            toast({
                title: "Status Reset Successful",
                description: "All users now have 'active' status.",
            });
        }
        catch (err) {
            console.error("Error resetting status:", err);
            setError(err instanceof Error ? err.message : String(err));
            setSuccess(false);
            toast({
                title: "Reset Failed",
                description: err instanceof Error ? err.message : String(err),
                variant: "destructive",
            });
        }
        finally {
            setLoading(false);
        }
    });
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold", children: "User Status Migration" }), _jsx("p", { className: "text-muted-foreground mt-1", children: "Add status functionality to user profiles" })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Add Status Column to Profiles" }), _jsx(CardDescription, { children: "This will add a 'status' column to the profiles table in your database. Users can then be marked as active, inactive, or banned." })] }), _jsxs(CardContent, { className: "space-y-4", children: [migrationStatus && (_jsxs(Alert, { className: success ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800" : "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800", children: [success ? (_jsx(Check, { className: "h-4 w-4 text-green-600 dark:text-green-400" })) : (_jsx(AlertCircle, { className: "h-4 w-4 text-blue-600 dark:text-blue-400" })), _jsx(AlertDescription, { className: "text-sm", children: migrationStatus })] })), error && (_jsxs(Alert, { className: "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800", children: [_jsx(AlertCircle, { className: "h-4 w-4 text-red-600 dark:text-red-400" }), _jsxs(AlertDescription, { className: "text-sm", children: ["Error: ", error] })] })), _jsxs("div", { className: "space-y-2", children: [_jsx("p", { children: "This utility will perform the following:" }), _jsxs("ol", { className: "list-decimal pl-5 space-y-1", children: [_jsx("li", { children: "Add a 'status' column to the profiles table" }), _jsx("li", { children: "Set a default value of 'active' for the column" }), _jsx("li", { children: "Update existing users to have the 'active' status" })] })] }), _jsxs("div", { className: "bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md p-4", children: [_jsxs("p", { className: "text-sm text-amber-800 dark:text-amber-300", children: [_jsx("strong", { children: "Important:" }), " You need database administrator privileges to run this migration. If it fails, you may need to run the SQL command manually in the Supabase SQL editor."] }), _jsx("pre", { className: "mt-2 bg-black/10 dark:bg-white/10 p-2 rounded text-xs overflow-auto", children: "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' NOT NULL;" })] })] }), _jsxs(CardFooter, { className: "flex justify-between", children: [_jsx(Button, { variant: "outline", onClick: resetUserStatus, disabled: loading || !success, children: "Reset All Users to Active" }), _jsx(Button, { onClick: addStatusColumn, disabled: loading, children: loading ? "Running Migration..." : "Run Migration" })] })] })] }));
};
export default UserStatusMigration;
