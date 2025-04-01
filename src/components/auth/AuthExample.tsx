import React, { useState } from 'react';
import { useAuth, useIsAuthenticated, useProfile } from '@/contexts/ConsolidatedAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

export default function AuthExample() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Use our new auth hooks
  const { signIn, signOut, updateProfile, isLoading } = useAuth();
  const isAuthenticated = useIsAuthenticated();
  const profile = useProfile();

  // Handle sign in
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    const { error } = await signIn(email, password);
    if (!error) {
      // Clear form on success
      setEmail('');
      setPassword('');
    }
  };
  
  // Handle sign out
  const handleSignOut = async () => {
    await signOut();
  };
  
  // Handle profile update
  const handleUpdateName = async () => {
    const firstName = prompt('Enter your first name:');
    const lastName = prompt('Enter your last name:');
    
    if (firstName || lastName) {
      await updateProfile({
        first_name: firstName || undefined,
        last_name: lastName || undefined,
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Authentication Example</CardTitle>
        <CardDescription>
          Using the consolidated Auth Context
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isAuthenticated ? (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-medium">
                Welcome, {profile?.first_name || profile?.email || 'User'}!
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
                onChange={(e) => setEmail(e.target.value)}
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
                onChange={(e) => setPassword(e.target.value)}
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
        This component uses the new consolidated Auth Context
      </CardFooter>
    </Card>
  );
} 