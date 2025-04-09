import React, { useState } from 'react';
import { useAuth } from '@/contexts/UnifiedAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Check, User, Shield } from 'lucide-react';

export function AdminSetter() {
  const auth = useAuth();
  const { user, profile, isAdmin, setUserAsAdmin } = auth;
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  
  if (!user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Admin Access</CardTitle>
          <CardDescription>You need to be logged in to set admin status</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  const handleSetAdmin = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      // First try refreshing auth state to ensure we have latest profile
      await auth.refreshProfile();
      
      if (isAdmin) {
        setResult('You are already an admin!');
        setIsLoading(false);
        return;
      }
      
      // Set user as admin
      const success = await setUserAsAdmin();
      
      if (success) {
        setResult('Successfully set as admin! Refreshing state...');
        // Refresh auth state to update UI
        setTimeout(() => {
          auth.refreshProfile();
          setIsLoading(false);
        }, 1000);
      } else {
        setResult('Failed to set admin status. Check console for details.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error setting admin status:', error);
      setResult('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Admin Access Tool
        </CardTitle>
        <CardDescription>
          Set your account as admin for full access
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="font-medium">{profile?.email || user.email}</div>
              <div className="text-sm text-muted-foreground">
                {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : 'User'}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Current Role:</span>
            <Badge variant={isAdmin ? "default" : "secondary"} className={isAdmin ? "bg-green-500" : ""}>
              {isAdmin ? 'Admin' : (profile?.role || 'Unknown')}
            </Badge>
          </div>
          
          {result && (
            <div className={`p-3 rounded-md ${result.includes('Success') ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
              <div className="flex items-center gap-2">
                {result.includes('Success') ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                <p className="text-sm">{result}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleSetAdmin} 
          disabled={isLoading || isAdmin}
          className="w-full"
        >
          {isLoading ? 'Setting admin status...' : isAdmin ? 'Already Admin' : 'Set as Admin'}
        </Button>
      </CardFooter>
    </Card>
  );
} 