var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { useAuth } from '@/contexts/UnifiedAuthContext';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminCheckComponent from '@/components/dashboard/AdminCheck';
import withAdminInit from '@/components/admin/withAdminInit';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { diagnoseSuperAdminIssues, enableDevAdminMode } from '@/utils/admin-utils';
import { Button } from '@/components/ui/button';
const AdminCheck = () => {
    const { user, isAdmin } = useAuth();
    const { isSuperAdmin, checkSuperAdminStatus } = useSuperAdmin();
    const [diagnosticData, setDiagnosticData] = React.useState(null);
    const [isRunningDiagnostic, setIsRunningDiagnostic] = React.useState(false);
    const runDiagnostic = () => __awaiter(void 0, void 0, void 0, function* () {
        setIsRunningDiagnostic(true);
        try {
            const data = yield diagnoseSuperAdminIssues();
            setDiagnosticData(data);
        }
        catch (error) {
            console.error('Error running diagnostic:', error);
        }
        finally {
            setIsRunningDiagnostic(false);
        }
    });
    const toggleAdminStatus = () => {
        const currentStatus = localStorage.getItem('akii-is-admin') === 'true';
        enableDevAdminMode(!currentStatus);
        setTimeout(() => {
            checkSuperAdminStatus();
            window.location.reload();
        }, 100);
    };
    // Format JSON data for display
    const formatJson = (data) => {
        return JSON.stringify(data, null, 2);
    };
    return (_jsxs("div", { className: "container py-6", children: [_jsx("h1", { className: "text-2xl font-bold mb-4", children: "Admin Access Check" }), _jsx("p", { className: "text-gray-500 dark:text-gray-400 mb-6", children: "This page helps diagnose and fix admin access issues." }), _jsxs(Tabs, { defaultValue: "status", children: [_jsxs(TabsList, { className: "mb-4", children: [_jsx(TabsTrigger, { value: "status", children: "Current Status" }), _jsx(TabsTrigger, { value: "super-admin", children: "Super Admin" })] }), _jsx(TabsContent, { value: "status", children: _jsx(AdminCheckComponent, {}) }), _jsx(TabsContent, { value: "super-admin", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Super Admin Status" }), _jsx(CardDescription, { children: "View and manage super admin privileges" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium mb-1", children: "User ID:" }), _jsx("p", { className: "text-sm font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded", children: (user === null || user === void 0 ? void 0 : user.id) || 'Not logged in' })] }), _jsxs("div", { children: [_jsx("p", { className: "font-medium mb-1", children: "Super Admin Status:" }), _jsx("p", { className: `text-sm font-semibold ${isSuperAdmin ? 'text-green-600' : 'text-red-600'}`, children: isSuperAdmin ? 'Enabled' : 'Disabled' })] })] }), _jsxs("div", { className: "flex space-x-4 mt-4", children: [_jsx(Button, { onClick: toggleAdminStatus, variant: localStorage.getItem('akii-is-admin') === 'true' ? 'destructive' : 'default', children: localStorage.getItem('akii-is-admin') === 'true' ? 'Disable Admin Mode' : 'Enable Admin Mode' }), _jsx(Button, { onClick: runDiagnostic, variant: "outline", disabled: isRunningDiagnostic, children: isRunningDiagnostic ? 'Running...' : 'Run Diagnostic' })] }), diagnosticData && (_jsxs("div", { className: "mt-6", children: [_jsx("h3", { className: "text-lg font-medium mb-2", children: "Diagnostic Results" }), _jsx("div", { className: "bg-gray-100 dark:bg-gray-800 p-4 rounded-md", children: _jsx("pre", { className: "text-xs overflow-auto max-h-96", children: formatJson(diagnosticData) }) })] }))] })] }) })] })] }));
};
// Use the admin init HOC to handle loading and access control
export default withAdminInit(AdminCheck);
