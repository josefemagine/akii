import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { supabaseAdmin, getAuthUsers } from "@/lib/supabase-admin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw, UserPlus } from "lucide-react";

interface AuthUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  provider?: string;
}

interface ProfileUser {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
}

const UserSyncPage = () => {
  const [loading, setLoading] = useState(true);
  const [authUsers, setAuthUsers] = useState<AuthUser[]>([]);
  const [profileUsers, setProfileUsers] = useState<ProfileUser[]>([]);
  const [missingUsers, setMissingUsers] = useState<AuthUser[]>([]);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Fetch all users from both tables
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setSyncError(null);
      
      let authUsersList: AuthUser[] = [];
      
      // Use our helper function to get auth users
      const { data: authData, error: authError } = await getAuthUsers();
      
      if (authError) {
        console.error("Could not fetch auth users:", authError);
        setSyncError("Could not access auth users. Check server logs for details.");
        
        // Still try to get the current user as a fallback
        try {
          const { data: currentSession } = await supabaseAdmin.auth.getSession();
          if (currentSession?.session?.user) {
            const user = currentSession.session.user;
            authUsersList = [{
              id: user.id,
              email: user.email || 'unknown',
              created_at: user.created_at || new Date().toISOString(),
              last_sign_in_at: null,
              provider: 'email'
            }];
            
            toast({
              title: "Limited Auth Access",
              description: "Only the current user could be fetched from auth",
              variant: "destructive",
            });
          }
        } catch (fallbackError) {
          console.error("Fallback auth method failed:", fallbackError);
        }
      } else if (authData?.users) {
        // Process auth users from admin API
        authUsersList = authData.users.map(user => ({
          id: user.id,
          email: user.email || 'unknown',
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
          provider: user.app_metadata?.provider || 'email'
        }));
      } else if (Array.isArray(authData)) {
        // Process auth users from RPC call
        authUsersList = authData.map(user => ({
          id: user.id,
          email: user.email || 'unknown',
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
          provider: user.role || 'unknown'
        }));
      }
      
      // Fetch profile users
      const { data: profileData, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id, email, full_name, role, created_at');
      
      if (profileError) {
        console.error("Error fetching profile users:", profileError);
        toast({
          title: "Error fetching profile users",
          description: profileError.message,
          variant: "destructive",
        });
        setSyncError(profileError.message);
        return;
      }
      
      // Process profiles
      const processedProfiles = profileData || [];
      
      // Find missing users (in auth but not in profiles)
      const missing = authUsersList.filter(authUser => 
        !processedProfiles.some(profile => 
          profile.email === authUser.email
        )
      );
      
      setAuthUsers(authUsersList);
      setProfileUsers(processedProfiles);
      setMissingUsers(missing);
      
      toast({
        title: "Users loaded",
        description: `Found ${authUsersList.length} auth users and ${processedProfiles.length} profiles`,
      });
    } catch (err) {
      console.error("Error fetching users:", err);
      setSyncError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };
  
  // Sync a single user from auth to profiles
  const syncUser = async (authUser: AuthUser) => {
    try {
      setSyncStatus(`Syncing user ${authUser.email}...`);
      
      // Check if user already exists in profiles (by email)
      const { data: existingProfile, error: checkError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('email', authUser.email)
        .maybeSingle();
      
      if (checkError) {
        console.error("Error checking for existing profile:", checkError);
        setSyncError(checkError.message);
        return false;
      }
      
      if (existingProfile) {
        // Profile exists, update it
        setSyncStatus(`Profile for ${authUser.email} already exists, updating...`);
        
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({
            id: authUser.id, // Ensure ID matches auth.users
            updated_at: new Date().toISOString()
          })
          .eq('email', authUser.email);
        
        if (updateError) {
          console.error("Error updating profile:", updateError);
          setSyncError(updateError.message);
          return false;
        }
        
        setSyncStatus(`Updated profile for ${authUser.email}`);
        return true;
      } else {
        // Create new profile
        setSyncStatus(`Creating new profile for ${authUser.email}...`);
        
        const { error: insertError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: authUser.id,
            email: authUser.email,
            full_name: authUser.email.split('@')[0],
            role: 'user',
            created_at: authUser.created_at,
            updated_at: new Date().toISOString()
          });
        
        if (insertError) {
          console.error("Error creating profile:", insertError);
          setSyncError(insertError.message);
          return false;
        }
        
        setSyncStatus(`Created new profile for ${authUser.email}`);
        return true;
      }
    } catch (err) {
      console.error("Error syncing user:", err);
      setSyncError(err instanceof Error ? err.message : String(err));
      return false;
    }
  };
  
  // Sync all missing users
  const syncAllMissingUsers = async () => {
    try {
      setSyncStatus("Starting sync of all missing users...");
      setSyncError(null);
      setLoading(true);
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const user of missingUsers) {
        setSyncStatus(`Syncing ${user.email} (${successCount + errorCount + 1}/${missingUsers.length})...`);
        const success = await syncUser(user);
        if (success) {
          successCount++;
        } else {
          errorCount++;
        }
      }
      
      await fetchUsers(); // Refresh the lists
      
      setSyncStatus(`Sync completed. Success: ${successCount}, Errors: ${errorCount}`);
      
      toast({
        title: "Sync Completed",
        description: `Successfully synced ${successCount} users with ${errorCount} errors`,
        variant: errorCount > 0 ? "destructive" : "default",
      });
    } catch (err) {
      console.error("Error in bulk sync:", err);
      setSyncError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };
  
  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Sync Utility</h1>
          <p className="text-muted-foreground mt-1">
            Synchronize users between auth.users and profiles tables
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={fetchUsers} 
            disabled={loading}
            variant="outline"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={syncAllMissingUsers} 
            disabled={loading || missingUsers.length === 0}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Sync Missing Users
          </Button>
        </div>
      </div>
      
      {syncStatus && (
        <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <RefreshCw className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-sm">
            {syncStatus}
          </AlertDescription>
        </Alert>
      )}
      
      {syncError && (
        <Alert className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-sm">
            Error: {syncError}
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="missing">
        <TabsList className="mb-4">
          <TabsTrigger value="missing">
            Missing Users ({missingUsers.length})
          </TabsTrigger>
          <TabsTrigger value="auth">
            Auth Users ({authUsers.length})
          </TabsTrigger>
          <TabsTrigger value="profiles">
            Profile Users ({profileUsers.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="missing">
          <Card>
            <CardHeader>
              <CardTitle>Missing Users</CardTitle>
              <CardDescription>
                Users that exist in auth.users but not in profiles table
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-4 text-center">Loading users...</div>
              ) : missingUsers.length === 0 ? (
                <div className="py-4 text-center">No missing users - everything is in sync!</div>
              ) : (
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-2 text-left font-medium">Email</th>
                        <th className="p-2 text-left font-medium">Created</th>
                        <th className="p-2 text-left font-medium">Last Sign In</th>
                        <th className="p-2 text-left font-medium">Provider</th>
                        <th className="p-2 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {missingUsers.map((user, i) => (
                        <tr key={user.id} className={i % 2 ? "bg-muted/50" : ""}>
                          <td className="p-2">{user.email}</td>
                          <td className="p-2">{new Date(user.created_at).toLocaleDateString()}</td>
                          <td className="p-2">
                            {user.last_sign_in_at 
                              ? new Date(user.last_sign_in_at).toLocaleDateString() 
                              : 'Never'}
                          </td>
                          <td className="p-2">{user.provider}</td>
                          <td className="p-2">
                            <Button 
                              size="sm" 
                              onClick={() => syncUser(user)}
                              disabled={loading}
                            >
                              Sync User
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="auth">
          <Card>
            <CardHeader>
              <CardTitle>Auth Users</CardTitle>
              <CardDescription>
                Users from the auth.users table
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-4 text-center">Loading users...</div>
              ) : authUsers.length === 0 ? (
                <div className="py-4 text-center">No auth users found</div>
              ) : (
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-2 text-left font-medium">Email</th>
                        <th className="p-2 text-left font-medium">Created</th>
                        <th className="p-2 text-left font-medium">Last Sign In</th>
                        <th className="p-2 text-left font-medium">Provider</th>
                      </tr>
                    </thead>
                    <tbody>
                      {authUsers.map((user, i) => (
                        <tr key={user.id} className={i % 2 ? "bg-muted/50" : ""}>
                          <td className="p-2">{user.email}</td>
                          <td className="p-2">{new Date(user.created_at).toLocaleDateString()}</td>
                          <td className="p-2">
                            {user.last_sign_in_at 
                              ? new Date(user.last_sign_in_at).toLocaleDateString() 
                              : 'Never'}
                          </td>
                          <td className="p-2">{user.provider}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="profiles">
          <Card>
            <CardHeader>
              <CardTitle>Profile Users</CardTitle>
              <CardDescription>
                Users from the profiles table
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-4 text-center">Loading users...</div>
              ) : profileUsers.length === 0 ? (
                <div className="py-4 text-center">No profile users found</div>
              ) : (
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-2 text-left font-medium">Name</th>
                        <th className="p-2 text-left font-medium">Email</th>
                        <th className="p-2 text-left font-medium">Role</th>
                        <th className="p-2 text-left font-medium">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profileUsers.map((user, i) => (
                        <tr key={user.id} className={i % 2 ? "bg-muted/50" : ""}>
                          <td className="p-2">{user.full_name || 'Unknown'}</td>
                          <td className="p-2">{user.email}</td>
                          <td className="p-2">{user.role}</td>
                          <td className="p-2">{new Date(user.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserSyncPage; 