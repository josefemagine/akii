import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/UnifiedAuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DatabaseService } from "@/lib/database";
import { UserRepository } from "@/lib/database/user-repository";
import { AuthRepository } from "@/lib/database/auth-repository";

interface PostgresStatus {
  isConnected: boolean;
  version?: string;
  error?: string;
  latency?: number;
}

interface UserDetails {
  [key: string]: any;
}

interface ProfileDetails {
  [key: string]: any;
}

// Custom badge variants
const SuccessBadge = ({ children }: { children: React.ReactNode }) => (
  <Badge className="bg-green-500 hover:bg-green-600">{children}</Badge>
);

const DangerBadge = ({ children }: { children: React.ReactNode }) => (
  <Badge variant="destructive">{children}</Badge>
);

const SystemDiagnostics: React.FC = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const [postgresStatus, setPostgresStatus] = useState<PostgresStatus | null>(null);
  const [authUserDetails, setAuthUserDetails] = useState<UserDetails | null>(null);
  const [profileDetails, setProfileDetails] = useState<ProfileDetails | null>(null);
  const [loading, setLoading] = useState<{[key: string]: boolean}>({
    postgres: false,
    authUser: false,
    profile: false
  });
  const [error, setError] = useState<{[key: string]: string | null}>({
    postgres: null,
    authUser: null,
    profile: null
  });

  // Check Postgres connection
  const checkPostgresConnection = async () => {
    setLoading(prev => ({ ...prev, postgres: true }));
    setError(prev => ({ ...prev, postgres: null }));
    
    try {
      const startTime = performance.now();
      const result = await DatabaseService.checkConnection();
      const endTime = performance.now();
      
      if (!result) throw new Error("Failed to check database connection");
      
      setPostgresStatus({
        isConnected: result.connected || false,
        version: result.version || 'Unknown',
        latency: Math.round(endTime - startTime),
        error: result.error
      });
    } catch (err: any) {
      console.error('Postgres connection error:', err);
      setPostgresStatus({
        isConnected: false,
        error: err.message || 'Failed to connect to database'
      });
      setError(prev => ({ ...prev, postgres: err.message || 'Failed to connect to database' }));
    } finally {
      setLoading(prev => ({ ...prev, postgres: false }));
    }
  };

  // Get user details from auth.users table
  const getUserDetails = async () => {
    if (!user?.id) return;
    
    setLoading(prev => ({ ...prev, authUser: true }));
    setError(prev => ({ ...prev, authUser: null }));
    
    try {
      // Use the UserRepository to get user details
      const data = await UserRepository.getUserDetails(user.id);
      
      if (!data) throw new Error("Failed to get user details");
      
      setAuthUserDetails(data);
    } catch (err: any) {
      console.error('Error fetching auth user details:', err);
      setError(prev => ({ ...prev, authUser: err.message || 'Failed to load user details' }));
    } finally {
      setLoading(prev => ({ ...prev, authUser: false }));
    }
  };

  // Get user profile from public.profiles table
  const getUserProfile = async () => {
    if (!user?.id) return;
    
    setLoading(prev => ({ ...prev, profile: true }));
    setError(prev => ({ ...prev, profile: null }));
    
    try {
      // Use the UserRepository to get user profile
      const data = await UserRepository.getProfile(user.id);
      
      if (!data) throw new Error("Failed to fetch profile");
      
      setProfileDetails(data);
    } catch (err: any) {
      console.error('Error fetching user profile:', err);
      setError(prev => ({ ...prev, profile: err.message || 'Failed to load profile details' }));
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  };

  // Toggle the admin status using AuthRepository
  const toggleAdminStatus = async () => {
    if (!user?.id) return;
    
    try {
      // Use AuthRepository to toggle admin status
      const success = await UserRepository.toggleAdminStatus(user.id);
      
      if (!success) throw new Error("Failed to toggle admin status");
      
      // Refresh user details after toggling admin status
      getUserDetails();
    } catch (err: any) {
      console.error('Error toggling admin status:', err);
      setError(prev => ({ ...prev, authUser: err.message || 'Failed to toggle admin status' }));
    }
  };

  // Format a value for display
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '(null)';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    return String(value);
  };

  // Run all diagnostics
  const runAllDiagnostics = () => {
    checkPostgresConnection();
    getUserDetails();
    getUserProfile();
  };

  // Run diagnostics on mount
  useEffect(() => {
    if (user?.id) {
      runAllDiagnostics();
    }
  }, [user?.id]);

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">System Diagnostics</h1>
        <Button onClick={runAllDiagnostics}>
          Refresh All
        </Button>
      </div>

      {/* Database Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>1. Postgres Database Connection Status</span>
            {loading.postgres ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : postgresStatus?.isConnected ? (
              <CheckCircle2 className="text-green-500 h-5 w-5" />
            ) : (
              <XCircle className="text-red-500 h-5 w-5" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading.postgres ? (
            <p>Testing connection...</p>
          ) : error.postgres ? (
            <div className="text-red-500">
              <p>Error: {error.postgres}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={checkPostgresConnection}
                className="mt-2"
              >
                Retry
              </Button>
            </div>
          ) : postgresStatus ? (
            <div className="space-y-2">
              <p>
                <strong>Status:</strong>{" "}
                {postgresStatus.isConnected ? (
                  <SuccessBadge>Connected</SuccessBadge>
                ) : (
                  <DangerBadge>Disconnected</DangerBadge>
                )}
              </p>
              {postgresStatus.version && (
                <p><strong>Version:</strong> {postgresStatus.version}</p>
              )}
              {postgresStatus.latency && (
                <p><strong>Latency:</strong> {postgresStatus.latency}ms</p>
              )}
              {postgresStatus.error && (
                <p><strong>Error:</strong> {postgresStatus.error}</p>
              )}
            </div>
          ) : (
            <Button onClick={checkPostgresConnection}>Check Connection</Button>
          )}
        </CardContent>
      </Card>

      {/* Authentication State */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>2. Authentication State</span>
            {isLoading ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : user ? (
              <CheckCircle2 className="text-green-500 h-5 w-5" />
            ) : (
              <XCircle className="text-red-500 h-5 w-5" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading authentication state...</p>
          ) : user ? (
            <div className="space-y-2">
              <p><strong>Status:</strong> <SuccessBadge>Authenticated</SuccessBadge></p>
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p>
                <strong>Admin:</strong>{" "}
                {isAdmin ? (
                  <SuccessBadge>Yes</SuccessBadge>
                ) : (
                  <Badge>No</Badge>
                )}
              </p>
              <p><strong>Auth Provider:</strong> {user.app_metadata?.provider || 'email'}</p>
            </div>
          ) : (
            <div>
              <DangerBadge>Not Authenticated</DangerBadge>
              <p className="mt-2">Please sign in to view authentication details.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details from auth.users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>3. User Details (auth.users table)</span>
            {loading.authUser ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : authUserDetails ? (
              <CheckCircle2 className="text-green-500 h-5 w-5" />
            ) : (
              <XCircle className="text-red-500 h-5 w-5" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!user?.id ? (
            <p>Please sign in to view user details.</p>
          ) : loading.authUser ? (
            <p>Loading user details...</p>
          ) : error.authUser ? (
            <div className="text-red-500">
              <p>Error: {error.authUser}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={getUserDetails}
                className="mt-2"
              >
                Retry
              </Button>
            </div>
          ) : authUserDetails ? (
            <div>
              <div className="mb-4 flex gap-2">
                <Button 
                  size="sm" 
                  onClick={toggleAdminStatus}
                  variant="outline"
                >
                  {authUserDetails.is_admin ? 'Remove Admin Status' : 'Make Admin'}
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-300 dark:border-gray-700">
                      <th className="text-left py-2 pr-4 font-medium">Field</th>
                      <th className="text-left py-2 font-medium">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(authUserDetails).map(([key, value]) => (
                      <tr key={key} className="border-b border-gray-200 dark:border-gray-800">
                        <td className="py-2 pr-4 font-medium align-top">{key}</td>
                        <td className="py-2 whitespace-pre-wrap break-all">
                          {formatValue(value)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <Button onClick={getUserDetails}>Load User Details</Button>
          )}
        </CardContent>
      </Card>

      {/* Public Profile Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>4. User Public Profile (public.profiles table)</span>
            {loading.profile ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : profileDetails ? (
              <CheckCircle2 className="text-green-500 h-5 w-5" />
            ) : (
              <XCircle className="text-red-500 h-5 w-5" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!user?.id ? (
            <p>Please sign in to view profile details.</p>
          ) : loading.profile ? (
            <p>Loading profile details...</p>
          ) : error.profile ? (
            <div className="text-red-500">
              <p>Error: {error.profile}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={getUserProfile}
                className="mt-2"
              >
                Retry
              </Button>
            </div>
          ) : profileDetails ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-300 dark:border-gray-700">
                    <th className="text-left py-2 pr-4 font-medium">Field</th>
                    <th className="text-left py-2 font-medium">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(profileDetails).map(([key, value]) => (
                    <tr key={key} className="border-b border-gray-200 dark:border-gray-800">
                      <td className="py-2 pr-4 font-medium align-top">{key}</td>
                      <td className="py-2 whitespace-pre-wrap break-all">
                        {formatValue(value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Button onClick={getUserProfile}>Load Profile</Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemDiagnostics; 