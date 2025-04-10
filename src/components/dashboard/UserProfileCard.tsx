import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Loader2, UserCircle, Mail, Phone, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.tsx";
import { UserRepository } from "@/lib/database/user-repository";
import type { UserProfile } from "@/lib/database/user-repository";

interface UserProfileCardProps {
  userId: string;
  showActions?: boolean;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({
  userId,
  showActions = true
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load user profile using UserRepository
  const loadProfile = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const userProfile = await UserRepository.getProfile(userId);
      setProfile(userProfile);
    } catch (err) {
      console.error("Error loading user profile:", err);
      setError("Failed to load user profile");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load profile on component mount or when userId changes
  useEffect(() => {
    if (userId) {
      loadProfile();
    }
  }, [userId]);
  
  // Get display name with fallbacks
  const displayName = 
    profile?.first_name && profile?.last_name 
      ? `${profile.first_name} ${profile.last_name}`
      : profile?.first_name || profile?.display_name || "User";
  
  // Get avatar URL with fallback
  const avatarUrl = profile?.avatar_url || "/assets/default-avatar.png";
  const firstInitial = displayName.charAt(0).toUpperCase();
  
  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6 flex justify-center items-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto border-destructive">
        <CardContent className="pt-6">
          <div className="text-destructive text-center">
            <p>{error}</p>
            <Button 
              variant="outline" 
              onClick={loadProfile}
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!profile) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <p>User profile not found</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="flex flex-col items-center space-y-2">
        <Avatar className="h-20 w-20">
          <AvatarImage src={avatarUrl} alt={`${displayName}'s profile picture`} />
          <AvatarFallback className="text-xl">
            {firstInitial || <User className="h-6 w-6" />}
          </AvatarFallback>
        </Avatar>
        <CardTitle className="text-center">{displayName}</CardTitle>
        {profile.is_admin && (
          <div className="px-2 py-1 text-xs font-medium bg-amber-200 text-amber-900 rounded flex items-center">
            Admin
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start space-x-3">
          <Mail className="h-5 w-5 mt-0.5 text-muted-foreground" />
          <div>
            <p className="font-medium">Email</p>
            <p className="text-muted-foreground">{profile.email || "Not specified"}</p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3">
          <Phone className="h-5 w-5 mt-0.5 text-muted-foreground" />
          <div>
            <p className="font-medium">Phone</p>
            <p className="text-muted-foreground">{profile.phone || "Not specified"}</p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3">
          <UserCircle className="h-5 w-5 mt-0.5 text-muted-foreground" />
          <div>
            <p className="font-medium">Status</p>
            <p className="text-muted-foreground capitalize">{profile.status || "Unknown"}</p>
          </div>
        </div>
      </CardContent>
      
      {showActions && (
        <CardFooter className="flex justify-center gap-2">
          <Button variant="outline" onClick={loadProfile}>
            Refresh
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default UserProfileCard; 