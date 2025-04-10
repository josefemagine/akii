import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.tsx";
import { Camera, Loader2 } from "lucide-react";
import { useRef } from "react";
import { useAuth } from "@/contexts/UnifiedAuthContext.tsx";
import type { Profile as ProfileType } from "@/types/auth.ts";
import { useToast } from "@/components/ui/use-toast.ts";
import { supabase } from "@/lib/supabase.tsx";

// Default avatar URL
const DEFAULT_AVATAR_URL = "https://injxxchotrvgvvzelhvj.supabase.co/storage/v1/object/public/avatars/b574f273-e0e1-4cb8-8c98-f5a7569234c8/green-robot-icon.png";

// Edge Function endpoint
const USER_DATA_ENDPOINT = "https://injxxchotrvgvvzelhvj.supabase.co/functions/v1/user-data";

interface ExtendedProfile extends ProfileType {
  // Add any extended profile properties here
}

const Profile = () => {
  const { user, isAdmin } = useAuth();
  const [profileData, setProfileData] = useState<ExtendedProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Form setup
  const form = useForm({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      company: "",
    },
  });

  // Fetch user data from Edge Function with direct database query
  const fetchUserData = async () => {
    if (!user) return;
    
    setIsFetching(true);
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        throw new Error("No active session");
      }
      
      const response = await fetch(USER_DATA_ENDPOINT, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionData.session.access_token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch user data");
      }
      
      const userData = await response.json();
      console.log("User data fetched directly from database:", userData);
      setProfileData(userData);
      
      // Update form values
      form.reset({
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
        email: userData.email || "",
        company: userData.company || "",
      });
      
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch user data",
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
    }
  };

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, [user]);
  
  // Submit handler - uses the direct database approach via Edge Function
  const onSubmit = async (data: any) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update your profile",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create a simple update with only the fields we need to change
      const updates = {
        first_name: data.first_name,
        last_name: data.last_name,
        company: data.company,
      };
      
      // Get current session for the token
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        throw new Error("No active session");
      }
      
      // Send update to the Edge Function that uses direct database queries
      const response = await fetch(USER_DATA_ENDPOINT, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionData.session.access_token}`
        },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }
      
      const result = await response.json();
      console.log("Profile updated directly in database:", result);
      
      // Update the local state with the new profile data
      setProfileData(result.profile);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error('Profile update error:', error);
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Avatar upload - still uses Storage API but updates profile through Edge Function
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };
  
  // Handle avatar upload
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;
    
    setIsUploading(true);
    
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      // Get current session for the token
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        throw new Error("No active session");
      }
      
      // Update profile with new avatar URL via Edge Function
      const response = await fetch(USER_DATA_ENDPOINT, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionData.session.access_token}`
        },
        body: JSON.stringify({
          avatar_url: urlData.publicUrl
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update avatar");
      }
      
      const result = await response.json();
      console.log("Avatar updated via direct database approach:", result);
      
      // Update the local state with the new profile data
      setProfileData(result.profile);
      
      toast({
        title: "Avatar updated",
        description: "Your avatar has been updated successfully.",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload avatar",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Show admin badge when applicable
  const AdminBadge = () => {
    if (!isAdmin) return null;
    
    return (
      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 ml-2">
        Admin
      </div>
    );
  };

  // Admin-only section
  const AdminSection = ({ profileData, isAdmin }: { profileData: ExtendedProfile, isAdmin: boolean }) => {
    if (!isAdmin) return null;
    
    // Admin-only content here
    return (
      <div>
        {/* Admin-only content */}
      </div>
    );
  };

  if (isFetching) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Profile
          <AdminBadge />
        </CardTitle>
        <CardDescription>
          Manage your personal information
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {/* Avatar with upload button */}
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profileData?.avatar_url || DEFAULT_AVATAR_URL} />
                  <AvatarFallback className="text-xl bg-primary/10">
                    {profileData?.first_name?.[0]?.toUpperCase() || ''}{profileData?.last_name?.[0]?.toUpperCase() || ''}
                  </AvatarFallback>
                </Avatar>
                <div 
                  className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={triggerFileUpload}
                >
                  {isUploading ? (
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  ) : (
                    <Camera className="h-6 w-6 text-white" />
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={isUploading}
                />
              </div>
              <div>
                <h3 className="text-xl font-semibold">{profileData?.first_name} {profileData?.last_name}</h3>
                <p className="text-gray-500 dark:text-gray-400">{profileData?.email}</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Hover over image to change avatar
                </p>
              </div>
            </div>
            
            {/* Profile form fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="First name" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Last name" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email address" {...field} disabled={true} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input placeholder="Company name" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between items-center border-t p-6">
            <div>{isLoading ? "Saving your profile information..." : ""}</div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default Profile; 