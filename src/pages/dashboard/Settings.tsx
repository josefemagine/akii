import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { DashboardPageContainer } from "@/components/layout/DashboardPageContainer.tsx";
import Profile from "./Profile.tsx";
import Appearance from "./Appearance.tsx";
import Security from "./Security.tsx";
import Notifications from "./Notifications.tsx";
import Billing from "./Billing.tsx";
import APIKeys from "./APIKeys.tsx";
import { AdminSetter } from '@/components/debug/AdminSetter.tsx';
import { useAuth } from "@/contexts/UnifiedAuthContext.tsx";
import type { Profile as ProfileType } from "@/types/auth.ts";

// Custom profile type that extends the basic Profile from auth types
// All properties are already included in the Profile type from @/types/auth
type ExtendedProfile = ProfileType;

export default function Settings() {
  const { user, profile: authProfile, refreshProfile, hasUser, authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  // Check profile loading state
  useEffect(() => {
    if (authProfile || (!user && !authLoading)) {
      // Either we have a profile or there's no user (not logged in)
      setIsLoading(false);
    }
  }, [user, authProfile, authLoading]);

  // Handle loading state
  if (authLoading || isLoading) {
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

  // If we have a user but no profile - show error with debugging information
  if (hasUser && !authProfile) {
    return (
      <DashboardPageContainer className="pb-12">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        <div className="p-6 bg-destructive/10 rounded-lg mb-6">
          <h3 className="text-lg font-medium mb-2">Profile Error</h3>
          <p className="mb-4">We couldn't load your profile data. This might be due to a database connection issue or missing profile record.</p>
          
          {/* Debug information */}
          <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono overflow-auto">
            <p>User ID: {user?.id || "Not available"}</p>
            <p>Email: {user?.email || "Not available"}</p>
            <p>Auth State: {hasUser ? "Authenticated" : "Not authenticated"}</p>
            <p>Timestamp: {new Date().toISOString()}</p>
          </div>
          
          <div className="flex space-x-3">
            <button 
              className="px-4 py-2 bg-primary text-white rounded-md"
              onClick={() => {
                refreshProfile?.();
              }}
            >
              Retry Loading Profile
            </button>
            
            <button 
              className="px-4 py-2 bg-secondary text-white rounded-md"
              onClick={() => {
                window.location.reload();
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      </DashboardPageContainer>
    );
  }

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
          <Profile />
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
          <p>Profile Status: {authProfile ? "Loaded from DB" : "Not loaded"}</p>
          <p>Role: {authProfile?.role || "Unknown"}</p>
          <p>Is Admin: {authProfile?.role === "admin" ? "Yes" : "No"}</p>
        </div>
      </div>
    </DashboardPageContainer>
  );
}
