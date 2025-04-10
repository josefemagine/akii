import React, { useState, ChangeEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

export default function AuthExample() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Use our auth hooks
  const { signIn, signOut, user, profile, isLoading, updateProfile } = useAuth();
  const isAuthenticated = !!user;

  // Handle sign in
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      
      // Clear form on success
      setEmail('');
      setPassword('');
    } catch (err) {
      console.error('Error signing in:', err);
      toast({
        title: "Authentication Error",
        description: "Failed to sign in. Please check your credentials and try again."
      });
    }
  };
  
  // Handle sign out
  const handleSignOut = async () => {
    await signOut();
  };
  
  // Now we can update profile with the new hooks
  const handleUpdateName = async () => {
    if (!user?.id) return;
    
    try {
      const success = await updateProfile({ first_name: 'Updated Name' });
      if (success) {
        toast({
          title: "Profile Updated",
          description: "Your name has been updated successfully."
        });
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      toast({
        title: "Update Error",
        description: "Failed to update your profile."
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Authentication Example</CardTitle>
        <CardDescription>
          Using the new Auth Hooks
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isAuthenticated ? (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-medium">
                Welcome, {profile?.first_name || user?.email || 'User'}!
              </h3>
              {profile?.role && (
                <p className="text-sm text-muted-foreground">
                  Role: {profile.role}
                </p>
              )}
            </div>
            
            <div className="flex flex-col space-y-2">
              <Button 
                variant="outline" 
                onClick={handleUpdateName}
                disabled={isLoading}
              >
                Update Name
              </Button>
              
              <Button 
                variant="destructive" 
                onClick={handleSignOut}
                disabled={isLoading}
              >
                {isLoading ? 'Signing Out...' : 'Sign Out'}
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-center text-sm text-muted-foreground">
        This component uses the new modular Auth Hooks
      </CardFooter>
    </Card>
  );
} 