import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/UnifiedAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

// Define the auth.users table columns
const userColumns = [
  { key: 'instance_id', label: 'Instance ID' },
  { key: 'id', label: 'ID' },
  { key: 'aud', label: 'Audience' },
  { key: 'role', label: 'Role' },
  { key: 'email', label: 'Email' },
  { key: 'email_confirmed_at', label: 'Email Confirmed At' },
  { key: 'invited_at', label: 'Invited At' },
  { key: 'confirmation_token', label: 'Confirmation Token' },
  { key: 'confirmation_sent_at', label: 'Confirmation Sent At' },
  { key: 'recovery_token', label: 'Recovery Token' },
  { key: 'recovery_sent_at', label: 'Recovery Sent At' },
  { key: 'email_change_token_new', label: 'Email Change Token New' },
  { key: 'email_change', label: 'Email Change' },
  { key: 'email_change_sent_at', label: 'Email Change Sent At' },
  { key: 'last_sign_in_at', label: 'Last Sign In At' },
  { key: 'raw_app_meta_data', label: 'App Metadata' },
  { key: 'raw_user_meta_data', label: 'User Metadata' },
  { key: 'is_super_admin', label: 'Is Super Admin' },
  { key: 'created_at', label: 'Created At' },
  { key: 'updated_at', label: 'Updated At' },
  { key: 'phone', label: 'Phone' },
  { key: 'phone_confirmed_at', label: 'Phone Confirmed At' },
  { key: 'phone_change', label: 'Phone Change' },
  { key: 'phone_change_token', label: 'Phone Change Token' },
  { key: 'phone_change_sent_at', label: 'Phone Change Sent At' },
  { key: 'confirmed_at', label: 'Confirmed At' },
  { key: 'email_change_token_current', label: 'Email Change Token Current' },
  { key: 'email_change_confirm_status', label: 'Email Change Confirm Status' },
  { key: 'banned_until', label: 'Banned Until' },
  { key: 'reauthentication_token', label: 'Reauthentication Token' },
  { key: 'reauthentication_sent_at', label: 'Reauthentication Sent At' },
  { key: 'is_sso_user', label: 'Is SSO User' },
  { key: 'deleted_at', label: 'Deleted At' },
  { key: 'is_anonymous', label: 'Is Anonymous' }
];

// Define the public.profiles table columns
const profileColumns = [
  { key: 'id', label: 'ID' },
  { key: 'email', label: 'Email' },
  { key: 'full_name', label: 'Full Name' },
  { key: 'first_name', label: 'First Name' },
  { key: 'last_name', label: 'Last Name' },
  { key: 'is_admin', label: 'Is Admin' },
  { key: 'address1', label: 'Address 1' },
  { key: 'address2', label: 'Address 2' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'zip', label: 'ZIP' },
  { key: 'country', label: 'Country' },
  { key: 'avatar_url', label: 'Avatar URL' },
  { key: 'company', label: 'Company' },
  { key: 'company_name', label: 'Company Name' },
  { key: 'role', label: 'Role' },
  { key: 'created_at', label: 'Created At' },
  { key: 'updated_at', label: 'Updated At' },
  { key: 'subscription_updated_at', label: 'Subscription Updated At' },
  { key: 'subscription_renews_at', label: 'Subscription Renews At' },
  { key: 'payment_method_type', label: 'Payment Method Type' },
  { key: 'payment_customer_id', label: 'Payment Customer ID' },
  { key: 'payment_subscription_id', label: 'Payment Subscription ID' },
  { key: 'trial_notification_sent', label: 'Trial Notification Sent' },
  { key: 'usage_limit_notification_sent', label: 'Usage Limit Notification Sent' },
  { key: 'subscription_addons', label: 'Subscription Addons' },
  { key: 'status', label: 'Status' }
];

// Define fields that need to be migrated from profiles to auth.users
const fieldsToMigrate = [
  { key: 'first_name', label: 'First Name', source: 'profile' },
  { key: 'last_name', label: 'Last Name', source: 'profile' },
  { key: 'email', label: 'Email', source: 'profile' },
  { key: 'phone', label: 'Phone', source: 'profile' },
  { key: 'company_name', label: 'Company Name', source: 'profile' },
  { key: 'address1', label: 'Address 1', source: 'new' },
  { key: 'address2', label: 'Address 2', source: 'new' },
  { key: 'zip', label: 'ZIP/Postal Code', source: 'new' },
  { key: 'city', label: 'City', source: 'new' },
  { key: 'state', label: 'State/Province', source: 'new' },
  { key: 'country', label: 'Country', source: 'new' }
];

const UserDetails = () => {
    const { user } = useAuth();
    const [profileData, setProfileData] = useState<any>(null);
    const [userData, setUserData] = useState<any>(null);
    const [localStorageData, setLocalStorageData] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [actionMessage, setActionMessage] = useState<{ text: string, type: 'success' | 'error' | 'info' } | null>(null);

    useEffect(() => {
        // Get relevant localStorage items
        const relevantKeys = [
            'akii-is-admin',
            'akii-is-logged-in',
            'dashboard-theme',
            'akii-dev-ports',
            'akii-redirect-after-login'
        ];
        
        const data: Record<string, string> = {};
        relevantKeys.forEach(key => {
            const value = localStorage.getItem(key);
            if (value) {
                data[key] = value;
            }
        });
        
        setLocalStorageData(data);
        
        // Test Supabase connectivity on mount
        testSupabaseConnection();
    }, []);

    // Function to test basic Supabase connectivity
    const testSupabaseConnection = async () => {
        console.log('Testing Supabase connection...');
        try {
            // Simple query to test connectivity
            const { data, error } = await supabase
                .from('profiles')
                .select('count(*)', { count: 'exact', head: true });
            
            console.log('Supabase connection test result:', { data, error });
            
            if (error) {
                console.error('Supabase connection test error:', error);
            } else {
                console.log('Supabase connection successful');
            }
        } catch (err) {
            console.error('Supabase connection test exception:', err);
        }
    };

    // Simply load data when the component mounts and user is available
    useEffect(() => {
        console.log('UserDetails component mounted, user:', user?.id);
        if (user?.id) {
            console.log('User ID available, loading data');
            setIsLoading(true);
            setActionMessage({ text: 'Loading data...', type: 'info' });
            fetchUserData();
        }
    }, [user]);

    // Fetch user and profile data - simplified version
    const fetchUserData = async () => {
        console.log('fetchUserData called with user:', user?.id);
        setIsLoading(true);
        
        try {
            if (user) {
                console.log('Setting user data from user object');
                // Extract data from the user object
                setUserData({
                    id: user.id,
                    email: user.email || '',
                    name: user.user_metadata?.name || '',
                    avatar_url: user.user_metadata?.avatar_url || '',
                });
                console.log('User data set from user object:', user);
                
                try {
                    console.log('Starting profile query for user:', user.id);
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single();
                    
                    console.log('Profile query completed', { data, error });
                    
                    if (error) {
                        console.error('Profile query error:', error);
                    } else if (data) {
                        console.log('Profile data found:', data);
                        // Update the user data with profile information
                        setUserData(prevData => ({
                            ...prevData,
                            name: data.full_name || prevData.name,
                            avatar_url: data.avatar_url || prevData.avatar_url,
                            role: data.role,
                            referrer: data.referrer,
                            id: data.id,
                        }));
                        console.log('UserData state updated with profile data');
                    } else {
                        console.log('No profile data found for user');
                    }
                } catch (queryError) {
                    console.error('Error during profile query execution:', queryError);
                }
            } else {
                console.log('No user object available');
            }
        } catch (mainError) {
            console.error('Unexpected error in fetchUserData:', mainError);
        } finally {
            console.log('fetchUserData completed, clearing loading state');
            setIsLoading(false);
        }
    };

    // Format JSON data for display
    const formatJson = (data: any) => {
        return JSON.stringify(data, null, 2);
    };

    // Format value for display
    const formatValue = (key: string, value: any): React.ReactNode => {
        if (value === null || value === undefined) {
            return <span className="text-gray-400">null</span>;
        }
        
        if (typeof value === 'boolean') {
            return value ? 'true' : 'false';
        }
        
        if (typeof value === 'object') {
            return (
                <div className="max-h-40 overflow-y-auto">
                    <pre className="text-xs p-2 bg-gray-100 dark:bg-gray-800 rounded">
                        {formatJson(value)}
                    </pre>
                </div>
            );
        }
        
        // Display image for avatar_url
        if (key === 'avatar_url' && typeof value === 'string' && value.match(/^https?:\/\//)) {
            return (
                <div>
                    <img 
                        src={value} 
                        alt="Avatar" 
                        className="w-8 h-8 rounded-full inline mr-2"
                    />
                    <span className="text-xs break-all">{value}</span>
                </div>
            );
        }
        
        return String(value);
    };

    return (
        <div className="container py-6">
            <h1 className="text-2xl font-bold mb-4">User Details</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
                This page displays all data retrieved from Supabase for the current user.
            </p>

            <div className="mb-4 flex justify-end gap-2">
                <Button 
                    onClick={async () => {
                        setIsLoading(true);
                        setActionMessage({ text: 'Creating profile...', type: 'info' });
                        try {
                            if (!user?.id) {
                                throw new Error('No user ID available');
                            }
                            
                            // Create profile with standard Supabase insert
                            const { data, error } = await supabase
                                .from('profiles')
                                .insert({
                                    id: user.id,
                                    email: user.email || '',
                                    first_name: user.email ? user.email.split('@')[0] : '',
                                    last_name: '',
                                    role: 'user',
                                    status: 'active',
                                    is_admin: false,
                                    address1: '',
                                    address2: '',
                                    city: '',
                                    state: '',
                                    zip: '',
                                    country: '',
                                    company_name: ''
                                })
                                .select()
                                .single();
                            
                            if (error) throw error;
                            
                            console.log('Profile created:', data);
                            setActionMessage({ 
                                text: 'Profile created successfully!', 
                                type: 'success' 
                            });
                            
                            // Refresh to see the changes
                            await fetchUserData();
                        } catch (error) {
                            console.error('Error creating profile:', error);
                            setActionMessage({
                                text: `Error creating profile: ${(error as Error).message}`,
                                type: 'error'
                            });
                        } finally {
                            setIsLoading(false);
                        }
                    }}
                    disabled={isLoading || !!profileData}
                    variant="secondary"
                >
                    {isLoading ? 'Working...' : 'Create Profile'}
                </Button>
                <Button 
                    onClick={() => {
                        console.log('Refresh button clicked');
                        setIsLoading(true);
                        setActionMessage({ text: 'Loading data...', type: 'info' });
                        fetchUserData();
                    }}
                    disabled={isLoading}
                    variant="outline"
                >
                    {isLoading ? 'Refreshing...' : 'Refresh Profile Data'}
                </Button>
            </div>

            {actionMessage && (
                <div className={`mb-4 p-3 rounded-md ${
                    actionMessage.type === 'success' ? 'bg-green-100 text-green-800' :
                    actionMessage.type === 'error' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                }`}>
                    {actionMessage.text}
                </div>
            )}

            <Tabs defaultValue="user" className="w-full mb-6">
                <TabsList className="mb-4">
                    <TabsTrigger value="user">auth.users Data</TabsTrigger>
                    <TabsTrigger value="profile">public.profiles Data</TabsTrigger>
                    <TabsTrigger value="migration">Migration Plan</TabsTrigger>
                    <TabsTrigger value="auth">Auth Status</TabsTrigger>
                    <TabsTrigger value="raw">Raw Data</TabsTrigger>
                    <TabsTrigger value="debug">Debug Info</TabsTrigger>
                </TabsList>
                
                {/* auth.users Table Data */}
                <TabsContent value="user">
                    <Card>
                        <CardHeader>
                            <CardTitle>auth.users Table</CardTitle>
                            <CardDescription>
                                Complete data from the Supabase auth.users table
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[250px]">Column</TableHead>
                                            <TableHead>Value</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {userColumns.map((column) => (
                                            <TableRow key={column.key}>
                                                <TableCell className="font-medium">{column.label}</TableCell>
                                                <TableCell>
                                                    {userData && column.key in userData 
                                                        ? formatValue(column.key, (userData as any)[column.key])
                                                        : <span className="text-gray-400">not present</span>
                                                    }
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                {/* public.profiles Table Data */}
                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle>public.profiles Table</CardTitle>
                            <CardDescription>
                                Complete data from the Supabase public.profiles table
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {profileData ? (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[250px]">Column</TableHead>
                                                <TableHead>Value</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {profileColumns.map((column) => (
                                                <TableRow key={column.key}>
                                                    <TableCell className="font-medium">{column.label}</TableCell>
                                                    <TableCell>
                                                        {profileData && column.key in profileData 
                                                            ? formatValue(column.key, (profileData as any)[column.key])
                                                            : <span className="text-gray-400">not present</span>
                                                        }
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="text-amber-500 font-medium p-4 bg-amber-50 dark:bg-amber-950/30 rounded-md">
                                    No profile record found for this user
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                
                {/* Migration Plan Tab */}
                <TabsContent value="migration">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Table Enhancement Plan</CardTitle>
                            <CardDescription>
                                Add missing fields to the public.profiles table to store all required user information
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border mb-6">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[200px]">Field</TableHead>
                                            <TableHead className="w-[150px]">Status</TableHead>
                                            <TableHead>Description</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {fieldsToMigrate.map((field) => (
                                            <TableRow key={field.key}>
                                                <TableCell className="font-medium">{field.label}</TableCell>
                                                <TableCell>
                                                    {field.source === 'profile' ? (
                                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs">
                                                            May exist
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs">
                                                            New field
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {field.source === 'profile' 
                                                        ? `May already exist in the profiles table, ensure column exists`
                                                        : `Add new ${field.label.toLowerCase()} field to profiles table`
                                                    }
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">SQL Migration Commands</h3>
                                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                                    <pre className="text-xs overflow-auto max-h-80 text-green-600 dark:text-green-400">
{`-- Add missing columns to public.profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address1 TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address2 TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS zip TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country TEXT;

-- Extract first and last name from full_name if available
UPDATE public.profiles
SET first_name = SPLIT_PART(full_name, ' ', 1),
    last_name = SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1)
WHERE full_name IS NOT NULL 
  AND first_name IS NULL 
  AND last_name IS NULL
  AND POSITION(' ' IN full_name) > 0;

-- Copy company data to company_name if it exists
UPDATE public.profiles
SET company_name = company
WHERE company IS NOT NULL
  AND company_name IS NULL;

-- Add a database trigger to keep email in sync with auth.users
CREATE OR REPLACE FUNCTION sync_profile_email()
RETURNS TRIGGER AS $$
BEGIN
  NEW.email = (SELECT email FROM auth.users WHERE id = NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'ensure_profile_email_matches_auth'
  ) THEN
    CREATE TRIGGER ensure_profile_email_matches_auth
    BEFORE INSERT OR UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION sync_profile_email();
  END IF;
END $$;`}
                                    </pre>
                                </div>
                                
                                <h3 className="text-lg font-medium mt-6">Code Update Requirements</h3>
                                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                                    <ol className="list-decimal list-inside space-y-2 text-sm">
                                        <li>Create or update any forms that collect user information to include all the new fields</li>
                                        <li>Ensure profile creation process creates records with all required fields</li>
                                        <li>Update settings page to allow users to edit their address information</li>
                                        <li>Add form validation for new address fields</li>
                                        <li>Make sure all profile data is properly displayed in user interfaces</li>
                                    </ol>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                {/* Auth Status Data */}
                <TabsContent value="auth">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Admin Status Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Admin Status</CardTitle>
                                <CardDescription>
                                    Current admin status from profiles table
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <span className="font-semibold mr-2">Admin Status:</span>
                                        <span className={profileData?.is_admin ? "text-green-500 font-bold" : "text-red-500 font-bold"}>
                                            {profileData?.is_admin ? "Admin" : "Regular User"}
                                        </span>
                                    </div>
                                    
                                    {profileData && (
                                        <div className="pt-2">
                                            <Button 
                                                onClick={async () => {
                                                    setActionMessage({ text: 'Updating admin status...', type: 'info' });
                                                    try {
                                                        if (!user?.id) {
                                                            throw new Error('No user ID available');
                                                        }
                                                        
                                                        // Toggle admin status
                                                        const newAdminStatus = !profileData.is_admin;
                                                        
                                                        const { error } = await supabase
                                                            .from('profiles')
                                                            .update({ is_admin: newAdminStatus })
                                                            .eq('id', user.id);
                                                            
                                                        if (error) {
                                                            throw new Error(`${error.message} (${error.code})`);
                                                        }
                                                        
                                                        setActionMessage({ 
                                                            text: `Admin status updated to: ${newAdminStatus ? 'Admin' : 'Regular User'}`, 
                                                            type: 'success' 
                                                        });
                                                        
                                                        // Refresh to see the changes
                                                        fetchUserData();
                                                    } catch (error) {
                                                        console.error('Error toggling admin status:', error);
                                                        setActionMessage({
                                                            text: `Error updating admin status: ${(error as Error).message}`,
                                                            type: 'error'
                                                        });
                                                    }
                                                }}
                                                variant="outline"
                                                size="sm"
                                            >
                                                {profileData.is_admin ? "Make Regular User" : "Make Admin"}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* LocalStorage Data Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>LocalStorage Values</CardTitle>
                                <CardDescription>
                                    Relevant localStorage values affecting authentication
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                                    <pre className="text-xs overflow-auto max-h-96">
                                        {formatJson(localStorageData)}
                                    </pre>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
                
                {/* Raw JSON Data */}
                <TabsContent value="raw">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* User Data Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Raw User Record</CardTitle>
                                <CardDescription>
                                    Raw JSON data from the Supabase auth.users table
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                                    <pre className="text-xs overflow-auto max-h-96">
                                        {formatJson(userData)}
                                    </pre>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Profile Data Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Raw Profile Record</CardTitle>
                                <CardDescription>
                                    Raw JSON data from the Supabase profiles table
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {profileData ? (
                                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                                        <pre className="text-xs overflow-auto max-h-96">
                                            {formatJson(profileData)}
                                        </pre>
                                    </div>
                                ) : (
                                    <div className="text-amber-500 font-medium">
                                        No profile record found for this user
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Debug Info Tab */}
                <TabsContent value="debug">
                    <Card>
                        <CardHeader>
                            <CardTitle>Debug Information</CardTitle>
                            <CardDescription>
                                Detailed information for troubleshooting profile loading issues
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium mb-2">User ID Check</h3>
                                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                                        <p className="mb-2">
                                            <span className="font-semibold">User ID present:</span> {user?.id ? 'Yes' : 'No'}
                                        </p>
                                        {user?.id && (
                                            <p>
                                                <span className="font-semibold">User ID:</span> {user.id}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-medium mb-2">Profile Check</h3>
                                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                                        <p className="mb-2">
                                            <span className="font-semibold">Profile loaded:</span> {profileData ? 'Yes' : 'No'}
                                        </p>
                                        {profileData ? (
                                            <>
                                                <p className="mb-2">
                                                    <span className="font-semibold">Profile ID:</span> {profileData.id}
                                                </p>
                                                <p className="mb-2">
                                                    <span className="font-semibold">Email matches:</span> {profileData.email === userData?.email ? 'Yes' : 'No'}
                                                </p>
                                                <p className="mb-2">
                                                    <span className="font-semibold">Admin field:</span> {profileData.is_admin !== undefined ? (profileData.is_admin ? 'true' : 'false') : 'not present'}
                                                </p>
                                                <p className="mb-2">
                                                    <span className="font-semibold">Role field:</span> {profileData.role || 'not present'}
                                                </p>
                                                <p>
                                                    <span className="font-semibold">Status field:</span> {profileData.status || 'not present'}
                                                </p>
                                            </>
                                        ) : (
                                            <p className="text-amber-500">
                                                Profile not loaded - try clicking the "Refresh Profile Data" button
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-medium mb-2">Direct Profile Query</h3>
                                    <Button 
                                        onClick={async () => {
                                            setActionMessage({ text: 'Checking profile in database...', type: 'info' });
                                            try {
                                                if (!user?.id) {
                                                    throw new Error('No user ID available');
                                                }
                                                
                                                // Direct query to check profile existence
                                                const { data, error } = await supabase
                                                    .from('profiles')
                                                    .select('*')
                                                    .eq('id', user.id);
                                                
                                                if (error) throw error;
                                                
                                                const profileExists = data && data.length > 0;
                                                console.log('Direct profile query result:', data);
                                                
                                                setActionMessage({ 
                                                    text: profileExists 
                                                        ? `Profile exists in database. Found ${data.length} records.` 
                                                        : 'Profile does NOT exist in database.', 
                                                    type: profileExists ? 'success' : 'error' 
                                                });
                                            } catch (error) {
                                                console.error('Error checking profile directly:', error);
                                                setActionMessage({ 
                                                    text: `Error checking profile: ${(error as Error).message}`,
                                                    type: 'error'
                                                });
                                            }
                                        }}
                                        variant="outline"
                                        className="mb-4"
                                    >
                                        Check Profile in Database
                                    </Button>

                                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md font-mono text-xs mb-4">
                                        {user?.id ? (
                                            `SELECT * FROM profiles WHERE id = '${user.id}';`
                                        ) : (
                                            'No user ID to generate SQL query'
                                        )}
                                    </div>
                                    <p className="text-sm">
                                        If the query returns no rows, the profile doesn't exist in the database and needs to be created.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-lg font-medium mb-2">Create Profile</h3>
                                    <p className="text-sm mb-2">
                                        If you don't see any profile data, you can create a profile record for the current user:
                                    </p>
                                    <Button 
                                        onClick={async () => {
                                            setActionMessage({ text: 'Creating profile for current user...', type: 'info' });
                                            try {
                                                if (!user?.id) {
                                                    throw new Error('No user ID available');
                                                }
                                                
                                                // Create profile with standard Supabase insert
                                                const { data, error } = await supabase
                                                    .from('profiles')
                                                    .insert({
                                                        id: user.id,
                                                        email: user.email || '',
                                                        first_name: user.email ? user.email.split('@')[0] : '',
                                                        last_name: '',
                                                        role: 'user',
                                                        status: 'active',
                                                        is_admin: false,
                                                        address1: '',
                                                        address2: '',
                                                        city: '',
                                                        state: '',
                                                        zip: '',
                                                        country: '',
                                                        company_name: ''
                                                    })
                                                    .select()
                                                    .single();
                                                
                                                if (error) throw error;
                                                
                                                console.log('Profile created:', data);
                                                setActionMessage({ 
                                                    text: 'Profile created successfully. Refreshing data...', 
                                                    type: 'success' 
                                                });
                                                
                                                // Refresh data to see the newly created profile
                                                fetchUserData();
                                            } catch (error) {
                                                console.error('Error creating profile:', error);
                                                setActionMessage({ 
                                                    text: `Error creating profile: ${(error as Error).message}`,
                                                    type: 'error'
                                                });
                                            }
                                        }}
                                        variant="default"
                                        className="mb-4"
                                    >
                                        Create Profile Record
                                    </Button>
                                </div>

                                <div>
                                    <h3 className="text-lg font-medium mb-2">Database Functions</h3>
                                    <Button 
                                        onClick={async () => {
                                            setActionMessage({ text: 'Creating SQL helper functions...', type: 'info' });
                                            try {
                                                // Create the execute_sql function
                                                const { error: error1 } = await supabase.rpc('execute_sql', {
                                                    sql: `
                                                        DO $$
                                                        BEGIN
                                                            IF NOT EXISTS (
                                                                SELECT 1
                                                                FROM pg_proc p
                                                                JOIN pg_namespace n ON p.pronamespace = n.oid
                                                                WHERE n.nspname = 'public'
                                                                AND p.proname = 'column_exists'
                                                            ) THEN
                                                                CREATE OR REPLACE FUNCTION public.column_exists(
                                                                    table_name text,
                                                                    column_name text
                                                                )
                                                                RETURNS boolean
                                                                LANGUAGE plpgsql
                                                                SECURITY DEFINER
                                                                SET search_path = public
                                                                AS $$
                                                                DECLARE
                                                                    column_exists boolean;
                                                                BEGIN
                                                                    SELECT EXISTS (
                                                                        SELECT 1
                                                                        FROM information_schema.columns
                                                                        WHERE table_schema = 'public'
                                                                        AND table_name = column_exists.table_name
                                                                        AND column_name = column_exists.column_name
                                                                    ) INTO column_exists;
                                                                    
                                                                    RETURN column_exists;
                                                                END;
                                                                $$;

                                                                GRANT EXECUTE ON FUNCTION public.column_exists(text, text) TO authenticated;
                                                            END IF;
                                                        END
                                                        $$;
                                                    `
                                                });
                                                
                                                if (error1) throw error1;
                                                
                                                setActionMessage({ text: 'SQL helper functions created successfully', type: 'success' });
                                            } catch (error) {
                                                console.error('Error creating SQL helper functions:', error);
                                                setActionMessage({ 
                                                    text: `Error creating functions: ${(error as Error).message}`,
                                                    type: 'error'
                                                });
                                            }
                                        }}
                                        variant="outline"
                                        className="mb-4"
                                    >
                                        Create SQL Helper Functions
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default UserDetails; 