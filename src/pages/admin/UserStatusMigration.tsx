import { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card.tsx";
import { Alert, AlertDescription } from "@/components/ui/alert.tsx";
import { supabaseAdmin } from "@/lib/supabase-admin.ts";
import { toast } from "@/components/ui/use-toast.ts";
import { AlertCircle, Check } from "lucide-react";

const UserStatusMigration = () => {
  const [loading, setLoading] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addStatusColumn = async () => {
    try {
      setLoading(true);
      setMigrationStatus("Adding status column to profiles table...");
      setError(null);
      
      // Execute SQL to add the status column if it doesn't exist
      const { error: sqlError } = await supabaseAdmin.rpc('execute_sql', {
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
          const { data: profiles, error: profilesError } = await supabaseAdmin
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
          } else {
            setMigrationStatus("Status column already exists in profiles table.");
          }
        } catch (apiError) {
          throw apiError;
        }
      } else {
        setMigrationStatus("Status column added successfully!");
      }
      
      // Now update all users to have an 'active' status if they don't have one
      setMigrationStatus("Updating existing users with default status...");
      
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ status: 'active' })
        .is('status', null);
        
      if (updateError) {
        console.error("Error updating users with default status:", updateError);
        // This might fail for permissions reasons, but it's not critical
        setMigrationStatus("Warning: Could not update existing users. They will use the database default value.");
      } else {
        setMigrationStatus("Existing users updated with 'active' status successfully!");
      }
      
      setSuccess(true);
      toast({
        title: "Migration Successful",
        description: "Status column has been added to profiles table.",
      });
    } catch (err) {
      console.error("Error in migration:", err);
      setError(err instanceof Error ? err.message : String(err));
      setSuccess(false);
      toast({
        title: "Migration Failed",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const resetUserStatus = async () => {
    try {
      setLoading(true);
      setMigrationStatus("Resetting status for all users to 'active'...");
      setError(null);
      
      const { error: updateError } = await supabaseAdmin
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
    } catch (err) {
      console.error("Error resetting status:", err);
      setError(err instanceof Error ? err.message : String(err));
      setSuccess(false);
      toast({
        title: "Reset Failed",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Status Migration</h1>
        <p className="text-muted-foreground mt-1">
          Add status functionality to user profiles
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Add Status Column to Profiles</CardTitle>
          <CardDescription>
            This will add a 'status' column to the profiles table in your database.
            Users can then be marked as active, inactive, or banned.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {migrationStatus && (
            <Alert className={success ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800" : "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"}>
              {success ? (
                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              )}
              <AlertDescription className="text-sm">
                {migrationStatus}
              </AlertDescription>
            </Alert>
          )}
          
          {error && (
            <Alert className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-sm">
                Error: {error}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <p>This utility will perform the following:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Add a 'status' column to the profiles table</li>
              <li>Set a default value of 'active' for the column</li>
              <li>Update existing users to have the 'active' status</li>
            </ol>
          </div>
          
          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md p-4">
            <p className="text-sm text-amber-800 dark:text-amber-300">
              <strong>Important:</strong> You need database administrator privileges to run this migration.
              If it fails, you may need to run the SQL command manually in the Supabase SQL editor.
            </p>
            <pre className="mt-2 bg-black/10 dark:bg-white/10 p-2 rounded text-xs overflow-auto">
              ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' NOT NULL;
            </pre>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={resetUserStatus}
            disabled={loading || !success}
          >
            Reset All Users to Active
          </Button>
          <Button 
            onClick={addStatusColumn}
            disabled={loading}
          >
            {loading ? "Running Migration..." : "Run Migration"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default UserStatusMigration; 