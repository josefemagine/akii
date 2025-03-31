import React, { useState } from "react";
import { adminClient, supabaseClient } from "@/lib/auth-core";

export default function FixMyAdmin() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<"success" | "error" | "idle">("idle");

  // Function to fix session issues
  const fixSession = async () => {
    setLoading(true);
    setMessage("Clearing session data...");
    try {
      // Clear all localStorage supabase items
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-') || key.startsWith('supabase.')) {
          localStorage.removeItem(key);
        }
      });
      
      // Clear any auth state flags
      localStorage.removeItem('auth-in-progress');
      localStorage.removeItem('auth-in-progress-time');
      
      setMessage("Session cleared successfully. Please sign in again.");
      setStatus("success");
      
      // Redirect to homepage after 2 seconds
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
      
    } catch (error) {
      console.error("Error clearing session:", error);
      setMessage(`Error clearing session: ${error.message}`);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  // Function to directly check the DB role
  const checkDbRole = async () => {
    setLoading(true);
    setMessage("Checking database role...");
    try {
      // Get email from current session
      const { data: { session } } = await supabaseClient.auth.getSession();
      
      if (!session || !session.user || !session.user.email) {
        setMessage("No active session found. Please sign in first.");
        setStatus("error");
        return;
      }
      
      const email = session.user.email;
      
      // Check role in database
      const { data, error } = await adminClient
        .from('profiles')
        .select('role, status')
        .eq('email', email)
        .single();
      
      if (error) {
        console.error("Error checking role:", error);
        setMessage(`Error checking role: ${error.message}`);
        setStatus("error");
        return;
      }
      
      if (!data) {
        setMessage(`No profile found for ${email}`);
        setStatus("error");
        return;
      }
      
      setMessage(`Database role: ${data.role}, Status: ${data.status}`);
      setStatus("success");
      
    } catch (error) {
      console.error("Error checking role:", error);
      setMessage(`Error checking role: ${error.message}`);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  // Function to refresh role
  const refreshRole = async () => {
    setLoading(true);
    setMessage("Refreshing role...");
    try {
      // Get current user ID
      const { data: { session } } = await supabaseClient.auth.getSession();
      
      if (!session || !session.user) {
        setMessage("No active session found. Please sign in first.");
        setStatus("error");
        return;
      }
      
      // Force refresh the session
      await supabaseClient.auth.refreshSession();
      
      setMessage("Session refreshed. Please check if your role has been updated.");
      setStatus("success");
      
      // Reload page after 2 seconds to reflect changes
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error("Error refreshing role:", error);
      setMessage(`Error refreshing role: ${error.message}`);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  // Special bypass for admin check
  const bypassAdminCheck = async () => {
    setLoading(true);
    setMessage("Setting admin override...");
    try {
      // Get email from current session
      const { data: { session } } = await supabaseClient.auth.getSession();
      
      if (!session || !session.user || !session.user.email) {
        setMessage("No active session found. Please sign in first.");
        setStatus("error");
        return;
      }
      
      const email = session.user.email;
      
      // Set override in session and local storage
      // Direct implementation instead of using the helper function
      const now = new Date();
      const expiry = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
      
      localStorage.setItem('akii_admin_override', 'true');
      localStorage.setItem('akii_admin_override_email', email);
      localStorage.setItem('akii_admin_override_expiry', expiry.toISOString());
      
      sessionStorage.setItem('akii_admin_override', 'true');
      sessionStorage.setItem('akii_admin_override_email', email);
      sessionStorage.setItem('akii_admin_override_expiry', expiry.toISOString());
      
      setMessage("Admin override set for 24 hours. You should have temporary admin access.");
      setStatus("success");
      
      // Redirect to admin page after 2 seconds
      setTimeout(() => {
        window.location.href = '/admin';
      }, 2000);
      
    } catch (error) {
      console.error("Error setting admin override:", error);
      setMessage(`Error setting admin override: ${error.message}`);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  // Special function to force Josef as admin
  const forceJosefAdmin = async () => {
    setLoading(true);
    setMessage("Setting Josef as admin with special privileges...");
    try {
      const email = 'josef@holm.com';
      
      // 1. Update profile with admin client
      const { error: updateError } = await adminClient
        .from('profiles')
        .update({
          role: 'admin',
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('email', email);
      
      if (updateError) {
        console.error('Error updating profile:', updateError);
        
        // Try fallback with RPC
        try {
          const { error: rpcError } = await adminClient.rpc('force_admin_role', {
            target_email: email
          });
          
          if (rpcError) throw rpcError;
        } catch (rpcError) {
          console.error('Error with RPC fallback:', rpcError);
          // Continue to try other methods
        }
      }
      
      // 2. Set admin override for 7 days
      const now = new Date();
      const expiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
      
      localStorage.setItem('akii_admin_override', 'true');
      localStorage.setItem('akii_admin_override_email', email);
      localStorage.setItem('akii_admin_override_expiry', expiry.toISOString());
      
      sessionStorage.setItem('akii_admin_override', 'true');
      sessionStorage.setItem('akii_admin_override_email', email);
      sessionStorage.setItem('akii_admin_override_expiry', expiry.toISOString());
      
      // Legacy support
      localStorage.setItem('admin_override', 'true');
      localStorage.setItem('admin_override_email', email);
      localStorage.setItem('admin_override_time', Date.now().toString());
      
      sessionStorage.setItem('admin_override', 'true');
      sessionStorage.setItem('admin_override_email', email);
      sessionStorage.setItem('admin_override_time', Date.now().toString());
      
      setMessage("Josef has been set as admin through multiple methods. You should now have admin access.");
      setStatus("success");
      
      // Redirect to admin page after 2 seconds
      setTimeout(() => {
        window.location.href = '/admin';
      }, 2000);
      
    } catch (error) {
      console.error("Error forcing Josef admin:", error);
      setMessage(`Error forcing admin: ${error.message}`);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8" style={{ maxWidth: '1000px' }}>
      <h1 className="text-3xl font-bold mb-8 text-center">Admin Access Fix</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-100 px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">Fix Session Issues</h2>
          </div>
          <div className="px-6 py-4">
            <p className="mb-4">
              If you're experiencing authentication issues, this will clear your current session
              data and allow you to sign in again with a clean slate.
            </p>
          </div>
          <div className="px-6 py-4 bg-gray-50">
            <button 
              onClick={fixSession} 
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md"
            >
              {loading ? "Processing..." : "Clear Session Data"}
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-100 px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">Check Database Role</h2>
          </div>
          <div className="px-6 py-4">
            <p className="mb-4">
              Check what role is assigned to your user in the database directly. This bypasses
              any cached information and shows your true role.
            </p>
          </div>
          <div className="px-6 py-4 bg-gray-50">
            <button 
              onClick={checkDbRole} 
              disabled={loading}
              className="w-full py-2 px-4 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-md"
            >
              {loading ? "Checking..." : "Check DB Role"}
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-100 px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">Refresh Auth State</h2>
          </div>
          <div className="px-6 py-4">
            <p className="mb-4">
              Force a refresh of your authentication state including roles and permissions. 
              Use this if your role has changed but isn't reflected in the UI.
            </p>
          </div>
          <div className="px-6 py-4 bg-gray-50">
            <button 
              onClick={refreshRole} 
              disabled={loading}
              className="w-full py-2 px-4 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-md"
            >
              {loading ? "Refreshing..." : "Refresh Auth State"}
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-100 px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">Bypass Admin Check</h2>
          </div>
          <div className="px-6 py-4">
            <p className="mb-4">
              Temporarily bypass the admin role check, granting admin access for 24 hours.
              This doesn't change your database role, just allows temporary access.
            </p>
          </div>
          <div className="px-6 py-4 bg-gray-50">
            <button 
              onClick={bypassAdminCheck} 
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md"
            >
              {loading ? "Processing..." : "Enable Admin Override (24h)"}
            </button>
          </div>
        </div>
        
        <div className="col-span-1 md:col-span-2 bg-purple-50 rounded-lg shadow-md overflow-hidden border border-purple-200">
          <div className="bg-purple-100 px-6 py-4 border-b border-purple-200">
            <h2 className="text-xl font-semibold text-purple-800">Force Josef as Admin</h2>
          </div>
          <div className="px-6 py-4">
            <p className="mb-4">
              <strong className="text-purple-700">Special function:</strong> This will forcefully set josef@holm.com as an admin 
              through multiple methods, bypassing all normal verification checks. It updates the database
              directly, sets session overrides, and ensures admin access through all possible means.
            </p>
          </div>
          <div className="px-6 py-4 bg-purple-50">
            <button 
              onClick={forceJosefAdmin} 
              disabled={loading}
              className="w-full py-2 px-4 bg-purple-700 hover:bg-purple-800 text-white font-medium rounded-md"
            >
              {loading ? "Processing..." : "Force Josef as Admin"}
            </button>
          </div>
        </div>
      </div>
      
      {message && (
        <div className={`mt-8 p-4 rounded shadow-sm ${
          status === "success" ? "bg-green-100 text-green-800 border border-green-200" : 
          status === "error" ? "bg-red-100 text-red-800 border border-red-200" : 
          "bg-blue-100 text-blue-800 border border-blue-200"
        }`}>
          {message}
        </div>
      )}
    </div>
  );
} 