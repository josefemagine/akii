import React, { useState } from 'react';
import { useAuth } from '@/contexts/UnifiedAuthContext.tsx';
import { supabase } from "@/lib/supabase.tsx";
import { Button } from '@/components/ui/button.tsx';
import { Shield, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast.ts';

export function AdminSetter() {
  const { user, profile, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<Record<string, any>>({});
  
  // Get user information
  const userEmail = user?.email || profile?.email || '';
  const userId = user?.id || profile?.id || '';
  const currentRole = profile?.role || 'Unknown';
  
  // Check if Supabase environment variables are properly set
  const checkSupabaseConfig = () => {
    // Check if Supabase URL and anon key are available
    let supabaseUrl = '';
    let supabaseKey = '';
    
    // Try to access env vars safely
    try {
      if (typeof import.meta !== 'undefined' && import.meta.env) {
        supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL || '';
        supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || '';
      }
      
      // Check window.ENV as fallback
      if ((!supabaseUrl || !supabaseKey) && typeof window !== 'undefined' && window.ENV) {
        supabaseUrl = supabaseUrl || window.ENV.VITE_SUPABASE_URL || window.ENV.SUPABASE_URL || '';
        supabaseKey = supabaseKey || window.ENV.VITE_SUPABASE_ANON_KEY || window.ENV.SUPABASE_ANON_KEY || '';
      }
      
      return {
        isConfigured: Boolean(supabaseUrl && supabaseKey),
        url: supabaseUrl ? `${supabaseUrl.substring(0, 15)}...` : 'missing',
      };
    } catch (error) {
      console.error('Error checking Supabase configuration:', error);
      return { isConfigured: false, error };
    }
  };
  
  const setAdminRole = async () => {
    if (!userId || !userEmail) {
      toast({
        title: "Error",
        description: "User information is missing",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    setErrorDetails(null);
    setDebugInfo({});
    
    // Check Supabase configuration
    const supabaseConfig = checkSupabaseConfig();
    setDebugInfo(prev => ({ ...prev, supabaseConfig }));
    
    try {
      console.log('Setting admin role for:', { userId, userEmail });
      
      // Use the edge function first as it has service role permissions
      console.log('Attempting to use edge function...');
      const edgeFnResponse = await supabase.functions.invoke('ensure_profile_exists', {
        body: {
          user_id: userId,
          email: userEmail,
          role: 'admin',
          status: 'active'
        }
      });
      
      if (edgeFnResponse.error) {
        console.error('Edge function error:', edgeFnResponse.error);
        setErrorDetails(`Edge function error: ${JSON.stringify(edgeFnResponse.error, null, 2)}`);
        setDebugInfo(prev => ({ 
          ...prev, 
          edgeFnError: edgeFnResponse.error,
          edgeFnErrorTime: new Date().toISOString()
        }));
        
        // Fall back to RPC call
        console.log('Edge function failed, falling back to RPC call...');
        const rpcResponse = await supabase
          .rpc('ensure_profile_exists', {
            user_id: userId,
            user_email: userEmail,
            user_role: 'admin',
            user_status: 'active'
          });
        
        if (rpcResponse.error) {
          console.error('RPC error:', rpcResponse.error);
          setErrorDetails(prev => `${prev}\n\nRPC Error: ${rpcResponse.error.message} (Code: ${rpcResponse.error.code})`);
          setDebugInfo(prev => ({ 
            ...prev, 
            rpcError: rpcResponse.error,
            rpcErrorTime: new Date().toISOString() 
          }));
          
          // Last resort: direct update
          console.log('RPC failed, attempting direct profile update as last resort...');
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ 
              role: 'admin',
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);
            
          if (updateError) {
            console.error('Direct update error:', updateError);
            setErrorDetails(prev => `${prev}\n\nDirect update error: ${updateError.message} (Code: ${updateError.code})`);
            setDebugInfo(prev => ({ 
              ...prev, 
              directUpdateError: updateError,
              directUpdateErrorTime: new Date().toISOString() 
            }));
            throw updateError;
          } else {
            console.log('Direct update successful');
            setDebugInfo(prev => ({ 
              ...prev, 
              directUpdateSuccess: true,
              directUpdateTime: new Date().toISOString() 
            }));
          }
        } else {
          console.log('RPC call successful:', rpcResponse.data);
          setDebugInfo(prev => ({ 
            ...prev, 
            rpcSuccess: true,
            rpcSuccessTime: new Date().toISOString() 
          }));
        }
      } else {
        console.log('Edge function successful:', edgeFnResponse.data);
        setDebugInfo(prev => ({ 
          ...prev, 
          edgeFnSuccess: true,
          edgeFnSuccessTime: new Date().toISOString(),
          edgeFnResponse: edgeFnResponse.data 
        }));
      }
      
      // Refresh the profile to get the latest changes
      await refreshProfile();
      setDebugInfo(prev => ({ 
        ...prev, 
        profileRefreshed: true,
        profileRefreshTime: new Date().toISOString() 
      }));
      
      toast({
        title: "Success",
        description: "Admin role set successfully",
        variant: "default"
      });
    } catch (error) {
      console.error('Failed to set admin role:', error);
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      setErrorDetails(prev => `${prev || ''}\n\nFinal error: ${errorMessage}`);
      setDebugInfo(prev => ({ 
        ...prev, 
        finalError: error,
        finalErrorTime: new Date().toISOString() 
      }));
      
      toast({
        title: "Error",
        description: "Failed to set admin role. See details below.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-950 p-6 shadow-sm dark:border-slate-800">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Admin Access Tool</h3>
        </div>
        
        <p className="text-sm text-slate-400">
          Set your account as admin for full access
        </p>
        
        <div className="flex items-center space-x-2 text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </span>
            <span className="font-medium">{userEmail}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">User ID: {userId ? userId.substring(0, 8) + '...' : 'Unknown'}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm">Current Role:</span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            currentRole === 'admin' 
              ? 'bg-green-800 text-green-100' 
              : 'bg-slate-800 text-slate-100'
          }`}>
            {currentRole}
          </span>
        </div>
        
        <Button
          onClick={setAdminRole}
          disabled={isLoading || currentRole === 'admin'}
          className="w-full"
          variant={currentRole === 'admin' ? "outline" : "default"}
        >
          {isLoading ? 'Setting...' : currentRole === 'admin' ? 'Already Admin' : 'Set as Admin'}
        </Button>
        
        {errorDetails && (
          <div className="mt-4 rounded border border-red-400 bg-red-100 p-3 text-xs text-red-800 dark:bg-red-900/20 dark:text-red-400">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4" />
              <strong>Error Details:</strong>
            </div>
            <pre className="mt-1 whitespace-pre-wrap overflow-auto max-h-40">{errorDetails}</pre>
            
            {Object.keys(debugInfo).length > 0 && (
              <details className="mt-2">
                <summary className="text-xs cursor-pointer">Debug Information</summary>
                <pre className="mt-1 text-xs whitespace-pre-wrap overflow-auto max-h-60">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminSetter; 