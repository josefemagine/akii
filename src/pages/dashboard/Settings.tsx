import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import AvatarManager from "@/components/avatar/AvatarManager";
import { supabase } from "@/lib/supabase-singleton";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, LogIn, RefreshCw } from "lucide-react";

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

const Settings = () => {
  // State
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [authState, setAuthState] = useState<AuthDebugState | null>(null);
  
  // Navigation
  const navigate = useNavigate();
  
  // Get auth from context
  const { user: authUser } = useAuth();

  // Check auth state first
  useEffect(() => {
    async function checkAuthState() {
      try {
        console.log("Settings: Checking auth state...");
        setIsLoading(true);
        
        // Try to get session directly from Supabase
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        // Get stored email/ID from localStorage as fallback
        const storedEmail = localStorage.getItem("akii-auth-user-email");
        const storedUserId = localStorage.getItem("akii-auth-user-id");
        
        // Collect auth state for debugging
        const authStateInfo: AuthDebugState = {
          hasAuthUser: !!authUser,
          authUserId: authUser?.id,
          authUserEmail: authUser?.email,
          hasSession: !!sessionData?.session,
          sessionUserId: sessionData?.session?.user?.id,
          sessionUserEmail: sessionData?.session?.user?.email,
          sessionError: sessionError?.message,
          storedEmail,
          storedUserId,
          timestamp: new Date().toISOString()
        };
        
        console.log("Settings: Auth state info:", authStateInfo);
        setAuthState(authStateInfo);
        
        // Check if we have any valid user ID
        const userId = authUser?.id || sessionData?.session?.user?.id || storedUserId;
        
        if (!userId) {
          console.error("Settings: No authenticated user ID found");
          setError("You are not logged in. Please sign in to access settings.");
          setIsLoading(false);
          return;
        }
        
        // We have a user ID, try to load the profile
        await loadUserProfile(userId);
      } catch (error) {
        console.error("Settings: Error checking auth state:", error);
        setError("Error checking authentication. Please try signing in again.");
        setIsLoading(false);
      }
    }
    
    checkAuthState();
  }, [authUser]);

  // Load user profile
  async function loadUserProfile(userId: string) {
    try {
      console.log("Settings: Loading profile for user ID:", userId);
      
      // Add timeout protection
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Profile fetch timed out after 10 seconds")), 10000)
      );
      
      // Race the profile fetch against a timeout
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      // Use Promise.race to implement a timeout
      const { data: profileData, error: profileError } = await Promise.race([
        profilePromise,
        timeoutPromise.then(() => ({ data: null, error: new Error("Timeout") }))
      ]) as any;
        
      if (profileError) {
        // Log more details about the error
        console.error("Settings: Profile load error details:", {
          error: profileError,
          errorCode: profileError.code,
          errorMessage: profileError.message,
          errorDetails: profileError.details,
          userId
        });
        
        // Handle the "not found" case
        if (profileError.code === 'PGRST116') {
          // Special case for Josef to auto-create profile with hardcoded ID
          if (authState?.authUserEmail === "josef@holm.com" || authState?.storedEmail === "josef@holm.com") {
            return await createJosefProfile();
          }
          
          console.log("Settings: Profile not found, will need to create one");
          setError("Your profile hasn't been set up yet. Please complete the form below to create it.");
          
          // Start with a blank profile
          setProfile({
            id: userId,
            email: authState?.authUserEmail || authState?.sessionUserEmail || authState?.storedEmail || "",
          });
          setIsLoading(false);
          return;
        }
        
        // Other database errors
        throw new Error(`Database error: ${profileError.message}`);
      }
      
      // Profile found
      console.log("Settings: Profile loaded successfully");
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
    
    try {
      setIsSaving(true);
      
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      
      const firstName = formData.get('firstName') as string;
      const lastName = formData.get('lastName') as string;
      const company = formData.get('company') as string;
      
      console.log("Settings: Updating profile for user ID:", profile.id);
      
      // Check if this is a new profile or update
      const isNewProfile = !profile.created_at;
      
      // Define the profile data with appropriate type
      const profileData: {
        id: string;
        first_name: string;
        last_name: string;
        company: string;
        email: string;
        updated_at: string;
        created_at?: string;
        status?: string;
        role?: string;
      } = {
        id: profile.id,
        first_name: firstName,
        last_name: lastName,
        company,
        email: profile.email,
        updated_at: new Date().toISOString(),
      };
      
      // Add created_at for new profiles
      if (isNewProfile) {
        profileData.created_at = new Date().toISOString();
        profileData.status = 'active';
        profileData.role = profile.email === 'josef@holm.com' ? 'admin' : 'user';
      }
      
      // Update or insert profile in your database table
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert(profileData);
        
      if (upsertError) {
        throw new Error(`Failed to save profile: ${upsertError.message}`);
      }
      
      // Update local state
      setProfile(prev => ({
        ...prev,
        ...profileData
      }));
      
      toast({
        title: isNewProfile ? "Profile Created" : "Profile Updated",
        description: isNewProfile 
          ? "Your profile has been created successfully."
          : "Your profile information has been saved.",
      });
      
    } catch (error) {
      console.error("Settings: Failed to save profile:", error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save your profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle sign in redirect
  const handleSignIn = () => {
    navigate("/login");
  };

  // Handle refresh
  const handleRefresh = () => {
    window.location.reload();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container py-10 flex items-center justify-center min-h-[300px] flex-col">
        <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
        <p className="text-primary font-medium">Loading your profile...</p>
        <p className="text-sm text-muted-foreground mt-2">This may take a moment</p>
        
        {/* Add a refresh button that appears after 10 seconds */}
        <div className="mt-6 opacity-0" style={{
          animationDelay: '10s', 
          animationFillMode: 'forwards',
          animation: 'fadeIn 0.5s ease-in-out forwards'
        }}>
          <Button variant="outline" size="sm" onClick={handleRefresh} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Not loading? Click to refresh
          </Button>
        </div>
        
        {/* Add keyframes for fadeIn animation */}
        <style>
          {`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}
        </style>
      </div>
    );
  }

  // Authentication error - need to sign in
  if (error === "You are not logged in. Please sign in to access settings.") {
    return (
      <div className="container py-10 max-w-2xl">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-amber-800 mb-2">Authentication Required</h3>
          <p className="text-amber-700 mb-4">
            You need to be signed in to view and edit your profile settings.
          </p>
          <div className="flex gap-3">
            <Button onClick={handleSignIn}>
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
        
        {/* Debug auth state */}
        {authState && (
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs font-mono">
            <h4 className="font-medium mb-2 text-sm">Auth Debug Info</h4>
            <pre className="overflow-auto whitespace-pre-wrap">
              {JSON.stringify(authState, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  }

  // Add a special case for error states to render the retry UI
  if (error && (!profile || profile.needsRefresh)) {
    return (
      <div className="container py-10 flex flex-col items-center justify-center min-h-[300px]">
        <div className="bg-destructive/10 p-6 rounded-lg max-w-md mx-auto text-center mb-6">
          <h2 className="text-xl font-semibold mb-2">Profile Loading Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={handleRefresh} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh Page
            </Button>
            <Button variant="outline" onClick={handleSignIn} className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Sign In Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show profile form (whether creating new or editing existing)
  return (
    <div className="container max-w-4xl py-10">
      {/* Warning for new profile */}
      {error === "Your profile hasn't been set up yet. Please complete the form below to create it." && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-amber-800">Profile Setup Required</h3>
          <p className="text-amber-700 text-sm">
            Please fill out your profile information below to complete your account setup.
          </p>
        </div>
      )}
      
      <h1 className="text-3xl font-bold mb-2">Settings</h1>
      <p className="text-muted-foreground mb-6">Manage your account settings and preferences.</p>
      
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            {profile?.created_at ? 
              "Update your profile information and how others see you." : 
              "Complete your profile information to set up your account."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-8">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex flex-col items-center">
                <AvatarManager 
                  userId={profile?.id}
                  userEmail={profile?.email}
                  initialAvatarUrl={profile?.avatar_url}
                  googleAvatarUrl={authUser?.user_metadata?.avatar_url}
                  size="xl"
                  onAvatarChange={(url) => {
                    if (url && profile?.id) {
                      // Update avatar in database
                      supabase
                        .from('profiles')
                        .update({ avatar_url: url })
                        .eq('id', profile.id)
                        .then(({ error }) => {
                          if (error) {
                            console.error("Failed to save avatar:", error);
                            toast({
                              title: "Avatar Update Failed",
                              description: "Could not save your avatar to the database",
                              variant: "destructive",
                            });
                            return;
                          }
                          
                          // Update local state
                          setProfile(prev => ({ ...prev, avatar_url: url }));
                          
                          toast({
                            title: "Avatar Updated",
                            description: "Your profile picture has been updated successfully.",
                          });
                        });
                    }
                  }}
                />
                <p className="text-sm text-muted-foreground mt-4 text-center max-w-xs">
                  Click or drag an image to upload. For best results, use a square image.
                </p>
              </div>
              
              <div className="space-y-4 flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      defaultValue={profile?.first_name || ''}
                      placeholder="Your first name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      defaultValue={profile?.last_name || ''}
                      placeholder="Your last name"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile?.email || ''}
                    readOnly
                    disabled
                    className="bg-muted"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    name="company"
                    defaultValue={profile?.company || ''}
                    placeholder="Your company name"
                  />
                </div>
                
                <div className="pt-4">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : profile?.created_at ? "Save Changes" : "Create Profile"}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
