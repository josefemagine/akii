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
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import { AlertCircle, CheckCircle, Database, PlayCircle, RefreshCw, } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
const MigrationSQL = `
-- Add new columns to profiles table
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Update profile first_name/last_name from full_name if needed
UPDATE public.profiles
SET 
  first_name = split_part(full_name, ' ', 1),
  last_name = substring(full_name from position(' ' in full_name))
WHERE full_name IS NOT NULL AND first_name IS NULL;

-- Make sure indexes exist for the RLS policies
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
`;
const UserProfileMigration = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [columnStatus, setColumnStatus] = useState({
        first_name: false,
        last_name: false,
        company_name: false,
        role: false,
        status: false,
    });
    const checkColumns = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            setIsRunning(true);
            setProgress(10);
            // Check if columns exist directly using information_schema
            const { data, error } = yield supabase
                .from('information_schema.columns')
                .select('column_name')
                .eq('table_name', 'profiles')
                .eq('table_schema', 'public');
            if (error) {
                throw new Error(`Could not check columns: ${error.message}`);
            }
            if (data) {
                // Extract column names into an array
                const columnNames = data.map(col => col.column_name);
                // Build status object
                const newColumnStatus = {
                    first_name: columnNames.includes('first_name'),
                    last_name: columnNames.includes('last_name'),
                    company_name: columnNames.includes('company_name'),
                    role: columnNames.includes('role'),
                    status: columnNames.includes('status')
                };
                setColumnStatus(newColumnStatus);
            }
            setProgress(100);
        }
        catch (err) {
            console.error('Error checking columns:', err);
            setError(err instanceof Error ? err.message : String(err));
        }
        finally {
            setIsRunning(false);
        }
    });
    const runMigration = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            setError(null);
            setResult(null);
            setIsRunning(true);
            setProgress(10);
            // Split SQL into individual statements
            const statements = MigrationSQL.split(';').filter(s => s.trim());
            // Execute each statement using direct database operations
            for (let i = 0; i < statements.length; i++) {
                const statement = statements[i].trim();
                if (!statement)
                    continue;
                setProgress(Math.floor(10 + (i / statements.length) * 70));
                // For each statement, determine if it's an ALTER TABLE for profiles table
                const isAlterProfilesTable = statement.includes('ALTER TABLE public.profiles');
                if (isAlterProfilesTable) {
                    // Extract column definitions
                    const addColumnMatch = statement.match(/ADD COLUMN IF NOT EXISTS ([A-Za-z_]+) ([A-Za-z()0-9]+)( DEFAULT [^,]+)?/i);
                    if (addColumnMatch) {
                        const columnName = addColumnMatch[1];
                        const columnType = addColumnMatch[2];
                        const defaultValue = addColumnMatch[3] || '';
                        console.log(`Adding column ${columnName} of type ${columnType}${defaultValue}`);
                        // Check if column already exists
                        const { data: colExists } = yield supabase
                            .from('information_schema.columns')
                            .select('column_name')
                            .eq('table_name', 'profiles')
                            .eq('table_schema', 'public')
                            .eq('column_name', columnName)
                            .maybeSingle();
                        if (!colExists) {
                            // Use upsert to add the column
                            try {
                                // Use a test query to see if we have permission
                                const testResult = yield supabase
                                    .from('profiles')
                                    .select('id')
                                    .limit(1);
                                if (testResult.error) {
                                    throw new Error(`No permission to access profiles: ${testResult.error.message}`);
                                }
                                // Unfortunately, we can't add columns with direct data operations
                                // We need to notify the user that this requires admin privileges
                                console.error(`Adding column ${columnName} requires admin privileges.`);
                                throw new Error(`Cannot add column ${columnName} - requires admin privileges`);
                            }
                            catch (e) {
                                console.error(`Error adding column ${columnName}:`, e);
                                throw e;
                            }
                        }
                        else {
                            console.log(`Column ${columnName} already exists.`);
                        }
                    }
                }
                else {
                    // For other statements like creating indexes or updating constraints,
                    // we need to notify the user these require admin privileges
                    console.log("This migration requires admin privileges.");
                }
            }
            // Re-check columns after migration attempts
            yield checkColumns();
            setProgress(100);
            // Determine if migration was successful
            const allColumnsExist = Object.values(columnStatus).every(exists => exists);
            if (allColumnsExist) {
                setResult("Migration completed successfully. The profiles table has been updated with the new columns.");
                toast({
                    title: "Migration Successful",
                    description: "The profile columns have been added successfully.",
                });
            }
            else {
                throw new Error("Not all columns were added. This operation requires database admin privileges.");
            }
        }
        catch (err) {
            console.error('Error running migration:', err);
            setError(err instanceof Error ? err.message : String(err));
            toast({
                title: "Migration Failed",
                description: err instanceof Error ? err.message : String(err),
                variant: "destructive",
            });
        }
        finally {
            setIsRunning(false);
        }
    });
    // Check columns on component mount
    React.useEffect(() => {
        checkColumns();
    }, []);
    const getColumnStatusIcon = (name) => {
        if (columnStatus[name]) {
            return _jsx(CheckCircle, { className: "h-5 w-5 text-green-500" });
        }
        return _jsx(AlertCircle, { className: "h-5 w-5 text-red-500" });
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold", children: "Profile Fields Migration" }), _jsx("p", { className: "text-muted-foreground mt-1", children: "Add first_name, last_name, and company_name fields to the profiles table" })] }) }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Profile Table Schema" }), _jsx(CardDescription, { children: "Check if the required columns exist in the profiles table" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: [_jsxs("div", { className: "flex items-center space-x-2 p-3 border rounded-md", children: [getColumnStatusIcon("first_name"), _jsx("span", { children: "first_name" })] }), _jsxs("div", { className: "flex items-center space-x-2 p-3 border rounded-md", children: [getColumnStatusIcon("last_name"), _jsx("span", { children: "last_name" })] }), _jsxs("div", { className: "flex items-center space-x-2 p-3 border rounded-md", children: [getColumnStatusIcon("company_name"), _jsx("span", { children: "company_name" })] }), _jsxs("div", { className: "flex items-center space-x-2 p-3 border rounded-md", children: [getColumnStatusIcon("role"), _jsx("span", { children: "role" })] }), _jsxs("div", { className: "flex items-center space-x-2 p-3 border rounded-md", children: [getColumnStatusIcon("status"), _jsx("span", { children: "status" })] })] }), _jsxs(Button, { variant: "outline", onClick: checkColumns, disabled: isRunning, className: "mt-4", children: [_jsx(RefreshCw, { className: "h-4 w-4 mr-2" }), "Refresh Column Status"] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Run Migration" }), _jsx(CardDescription, { children: "Add missing columns to the profiles table to support the user edit form" })] }), _jsxs(CardContent, { className: "space-y-4", children: [error && (_jsxs(Alert, { variant: "destructive", children: [_jsx(AlertCircle, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: "Migration Error" }), _jsx(AlertDescription, { children: error })] })), result && (_jsxs(Alert, { variant: "default", className: "bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-200", children: [_jsx(CheckCircle, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: "Success" }), _jsx(AlertDescription, { children: result })] })), _jsxs("div", { className: "p-4 border rounded-md bg-muted", children: [_jsxs("h3", { className: "text-sm font-medium mb-2 flex items-center", children: [_jsx(Database, { className: "h-4 w-4 mr-2" }), "Migration SQL"] }), _jsx("pre", { className: "whitespace-pre-wrap text-xs overflow-auto max-h-40 p-2 bg-background rounded", children: MigrationSQL })] }), isRunning && (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm", children: "Migration progress" }), _jsxs("span", { className: "text-sm", children: [progress, "%"] })] }), _jsx(Progress, { value: progress, className: "h-2" })] }))] }), _jsx(CardFooter, { children: _jsxs(Button, { onClick: runMigration, disabled: isRunning || Object.values(columnStatus).every(Boolean), children: [_jsx(PlayCircle, { className: "h-4 w-4 mr-2" }), Object.values(columnStatus).every(Boolean)
                                    ? "All Columns Already Exist"
                                    : isRunning
                                        ? "Running Migration..."
                                        : "Run Migration"] }) })] })] }));
};
export default UserProfileMigration;
