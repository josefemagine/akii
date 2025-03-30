import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminAccessFix() {
  const [email, setEmail] = useState('josef@holm.com');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [supabaseInfo, setSupabaseInfo] = useState({
    url: import.meta.env.VITE_SUPABASE_URL || 'Not set',
    keyAvailable: !!import.meta.env.VITE_SUPABASE_ANON_KEY
  });

  // Test Supabase connection
  useEffect(() => {
    const testConnection = async () => {
      try {
        setMessage('Testing Supabase connection...');
        
        // Try a simple query
        const { data, error } = await supabase
          .from('profiles')
          .select('count')
          .limit(1);
        
        if (error) {
          setMessage(`Supabase error: ${error.message}`);
        } else {
          setMessage(`Supabase connected successfully. Found ${JSON.stringify(data)} results.`);
        }
      } catch (err) {
        setMessage(`Connection error: ${err instanceof Error ? err.message : String(err)}`);
      }
    };
    
    testConnection();
  }, []);

  const createAdminUser = async () => {
    if (!email) return;
    
    setLoading(true);
    setMessage('Creating admin user...');
    
    try {
      // First check if the user already exists
      const { data: existingUsers, error: queryError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email);
      
      if (queryError) {
        setMessage(`Query error: ${queryError.message}`);
        setLoading(false);
        return;
      }
      
      // Generate a unique ID if user doesn't exist
      const userId = crypto.randomUUID();
      const timestamp = new Date().toISOString();
      
      if (existingUsers && existingUsers.length > 0) {
        // User exists, update role to admin
        const user = existingUsers[0];
        setMessage(`Found existing user: ${JSON.stringify(user)}`);
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin', updated_at: timestamp })
          .eq('id', user.id);
        
        if (updateError) {
          setMessage(`Error updating role: ${updateError.message}`);
        } else {
          setMessage(`Successfully updated ${email} to admin role. Please sign out and sign in again.`);
        }
      } else {
        // User doesn't exist, create new admin user
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: userId,
              email: email,
              role: 'admin', 
              created_at: timestamp,
              updated_at: timestamp
            }
          ]);
        
        if (insertError) {
          setMessage(`Error creating user: ${insertError.message}`);
        } else {
          setMessage(`Created new admin user ${email}. You can now sign up with this email address.`);
        }
      }
    } catch (err) {
      setMessage(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const listAllTables = async () => {
    try {
      setMessage('Listing available tables...');
      
      const { data, error } = await supabase
        .from('pg_catalog.pg_tables')
        .select('tablename')
        .eq('schemaname', 'public');
      
      if (error) {
        setMessage(`Error listing tables: ${error.message}`);
      } else {
        setMessage(`Available tables: ${JSON.stringify(data)}`);
      }
    } catch (err) {
      setMessage(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };
  
  const listUsers = async () => {
    try {
      setMessage('Listing all users...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(10);
      
      if (error) {
        setMessage(`Error listing users: ${error.message}`);
      } else if (data.length === 0) {
        setMessage('No users found in the profiles table.');
      } else {
        setMessage(`Users found: ${JSON.stringify(data)}`);
      }
    } catch (err) {
      setMessage(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Admin Access Fix</CardTitle>
          <CardDescription>Direct tool to grant admin access (no auth required)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="font-medium">Supabase Config:</p>
            <pre className="text-sm bg-gray-100 p-2 rounded">
              URL: {supabaseInfo.url}<br/>
              Key available: {supabaseInfo.keyAvailable ? 'Yes' : 'No'}
            </pre>
          </div>
          
          <div className="mb-4">
            <p className="font-medium">Status:</p>
            <div className="bg-gray-100 p-2 rounded">
              {message}
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="admin-email">Email to grant admin access:</Label>
              <Input
                id="admin-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="mt-1"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={createAdminUser} 
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Create/Update Admin User'}
              </Button>
              
              <Button 
                onClick={listUsers} 
                variant="outline"
                disabled={loading}
              >
                List Users
              </Button>
              
              <Button 
                onClick={listAllTables} 
                variant="outline"
                disabled={loading}
              >
                List Tables
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 