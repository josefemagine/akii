import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2 } from "lucide-react";
import { useRef } from "react";
import { useAuth } from "@/contexts/UnifiedAuthContext";
import type { Profile } from "@/types/auth";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

// Default avatar URL
const DEFAULT_AVATAR_URL = "https://injxxchotrvgvvzelhvj.supabase.co/storage/v1/object/public/avatars/b574f273-e0e1-4cb8-8c98-f5a7569234c8/green-robot-icon.png";

// Extended profile interface
interface ExtendedProfile extends Profile {
  display_name?: string;
  avatar_url?: string;
  company?: string;
}

interface ProfileProps {
  profile: ExtendedProfile | null;
}

const Profile = ({ profile }: ProfileProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { refreshProfile, updateProfile } = useAuth();
  const { toast } = useToast();

  // Verify session before operations
  useEffect(() => {
    // Check if we have a valid session
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      const currentSession = data.session;
      
      if (!currentSession) {
        console.warn('No active session found. User may need to re-authenticate.');
      } else {
        console.log('Valid session found, profile updates should work');
      }
    };
    
    checkSession();
  }, []);
  
  // Form setup
  const form = useForm({
    defaultValues: {
      first_name: profile?.first_name || "",
      last_name: profile?.last_name || "",
      email: profile?.email || "",
      company: profile?.company || "",
    },
  });
  
  // Submit handler
  const onSubmit = async (data: any) => {
    console.log('Profile form submitted with data:', data);
    
    if (!profile?.id) {
      console.error('Profile ID not found. Cannot update profile.');
      toast({
        title: "Error",
        description: "Profile ID not found. Cannot update profile.",
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
        updated_at: new Date().toISOString()
      };
      
      // Make the simplest possible update request
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id);
      
      if (error) {
        throw error;
      }
      
      // Update the UI immediately
      form.reset({
        ...data,
        email: profile.email
      });
      
      // Try to refresh the profile if available
      if (refreshProfile) {
        try {
          await refreshProfile();
        } catch (e) {
          // Continue if refresh fails
        }
      }
      
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
  
  // Avatar upload
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };
  
  // Handle avatar upload
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile?.id) return;
    
    setIsUploading(true);
    
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${profile.id}/${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: data.publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);
      
      if (updateError) {
        throw updateError;
      }
      
      // Refresh auth context to show new avatar
      refreshProfile?.();
      
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
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
                  <AvatarImage src={profile?.avatar_url || DEFAULT_AVATAR_URL} />
                  <AvatarFallback className="text-xl bg-primary/10">
                    {profile?.first_name?.[0]?.toUpperCase() || ''}{profile?.last_name?.[0]?.toUpperCase() || ''}
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
                <h3 className="text-xl font-semibold">{profile?.first_name} {profile?.last_name}</h3>
                <p className="text-gray-500 dark:text-gray-400">{profile?.email}</p>
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