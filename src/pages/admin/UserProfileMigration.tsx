import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/lib/supabase-singleton";
import { toast } from "@/components/ui/use-toast";
import {
  AlertCircle,
  CheckCircle,
  Database,
  PlayCircle,
  RefreshCw,
} from "lucide-react";
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
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [columnStatus, setColumnStatus] = useState<Record<string, boolean>>({
    first_name: false,
    last_name: false,
    company_name: false,
    role: false,
    status: false,
  });

  const checkColumns = async () => {
    try {
      setIsRunning(true);
      setProgress(10);
      
      // Check if the columns exist
      const { data, error } = await supabase.rpc('check_profile_columns');
      
      if (error) {
        // If the function doesn't exist, create it first
        await supabase.rpc('admin_query', {
          query: `
            CREATE OR REPLACE FUNCTION check_profile_columns()
            RETURNS json AS $$
            DECLARE
              result json;
            BEGIN
              SELECT json_build_object(
                'first_name', EXISTS (
                  SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'profiles' AND column_name = 'first_name'
                ),
                'last_name', EXISTS (
                  SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'profiles' AND column_name = 'last_name'
                ),
                'company_name', EXISTS (
                  SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'profiles' AND column_name = 'company_name'
                ),
                'role', EXISTS (
                  SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'profiles' AND column_name = 'role'
                ),
                'status', EXISTS (
                  SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'profiles' AND column_name = 'status'
                )
              ) INTO result;
              
              RETURN result;
            END;
            $$ LANGUAGE plpgsql SECURITY DEFINER;
          `
        });
        
        // Try again
        const { data: retryData, error: retryError } = await supabase.rpc('check_profile_columns');
        
        if (retryError) {
          throw new Error(`Could not check columns: ${retryError.message}`);
        }
        
        setColumnStatus(retryData || {});
      } else {
        setColumnStatus(data || {});
      }
      
      setProgress(100);
    } catch (err) {
      console.error('Error checking columns:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsRunning(false);
    }
  };

  const runMigration = async () => {
    try {
      setError(null);
      setResult(null);
      setIsRunning(true);
      setProgress(10);

      // First try with RPC if we have appropriate permission
      try {
        const { error } = await supabase.rpc('admin_query', {
          query: MigrationSQL
        });
        
        if (error) {
          throw error;
        }
        
        setProgress(80);
        setResult("Migration completed successfully. The profiles table has been updated with the new columns.");
      } catch (rpcError) {
        console.log("RPC error, falling back to SQL queries:", rpcError);
        
        // Split into individual statements and execute separately
        const statements = MigrationSQL.split(';').filter(s => s.trim());
        
        for (let i = 0; i < statements.length; i++) {
          const statement = statements[i].trim();
          if (!statement) continue;
          
          setProgress(Math.floor(10 + (i / statements.length) * 70));
          
          // Execute each statement
          const { error } = await supabase.rpc('admin_query', {
            query: statement
          });
          
          if (error) {
            throw new Error(`Error executing statement ${i+1}: ${error.message}`);
          }
        }
        
        setResult("Migration completed successfully via sequential statements. The profiles table has been updated with the new columns.");
      }
      
      // Check columns after migration
      await checkColumns();
      
      setProgress(100);
      toast({
        title: "Migration Successful",
        description: "The profile columns have been added successfully.",
      });
    } catch (err) {
      console.error('Error running migration:', err);
      setError(err instanceof Error ? err.message : String(err));
      toast({
        title: "Migration Failed",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Check columns on component mount
  React.useEffect(() => {
    checkColumns();
  }, []);

  const getColumnStatusIcon = (name: string) => {
    if (columnStatus[name]) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return <AlertCircle className="h-5 w-5 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profile Fields Migration</h1>
          <p className="text-muted-foreground mt-1">
            Add first_name, last_name, and company_name fields to the profiles table
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Table Schema</CardTitle>
          <CardDescription>
            Check if the required columns exist in the profiles table
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2 p-3 border rounded-md">
              {getColumnStatusIcon("first_name")}
              <span>first_name</span>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded-md">
              {getColumnStatusIcon("last_name")}
              <span>last_name</span>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded-md">
              {getColumnStatusIcon("company_name")}
              <span>company_name</span>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded-md">
              {getColumnStatusIcon("role")}
              <span>role</span>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded-md">
              {getColumnStatusIcon("status")}
              <span>status</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            onClick={checkColumns} 
            disabled={isRunning}
            className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Column Status
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Run Migration</CardTitle>
          <CardDescription>
            Add missing columns to the profiles table to support the user edit form
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Migration Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <Alert variant="default" className="bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-200">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{result}</AlertDescription>
            </Alert>
          )}

          <div className="p-4 border rounded-md bg-muted">
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <Database className="h-4 w-4 mr-2" />
              Migration SQL
            </h3>
            <pre className="whitespace-pre-wrap text-xs overflow-auto max-h-40 p-2 bg-background rounded">
              {MigrationSQL}
            </pre>
          </div>

          {isRunning && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Migration progress</span>
                <span className="text-sm">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            onClick={runMigration} 
            disabled={isRunning || Object.values(columnStatus).every(Boolean)}>
            <PlayCircle className="h-4 w-4 mr-2" />
            {Object.values(columnStatus).every(Boolean) 
              ? "All Columns Already Exist" 
              : isRunning 
                ? "Running Migration..." 
                : "Run Migration"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default UserProfileMigration; 