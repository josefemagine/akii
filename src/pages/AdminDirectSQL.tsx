import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminDirectSQL() {
  const [email, setEmail] = useState('josef@holm.com');
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const listUsers = async () => {
    setLoading(true);
    setStatus('Listing users...');

    try {
      // Simple direct query only
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(10);
      
      if (error) {
        setStatus(`Error: ${error.message}`);
      } else if (data.length === 0) {
        setStatus('No users found in the profiles table.');
      } else {
        setStatus(`Found ${data.length} users:\n${JSON.stringify(data, null, 2)}`);
      }
    } catch (err) {
      setStatus(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const makeUserAdmin = async () => {
    if (!email) return;
    setLoading(true);
    setStatus(`Looking for user: ${email}`);

    try {
      // First check if user exists
      const { data: existingUsers, error: queryError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email);
      
      if (queryError) {
        setStatus(`Query error: ${queryError.message}`);
        setLoading(false);
        return;
      }
      
      if (!existingUsers || existingUsers.length === 0) {
        setStatus(`No user found with email: ${email}. 
        Please make sure the user is already registered in Supabase.`);
        setLoading(false);
        return;
      }
      
      // User exists, update role to admin
      const user = existingUsers[0];
      setStatus(`Found existing user:
ID: ${user.id}
Email: ${user.email}
Current role: ${user.role || 'none'}

Updating to admin role...`);
      
      // Update the user role to admin
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', user.id);
      
      if (updateError) {
        setStatus(`Error updating user: ${updateError.message}`);
      } else {
        setStatus(`Successfully updated user to admin role!

User: ${email}
ID: ${user.id}

Please sign out and sign back in to apply the changes.`);
      }
    } catch (err) {
      setStatus(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Admin Role Update</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-100 p-4 rounded min-h-[100px] max-h-[400px] overflow-auto">
            <pre className="whitespace-pre-wrap break-words text-sm">{status}</pre>
          </div>
          
          <div>
            <Label htmlFor="email">Email to make admin:</Label>
            <Input 
              id="email"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="mt-1"
            />
          </div>
          
          <div className="flex gap-2">
            <Button onClick={makeUserAdmin} disabled={loading}>
              {loading ? 'Processing...' : 'Make Admin'}
            </Button>
            <Button onClick={listUsers} variant="outline" disabled={loading}>
              List Users
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 