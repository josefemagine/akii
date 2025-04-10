import React, { useState } from 'react';
import { useAuth } from '@/contexts/UnifiedAuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminCheckComponent from '@/components/dashboard/AdminCheck';
import withAdminInit from '@/components/admin/withAdminInit';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { diagnoseAdminIssues, enableDevAdminMode } from '@/utils/admin-utils';
import { Button } from '@/components/ui/button';
import { createClient } from '@supabase/supabase-js';
import { Loader } from '@/components/ui/loader';

const testServiceRolePermissions = async () => {
    console.log('Testing service role permissions...');
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        console.error('Missing Supabase service role configuration');
        return { error: 'Missing service role configuration' };
    }
    
    try {
        // Create a separate client with the service role key
        const serviceRoleClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        
        // Attempt a simple query using service role permissions
        const { data, error } = await serviceRoleClient
            .from('profiles')
            .select('count(*)', { count: 'exact' });
        
        if (error) {
            console.error('Service role test failed:', error);
            return { success: false, error };
        }
        
        console.log('Service role test succeeded:', data);
        return { success: true, data };
    } catch (err) {
        console.error('Service role test exception:', err);
        return { success: false, error: err.message };
    }
};

const AdminCheck = () => {
    const { user, isAdmin } = useAuth();
    const [diagnosticData, setDiagnosticData] = useState(null);
    const [isRunningDiagnostic, setIsRunningDiagnostic] = useState(false);
    const [diagnosticResult, setDiagnosticResult] = useState(null);

    const runDiagnostic = async () => {
        setIsRunningDiagnostic(true);
        try {
            const data = await diagnoseAdminIssues();
            setDiagnosticData(data);
        } catch (error) {
            console.error('Error running diagnostic:', error);
        } finally {
            setIsRunningDiagnostic(false);
        }
    };

    const handleRunDiagnostic = async () => {
        setIsRunningDiagnostic(true);
        try {
            await runDiagnostic();
            
            // Also test service role permissions
            const serviceRoleTest = await testServiceRolePermissions();
            setDiagnosticResult(prev => ({
                ...prev,
                serviceRoleTest
            }));
        } catch (err) {
            console.error("Error running diagnostics:", err);
            setDiagnosticResult({ error: err.message });
        } finally {
            setIsRunningDiagnostic(false);
        }
    };

    const toggleAdminStatus = () => {
        const currentStatus = localStorage.getItem('akii-is-admin') === 'true';
        enableDevAdminMode(!currentStatus);
        setTimeout(() => {
            window.location.reload();
        }, 100);
    };

    // Format JSON data for display
    const formatJson = (data) => {
        return JSON.stringify(data, null, 2);
    };

    return (
        <div className="container py-6">
            <h1 className="text-2xl font-bold mb-4">Admin Access Check</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
                This page helps diagnose and fix admin access issues.
            </p>

            <div className="flex flex-col gap-6">
                <Tabs defaultValue="status">
                    <TabsList>
                        <TabsTrigger value="status">Admin Status</TabsTrigger>
                        <TabsTrigger value="diagnostic">Diagnostic</TabsTrigger>
                    </TabsList>
                    <TabsContent value="status">
                        <Card>
                            <CardHeader>
                                <CardTitle>Admin Status</CardTitle>
                                <CardDescription>
                                    View and manage your admin access
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4">
                                <div>
                                    <p className="text-sm font-medium">User ID</p>
                                    <p className="text-xs text-gray-500">{user?.id}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Admin</p>
                                    <p className="text-xs text-gray-500">
                                        {isAdmin ? "Yes" : "No"}
                                    </p>
                                </div>
                                <Button onClick={() => toggleAdminStatus()}>
                                    {isAdmin
                                        ? "Disable Dev Admin Mode"
                                        : "Enable Dev Admin Mode"}
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="diagnostic">
                        <Card>
                            <CardHeader>
                                <CardTitle>Diagnostic Results</CardTitle>
                                <CardDescription>
                                    Diagnostics for admin functionality
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex space-x-4 mb-4">
                                    <Button
                                        onClick={handleRunDiagnostic}
                                        variant="outline"
                                        disabled={isRunningDiagnostic}
                                    >
                                        {isRunningDiagnostic ? 'Running...' : 'Run Diagnostic'}
                                    </Button>
                                </div>
                                
                                {isRunningDiagnostic ? (
                                    <div className="flex justify-center">
                                        <Loader className="h-6 w-6 animate-spin" />
                                    </div>
                                ) : (
                                    <div>
                                        {diagnosticData && (
                                            <div className="bg-black rounded p-4 mt-2">
                                                <pre className="text-white text-sm whitespace-pre-wrap">
                                                    {formatJson(diagnosticData)}
                                                </pre>
                                            </div>
                                        )}
                                        {diagnosticResult?.serviceRoleTest && (
                                            <div className="mt-4">
                                                <h3 className="text-lg font-medium mb-2">Service Role Test</h3>
                                                <div className={`p-3 rounded ${diagnosticResult.serviceRoleTest.success ? 'bg-green-100' : 'bg-red-100'}`}>
                                                    <p><strong>Status:</strong> {diagnosticResult.serviceRoleTest.success ? 'Success' : 'Failed'}</p>
                                                    {diagnosticResult.serviceRoleTest.error && (
                                                        <p><strong>Error:</strong> {diagnosticResult.serviceRoleTest.error}</p>
                                                    )}
                                                    {diagnosticResult.serviceRoleTest.data && (
                                                        <div className="bg-black rounded p-4 mt-2">
                                                            <pre className="text-white text-sm whitespace-pre-wrap">
                                                                {formatJson(diagnosticResult.serviceRoleTest.data)}
                                                            </pre>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

// Use the admin init HOC to handle loading and access control
export default withAdminInit(AdminCheck);
