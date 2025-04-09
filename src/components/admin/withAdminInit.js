import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect } from 'react';
import { initializeAdminPage } from '@/lib/admin-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/UnifiedAuthContext';
/**
 * Error boundary specifically for admin components
 */
export class AdminErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('[AdminError]', error, errorInfo);
    }
    render() {
        var _a;
        if (this.state.hasError) {
            return (_jsx("div", { className: "p-6", children: _jsxs(Card, { className: "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-red-800 dark:text-red-300", children: "Error Loading Admin Page" }) }), _jsxs(CardContent, { children: [_jsx("p", { className: "mb-4 text-red-700 dark:text-red-300", children: "Something went wrong while loading this admin page." }), _jsx("pre", { className: "max-h-40 overflow-auto rounded bg-red-100 p-2 text-xs dark:bg-red-900/30", children: ((_a = this.state.error) === null || _a === void 0 ? void 0 : _a.toString()) || "Unknown error" }), _jsx(Button, { onClick: () => window.location.reload(), className: "mt-4 bg-red-700 hover:bg-red-800", children: "Reload Page" })] })] }) }));
        }
        return this.props.children;
    }
}
/**
 * Higher Order Component that adds admin initialization and error boundary to admin pages
 */
export function withAdminInit(Component) {
    const WithAdminInit = (props) => {
        const { user, isAdmin } = useAuth();
        // Initialize admin access on component mount
        useEffect(() => {
            console.log(`[AdminInit] Initializing admin component ${Component.displayName || Component.name}`);
            initializeAdminPage();
        }, []);
        // Log authentication state for debugging
        useEffect(() => {
            console.log(`[AdminInit] Auth state for ${Component.displayName || Component.name}:`, {
                hasUser: !!user,
                userEmail: user === null || user === void 0 ? void 0 : user.email,
                isAdmin,
            });
        }, [user, isAdmin]);
        return (_jsx(AdminErrorBoundary, { children: _jsx(Component, Object.assign({}, props)) }));
    };
    // Set display name for debugging
    WithAdminInit.displayName = `withAdminInit(${Component.displayName || Component.name || 'Component'})`;
    return WithAdminInit;
}
export default withAdminInit;
