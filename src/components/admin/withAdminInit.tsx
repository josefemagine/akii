import React, { useEffect, ComponentType } from 'react';
import { initializeAdminPage } from '@/lib/admin-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/UnifiedAuthContext';

/**
 * Error boundary specifically for admin components
 */
export class AdminErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[AdminError]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6">
          <Card className="border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <CardHeader>
              <CardTitle className="text-red-800 dark:text-red-300">
                Error Loading Admin Page
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-red-700 dark:text-red-300">
                Something went wrong while loading this admin page.
              </p>
              <pre className="max-h-40 overflow-auto rounded bg-red-100 p-2 text-xs dark:bg-red-900/30">
                {this.state.error?.toString() || "Unknown error"}
              </pre>
              <Button
                onClick={() => window.location.reload()}
                className="mt-4 bg-red-700 hover:bg-red-800"
              >
                Reload Page
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher Order Component that adds admin initialization and error boundary to admin pages
 */
export function withAdminInit<P extends object>(
  Component: ComponentType<P>
): React.FC<P> {
  const WithAdminInit: React.FC<P> = (props) => {
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
        userEmail: user?.email,
        isAdmin,
      });
    }, [user, isAdmin]);

    return (
      <AdminErrorBoundary>
        <Component {...props} />
      </AdminErrorBoundary>
    );
  };

  // Set display name for debugging
  WithAdminInit.displayName = `withAdminInit(${Component.displayName || Component.name || 'Component'})`;

  return WithAdminInit;
}

export default withAdminInit; 