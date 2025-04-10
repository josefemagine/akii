import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/UnifiedAuthContext.tsx';
import { supabase } from "@/lib/supabase.tsx";
import { Profile } from '@/types/auth.ts';

/**
 * Component to check admin status directly from the database
 * This is a diagnostic component - for use in development only
 */
const AdminCheck: React.FC = () => {
  const { user, profile, isAdmin, isDeveloper } = useAuth();
  const [dbProfile, setDbProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkAdminStatusInDb() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          throw error;
        }

        setDbProfile(data as Profile);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        console.error('[AdminCheck] Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    }

    checkAdminStatusInDb();
  }, [user?.id]);

  if (loading) {
    return <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md">Loading admin status...</div>;
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg mb-4 text-gray-900 dark:text-gray-100">
      <h3 className="text-lg font-medium mb-2">Admin Status Check</h3>
      
      {error && (
        <div className="text-red-600 dark:text-red-400 mb-2 p-2 bg-red-50 dark:bg-red-900/20 rounded">
          Error: {error}
        </div>
      )}
      
      <div className="text-sm space-y-1">
        <p><strong>User ID:</strong> {user?.id || 'Not logged in'}</p>
        <p><strong>Email:</strong> {user?.email || 'Not available'}</p>
        <p><strong>Context - isAdmin:</strong> {isAdmin ? 'true' : 'false'}</p>
        <p><strong>Context - isDeveloper:</strong> {isDeveloper ? 'true' : 'false'}</p>
        <p><strong>Context - Profile Role:</strong> {profile?.role || 'Not set'}</p>
        <p><strong>DB - Profile Role:</strong> {dbProfile?.role || 'Not set'}</p>
        <p><strong>Auth Status:</strong> {profile?.status || 'Not set'}</p>
        <p><strong>Subscription Tier:</strong> {profile?.subscription_tier || 'Not set'}</p>
      </div>
    </div>
  );
};

export default AdminCheck; 