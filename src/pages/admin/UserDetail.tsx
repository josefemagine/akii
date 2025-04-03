import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserProfile, getCompleteUserData } from "../../lib/supabase/auth";
import { getClient } from "../../lib/supabase/client";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Skeleton } from "../../components/ui/skeleton";
import { ReloadIcon, ArrowLeftIcon } from "@radix-ui/react-icons";
import { toast } from "../../components/ui/use-toast";
import { 
  checkSubscriptionTables, 
  getUserSubscriptions, 
  getUserInvoices,
  type Plan,
  type Subscription,
  type Invoice,
  type TablesInfo
} from "../../lib/supabase/subscriptions";

interface UserProfile {
  id: string;
  email: string;
  role: string;
  status: string;
  full_name?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tablesInfo, setTablesInfo] = useState<TablesInfo>({
    hasSubscriptions: false,
    hasPlans: false,
    hasInvoices: false,
    hasRelationship: false
  });
  const [completeUserData, setCompleteUserData] = useState<any>(null);
  const [showRawData, setShowRawData] = useState(false);

  // Fetch table information to avoid querying non-existent tables
  useEffect(() => {
    async function checkTables() {
      try {
        const { data, error } = await checkSubscriptionTables();
        
        if (error) {
          console.error("Error checking subscription tables:", error);
          // Default to assuming tables don't exist if check fails
          setTablesInfo({
            hasSubscriptions: false,
            hasPlans: false,
            hasInvoices: false,
            hasRelationship: false
          });
        } else if (data) {
          setTablesInfo(data);
        }
      } catch (err) {
        console.error("Error checking tables:", err);
        // Default to assuming tables don't exist if check fails
        setTablesInfo({
          hasSubscriptions: false,
          hasPlans: false,
          hasInvoices: false,
          hasRelationship: false
        });
      }
    }
    
    checkTables();
  }, []);

  useEffect(() => {
    async function fetchUserData() {
      if (!userId) {
        setError("User ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch user profile - this always exists
        const profileResponse = await getUserProfile(userId);
        if (profileResponse.error) {
          throw new Error(`Failed to fetch user profile: ${profileResponse.error.message}`);
        }
        setUserProfile(profileResponse.data);

        // Fetch subscriptions if tables exist
        if (tablesInfo.hasSubscriptions && tablesInfo.hasPlans && tablesInfo.hasRelationship) {
          try {
            const { data: subscriptionsData, error: subscriptionsError } = await getUserSubscriptions(userId);

            if (subscriptionsError) {
              console.error("Error fetching subscriptions:", subscriptionsError);
            } else if (subscriptionsData) {
              setSubscriptions(subscriptionsData);
            }
          } catch (subErr) {
            console.error("Exception fetching subscriptions:", subErr);
          }
        }

        // Fetch invoices if the table exists
        if (tablesInfo.hasInvoices) {
          try {
            const { data: invoicesData, error: invoicesError } = await getUserInvoices(userId);

            if (invoicesError) {
              console.error("Error fetching invoices:", invoicesError);
            } else if (invoicesData) {
              setInvoices(invoicesData);
            }
          } catch (invErr) {
            console.error("Exception fetching invoices:", invErr);
          }
        }

      } catch (err) {
        console.error("Error fetching user details:", err);
        setError(err instanceof Error ? err.message : "Failed to load user data");
      } finally {
        setLoading(false);
      }
    }

    // Only fetch user data if we've completed the table check
    if (Object.values(tablesInfo).some(value => value !== undefined)) {
      fetchUserData();
    }
  }, [userId, tablesInfo]);

  useEffect(() => {
    async function fetchCompleteUserData() {
      if (!userId) return;
      
      try {
        const { data, error } = await getCompleteUserData(userId);
        if (error) {
          console.error("Error fetching complete user data:", error);
          return;
        }
        
        setCompleteUserData(data);
      } catch (err) {
        console.error("Exception fetching complete user data:", err);
      }
    }
    
    fetchCompleteUserData();
  }, [userId]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'paid':
        return 'default';
      case 'inactive':
      case 'pending':
      case 'trialing':
        return 'secondary';
      case 'banned':
      case 'failed':
      case 'past_due':
        return 'destructive';
      case 'refunded':
      case 'expired':
      case 'canceled':
        return 'outline';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center mb-6">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-64 ml-4" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-[300px] w-full rounded-lg" />
          <Skeleton className="h-[300px] w-full rounded-lg" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-lg mt-6" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Card className="w-full">
          <CardHeader className="bg-red-50 dark:bg-red-950">
            <CardTitle className="text-red-700 dark:text-red-300">Error Loading User</CardTitle>
            <CardDescription className="text-red-600 dark:text-red-400">
              {error}
            </CardDescription>
          </CardHeader>
          <CardFooter className="bg-red-50 dark:bg-red-950">
            <Button 
              variant="outline" 
              onClick={() => navigate("/admin/users")}
              className="mr-2"
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back to Users
            </Button>
            <Button 
              onClick={() => window.location.reload()}
            >
              <ReloadIcon className="mr-2 h-4 w-4" /> Retry
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="container mx-auto py-10">
        <Card className="w-full">
          <CardHeader className="bg-yellow-50 dark:bg-yellow-950">
            <CardTitle className="text-yellow-700 dark:text-yellow-300">User Not Found</CardTitle>
            <CardDescription className="text-yellow-600 dark:text-yellow-400">
              The requested user could not be found or you don't have permission to view it.
            </CardDescription>
          </CardHeader>
          <CardFooter className="bg-yellow-50 dark:bg-yellow-950">
            <Button 
              variant="outline" 
              onClick={() => navigate("/admin/users")}
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back to Users
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button 
            variant="outline" 
            onClick={() => navigate("/admin/users")}
            className="mr-4"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-3xl font-bold">User Details</h1>
        </div>
      </div>

      {/* User Profile Card */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <div className="flex items-center">
            <Avatar className="h-12 w-12 mr-4">
              <AvatarImage src={userProfile.avatar_url || `https://www.gravatar.com/avatar/${userProfile.email}?d=mp`} />
              <AvatarFallback>{userProfile.full_name?.charAt(0) || userProfile.email?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{userProfile.full_name || 'Unnamed User'}</CardTitle>
              <CardDescription className="text-sm">{userProfile.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300">Supabase UID</h3>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100 font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">{userProfile.id}</p>
              </div>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300">Email</h3>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{userProfile.email}</p>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300">Role</h3>
                <Badge className="mt-1">{userProfile.role || 'user'}</Badge>
              </div>
            </div>

            <div>
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300">Status</h3>
                <Badge variant={getStatusBadge(userProfile.status)} className="mt-1">
                  {userProfile.status || 'unknown'}
                </Badge>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300">Created At</h3>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatDate(userProfile.created_at)}</p>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300">Last Updated</h3>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatDate(userProfile.updated_at)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Only render subscriptions section if the tables exist */}
      {tablesInfo.hasSubscriptions && tablesInfo.hasPlans && tablesInfo.hasRelationship && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Subscriptions</CardTitle>
            <CardDescription>User's active and past subscription packages</CardDescription>
          </CardHeader>
          <CardContent>
            {subscriptions.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No subscription data found for this user.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Billing Cycle</TableHead>
                    <TableHead>Current Period</TableHead>
                    <TableHead>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((sub, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{sub.plan?.name || 'Unknown Plan'}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadge(sub.status)}>
                          {sub.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{sub.billing_cycle || 'N/A'}</TableCell>
                      <TableCell>
                        {sub.current_period_start ? (
                          <span>
                            {formatDate(sub.current_period_start)} - {formatDate(sub.current_period_end)}
                          </span>
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                      <TableCell>
                        {sub.plan ? (
                          sub.billing_cycle === 'yearly' 
                            ? formatCurrency(sub.plan.price_yearly || 0) 
                            : formatCurrency(sub.plan.price_monthly || 0)
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Only render invoices section if the table exists */}
      {tablesInfo.hasInvoices && (
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>User's payment and invoice history</CardDescription>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No payment history found for this user.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium font-mono">
                        {invoice.invoice_number || invoice.id.substring(0, 8)}
                      </TableCell>
                      <TableCell>{formatDate(invoice.created_at)}</TableCell>
                      <TableCell>{formatCurrency(invoice.amount || 0, invoice.currency)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadge(invoice.status)}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {invoice.invoice_pdf_url && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.open(invoice.invoice_pdf_url, '_blank')}
                          >
                            View
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Auth Details Card */}
      {completeUserData && (
        <>
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Authentication Details</CardTitle>
                <CardDescription>User authentication and identity information</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowRawData(!showRawData)}
              >
                {showRawData ? "Show Formatted" : "Show Raw JSON"}
              </Button>
            </CardHeader>
            <CardContent>
              {showRawData ? (
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto max-h-[500px] text-xs">
                  {JSON.stringify(completeUserData, null, 2)}
                </pre>
              ) : (
                <div className="space-y-6">
                  {/* Auth Data Section */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">Auth Provider Info</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Provider</TableHead>
                          <TableHead>Identity ID</TableHead>
                          <TableHead>Email Verified</TableHead>
                          <TableHead>Last Sign In</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {completeUserData.auth?.identities?.map((identity: any) => (
                          <TableRow key={identity.id}>
                            <TableCell className="font-medium">{identity.provider}</TableCell>
                            <TableCell className="font-mono text-xs">{identity.identity_id}</TableCell>
                            <TableCell>
                              {identity.identity_data?.email_verified ? (
                                <Badge variant="default">Verified</Badge>
                              ) : (
                                <Badge variant="outline">Not Verified</Badge>
                              )}
                            </TableCell>
                            <TableCell>{formatDate(identity.last_sign_in_at)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Metadata Section */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">User Metadata</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-300">User Metadata</h4>
                        {completeUserData.auth?.user_metadata ? (
                          <div className="mt-1 text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded">
                            {Object.entries(completeUserData.auth.user_metadata).map(([key, value]) => (
                              <div key={key} className="mb-1">
                                <span className="font-medium">{key}:</span>{" "}
                                <span>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">No user metadata</p>
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-300">App Metadata</h4>
                        {completeUserData.auth?.app_metadata ? (
                          <div className="mt-1 text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded">
                            {Object.entries(completeUserData.auth.app_metadata).map(([key, value]) => (
                              <div key={key} className="mb-1">
                                <span className="font-medium">{key}:</span>{" "}
                                <span>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">No app metadata</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Session Info */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">Active Sessions</h3>
                    {completeUserData.sessions?.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Session ID</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead>Last Used</TableHead>
                            <TableHead>User Agent</TableHead>
                            <TableHead>IP Address</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {completeUserData.sessions.map((session: any) => (
                            <TableRow key={session.id}>
                              <TableCell className="font-mono text-xs">{session.id.substring(0, 8)}...</TableCell>
                              <TableCell>{formatDate(session.created_at)}</TableCell>
                              <TableCell>{formatDate(session.updated_at)}</TableCell>
                              <TableCell className="max-w-[200px] truncate text-xs">
                                {session.user_agent || 'N/A'}
                              </TableCell>
                              <TableCell>{session.ip_address || 'N/A'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No active sessions found</p>
                    )}
                  </div>

                  {/* Auth Factors */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">Authentication Factors</h3>
                    {completeUserData.factors?.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Factor Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead>Last Used</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {completeUserData.factors.map((factor: any) => (
                            <TableRow key={factor.id}>
                              <TableCell className="font-medium">{factor.factor_type}</TableCell>
                              <TableCell>
                                <Badge variant={factor.status === 'verified' ? 'default' : 'secondary'}>
                                  {factor.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{formatDate(factor.created_at)}</TableCell>
                              <TableCell>{formatDate(factor.updated_at)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No authentication factors found</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Notes about database tables if some are missing */}
      {(!tablesInfo.hasSubscriptions || !tablesInfo.hasPlans || !tablesInfo.hasInvoices) && (
        <Card className="mt-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-blue-700 dark:text-blue-300">Database Setup Information</CardTitle>
            <CardDescription className="text-blue-600 dark:text-blue-400">
              Some database tables are missing for subscription and payment features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-sm text-blue-700 dark:text-blue-300 space-y-1">
              {!tablesInfo.hasSubscriptions && (
                <li>The 'subscriptions' table is not set up in your database</li>
              )}
              {!tablesInfo.hasPlans && (
                <li>The 'plans' table is not set up in your database</li>
              )}
              {(tablesInfo.hasSubscriptions && tablesInfo.hasPlans && !tablesInfo.hasRelationship) && (
                <li>The relationship between 'subscriptions' and 'plans' tables is not configured</li>
              )}
              {!tablesInfo.hasInvoices && (
                <li>The 'invoices' table is not set up in your database</li>
              )}
              <li>
                Run the migration script at <code className="bg-blue-100 dark:bg-blue-900 p-1 rounded">migrations/20230501000000_create_subscription_tables.sql</code> to set up these tables
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              onClick={() => navigate("/admin/run-migration")}
              className="bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800"
            >
              Go to Migrations
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
} 