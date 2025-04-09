import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardPageContainer } from "@/components/layout/DashboardPageContainer";
import Profile from "./Profile";
import Appearance from "./Appearance";
import Security from "./Security";
import Notifications from "./Notifications";
import Billing from "./Billing";
import APIKeys from "./APIKeys";
import { AdminSetter } from '@/components/debug/AdminSetter';
import { useAuth } from "@/contexts/UnifiedAuthContext";
import type { Profile as ProfileType } from "@/types/auth";

// Custom profile type that extends the basic Profile from AuthContext
interface ExtendedProfile extends ProfileType {
  display_name?: string;
  avatar_url?: string;
  company?: string;
}

export default function Settings() {
  const { user, profile: authProfile, refreshProfile } = useAuth();
  const [localProfile, setLocalProfile] = useState<ExtendedProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Force create a fallback profile if database access fails
  useEffect(() => {
    if (user && !authProfile) {
      console.log('[Settings] No profile found, creating fallback profile');
      
      // Create minimal fallback profile for UI to work
      const fallbackProfile: ExtendedProfile = {
        id: user.id,
        email: user.email || '',
        role: user.email?.includes('@holm.com') ? 'admin' : 'user',
        status: 'active',
        first_name: user.email?.split('@')[0] || 'User',
        is_fallback_profile: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setLocalProfile(fallbackProfile);
      setIsLoading(false);
    } else if (authProfile) {
      console.log('[Settings] Using profile from context:', authProfile);
      setLocalProfile(authProfile as ExtendedProfile);
      setIsLoading(false);
    } else if (!user) {
      console.log('[Settings] No user found');
      setIsLoading(false);
    }
  }, [user, authProfile]);

  // Handle loading state
  if (isLoading) {
    return (
      <DashboardPageContainer className="pb-12">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </DashboardPageContainer>
    );
  }

  // If we have a user but no profile (from context or local fallback)
  if (user && !authProfile && !localProfile) {
    return (
      <DashboardPageContainer className="pb-12">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        <div className="p-6 bg-destructive/10 rounded-lg mb-6">
          <h3 className="text-lg font-medium mb-2">Profile Error</h3>
          <p className="mb-4">We couldn't load your profile data. Please try refreshing the page.</p>
          <button 
            className="px-4 py-2 bg-primary text-white rounded-md"
            onClick={() => {
              refreshProfile?.();
              window.location.reload();
            }}
          >
            Refresh Now
          </button>
        </div>
      </DashboardPageContainer>
    );
  }

  // Use either the context profile or our local fallback
  const displayProfile = authProfile as ExtendedProfile || localProfile;

  return (
    <DashboardPageContainer className="pb-12">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Profile profile={displayProfile} />
        </TabsContent>
        
        <TabsContent value="appearance">
          <Appearance />
        </TabsContent>
        
        <TabsContent value="security">
          <Security />
        </TabsContent>
        
        <TabsContent value="notifications">
          <Notifications />
        </TabsContent>
        
        <TabsContent value="billing">
          <Billing />
        </TabsContent>
        
        <TabsContent value="api">
          <APIKeys />
        </TabsContent>
      </Tabs>

      {/* Admin Access Tool */}
      <div className="mb-8 mt-12">
        <h2 className="text-2xl font-bold mb-4">Admin Access</h2>
        <AdminSetter />
      </div>
      
      {/* Debug info for troubleshooting */}
      <div className="mt-12 p-4 border border-gray-200 rounded-md">
        <h3 className="text-sm font-semibold mb-2">Debug Information</h3>
        <div className="text-xs text-muted-foreground">
          <p>User ID: {user?.id || "Not logged in"}</p>
          <p>Email: {user?.email || "Unknown"}</p>
          <p>Profile Status: {authProfile ? "Loaded from DB" : (localProfile ? "Using fallback" : "Not loaded")}</p>
          <p>Role: {displayProfile?.role || "Unknown"}</p>
          <p>Is Admin: {displayProfile?.role === "admin" ? "Yes" : "No"}</p>
          <p>Is Fallback: {displayProfile?.is_fallback_profile ? "Yes" : "No"}</p>
        </div>
      </div>
    </DashboardPageContainer>
  );
}
