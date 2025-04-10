import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/UnifiedAuthContext";
import UserProfileCard from "@/components/dashboard/UserProfileCard";
import { UserRepository } from "@/lib/database/user-repository";

const ProfilePage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [isRepoAvailable, setIsRepoAvailable] = useState<boolean>(false);
  
  // Check if the repository is available
  useEffect(() => {
    const checkRepo = async () => {
      try {
        // Just check if UserRepository is defined
        setIsRepoAvailable(!!UserRepository);
        console.log("UserRepository available:", UserRepository);
      } catch (err) {
        console.error("Error with UserRepository:", err);
        setIsRepoAvailable(false);
      }
    };
    
    checkRepo();
  }, []);
  
  if (isLoading) {
    return <div className="p-8 text-center">Loading auth state...</div>;
  }
  
  if (!user) {
    return <div className="p-8 text-center">Please sign in to view your profile.</div>;
  }
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
      
      {!isRepoAvailable && (
        <div className="bg-red-100 text-red-800 p-4 mb-6 rounded">
          Warning: Repository module not loaded correctly.
        </div>
      )}
      
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Profile Details</h2>
          <UserProfileCard userId={user.id} />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Account Information</h2>
          <div className="bg-card rounded-lg border p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">User ID</h3>
                <p className="font-mono text-sm break-all">{user.id}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Email</h3>
                <p>{user.email}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Auth Provider</h3>
                <p className="capitalize">{user.app_metadata?.provider || "email"}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Last Sign In</h3>
                <p>{new Date(user.last_sign_in_at || Date.now()).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 