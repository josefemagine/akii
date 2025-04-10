import React, { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { supabase } from "@/lib/supabase.tsx";
import { toast } from "@/components/ui/use-toast.ts";
import {
  AlertCircle,
  CheckCircle,
  Database,
  PlayCircle,
  RefreshCw,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import { Progress } from "@/components/ui/progress.tsx";

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
      
      // Check if columns exist directly using information_schema
      const { data, error } = await supabase
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
        const newColumnStatus: Record<string, boolean> = {
          first_name: columnNames.includes('first_name'),
          last_name: columnNames.includes('last_name'),
          company_name: columnNames.includes('company_name'),
          role: columnNames.includes('role'),
          status: columnNames.includes('status')
        };
        
        setColumnStatus(newColumnStatus);
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

      // Split SQL into individual statements
      const statements = MigrationSQL.split(';').filter(s => s.trim());
      
      // Execute each statement using direct database operations
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i].trim();
        if (!statement) continue;
        
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
            const { data: colExists } = await supabase
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
                const testResult = await supabase
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
              } catch (e) {
                console.error(`Error adding column ${columnName}:`, e);
                throw e;
              }
            } else {
              console.log(`Column ${columnName} already exists.`);
            }
          }
        } else {
          // For other statements like creating indexes or updating constraints,
          // we need to notify the user these require admin privileges
          console.log("This migration requires admin privileges.");
        }
      }
      
      // Re-check columns after migration attempts
      await checkColumns();
      
      setProgress(100);
      
      // Determine if migration was successful
      const allColumnsExist = Object.values(columnStatus).every(exists => exists);
      
      if (allColumnsExist) {
        setResult("Migration completed successfully. The profiles table has been updated with the new columns.");
        toast({
          title: "Migration Successful",
          description: "The profile columns have been added successfully.",
        });
      } else {
        throw new Error("Not all columns were added. This operation requires database admin privileges.");
      }
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