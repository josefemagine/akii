import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/UnifiedAuthContext.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { AlertTriangle, Check, User, Shield, Loader2 } from 'lucide-react';
import { UserRepository } from '@/lib/database/user-repository';

export function AdminSetter() {
  const auth = useAuth();
  const { user, profile, isAdmin: contextIsAdmin } = auth;
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [isAdminViaREST, setIsAdminViaREST] = useState<boolean | null>(null);
  const [adminCheckLoading, setAdminCheckLoading] = useState(false);
  
  // Combined admin status - true if any check returns true
  const isAdmin = contextIsAdmin || isAdminViaREST === true;
  
  // Check admin status using REST API
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.id) return;
      
      setAdminCheckLoading(true);
      try {
        console.log("[AdminSetter] Checking admin status via REST API for:", user.id);
        const adminStatus = await UserRepository.checkAdminStatusREST(user.id);
        console.log("[AdminSetter] REST API admin check result:", adminStatus);
        setIsAdminViaREST(adminStatus);
      } catch (error) {
        console.error("[AdminSetter] Error checking admin status via REST:", error);
      } finally {
        setAdminCheckLoading(false);
      }
    };
    
    checkAdminStatus();
  }, [user?.id]);
  
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
      if (isAdmin) {
        setResult('You are already an admin!');
        setIsLoading(false);
        return;
      }
      
      // Use UserRepository to set admin status
      const success = await UserRepository.toggleAdminStatus(user.id);
      
      if (success) {
        setResult('Successfully set as admin! Refreshing state...');
        // Refresh admin status
        setTimeout(async () => {
          try {
            const adminStatus = await UserRepository.checkAdminStatusREST(user.id);
            setIsAdminViaREST(adminStatus);
          } catch (err) {
            console.error("[AdminSetter] Error checking updated admin status:", err);
          } finally {
            setIsLoading(false);
          }
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
            {adminCheckLoading ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                <span className="text-sm">Checking...</span>
              </div>
            ) : (
              <Badge variant={isAdmin ? "default" : "secondary"} className={isAdmin ? "bg-green-500" : ""}>
                {isAdmin ? 'Admin' : (profile?.role || 'User')}
              </Badge>
            )}
          </div>
          
          <div className="text-xs text-muted-foreground mt-2">
            <p>Admin Status via Context: {contextIsAdmin ? 'Yes' : 'No'}</p>
            <p>Admin Status via REST API: {isAdminViaREST === null ? 'Checking...' : isAdminViaREST ? 'Yes' : 'No'}</p>
          </div>
          
          {result && (
            <div className={`p-3 rounded-md ${result.includes('Success') ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300'}`}>
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
          disabled={isLoading || isAdmin || adminCheckLoading}
          className="w-full"
        >
          {isLoading ? 'Setting admin status...' : isAdmin ? 'Already Admin' : 'Set as Admin'}
        </Button>
      </CardFooter>
    </Card>
  );
} 