import React from 'react';
import { useAuth } from '@/contexts/UnifiedAuthContext';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminCheckComponent from '@/components/dashboard/AdminCheck';
import withAdminInit from '@/components/admin/withAdminInit';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { diagnoseSuperAdminIssues, enableDevAdminMode } from '@/utils/admin-utils';
import { Button } from '@/components/ui/button';

const AdminCheck: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { isSuperAdmin, checkSuperAdminStatus } = useSuperAdmin();
  const [diagnosticData, setDiagnosticData] = React.useState<any>(null);
  const [isRunningDiagnostic, setIsRunningDiagnostic] = React.useState(false);

  const runDiagnostic = async () => {
    setIsRunningDiagnostic(true);
    try {
      const data = await diagnoseSuperAdminIssues();
      setDiagnosticData(data);
    } catch (error) {
      console.error('Error running diagnostic:', error);
    } finally {
      setIsRunningDiagnostic(false);
    }
  };

  const toggleAdminStatus = () => {
    const currentStatus = localStorage.getItem('akii-is-admin') === 'true';
    enableDevAdminMode(!currentStatus);
    setTimeout(() => {
      checkSuperAdminStatus();
      window.location.reload();
    }, 100);
  };

  // Format JSON data for display
  const formatJson = (data: any) => {
    return JSON.stringify(data, null, 2);
  };

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-4">Admin Access Check</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        This page helps diagnose and fix admin access issues.
      </p>

      <Tabs defaultValue="status">
        <TabsList className="mb-4">
          <TabsTrigger value="status">Current Status</TabsTrigger>
          <TabsTrigger value="super-admin">Super Admin</TabsTrigger>
        </TabsList>
        
        <TabsContent value="status">
          <AdminCheckComponent />
        </TabsContent>
        
        <TabsContent value="super-admin">
          <Card>
            <CardHeader>
              <CardTitle>Super Admin Status</CardTitle>
              <CardDescription>
                View and manage super admin privileges
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium mb-1">User ID:</p>
                  <p className="text-sm font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">{user?.id || 'Not logged in'}</p>
                </div>
                <div>
                  <p className="font-medium mb-1">Super Admin Status:</p>
                  <p className={`text-sm font-semibold ${isSuperAdmin ? 'text-green-600' : 'text-red-600'}`}>
                    {isSuperAdmin ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-4 mt-4">
                <Button 
                  onClick={toggleAdminStatus}
                  variant={localStorage.getItem('akii-is-admin') === 'true' ? 'destructive' : 'default'}
                >
                  {localStorage.getItem('akii-is-admin') === 'true' ? 'Disable Admin Mode' : 'Enable Admin Mode'}
                </Button>
                
                <Button
                  onClick={runDiagnostic}
                  variant="outline"
                  disabled={isRunningDiagnostic}
                >
                  {isRunningDiagnostic ? 'Running...' : 'Run Diagnostic'}
                </Button>
              </div>
              
              {/* Diagnostic results */}
              {diagnosticData && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">Diagnostic Results</h3>
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                    <pre className="text-xs overflow-auto max-h-96">
                      {formatJson(diagnosticData)}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Use the admin init HOC to handle loading and access control
export default withAdminInit(AdminCheck);
