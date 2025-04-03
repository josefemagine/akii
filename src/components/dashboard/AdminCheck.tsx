import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-compatibility';
import { supabase } from '@/lib/supabase';

/**
 * Component to check admin status directly from the database
 * This is a diagnostic component - for use in development only
 */
const AdminCheck: React.FC = () => {
  const { user, profile, isAdmin } = useAuth();
  const [dbProfile, setDbProfile] = useState<any>(null);
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

        setDbProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    checkAdminStatusInDb();
  }, [user?.id]);

  if (loading) {
    return <div>Loading admin status...</div>;
  }

  return (
    <div style={{ 
      backgroundColor: '#f0f0f0', 
      padding: '1rem', 
      border: '1px solid #ddd',
      borderRadius: '0.5rem',
      marginBottom: '1rem',
      color: '#333'
    }}>
      <h3 style={{ margin: '0 0 0.5rem 0' }}>Admin Status Check</h3>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '0.5rem' }}>
          Error: {error}
        </div>
      )}
      
      <div style={{ fontSize: '0.875rem' }}>
        <p><strong>User ID:</strong> {user?.id || 'Not logged in'}</p>
        <p><strong>Email:</strong> {user?.email || 'Not available'}</p>
        <p><strong>Context - isAdmin:</strong> {isAdmin ? 'true' : 'false'}</p>
        <p><strong>Context - Profile Role:</strong> {profile?.role || 'Not set'}</p>
        <p><strong>DB - Profile Role:</strong> {dbProfile?.role || 'Not set'}</p>
      </div>
    </div>
  );
};

export default AdminCheck; 