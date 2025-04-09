var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserProfile, getCompleteUserData } from "../../lib/supabase/auth";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Skeleton } from "../../components/ui/skeleton";
import { ReloadIcon, ArrowLeftIcon } from "@radix-ui/react-icons";
import { checkSubscriptionTables, getUserSubscriptions, getUserInvoices } from "../../lib/supabase/subscriptions";
export function UserDetailPage() {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const { userId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null);
    const [subscriptions, setSubscriptions] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [error, setError] = useState(null);
    const [tablesInfo, setTablesInfo] = useState({
        hasSubscriptions: false,
        hasPlans: false,
        hasInvoices: false,
        hasRelationship: false
    });
    const [completeUserData, setCompleteUserData] = useState(null);
    const [showRawData, setShowRawData] = useState(false);
    // Fetch table information to avoid querying non-existent tables
    useEffect(() => {
        function checkTables() {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const { data, error } = yield checkSubscriptionTables();
                    if (error) {
                        console.error("Error checking subscription tables:", error);
                        // Default to assuming tables don't exist if check fails
                        setTablesInfo({
                            hasSubscriptions: false,
                            hasPlans: false,
                            hasInvoices: false,
                            hasRelationship: false
                        });
                    }
                    else if (data) {
                        setTablesInfo(data);
                    }
                }
                catch (err) {
                    console.error("Error checking tables:", err);
                    // Default to assuming tables don't exist if check fails
                    setTablesInfo({
                        hasSubscriptions: false,
                        hasPlans: false,
                        hasInvoices: false,
                        hasRelationship: false
                    });
                }
            });
        }
        checkTables();
    }, []);
    useEffect(() => {
        function fetchUserData() {
            return __awaiter(this, void 0, void 0, function* () {
                if (!userId) {
                    setError("User ID is missing");
                    setLoading(false);
                    return;
                }
                try {
                    setLoading(true);
                    // Fetch user profile - this always exists
                    const profileResponse = yield getUserProfile(userId);
                    if (profileResponse.error) {
                        throw new Error(`Failed to fetch user profile: ${profileResponse.error.message}`);
                    }
                    setUserProfile(profileResponse.data);
                    // Fetch subscriptions if tables exist
                    if (tablesInfo.hasSubscriptions && tablesInfo.hasPlans && tablesInfo.hasRelationship) {
                        try {
                            const { data: subscriptionsData, error: subscriptionsError } = yield getUserSubscriptions(userId);
                            if (subscriptionsError) {
                                console.error("Error fetching subscriptions:", subscriptionsError);
                            }
                            else if (subscriptionsData) {
                                setSubscriptions(subscriptionsData);
                            }
                        }
                        catch (subErr) {
                            console.error("Exception fetching subscriptions:", subErr);
                        }
                    }
                    // Fetch invoices if the table exists
                    if (tablesInfo.hasInvoices) {
                        try {
                            const { data: invoicesData, error: invoicesError } = yield getUserInvoices(userId);
                            if (invoicesError) {
                                console.error("Error fetching invoices:", invoicesError);
                            }
                            else if (invoicesData) {
                                setInvoices(invoicesData);
                            }
                        }
                        catch (invErr) {
                            console.error("Exception fetching invoices:", invErr);
                        }
                    }
                }
                catch (err) {
                    console.error("Error fetching user details:", err);
                    setError(err instanceof Error ? err.message : "Failed to load user data");
                }
                finally {
                    setLoading(false);
                }
            });
        }
        // Only fetch user data if we've completed the table check
        if (Object.values(tablesInfo).some(value => value !== undefined)) {
            fetchUserData();
        }
    }, [userId, tablesInfo]);
    useEffect(() => {
        function fetchCompleteUserData() {
            return __awaiter(this, void 0, void 0, function* () {
                if (!userId)
                    return;
                try {
                    const { data, error } = yield getCompleteUserData(userId);
                    if (error) {
                        console.error("Error fetching complete user data:", error);
                        return;
                    }
                    setCompleteUserData(data);
                }
                catch (err) {
                    console.error("Exception fetching complete user data:", err);
                }
            });
        }
        fetchCompleteUserData();
    }, [userId]);
    const formatDate = (dateString) => {
        if (!dateString)
            return "N/A";
        return new Date(dateString).toLocaleString();
    };
    const formatCurrency = (amount, currency = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    };
    const getStatusBadge = (status) => {
        switch (status === null || status === void 0 ? void 0 : status.toLowerCase()) {
            case 'active':
            case 'paid':
                return 'default';
            case 'inactive':
            case 'pending':
            case 'trialing':
                return 'secondary';
            case 'suspended':
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
        return (_jsxs("div", { className: "container mx-auto py-10", children: [_jsxs("div", { className: "flex items-center mb-6", children: [_jsx(Skeleton, { className: "h-10 w-10 rounded-full" }), _jsx(Skeleton, { className: "h-8 w-64 ml-4" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsx(Skeleton, { className: "h-[300px] w-full rounded-lg" }), _jsx(Skeleton, { className: "h-[300px] w-full rounded-lg" })] }), _jsx(Skeleton, { className: "h-[400px] w-full rounded-lg mt-6" })] }));
    }
    if (error) {
        return (_jsx("div", { className: "container mx-auto py-10", children: _jsxs(Card, { className: "w-full", children: [_jsxs(CardHeader, { className: "bg-red-50 dark:bg-red-950", children: [_jsx(CardTitle, { className: "text-red-700 dark:text-red-300", children: "Error Loading User" }), _jsx(CardDescription, { className: "text-red-600 dark:text-red-400", children: error })] }), _jsxs(CardFooter, { className: "bg-red-50 dark:bg-red-950", children: [_jsxs(Button, { variant: "outline", onClick: () => navigate("/admin/users"), className: "mr-2", children: [_jsx(ArrowLeftIcon, { className: "mr-2 h-4 w-4" }), " Back to Users"] }), _jsxs(Button, { onClick: () => window.location.reload(), children: [_jsx(ReloadIcon, { className: "mr-2 h-4 w-4" }), " Retry"] })] })] }) }));
    }
    if (!userProfile) {
        return (_jsx("div", { className: "container mx-auto py-10", children: _jsxs(Card, { className: "w-full", children: [_jsxs(CardHeader, { className: "bg-yellow-50 dark:bg-yellow-950", children: [_jsx(CardTitle, { className: "text-yellow-700 dark:text-yellow-300", children: "User Not Found" }), _jsx(CardDescription, { className: "text-yellow-600 dark:text-yellow-400", children: "The requested user could not be found or you don't have permission to view it." })] }), _jsx(CardFooter, { className: "bg-yellow-50 dark:bg-yellow-950", children: _jsxs(Button, { variant: "outline", onClick: () => navigate("/admin/users"), children: [_jsx(ArrowLeftIcon, { className: "mr-2 h-4 w-4" }), " Back to Users"] }) })] }) }));
    }
    return (_jsxs("div", { className: "container mx-auto py-10", children: [_jsx("div", { className: "flex justify-between items-center mb-6", children: _jsxs("div", { className: "flex items-center", children: [_jsxs(Button, { variant: "outline", onClick: () => navigate("/admin/users"), className: "mr-4", children: [_jsx(ArrowLeftIcon, { className: "mr-2 h-4 w-4" }), " Back"] }), _jsx("h1", { className: "text-3xl font-bold", children: "User Details" })] }) }), _jsxs(Card, { className: "mb-6", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs("div", { className: "flex items-center", children: [_jsxs(Avatar, { className: "h-12 w-12 mr-4", children: [_jsx(AvatarImage, { src: userProfile.avatar_url || `https://www.gravatar.com/avatar/${userProfile.email}?d=mp` }), _jsx(AvatarFallback, { children: ((_a = userProfile.full_name) === null || _a === void 0 ? void 0 : _a.charAt(0)) || ((_b = userProfile.email) === null || _b === void 0 ? void 0 : _b.charAt(0)) })] }), _jsxs("div", { children: [_jsx(CardTitle, { children: userProfile.full_name || 'Unnamed User' }), _jsx(CardDescription, { className: "text-sm", children: userProfile.email })] })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mt-4", children: [_jsxs("div", { children: [_jsxs("div", { className: "mb-4", children: [_jsx("h3", { className: "text-sm font-medium text-gray-500 dark:text-gray-300", children: "Supabase UID" }), _jsx("p", { className: "mt-1 text-sm text-gray-900 dark:text-gray-100 font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded", children: userProfile.id })] }), _jsxs("div", { className: "mb-4", children: [_jsx("h3", { className: "text-sm font-medium text-gray-500 dark:text-gray-300", children: "Email" }), _jsx("p", { className: "mt-1 text-sm text-gray-900 dark:text-gray-100", children: userProfile.email })] }), _jsxs("div", { className: "mb-4", children: [_jsx("h3", { className: "text-sm font-medium text-gray-500 dark:text-gray-300", children: "Role" }), _jsx(Badge, { className: "mt-1", children: userProfile.role || 'user' })] })] }), _jsxs("div", { children: [_jsxs("div", { className: "mb-4", children: [_jsx("h3", { className: "text-sm font-medium text-gray-500 dark:text-gray-300", children: "Status" }), _jsx(Badge, { variant: getStatusBadge(userProfile.status), className: "mt-1", children: userProfile.status || 'unknown' })] }), _jsxs("div", { className: "mb-4", children: [_jsx("h3", { className: "text-sm font-medium text-gray-500 dark:text-gray-300", children: "Created At" }), _jsx("p", { className: "mt-1 text-sm text-gray-900 dark:text-gray-100", children: formatDate(userProfile.created_at) })] }), _jsxs("div", { className: "mb-4", children: [_jsx("h3", { className: "text-sm font-medium text-gray-500 dark:text-gray-300", children: "Last Updated" }), _jsx("p", { className: "mt-1 text-sm text-gray-900 dark:text-gray-100", children: formatDate(userProfile.updated_at) })] })] })] }) })] }), tablesInfo.hasSubscriptions && tablesInfo.hasPlans && tablesInfo.hasRelationship && (_jsxs(Card, { className: "mb-6", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Subscriptions" }), _jsx(CardDescription, { children: "User's active and past subscription packages" })] }), _jsx(CardContent, { children: subscriptions.length === 0 ? (_jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "No subscription data found for this user." })) : (_jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Plan" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { children: "Billing Cycle" }), _jsx(TableHead, { children: "Current Period" }), _jsx(TableHead, { children: "Price" })] }) }), _jsx(TableBody, { children: subscriptions.map((sub, index) => {
                                        var _a;
                                        return (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: ((_a = sub.plan) === null || _a === void 0 ? void 0 : _a.name) || 'Unknown Plan' }), _jsx(TableCell, { children: _jsx(Badge, { variant: getStatusBadge(sub.status), children: sub.status }) }), _jsx(TableCell, { children: sub.billing_cycle || 'N/A' }), _jsx(TableCell, { children: sub.current_period_start ? (_jsxs("span", { children: [formatDate(sub.current_period_start), " - ", formatDate(sub.current_period_end)] })) : ('N/A') }), _jsx(TableCell, { children: sub.plan ? (sub.billing_cycle === 'yearly'
                                                        ? formatCurrency(sub.plan.price_yearly || 0)
                                                        : formatCurrency(sub.plan.price_monthly || 0)) : ('N/A') })] }, index));
                                    }) })] })) })] })), tablesInfo.hasInvoices && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Payment History" }), _jsx(CardDescription, { children: "User's payment and invoice history" })] }), _jsx(CardContent, { children: invoices.length === 0 ? (_jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "No payment history found for this user." })) : (_jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Invoice Number" }), _jsx(TableHead, { children: "Date" }), _jsx(TableHead, { children: "Amount" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { children: "Actions" })] }) }), _jsx(TableBody, { children: invoices.map((invoice, index) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium font-mono", children: invoice.invoice_number || invoice.id.substring(0, 8) }), _jsx(TableCell, { children: formatDate(invoice.created_at) }), _jsx(TableCell, { children: formatCurrency(invoice.amount || 0, invoice.currency) }), _jsx(TableCell, { children: _jsx(Badge, { variant: getStatusBadge(invoice.status), children: invoice.status }) }), _jsx(TableCell, { children: invoice.invoice_pdf_url && (_jsx(Button, { size: "sm", variant: "outline", onClick: () => window.open(invoice.invoice_pdf_url, '_blank'), children: "View" })) })] }, index))) })] })) })] })), completeUserData && (_jsx(_Fragment, { children: _jsxs(Card, { className: "mb-6", children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: "Authentication Details" }), _jsx(CardDescription, { children: "User authentication and identity information" })] }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setShowRawData(!showRawData), children: showRawData ? "Show Formatted" : "Show Raw JSON" })] }), _jsx(CardContent, { children: showRawData ? (_jsx("pre", { className: "bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto max-h-[500px] text-xs", children: JSON.stringify(completeUserData, null, 2) })) : (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium mb-2", children: "Auth Provider Info" }), _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Provider" }), _jsx(TableHead, { children: "Identity ID" }), _jsx(TableHead, { children: "Email Verified" }), _jsx(TableHead, { children: "Last Sign In" })] }) }), _jsx(TableBody, { children: (_d = (_c = completeUserData.auth) === null || _c === void 0 ? void 0 : _c.identities) === null || _d === void 0 ? void 0 : _d.map((identity) => {
                                                            var _a;
                                                            return (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: identity.provider }), _jsx(TableCell, { className: "font-mono text-xs", children: identity.identity_id }), _jsx(TableCell, { children: ((_a = identity.identity_data) === null || _a === void 0 ? void 0 : _a.email_verified) ? (_jsx(Badge, { variant: "default", children: "Verified" })) : (_jsx(Badge, { variant: "outline", children: "Not Verified" })) }), _jsx(TableCell, { children: formatDate(identity.last_sign_in_at) })] }, identity.id));
                                                        }) })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium mb-2", children: "User Metadata" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-gray-500 dark:text-gray-300", children: "User Metadata" }), ((_e = completeUserData.auth) === null || _e === void 0 ? void 0 : _e.user_metadata) ? (_jsx("div", { className: "mt-1 text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded", children: Object.entries(completeUserData.auth.user_metadata).map(([key, value]) => (_jsxs("div", { className: "mb-1", children: [_jsxs("span", { className: "font-medium", children: [key, ":"] }), " ", _jsx("span", { children: typeof value === 'object' ? JSON.stringify(value) : String(value) })] }, key))) })) : (_jsx("p", { className: "mt-1 text-sm text-gray-500 dark:text-gray-400", children: "No user metadata" }))] }), _jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-gray-500 dark:text-gray-300", children: "App Metadata" }), ((_f = completeUserData.auth) === null || _f === void 0 ? void 0 : _f.app_metadata) ? (_jsx("div", { className: "mt-1 text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded", children: Object.entries(completeUserData.auth.app_metadata).map(([key, value]) => (_jsxs("div", { className: "mb-1", children: [_jsxs("span", { className: "font-medium", children: [key, ":"] }), " ", _jsx("span", { children: typeof value === 'object' ? JSON.stringify(value) : String(value) })] }, key))) })) : (_jsx("p", { className: "mt-1 text-sm text-gray-500 dark:text-gray-400", children: "No app metadata" }))] })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium mb-2", children: "Active Sessions" }), ((_g = completeUserData.sessions) === null || _g === void 0 ? void 0 : _g.length) > 0 ? (_jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Session ID" }), _jsx(TableHead, { children: "Created At" }), _jsx(TableHead, { children: "Last Used" }), _jsx(TableHead, { children: "User Agent" }), _jsx(TableHead, { children: "IP Address" })] }) }), _jsx(TableBody, { children: completeUserData.sessions.map((session) => (_jsxs(TableRow, { children: [_jsxs(TableCell, { className: "font-mono text-xs", children: [session.id.substring(0, 8), "..."] }), _jsx(TableCell, { children: formatDate(session.created_at) }), _jsx(TableCell, { children: formatDate(session.updated_at) }), _jsx(TableCell, { className: "max-w-[200px] truncate text-xs", children: session.user_agent || 'N/A' }), _jsx(TableCell, { children: session.ip_address || 'N/A' })] }, session.id))) })] })) : (_jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "No active sessions found" }))] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium mb-2", children: "Authentication Factors" }), ((_h = completeUserData.factors) === null || _h === void 0 ? void 0 : _h.length) > 0 ? (_jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Factor Type" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { children: "Created At" }), _jsx(TableHead, { children: "Last Used" })] }) }), _jsx(TableBody, { children: completeUserData.factors.map((factor) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: factor.factor_type }), _jsx(TableCell, { children: _jsx(Badge, { variant: factor.status === 'verified' ? 'default' : 'secondary', children: factor.status }) }), _jsx(TableCell, { children: formatDate(factor.created_at) }), _jsx(TableCell, { children: formatDate(factor.updated_at) })] }, factor.id))) })] })) : (_jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "No authentication factors found" }))] })] })) })] }) })), (!tablesInfo.hasSubscriptions || !tablesInfo.hasPlans || !tablesInfo.hasInvoices) && (_jsxs(Card, { className: "mt-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: "text-blue-700 dark:text-blue-300", children: "Database Setup Information" }), _jsx(CardDescription, { className: "text-blue-600 dark:text-blue-400", children: "Some database tables are missing for subscription and payment features" })] }), _jsx(CardContent, { children: _jsxs("ul", { className: "list-disc pl-5 text-sm text-blue-700 dark:text-blue-300 space-y-1", children: [!tablesInfo.hasSubscriptions && (_jsx("li", { children: "The 'subscriptions' table is not set up in your database" })), !tablesInfo.hasPlans && (_jsx("li", { children: "The 'plans' table is not set up in your database" })), (tablesInfo.hasSubscriptions && tablesInfo.hasPlans && !tablesInfo.hasRelationship) && (_jsx("li", { children: "The relationship between 'subscriptions' and 'plans' tables is not configured" })), !tablesInfo.hasInvoices && (_jsx("li", { children: "The 'invoices' table is not set up in your database" })), _jsxs("li", { children: ["Run the migration script at ", _jsx("code", { className: "bg-blue-100 dark:bg-blue-900 p-1 rounded", children: "migrations/20230501000000_create_subscription_tables.sql" }), " to set up these tables"] })] }) }), _jsx(CardFooter, { children: _jsx(Button, { variant: "outline", onClick: () => navigate("/admin/run-migration"), className: "bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800", children: "Go to Migrations" }) })] }))] }));
}
