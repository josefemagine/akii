import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default function AdminForcedAccess() {
  const { user, forceAdminRole, refreshUserRole, isAdmin, userRole } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Set up all the admin overrides
    if (user?.email) {
      // Set the admin override flags in session storage
      try {
        sessionStorage.setItem('admin_override', 'true');
        sessionStorage.setItem('admin_override_email', user.email);
        sessionStorage.setItem('admin_override_time', Date.now().toString());
        
        localStorage.setItem('admin_override', 'true');
        
        // Force admin role in the context
        forceAdminRole();
        
        // Also attempt a database update
        const updateDatabaseRole = async () => {
          try {
            const { error } = await supabaseAdmin
              .from('profiles')
              .update({ role: 'admin' })
              .eq('email', user.email);
              
            if (error) {
              console.error('Error updating profile in DB:', error);
            } else {
              console.log('Successfully updated profile in DB');
              // Refresh role from DB
              await refreshUserRole();
            }
          } catch (error) {
            console.error('Exception updating profile:', error);
          }
        };
        
        updateDatabaseRole();
      } catch (error) {
        console.error('Error setting admin overrides:', error);
      }
    }
  }, [user, forceAdminRole, refreshUserRole]);
  
  const accessAdmin = () => {
    // Navigate with the override parameter
    navigate('/admin?override=true');
  };
  
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Admin Access Override</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-slate-100 p-4 rounded">
            <p><strong>Email:</strong> {user?.email || 'Not logged in'}</p>
            <p><strong>Current Role:</strong> {userRole || 'None'}</p>
            <p><strong>Admin Status:</strong> {isAdmin ? 'Admin' : 'Not Admin'}</p>
            <p><strong>Override:</strong> {sessionStorage.getItem('admin_override') === 'true' ? 'Active' : 'Not Active'}</p>
          </div>
          
          <div className="space-y-2">
            <p>All admin overrides have been applied. Click the button below to access the admin area:</p>
            
            <Button 
              onClick={accessAdmin} 
              className="w-full"
            >
              Access Admin Dashboard
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>This page bypasses normal admin checks and forces admin access using multiple techniques:</p>
            <ol className="list-decimal list-inside ml-2 mt-2">
              <li>Sets local and session storage overrides</li>
              <li>Updates your role in the auth context</li>
              <li>Attempts to update your role in the database</li>
              <li>Adds a URL override parameter to the admin route</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 