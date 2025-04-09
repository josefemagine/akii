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
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, RefreshCw, Trash2, AlertTriangle, Loader2, LogIn, Database, TestTube, InfoIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from 'react-router-dom';
import { BedrockClient } from "@/lib/supabase-bedrock-client";
import { BedrockConfig } from "@/lib/bedrock-config";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUser } from '@/contexts/UserContext';
import { useAuth } from '@/contexts/UnifiedAuthContext';
import AWSTestConnectionModal from "@/components/aws/AWSTestConnectionModal";
// Error boundary component to catch React errors
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        // Log error information
        console.error("Error in Supabase Bedrock component:", error);
        console.error("Error details:", errorInfo);
    }
    render() {
        var _a;
        if (this.state.hasError) {
            // Custom error UI
            return (_jsxs(Card, { className: "mb-6", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Something went wrong" }), _jsx(CardDescription, { children: "There was an error loading the Bedrock dashboard" })] }), _jsxs(CardContent, { children: [_jsxs(Alert, { variant: "destructive", children: [_jsx(AlertCircle, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: "Error" }), _jsx(AlertDescription, { children: ((_a = this.state.error) === null || _a === void 0 ? void 0 : _a.message) || "Unknown error" })] }), _jsx("div", { className: "mt-4", children: _jsxs(Button, { variant: "outline", onClick: () => this.setState({ hasError: false, error: null }), children: [_jsx(RefreshCw, { className: "mr-2 h-4 w-4" }), " Try Again"] }) })] })] }));
        }
        return this.props.children;
    }
}
// Plan configuration - maps to AWS Bedrock models and commitment options
const planConfig = {
    starter: {
        modelId: "amazon.titan-text-lite-v1",
        commitmentDuration: "ONE_MONTH",
        modelUnits: 1
    },
    pro: {
        modelId: "amazon.titan-text-express-v1",
        commitmentDuration: "ONE_MONTH",
        modelUnits: 2
    },
    business: {
        modelId: "anthropic.claude-instant-v1",
        commitmentDuration: "ONE_MONTH",
        modelUnits: 5
    },
};
// Map plan to friendly display format
function getPlanFromModelId(modelId) {
    const planMap = {
        'amazon.titan-text-lite-v1': 'starter',
        'amazon.titan-text-express-v1': 'pro',
        'anthropic.claude-instant-v1': 'business',
        'anthropic.claude-v2': 'business'
    };
    return planMap[modelId] || 'custom';
}
// Status badge component
const StatusBadge = ({ status }) => {
    let variant = "outline";
    switch (status.toLowerCase()) {
        case 'inservice':
        case 'active':
        case 'creating':
            variant = "default";
            break;
        case 'pending':
            variant = "secondary";
            break;
        case 'failed':
        case 'deleted':
            variant = "destructive";
            break;
    }
    return _jsx(Badge, { variant: variant, children: status });
};
// API connection status badge
const ConnectionStatusBadge = ({ status }) => {
    let variant = "outline";
    let label = "Unknown";
    switch (status) {
        case 'connected':
            variant = "default";
            label = "Connected";
            break;
        case 'checking':
            variant = "secondary";
            label = "Checking...";
            break;
        case 'error':
            variant = "destructive";
            label = "Connection Error";
            break;
        default:
            variant = "outline";
            label = "Not Checked";
    }
    return _jsx(Badge, { variant: variant, children: label });
};
// Authentication status badge
const AuthStatusBadge = ({ status }) => {
    let variant = "outline";
    let label = "Unknown";
    switch (status) {
        case 'authenticated':
            variant = "default";
            label = "Authenticated";
            break;
        case 'checking':
            variant = "secondary";
            label = "Checking Auth...";
            break;
        case 'unauthenticated':
            variant = "destructive";
            label = "Not Authenticated";
            break;
        case 'expired':
            variant = "destructive";
            label = "Session Expired";
            break;
        default:
            variant = "outline";
            label = "Auth Unknown";
    }
    return _jsx(Badge, { variant: variant, children: label });
};
// After imports, add this component for the mock data notice
const MockDataNotice = () => {
    if (!BedrockConfig.isLocalDevelopment || !BedrockConfig.useMockData) {
        return null;
    }
    return (_jsxs(Alert, { className: "mb-4", children: [_jsx(Database, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: "Using Mock Data" }), _jsx(AlertDescription, { children: "You're currently viewing mock data in development mode. Real API endpoints will be used in production." })] }));
};
// Server error notice component to display information about Edge Function errors
const ServerErrorNotice = ({ errorDetails }) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    if (!errorDetails)
        return null;
    // Handle different types of errors
    const isModuleError = errorDetails.code === 'EDGE_FUNCTION_MODULE_ERROR';
    const isBootError = errorDetails.code === 'EDGE_FUNCTION_BOOT_ERROR' ||
        (errorDetails.original && errorDetails.original.includes('BOOT_ERROR'));
    const isMissingExport = errorDetails.code === 'EDGE_FUNCTION_MISSING_EXPORT';
    if (!isModuleError && !isBootError && !isMissingExport)
        return null;
    // Extract the AWS documentation link if available
    const docLink = isMissingExport &&
        ((_a = errorDetails.details) === null || _a === void 0 ? void 0 : _a.suggestion) &&
        errorDetails.details.suggestion.includes('https://') ?
        (_b = errorDetails.details.suggestion.match(/(https:\/\/[^\s]+)/)) === null || _b === void 0 ? void 0 : _b[1] : null;
    return (_jsxs(Alert, { variant: "destructive", className: "mb-4", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: "Server-Side Error Detected" }), _jsxs(AlertDescription, { className: "space-y-2", children: [_jsx("p", { children: isModuleError ? (_jsxs(_Fragment, { children: ["The Supabase Edge Function has a module import error. It's trying to import", _jsx("code", { className: "px-1 mx-1 bg-red-900/20 rounded", children: ((_c = errorDetails.details) === null || _c === void 0 ? void 0 : _c.missingExport) || 'unknown export' }), "from", _jsx("code", { className: "px-1 mx-1 bg-red-900/20 rounded", children: ((_d = errorDetails.details) === null || _d === void 0 ? void 0 : _d.module) || 'unknown module' }), "but that export doesn't exist."] })) : isMissingExport ? (_jsxs(_Fragment, { children: ["The Supabase Edge Function is looking for the function", _jsx("code", { className: "px-1 mx-1 bg-red-900/20 rounded", children: (_e = errorDetails.details) === null || _e === void 0 ? void 0 : _e.missingExport }), "in the module", _jsx("code", { className: "px-1 mx-1 bg-red-900/20 rounded", children: (_f = errorDetails.details) === null || _f === void 0 ? void 0 : _f.module }), "but it's not available."] })) : ('The Supabase Edge Function is failing to initialize.') }), _jsxs("div", { className: "text-sm bg-red-900/10 p-2 rounded", children: [_jsx("div", { className: "font-semibold mb-1", children: "Resolution:" }), _jsx("p", { children: isModuleError || isMissingExport ? (_jsxs(_Fragment, { children: [((_g = errorDetails.details) === null || _g === void 0 ? void 0 : _g.resolution) ||
                                            `This requires updating the server-side Edge Function code to correct the ${isModuleError ? 'module import' : 'missing function'}.`, isMissingExport && ((_h = errorDetails.details) === null || _h === void 0 ? void 0 : _h.suggestion) && (_jsxs("div", { className: "mt-1 text-xs", children: [_jsx("strong", { children: "Suggestion:" }), " ", docLink ? (_jsxs("span", { children: ["Use ", _jsx("code", { className: "px-1 bg-red-900/20 rounded", children: "ListFoundationModels" }), " instead. See ", _jsx("a", { href: docLink, target: "_blank", rel: "noopener noreferrer", className: "text-blue-400 hover:text-blue-300 underline", children: "AWS Bedrock API Reference" })] })) : (errorDetails.details.suggestion)] }))] })) : ('Check the Supabase Edge Function logs for detailed error information.') })] }), _jsxs("div", { className: "pt-1 mt-1 border-t border-red-800/20 text-xs text-red-300", children: ["Error Code: ", errorDetails.code || 'UNKNOWN'] })] })] }));
};
// Test modal component
const TestModal = ({ isOpen, setIsOpen, testData }) => {
    return (_jsx(Dialog, { open: isOpen, onOpenChange: setIsOpen, children: _jsxs(DialogContent, { className: "max-w-3xl max-h-[80vh] overflow-auto", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Edge Function Details" }), _jsx(DialogDescription, { children: "Raw values from the super-action Edge Function" })] }), _jsxs("div", { className: "mt-4", children: [_jsx("div", { className: "mb-4", children: _jsxs(Alert, { children: [_jsx(AlertCircle, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: "Environment Details" }), _jsx(AlertDescription, { children: "These values show the current configuration of your Edge Function environment." })] }) }), _jsx("div", { className: "bg-muted rounded-md p-4", children: _jsx("pre", { className: "whitespace-pre-wrap overflow-auto", children: JSON.stringify(testData, null, 2) }) })] })] }) }));
};
// Define the available filters
const modelFilters = [
    {
        key: 'byProvider',
        label: 'Provider',
        options: [
            { value: 'amazon', label: 'Amazon' },
            { value: 'anthropic', label: 'Anthropic' },
            { value: 'ai21labs', label: 'AI21 Labs' },
            { value: 'cohere', label: 'Cohere' },
            { value: 'meta', label: 'Meta' },
            { value: 'stability', label: 'Stability AI' }
        ]
    },
    {
        key: 'byOutputModality',
        label: 'Output Type',
        options: [
            { value: 'TEXT', label: 'Text' },
            { value: 'IMAGE', label: 'Image' },
            { value: 'EMBEDDING', label: 'Embedding' }
        ]
    },
    {
        key: 'byInferenceType',
        label: 'Inference Type',
        options: [
            { value: 'ON_DEMAND', label: 'On-Demand' },
            { value: 'PROVISIONED', label: 'Provisioned' }
        ]
    }
];
// Create a component for model filters
const ModelFilters = ({ activeFilters, setActiveFilters, loadingModels, fetchAvailableModels }) => {
    const handleFilterChange = (filterKey, value) => {
        setActiveFilters(prev => {
            // If value is empty, remove the filter
            if (!value) {
                const newFilters = Object.assign({}, prev);
                delete newFilters[filterKey];
                return newFilters;
            }
            // Otherwise set the new filter value
            return Object.assign(Object.assign({}, prev), { [filterKey]: value });
        });
    };
    const clearFilters = () => {
        setActiveFilters({});
    };
    return (_jsxs("div", { className: "p-4 border rounded-md mb-4", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h3", { className: "text-lg font-medium", children: "Filter Models" }), _jsx(Button, { variant: "outline", size: "sm", onClick: clearFilters, disabled: Object.keys(activeFilters).length === 0, children: "Clear Filters" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: modelFilters.map(filter => (_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: filter.key, children: filter.label }), _jsxs(Select, { value: activeFilters[filter.key] || '', onValueChange: (value) => handleFilterChange(filter.key, value), children: [_jsx(SelectTrigger, { id: filter.key, children: _jsx(SelectValue, { placeholder: `All ${filter.label}s` }) }), _jsxs(SelectContent, { children: [_jsxs(SelectItem, { value: "", children: ["All ", filter.label, "s"] }), filter.options.map(option => (_jsx(SelectItem, { value: option.value, children: option.label }, option.value)))] })] })] }, filter.key))) }), _jsx("div", { className: "mt-4 flex justify-end", children: _jsx(Button, { variant: "outline", size: "sm", disabled: loadingModels, onClick: (e) => {
                        e.preventDefault();
                        fetchAvailableModels(activeFilters);
                    }, children: loadingModels ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Loading..."] })) : (_jsxs(_Fragment, { children: [_jsx(RefreshCw, { className: "mr-2 h-4 w-4" }), "Refresh"] })) }) })] }));
};
// Replace the separate ApiConfiguration and AWS Connection section with this:
const CombinedApiConfigPanel = ({ connectionStatus, authStatus, handleLogin, checkAuthStatus, refreshInstances, testingConnection, refreshing, credentials, clientStatus, testConnection, openTestModal }) => {
    return (_jsxs(Card, { className: "mb-6", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: "AWS Bedrock Connection" }), _jsx(CardDescription, { children: "API configuration and AWS credentials status" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: (clientStatus === null || clientStatus === void 0 ? void 0 : clientStatus.success) ? "default" : "destructive", className: (clientStatus === null || clientStatus === void 0 ? void 0 : clientStatus.success) ? "bg-green-100 text-green-800 border-green-200" : "", children: (clientStatus === null || clientStatus === void 0 ? void 0 : clientStatus.success) ? "Connected" : "Not Connected" }), _jsx(Badge, { variant: authStatus === 'authenticated' ? "outline" : "destructive", className: authStatus === 'authenticated' ? "bg-blue-50 text-blue-800 border-blue-200" : "", children: authStatus === 'authenticated' ? "Authenticated" : "Auth Error" })] })] }) }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsx("div", { className: "space-y-4", children: _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium mb-2", children: "Supabase API" }), _jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [_jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "text-muted-foreground", children: "API URL:" }), _jsx("p", { className: "font-mono bg-muted p-1 rounded", children: "/api/super-action" })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "text-muted-foreground", children: "Environment:" }), _jsx("p", { className: "font-medium", children: "Production" })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "text-muted-foreground", children: "Authentication:" }), _jsx("p", { className: "font-medium", children: "Supabase JWT" })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "text-muted-foreground", children: "Edge Functions:" }), _jsx("p", { className: "font-medium", children: "Enabled" })] })] })] }) }), _jsx("div", { className: "space-y-4", children: _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium mb-2", children: "AWS Credentials" }), _jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [_jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "text-muted-foreground", children: "Region:" }), _jsx("p", { className: "font-medium", children: (credentials === null || credentials === void 0 ? void 0 : credentials.region) || 'Not Configured' })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "text-muted-foreground", children: "Access Key:" }), _jsx("p", { className: "font-medium", children: (credentials === null || credentials === void 0 ? void 0 : credentials.hasCredentials) ?
                                                                '••••••••••••••••' :
                                                                _jsx("span", { className: "text-amber-600", children: "Not Configured" }) })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "text-muted-foreground", children: "Status:" }), _jsx("p", { className: `font-medium ${clientStatus.usingFallback ? 'text-amber-600' : 'text-green-600'}`, children: clientStatus.usingFallback ? 'Using Fallback Data' : 'Using AWS API' })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "text-muted-foreground", children: "Message:" }), _jsx("p", { className: "font-medium text-xs", children: clientStatus.message })] })] })] }) })] }), _jsx("div", { className: "h-px bg-border" }), _jsxs("div", { className: "flex flex-col sm:flex-row justify-between gap-3", children: [_jsx("div", { className: "flex flex-wrap gap-2", children: _jsxs(Button, { variant: "outline", size: "sm", onClick: openTestModal, disabled: testingConnection, children: [_jsx(TestTube, { className: "mr-2 h-4 w-4" }), "Test AWS Connection"] }) }), _jsxs("div", { className: "flex gap-2 justify-end", children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: refreshInstances, disabled: refreshing, children: [refreshing ? (_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" })) : (_jsx(RefreshCw, { className: "mr-2 h-4 w-4" })), "Refresh Data"] }), authStatus !== 'authenticated' && (_jsxs(Button, { variant: "default", size: "sm", onClick: handleLogin, children: [_jsx(LogIn, { className: "mr-2 h-4 w-4" }), "Login"] }))] })] })] })] }));
};
// Skeleton loader for the instances table
const InstanceSkeleton = () => (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(Skeleton, { className: "h-8 w-64" }), _jsx(Skeleton, { className: "h-4 w-full" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-2", children: [_jsx(Skeleton, { className: "h-6 w-full" }), _jsx(Skeleton, { className: "h-6 w-full" }), _jsx(Skeleton, { className: "h-6 w-full" }), _jsx(Skeleton, { className: "h-6 w-full" }), _jsx(Skeleton, { className: "h-6 w-full" })] }) })] }));
// Add a banner to explain the AWS credentials warning messages
const AwsCredentialsNotice = ({ clientStatus }) => {
    // Only show this notice when using fallback data
    if (!(clientStatus === null || clientStatus === void 0 ? void 0 : clientStatus.usingFallback))
        return null;
    return (_jsxs(Alert, { className: "mb-4 bg-blue-50 border-blue-200", children: [_jsx(InfoIcon, { className: "h-4 w-4 text-blue-600" }), _jsx(AlertTitle, { className: "text-blue-800 font-medium", children: "AWS Credentials Notice" }), _jsxs(AlertDescription, { className: "text-blue-700", children: [_jsxs("p", { children: ["The warnings about \"", _jsx("code", { className: "bg-blue-100 px-1 rounded", children: "No AWS credentials found in environment variables" }), "\" are expected."] }), _jsx("p", { className: "mt-1", children: "AWS credentials should be configured through this interface rather than environment variables. Enter your AWS Access Key and Secret below to configure AWS Bedrock." })] })] }));
};
// Extract the main content into a separate component to simplify rendering logic
const BedrockDashboardContent = ({ loading, refreshing, authStatus, error, connectionStatus, instances, testModalOpen, oldTestModalOpen, testData, setTestModalOpen, awsTestModalOpen, setAwsTestModalOpen, showDiagnostics, envDiagnostics, testingConnection, submitting, selectedPlan, selectedModelId, availableModels, loadingModels, showFilters, activeFilters, planConfig, client, 
// User data for auth debugging
user, directUser, isAdmin, 
// Functions
checkAuthStatus, handleLogin, refreshInstances, fetchEnvironmentDiagnostics, fetchDetailedTestData, fetchAvailableModels, handleProvisionInstance, handleDeleteInstance, setShowFilters, setActiveFilters, setAvailableModels, setSelectedModelId, setSelectedPlan, testConnection, openTestModal, 
// Form state
customInstanceName, setCustomInstanceName, 
// Toast
toast }) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    console.log("[DEBUG] Rendering BedrockDashboardContent with props:", {
        loading,
        refreshing,
        authStatus,
        connectionStatus,
        instances: instances === null || instances === void 0 ? void 0 : instances.length,
        availableModels: availableModels === null || availableModels === void 0 ? void 0 : availableModels.length,
        selectedModelId,
        customInstanceName
    });
    // Create a wrapper function for button clicks
    const handleFetchModels = (e) => {
        if (e)
            e.preventDefault();
        fetchAvailableModels(activeFilters);
    };
    // Check if we have edge function errors to display
    const hasEdgeFunctionError = (envDiagnostics === null || envDiagnostics === void 0 ? void 0 : envDiagnostics.errorDetails) ||
        (((_a = envDiagnostics === null || envDiagnostics === void 0 ? void 0 : envDiagnostics.standardEndpoint) === null || _a === void 0 ? void 0 : _a.error) &&
            typeof envDiagnostics.standardEndpoint.error === 'object');
    // Get the error details for the ServerErrorNotice
    const serverErrorDetails = hasEdgeFunctionError ?
        ((envDiagnostics === null || envDiagnostics === void 0 ? void 0 : envDiagnostics.errorDetails) || ((_b = envDiagnostics === null || envDiagnostics === void 0 ? void 0 : envDiagnostics.standardEndpoint) === null || _b === void 0 ? void 0 : _b.error)) :
        null;
    // Render loading state
    if (loading && !refreshing) {
        return (_jsxs("div", { className: "container mx-auto p-4", children: [_jsx("h1", { className: "text-2xl font-bold mb-4", children: "Bedrock AI Instances" }), _jsx(InstanceSkeleton, {})] }));
    }
    // Render auth required state
    if (authStatus === 'unauthenticated' || authStatus === 'expired') {
        // Don't show auth error during initial loading
        if (loading) {
            return (_jsxs("div", { className: "container mx-auto p-4", children: [_jsx("h1", { className: "text-2xl font-bold mb-4", children: "Bedrock AI Instances" }), _jsx(InstanceSkeleton, {})] }));
        }
        return (_jsxs("div", { className: "container mx-auto p-4", children: [_jsx("h1", { className: "text-2xl font-bold mb-4", children: "Bedrock AI Instances" }), _jsxs(Card, { className: "mb-4", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Authentication Required" }), _jsx(CardDescription, { children: "You need to be logged in to access Bedrock AI instances." })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "bg-red-100 text-red-800 p-4 rounded-md mb-4", children: _jsxs("div", { className: "flex items-start", children: [_jsx(AlertCircle, { className: "h-5 w-5 mr-2 mt-0.5" }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold", children: "Authentication Error" }), _jsxs("p", { className: "text-sm", children: [error || "You must be logged in with admin privileges to view this page.", _jsx("br", {}), _jsxs("span", { className: "text-xs mt-1", children: ["Auth Status: ", authStatus, ", Admin: ", isAdmin ? 'Yes' : 'No', ", User Email: ", (user === null || user === void 0 ? void 0 : user.email) || (directUser === null || directUser === void 0 ? void 0 : directUser.email) || localStorage.getItem('akii-auth-user-email') || 'Unknown'] })] })] })] }) }), _jsxs(Button, { onClick: handleLogin, children: [_jsx(LogIn, { className: "mr-2 h-4 w-4" }), " Log In"] })] })] })] }));
    }
    return (_jsx(_Fragment, { children: _jsxs("div", { className: "container p-6 space-y-6", children: [_jsx("h1", { className: "text-2xl font-bold", children: "AWS Bedrock Settings" }), _jsx(CombinedApiConfigPanel, { connectionStatus: connectionStatus, authStatus: authStatus, handleLogin: handleLogin, checkAuthStatus: checkAuthStatus, refreshInstances: refreshInstances, testingConnection: testingConnection, refreshing: refreshing, credentials: {}, clientStatus: {}, testConnection: testConnection, openTestModal: openTestModal }), _jsx(MockDataNotice, {}), client && ((_c = client.clientStatus) === null || _c === void 0 ? void 0 : _c.usingFallback) && _jsx(AwsCredentialsNotice, { clientStatus: client.clientStatus }), serverErrorDetails && _jsx(ServerErrorNotice, { errorDetails: serverErrorDetails }), error && (_jsxs(Alert, { variant: "destructive", className: "mb-4", children: [_jsx(AlertCircle, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: "Error" }), _jsx(AlertDescription, { children: error })] })), _jsxs(Tabs, { defaultValue: "instances", children: [_jsxs(TabsList, { className: "mb-4", children: [_jsx(TabsTrigger, { value: "instances", children: "Instances" }), _jsx(TabsTrigger, { value: "create", children: "Create Instance" }), showDiagnostics && (_jsx(TabsTrigger, { value: "diagnostics", children: "API Diagnostics" }))] }), _jsx(TabsContent, { value: "instances", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Bedrock Instances" }), _jsx(CardDescription, { children: "Manage your provisioned AWS Bedrock AI models" })] }), _jsx(CardContent, { children: instances.length === 0 ? (_jsx("div", { className: "text-center p-4", children: _jsx("p", { className: "text-muted-foreground", children: "No instances found. Create a new instance to get started." }) })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b", children: [_jsx("th", { className: "text-left p-2", children: "ID" }), _jsx("th", { className: "text-left p-2", children: "Model" }), _jsx("th", { className: "text-left p-2", children: "Status" }), _jsx("th", { className: "text-left p-2", children: "Units" }), _jsx("th", { className: "text-left p-2", children: "Created" }), _jsx("th", { className: "text-left p-2", children: "Actions" })] }) }), _jsx("tbody", { children: instances.map((instance) => (_jsxs("tr", { className: "border-b hover:bg-muted/50", children: [_jsx("td", { className: "p-2", children: instance.id }), _jsx("td", { className: "p-2", children: instance.model_id.split('.').pop() }), _jsx("td", { className: "p-2", children: _jsx(StatusBadge, { status: instance.status }) }), _jsx("td", { className: "p-2", children: instance.model_units }), _jsx("td", { className: "p-2", children: new Date(instance.created_at).toLocaleString() }), _jsx("td", { className: "p-2", children: _jsxs(Button, { variant: "destructive", size: "sm", onClick: () => handleDeleteInstance(instance.instance_id), children: [_jsx(Trash2, { className: "h-4 w-4" }), _jsx("span", { className: "sr-only", children: "Delete" })] }) })] }, instance.id))) })] }) })) })] }) }), _jsx(TabsContent, { value: "create", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Create Bedrock Instance" }), _jsx(CardDescription, { children: "Provision a new AWS Bedrock AI model" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h3", { className: "text-md font-medium", children: "Model Selection" }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setShowFilters(!showFilters), children: showFilters ? 'Hide Filters' : 'Show Filters' })] }), showFilters &&
                                                _jsx(ModelFilters, { activeFilters: activeFilters, setActiveFilters: setActiveFilters, loadingModels: loadingModels, fetchAvailableModels: fetchAvailableModels }), _jsxs("div", { className: "grid w-full gap-2", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx(Label, { children: "Available Models" }), _jsx("div", { className: "flex items-center gap-2", children: _jsx(Button, { variant: "outline", size: "sm", onClick: () => fetchAvailableModels(activeFilters), disabled: loadingModels || authStatus !== 'authenticated', children: loadingModels ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Loading..."] })) : (_jsxs(_Fragment, { children: [_jsx(RefreshCw, { className: "mr-2 h-4 w-4" }), "Refresh Models"] })) }) })] }), _jsxs("div", { className: "text-sm text-muted-foreground flex justify-between mb-2", children: [_jsx("span", { children: "Select the AI model you want to provision." }), _jsx("span", { children: availableModels.length > 0 ? (_jsxs(_Fragment, { children: ["Showing ", availableModels.length, " model", availableModels.length !== 1 ? 's' : ''] })) : !loadingModels ? (_jsx(_Fragment, { children: "No models found" })) : null })] }), loadingModels ? (_jsxs("div", { className: "py-8 text-center", children: [_jsx(Loader2, { className: "h-8 w-8 mx-auto mb-4 animate-spin text-primary" }), _jsx("p", { className: "text-muted-foreground", children: "Loading available models..." })] })) : (_jsx("div", { className: "border rounded-md overflow-hidden", children: _jsx("div", { className: "max-h-[350px] overflow-y-auto", children: availableModels.length > 0 ? (availableModels.filter(model => model && model.modelId).map((model) => {
                                                                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
                                                                return (_jsxs("div", { onClick: () => setSelectedModelId(model.modelId), className: `p-4 border-b last:border-b-0 cursor-pointer hover:bg-muted/50 transition-colors ${selectedModelId === model.modelId ? 'bg-primary/10 border-l-4 border-l-primary' : ''}`, children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "font-medium text-base", children: [model.providerName || ((_a = model.modelId) === null || _a === void 0 ? void 0 : _a.split('.')[0]) || 'Unknown', " - ", model.modelName || (((_b = model.modelId) === null || _b === void 0 ? void 0 : _b.split('.')[1]) || model.modelId)] }), _jsx(Badge, { variant: selectedModelId === model.modelId ? "default" : "outline", children: selectedModelId === model.modelId ? "Selected" : "Select" })] }), _jsxs("div", { className: "mt-2 flex flex-wrap gap-2", children: [_jsx("span", { className: "inline-flex text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded font-mono", children: model.modelId }), ((_c = model.inferenceTypesSupported) === null || _c === void 0 ? void 0 : _c.length) > 0 && (_jsx("span", { className: "inline-flex text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-2 py-1 rounded", children: model.inferenceTypesSupported.join(', ') })), ((_d = model.customizationsSupported) === null || _d === void 0 ? void 0 : _d.includes('FINE_TUNING')) && (_jsx("span", { className: "inline-flex text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 px-2 py-1 rounded", children: "Fine-tunable" }))] }), (((_e = model.inputModalities) === null || _e === void 0 ? void 0 : _e.length) > 0 || ((_f = model.outputModalities) === null || _f === void 0 ? void 0 : _f.length) > 0) && (_jsxs("div", { className: "mt-2 text-xs text-muted-foreground", children: [(((_g = model.inputModalities) === null || _g === void 0 ? void 0 : _g.length) > 0 || ((_h = model.inputs) === null || _h === void 0 ? void 0 : _h.length) > 0) && (_jsxs("span", { className: "mr-3", children: [_jsx("span", { className: "font-medium", children: "Input:" }), " ", (model.inputModalities || model.inputs || []).join(', ')] })), (((_j = model.outputModalities) === null || _j === void 0 ? void 0 : _j.length) > 0 || ((_k = model.outputs) === null || _k === void 0 ? void 0 : _k.length) > 0) && (_jsxs("span", { children: [_jsx("span", { className: "font-medium", children: "Output:" }), " ", (model.outputModalities || model.outputs || []).join(', ')] }))] }))] }, model.modelId));
                                                            })) : (_jsxs("div", { className: "text-center p-8 text-muted-foreground", children: [_jsxs("div", { className: "bg-amber-50 dark:bg-amber-950 p-4 rounded-lg border border-amber-200 dark:border-amber-800 mb-6", children: [_jsx("h3", { className: "text-amber-800 dark:text-amber-200 font-medium text-lg mb-2", children: "No Models Available" }), _jsx("p", { className: "mb-2 text-amber-700 dark:text-amber-300", children: "AWS Bedrock models could not be loaded. Click the button below to try fetching available models." }), _jsxs("div", { className: "text-left text-xs bg-amber-100 dark:bg-amber-900 p-3 rounded mt-3 text-amber-800 dark:text-amber-200", children: ["Debug info:", _jsx("br", {}), "Models array: ", availableModels ? `Array(${availableModels.length})` : 'null', _jsx("br", {}), "Loading status: ", loadingModels ? 'Loading' : 'Not loading', _jsx("br", {}), "Selected model ID: ", selectedModelId || 'None', _jsx("br", {}), "Auth status: ", authStatus] })] }), _jsxs("div", { className: "flex flex-col gap-3 items-center", children: [_jsxs(Button, { onClick: () => fetchAvailableModels(activeFilters), disabled: loadingModels || authStatus !== 'authenticated', size: "lg", className: "bg-green-600 hover:bg-green-700 text-white font-medium", children: [_jsx(RefreshCw, { className: "mr-2 h-5 w-5" }), "Load AWS Bedrock Models"] }), _jsx(Button, { onClick: () => {
                                                                                    console.log("[FORCE RENDER] Current available models:", availableModels);
                                                                                    // Force re-render by creating a new array reference
                                                                                    if (availableModels && availableModels.length > 0) {
                                                                                        setAvailableModels([...availableModels]);
                                                                                        toast({
                                                                                            title: "Models Refreshed",
                                                                                            description: `Manually refreshed ${availableModels.length} models in the UI`
                                                                                        });
                                                                                    }
                                                                                    else {
                                                                                        toast({
                                                                                            title: "No Models to Refresh",
                                                                                            description: "There are no models in memory to display",
                                                                                            variant: "destructive"
                                                                                        });
                                                                                    }
                                                                                }, variant: "outline", size: "sm", className: "mt-2", children: "Force UI Refresh" })] })] })) }) }))] }), _jsxs("div", { className: "grid w-full gap-2", children: [_jsx(Label, { htmlFor: "model-details", children: "Model Details" }), _jsx("div", { className: "bg-muted rounded-md p-3", children: _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsx("div", { children: _jsx("span", { className: "text-sm font-medium", children: "Model:" }) }), _jsx("div", { children: _jsx("span", { className: "text-sm", children: selectedModelId || ((_d = planConfig[selectedPlan]) === null || _d === void 0 ? void 0 : _d.modelId) || 'None selected' }) }), _jsx("div", { children: _jsx("span", { className: "text-sm font-medium", children: "Provider:" }) }), _jsx("div", { children: _jsx("span", { className: "text-sm", children: selectedModelId ? selectedModelId.split('.')[0] : 'Unknown' }) }), selectedModelId && availableModels.length > 0 && (_jsxs(_Fragment, { children: [_jsx("div", { children: _jsx("span", { className: "text-sm font-medium", children: "Input Types:" }) }), _jsx("div", { children: _jsx("span", { className: "text-sm", children: ((_f = (_e = availableModels.find(m => m.modelId === selectedModelId)) === null || _e === void 0 ? void 0 : _e.inputModalities) === null || _f === void 0 ? void 0 : _f.join(', ')) || 'Not specified' }) }), _jsx("div", { children: _jsx("span", { className: "text-sm font-medium", children: "Output Types:" }) }), _jsx("div", { children: _jsx("span", { className: "text-sm", children: ((_h = (_g = availableModels.find(m => m.modelId === selectedModelId)) === null || _g === void 0 ? void 0 : _g.outputModalities) === null || _h === void 0 ? void 0 : _h.join(', ')) || 'Not specified' }) })] })), _jsx("div", { children: _jsx("span", { className: "text-sm font-medium", children: "Commitment:" }) }), _jsx("div", { children: _jsx("span", { className: "text-sm", children: "1 Month" }) }), _jsx("div", { children: _jsx("span", { className: "text-sm font-medium", children: "Model Units:" }) }), _jsx("div", { children: _jsx("span", { className: "text-sm", children: "1" }) }), _jsx("div", { children: _jsx("span", { className: "text-sm font-medium", children: "Instance Name:" }) }), _jsx("div", { className: "flex gap-2 items-center", children: _jsx(Input, { placeholder: "Custom instance name (optional)", className: "h-8 text-sm", value: customInstanceName, onChange: (e) => setCustomInstanceName(e.target.value) }) })] }) }), _jsx("p", { className: "text-sm text-muted-foreground", children: "These details will be used to provision your Bedrock instance." })] })] }), _jsx(CardFooter, { children: _jsx(Button, { onClick: handleProvisionInstance, disabled: submitting, children: submitting ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Provisioning..."] })) : ('Create Instance') }) })] }) }), showDiagnostics && (_jsx(TabsContent, { value: "diagnostics", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "API Diagnostics" }), _jsx(CardDescription, { children: "Technical details about the API environment" })] }), _jsx(CardContent, { children: _jsx("pre", { className: "bg-muted p-4 rounded-md overflow-auto max-h-96", children: JSON.stringify(envDiagnostics, null, 2) }) })] }) }))] }), _jsx(TestModal, { isOpen: testModalOpen, setIsOpen: setTestModalOpen, testData: testData }), _jsx(AWSTestConnectionModal, { isOpen: awsTestModalOpen, onClose: () => setAwsTestModalOpen(false) })] }) }));
};
// At the end of the file, add a simple wrapper component for backward compatibility
const SupabaseBedrock = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const { user } = useUser();
    const { isAdmin, user: directUser } = useAuth();
    const [instances, setInstances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('unknown');
    const [authStatus, setAuthStatus] = useState('unknown');
    // Form state
    const [selectedPlan, setSelectedPlan] = useState('starter');
    const [submitting, setSubmitting] = useState(false);
    // Models state
    const [availableModels, setAvailableModels] = useState([]);
    const [loadingModels, setLoadingModels] = useState(false);
    const [selectedModelId, setSelectedModelId] = useState('');
    const [customInstanceName, setCustomInstanceName] = useState('');
    // Filter state
    const [activeFilters, setActiveFilters] = useState({});
    const [showFilters, setShowFilters] = useState(false);
    // Environment diagnostics
    const [envDiagnostics, setEnvDiagnostics] = useState({});
    const [showDiagnostics, setShowDiagnostics] = useState(false);
    // Test modal state
    const [testModalOpen, setTestModalOpen] = useState(false);
    const [awsTestModalOpen, setAwsTestModalOpen] = useState(false);
    const [testData, setTestData] = useState(null);
    const [testingConnection, setTestingConnection] = useState(false);
    // Actual implementation of functions
    const checkAuthStatus = () => __awaiter(void 0, void 0, void 0, function* () {
        console.log("[Bedrock] Checking auth status...");
        try {
            setAuthStatus('checking');
            const result = yield BedrockClient.checkAuth();
            console.log("[Bedrock] Auth check result:", result);
            if (result && result.connected) {
                setAuthStatus('authenticated');
                setConnectionStatus('connected');
            }
            else {
                setAuthStatus('unauthenticated');
                setConnectionStatus('error');
            }
            return result;
        }
        catch (err) {
            console.error("[Bedrock] Auth check error:", err);
            setAuthStatus('error');
            setConnectionStatus('error');
            setError(err.message || "Authentication check failed");
            return null;
        }
    });
    const handleLogin = () => {
        // Redirect to login page if needed
        navigate('/login');
    };
    const refreshInstances = () => __awaiter(void 0, void 0, void 0, function* () {
        console.log("[Bedrock] Refreshing instances...");
        try {
            setRefreshing(true);
            const result = yield BedrockClient.listInstances();
            console.log("[Bedrock] Instances:", result);
            setInstances(result || []);
            return result;
        }
        catch (err) {
            console.error("[Bedrock] Error refreshing instances:", err);
            toast({
                title: "Error",
                description: `Could not refresh instances: ${err.message}`,
                variant: "destructive"
            });
            return [];
        }
        finally {
            setRefreshing(false);
        }
    });
    const fetchAvailableModels = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filters = {}) {
        console.log("[Bedrock] Fetching available models with filters:", filters);
        try {
            setLoadingModels(true);
            const result = yield BedrockClient.listFoundationModels(filters);
            console.log("[Bedrock] Available models:", result);
            setAvailableModels(result || []);
            return result;
        }
        catch (err) {
            console.error("[Bedrock] Error fetching models:", err);
            toast({
                title: "Error",
                description: `Could not fetch models: ${err.message}`,
                variant: "destructive"
            });
            return [];
        }
        finally {
            setLoadingModels(false);
        }
    });
    const handleProvisionInstance = () => __awaiter(void 0, void 0, void 0, function* () {
        console.log("[Bedrock] Provisioning instance...");
        if (!selectedModelId) {
            toast({
                title: "Error",
                description: "Please select a model first",
                variant: "destructive"
            });
            return;
        }
        try {
            setSubmitting(true);
            const instanceName = customInstanceName || `akii-${selectedModelId.split('/').pop()}-${new Date().toISOString().split('T')[0]}`;
            const result = yield BedrockClient.createInstance({
                modelId: selectedModelId,
                commitmentDuration: "ONE_MONTH",
                modelUnits: 1,
                provisionedModelName: instanceName
            });
            console.log("[Bedrock] Instance provisioned:", result);
            toast({
                title: "Success",
                description: "Instance provisioned successfully"
            });
            // Refresh instances list
            yield refreshInstances();
        }
        catch (err) {
            console.error("[Bedrock] Error provisioning instance:", err);
            toast({
                title: "Error",
                description: `Could not provision instance: ${err.message}`,
                variant: "destructive"
            });
        }
        finally {
            setSubmitting(false);
        }
    });
    const handleDeleteInstance = (instanceId) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("[Bedrock] Deleting instance:", instanceId);
        if (!instanceId)
            return;
        try {
            setRefreshing(true);
            yield BedrockClient.deleteInstance(instanceId);
            toast({
                title: "Success",
                description: "Instance deleted successfully"
            });
            // Refresh instances list
            yield refreshInstances();
        }
        catch (err) {
            console.error("[Bedrock] Error deleting instance:", err);
            toast({
                title: "Error",
                description: `Could not delete instance: ${err.message}`,
                variant: "destructive"
            });
        }
        finally {
            setRefreshing(false);
        }
    });
    const testConnection = () => __awaiter(void 0, void 0, void 0, function* () {
        console.log("[Bedrock] Testing connection...");
        try {
            setTestingConnection(true);
            const result = yield BedrockClient.testEnvironment();
            setTestData(result);
            return result;
        }
        catch (err) {
            console.error("[Bedrock] Connection test error:", err);
            toast({
                title: "Error",
                description: `Connection test failed: ${err.message}`,
                variant: "destructive"
            });
            return null;
        }
        finally {
            setTestingConnection(false);
        }
    });
    const openTestModal = () => {
        testConnection().then(() => {
            setTestModalOpen(true);
        });
    };
    const fetchEnvironmentDiagnostics = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield BedrockClient.testEnvironment();
            setEnvDiagnostics(result || {});
            return result;
        }
        catch (err) {
            console.error("[Bedrock] Error fetching diagnostics:", err);
            return {};
        }
    });
    const fetchDetailedTestData = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield BedrockClient.testEnvironment();
            setTestData(result);
            return result;
        }
        catch (err) {
            console.error("[Bedrock] Error fetching test data:", err);
            return null;
        }
    });
    // Initialize the component
    useEffect(() => {
        console.log("[Bedrock] Initializing component with user:", user === null || user === void 0 ? void 0 : user.id);
        const initialize = () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                setLoading(true);
                // Check auth status first
                const authResult = yield checkAuthStatus();
                console.log("[Bedrock] Auth result:", authResult);
                if (authResult && authResult.connected) {
                    // Fetch instances and models in parallel
                    yield Promise.all([
                        refreshInstances(),
                        fetchAvailableModels()
                    ]);
                    // Fetch environment diagnostics
                    yield fetchEnvironmentDiagnostics();
                }
            }
            catch (err) {
                console.error("[Bedrock] Initialization error:", err);
                setError(err.message || "Initialization failed");
            }
            finally {
                setLoading(false);
            }
        });
        if (user && isAdmin) {
            console.log("[Bedrock] User is authenticated and admin, initializing...");
            initialize();
        }
        else {
            console.log("[Bedrock] User is not authenticated or not admin, skipping initialization");
            setLoading(false);
        }
    }, [user, isAdmin]);
    return (_jsx(BedrockDashboardContent, { loading: loading, refreshing: refreshing, authStatus: authStatus, error: error, connectionStatus: connectionStatus, instances: instances, testModalOpen: testModalOpen, oldTestModalOpen: testModalOpen, testData: testData, setTestModalOpen: setTestModalOpen, awsTestModalOpen: awsTestModalOpen, setAwsTestModalOpen: setAwsTestModalOpen, showDiagnostics: showDiagnostics, envDiagnostics: envDiagnostics, testingConnection: testingConnection, submitting: submitting, selectedPlan: selectedPlan, selectedModelId: selectedModelId, availableModels: availableModels, loadingModels: loadingModels, showFilters: showFilters, activeFilters: activeFilters, planConfig: planConfig, client: BedrockClient, 
        // User data for auth debugging
        user: user, directUser: directUser, isAdmin: isAdmin, 
        // Functions
        checkAuthStatus: checkAuthStatus, handleLogin: handleLogin, refreshInstances: refreshInstances, fetchEnvironmentDiagnostics: fetchEnvironmentDiagnostics, fetchDetailedTestData: fetchDetailedTestData, fetchAvailableModels: fetchAvailableModels, handleProvisionInstance: handleProvisionInstance, handleDeleteInstance: handleDeleteInstance, setShowFilters: setShowFilters, setActiveFilters: setActiveFilters, setAvailableModels: setAvailableModels, setSelectedModelId: setSelectedModelId, setSelectedPlan: setSelectedPlan, testConnection: testConnection, openTestModal: openTestModal, 
        // Form state
        customInstanceName: customInstanceName, setCustomInstanceName: setCustomInstanceName, 
        // Toast
        toast: toast }));
};
// Export the wrapper component
export default SupabaseBedrock;
