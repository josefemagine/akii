tsx
/**
 * Settings component for the dashboard
 * Handles displaying and updating the user's settings
 */

import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { useEffect, useState } from 'react';
import { UserRepository } from '@/lib/database/user-repository';
import { useRouter } from 'next/navigation';

/**
 * Settings component
 * Fetches and displays user settings, including profile information
 */
export default function Settings() {
  const { user, profile, refreshProfile } = useUnifiedAuth();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    /**
     * Fetch user settings
     */
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        console.log('[Settings] Fetching user settings');

        // Ensure user is available
        if (!user) {
          console.error('[Settings] No user found');
          return;
        }

        // Retrieve profile data
        if (!profile) {
          console.warn('[Settings] No profile data found - fetching');
          await refreshProfile();
        }

        console.log('[Settings] User settings loaded');
      } catch (err) {
        console.error('[Settings] Error fetching user settings:', err);
      } finally {
        setIsLoading(false);
      }
    };
    if(!profile){
        refreshProfile()
    }

    fetchSettings();
  }, [user, profile, refreshProfile]);

  // Loading state
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Main content
  return (
    <div>
      <h1>Settings</h1>
      <p>User ID: {user?.id}</p>
      <p>Email: {user?.email}</p>
      <p>Name: {profile?.full_name}</p>
      {/* Add more settings fields here */}
    </div>
  );
}