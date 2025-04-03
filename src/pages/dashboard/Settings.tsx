import React, { useState, useEffect, createContext, useContext } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import AvatarManager from "@/components/avatar/AvatarManager";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { Loader2, LogIn, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/auth-compatibility";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BillingPage from "./Billing";

// Define Profile types
interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  role?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  avatar_url?: string;
  needsRefresh?: boolean;
}

interface AuthDebugState {
  hasAuthUser: boolean;
  authUserId?: string;
  authUserEmail?: string;
  hasSession: boolean;
  sessionUserId?: string;
  sessionUserEmail?: string;
  sessionError?: string;
  storedEmail?: string;
  storedUserId?: string;
  timestamp: string;
}

// Profile Settings Component
const ProfileSettings = ({
  profile,
  isLoading,
  error,
  isSaving,
  authState,
  handleProfileUpdate,
  handleRefresh,
  handleSignIn,
  setProfile
}) => {
  return (
    <div className="space-y-6">
      {/* Profile Information */}
      {isLoading ? (
        <Card>
          <CardHeader>
            <CardTitle>Loading Profile</CardTitle>
            <CardDescription>Please wait while we load your profile...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      ) : error && !profile ? (
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Profile</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleSignIn} className="mr-2">
              <LogIn className="mr-2 h-4 w-4" /> Sign In Again
            </Button>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
          </CardContent>
        </Card>
      ) : profile?.needsRefresh ? (
        <Card>
          <CardHeader>
            <CardTitle>Profile Needs Refresh</CardTitle>
            <CardDescription>There was a problem loading your complete profile data.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Basic Info: {profile.email} (ID: {profile.id})</p>
            <Button onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh Profile
            </Button>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleProfileUpdate}>
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Avatar */}
              <div className="flex justify-center mb-6">
                <AvatarManager
                  initialAvatarUrl={profile?.avatar_url || ''}
                  userId={profile?.id || ''}
                  onAvatarChange={(url) => setProfile({...profile, avatar_url: url})}
                  size="xl"
                />
              </div>
              
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  value={profile?.email || ''}
                  disabled
                  type="email"
                />
                <p className="text-xs text-muted-foreground">
                  Your email cannot be changed. Contact support if you need to update your email.
                </p>
              </div>

              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={profile?.first_name || ''}
                  onChange={(e) => setProfile({...profile, first_name: e.target.value})}
                  placeholder="Enter your first name"
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={profile?.last_name || ''}
                  onChange={(e) => setProfile({...profile, last_name: e.target.value})}
                  placeholder="Enter your last name"
                />
              </div>

              {/* Company */}
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={profile?.company || ''}
                  onChange={(e) => setProfile({...profile, company: e.target.value})}
                  placeholder="Enter your company name"
                />
              </div>

              {/* Account Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Account Status</Label>
                <div className="flex items-center space-x-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${
                    profile?.status === 'active' ? 'bg-green-500' : 
                    profile?.status === 'pending' ? 'bg-amber-500' : 'bg-gray-300'
                  }`}></span>
                  <span className="capitalize">{profile?.status || 'Unknown'}</span>
                </div>
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  );
};

const Settings = () => {
  // State
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [authState, setAuthState] = useState<AuthDebugState | null>(null);
  const [activeTab, setActiveTab] = useState("profile");
  
  // Navigation
  const navigate = useNavigate();
  
  // Get auth from context with error handling
  let authUser;
  try {
    const auth = useAuth();
    authUser = auth?.user;
  } catch (e) {
    console.error("Error using auth context in Settings:", e);
    authUser = null;
  }

  // Check auth state first
  useEffect(() => {
    async function checkAuthState() {
      try {
        console.log("Settings: Checking auth state...");
        setIsLoading(true);
        
        // Import necessary functions
        const { getCurrentSession, getCurrentUser, ensureUserProfile } = await import('@/lib/supabase-auth');
        
        // Try to get session from Supabase
        const { data: session, error: sessionError } = await getCurrentSession();
        
        if (sessionError) {
          console.error("Settings: Session error:", sessionError);
          setError("Authentication error. Please try signing in again.");
          setIsLoading(false);
          return;
        }
        
        if (!session) {
          console.log("Settings: No active session found");
          setError("You are not logged in. Please sign in to access settings.");
          setIsLoading(false);
          return;
        }
        
        // Get the current user
        const { data: user, error: userError } = await getCurrentUser();
        
        if (userError || !user) {
          console.error("Settings: User error:", userError);
          setError("Could not retrieve user information. Please try signing in again.");
          setIsLoading(false);
          return;
        }
        
        // Store user information in auth state for debugging
        const authStateInfo: AuthDebugState = {
          hasAuthUser: !!user,
          authUserId: user?.id,
          authUserEmail: user?.email,
          hasSession: !!session,
          sessionUserId: session?.user?.id,
          sessionUserEmail: session?.user?.email,
          sessionError: sessionError?.message,
          storedEmail: localStorage.getItem("akii-auth-user-email"),
          storedUserId: localStorage.getItem("akii-auth-user-id"),
          timestamp: new Date().toISOString()
        };
        
        console.log("Settings: Auth state info:", authStateInfo);
        setAuthState(authStateInfo);
        
        // Ensure the user has a profile (this will create one if it doesn't exist)
        const { data: profileData, error: profileError } = await ensureUserProfile(user);
        
        if (profileError) {
          console.error("Settings: Profile error:", profileError);
          setError(`Error loading your profile: ${profileError.message}. Please try refreshing the page.`);
          setIsLoading(false);
          return;
        }
        
        if (!profileData) {
          console.error("Settings: No profile data returned");
          // Try direct profile lookup as a fallback
          await loadUserProfile(user.id);
          return;
        }
        
        // Successfully got profile
        console.log("Settings: Profile loaded:", profileData);
        setProfile(profileData);
        setIsLoading(false);
      } catch (error) {
        console.error("Settings: Error checking auth state:", error);
        setError("Error checking authentication. Please try signing in again.");
        setIsLoading(false);
      }
    }
    
    checkAuthState();
  }, []);

  // Load user profile
  async function loadUserProfile(userId: string) {
    try {
      console.log("Settings: Loading profile for user ID:", userId);
      
      // Import the getUserProfile function from supabase-auth.ts
      const { getUserProfile } = await import('@/lib/supabase-auth');
      
      // Use the enhanced getUserProfile function which handles RLS errors with fallbacks
      const { data: profileData, error } = await getUserProfile(userId);
      
      if (error) {
        console.error("Settings: Error getting profile:", error);
        
        // For severe errors we should still show an error
        if (!profileData) {
          setError(`Error loading your profile: ${error.message}. Please try refreshing the page.`);
          setIsLoading(false);
          
          // Add a manual refresh button by setting profile to a special state
          setProfile({ 
            id: userId || 'unknown',
            email: authState?.authUserEmail || authState?.sessionUserEmail || authState?.storedEmail || 'unknown',
            needsRefresh: true 
          });
          return;
        }
      }
      
      // Profile found (either real or fallback)
      console.log("Settings: Profile loaded:", profileData);
      setProfile(profileData);
      setIsLoading(false);
    } catch (error) {
      console.error("Settings: Error loading user profile:", error);
      
      // Show more specific error messages to the user
      if (error instanceof Error) {
        if (error.message.includes("timeout") || error.message.includes("Timeout")) {
          setError("Profile loading timed out. The database might be unresponsive. Please try refreshing the page.");
        } else if (error.message.includes("network")) {
          setError("Network error while loading your profile. Please check your internet connection.");
        } else {
          setError(`Error loading your profile: ${error.message}. Please try refreshing the page.`);
        }
      } else {
        setError("Error loading your profile. Please try again later.");
      }
      
      // Even with an error, stop the loading state
      setIsLoading(false);
      
      // Add a manual refresh button by setting profile to a special state
      setProfile({ 
        id: userId || 'unknown',
        email: authState?.authUserEmail || authState?.sessionUserEmail || authState?.storedEmail || 'unknown',
        needsRefresh: true 
      });
    }
  }
  
  // Create profile for Josef with hardcoded ID
  async function createJosefProfile() {
    try {
      console.log("Settings: Creating profile for Josef");
      const josefId = "b574f273-e0e1-4cb8-8c98-f5a7569234c8";
      
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: josefId,
          email: "josef@holm.com",
          first_name: "Josef",
          last_name: "Holm",
          role: "admin",
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
        
      if (createError) {
        throw new Error(`Failed to create profile: ${createError.message}`);
      }
      
      console.log("Settings: Josef's profile created successfully");
      setProfile(newProfile);
      setIsLoading(false);
    } catch (error) {
      console.error("Settings: Error creating Josef's profile:", error);
      setError(`Error creating profile: ${error instanceof Error ? error.message : String(error)}`);
      setIsLoading(false);
    }
  }

  // Handle profile update/creation
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.id) {
      toast({
        title: "Error",
        description: "Missing user ID. Please sign in again.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Update the profile in the database
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          company: profile.company,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Your profile has been updated.",
      });
    } catch (error) {
      console.error("Settings: Error updating profile:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSignIn = () => {
    navigate("/login");
  };
  
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="max-w-5xl mx-auto py-6">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings and preferences
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-4">
            <ProfileSettings 
              profile={profile}
              isLoading={isLoading}
              error={error}
              isSaving={isSaving}
              authState={authState}
              handleProfileUpdate={handleProfileUpdate}
              handleRefresh={handleRefresh}
              handleSignIn={handleSignIn}
              setProfile={setProfile}
            />
          </TabsContent>
          
          <TabsContent value="billing" className="space-y-4">
            <BillingPage />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
