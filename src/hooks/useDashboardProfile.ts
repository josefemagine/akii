import { useState, useCallback, useEffect } from 'react';
import { supabase } from "@/lib/supabase.tsx";
import { UserProfile, UserDisplayData, EnhancedUser } from '@/types/dashboard.ts';
import { extractUserDisplayData, createUserProfile, fetchUserProfile } from '@/utils/dashboard.ts';
import { toast } from '@/components/ui/use-toast.ts';

/**
 * Hook for managing dashboard user profiles
 */
export function useDashboardProfile(typedUser: EnhancedUser | null) {
  // Profile state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [displayData, setDisplayData] = useState<UserDisplayData>({ isAuthenticated: false });
  const [needsProfileCreation, setNeedsProfileCreation] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  
  /**
   * Fetches the user profile from the database
   */
  const loadUserProfile = useCallback(async () => {
    if (!typedUser) return false;
    
    try {
      setIsLoadingProfile(true);
      
      // Fetch user profile from database
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', typedUser.id)
        .single();
      
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        if (profileError.code === 'PGRST116') {
          // Profile doesn't exist
          setNeedsProfileCreation(true);
        }
        return false;
      } else if (profile) {
        setUserProfile(profile);
        setNeedsProfileCreation(false);
        return true;
      } else {
        setNeedsProfileCreation(true);
        return false;
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      return false;
    } finally {
      setIsLoadingProfile(false);
    }
  }, [typedUser]);
  
  /**
   * Creates a profile for the current user
   */
  const handleCreateProfile = useCallback(async () => {
    if (!typedUser) return false;
    
    try {
      setIsLoadingProfile(true);
      
      // Extract data from the authenticated user
      const userData = extractUserDisplayData(typedUser, null);
      
      // Create the profile
      const profile = await createUserProfile(typedUser.id, userData);
      
      if (profile) {
        setUserProfile(profile);
        setNeedsProfileCreation(false);
        
        toast({
          title: "Profile Created",
          description: "Your profile has been created successfully.",
        });
        
        return true;
      } else {
        toast({
          title: "Profile Creation Failed",
          description: "An error occurred while creating your profile.",
          variant: "destructive",
        });
        
        return false;
      }
    } catch (error) {
      console.error('Error in handleCreateProfile:', error);
      
      toast({
        title: "Profile Creation Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsLoadingProfile(false);
    }
  }, [typedUser]);
  
  /**
   * Refreshes the user profile
   */
  const refreshProfile = useCallback(async () => {
    if (!typedUser) return false;
    
    try {
      setIsLoadingProfile(true);
      const profile = await fetchUserProfile(typedUser.id);
      
      if (profile) {
        setUserProfile(profile);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error in refreshProfile:', error);
      return false;
    } finally {
      setIsLoadingProfile(false);
    }
  }, [typedUser]);
  
  // Update display data whenever user or profile changes
  useEffect(() => {
    setDisplayData(extractUserDisplayData(typedUser, userProfile));
  }, [typedUser, userProfile]);
  
  // Clear profile when user is null
  useEffect(() => {
    if (!typedUser) {
      setUserProfile(null);
      setDisplayData({ isAuthenticated: false });
      setNeedsProfileCreation(false);
    }
  }, [typedUser]);
  
  return {
    userProfile,
    displayData,
    needsProfileCreation,
    isLoadingProfile,
    loadUserProfile,
    createProfile: handleCreateProfile,
    refreshProfile
  };
} 