import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast.tsx";

// Simple AdminErrorBoundary component
class AdminErrorBoundary extends React.Component<{ children: React.ReactNode }> {
  state = { hasError: false, errorMessage: "" };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Admin error boundary caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 border border-red-300 rounded-md">
          <h2 className="text-red-800 text-lg font-semibold mb-2">Error Loading Admin Page</h2>
          <p className="text-red-700 mb-4">Something went wrong while loading this admin page.</p>
          <pre className="bg-red-100 p-2 rounded text-xs overflow-auto max-h-40">
            {this.state.errorMessage}
          </pre>
          <button 
            className="mt-4 px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Mock auth function to simulate authentication
function useAuth() {
  return {
    user: { id: "1", name: "Admin User", role: "admin" },
  };
}

export function withAdminInit<P extends object>(Component: React.ComponentType<P>) {
  const WithAdminInit: React.FC<P> = (props: P) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
      const checkAdminStatus = async () => {
        if (!user) {
          setIsLoading(false);
          toast({
            title: "Authentication required",
            description: "Please log in to access admin features",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }

        try {
          // Simulate checking admin status
          // In a real app, you would call an API endpoint to verify admin status
          const adminCheck = user.role === "admin";
          
          setIsAdmin(adminCheck);
          
          if (!adminCheck) {
            toast({
              title: "Access denied",
              description: "You do not have permission to access this area",
              variant: "destructive",
            });
            navigate("/dashboard");
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
          toast({
            title: "Error",
            description: "Failed to verify admin permissions",
            variant: "destructive",
          });
          navigate("/dashboard");
        } finally {
          setIsLoading(false);
        }
      };

      checkAdminStatus();
    }, [user, isAdmin, navigate, toast]);

    if (isLoading) {
      return <div className="flex items-center justify-center h-screen">Loading admin panel...</div>;
    }

    return (
      <AdminErrorBoundary>
        <Component {...props} />
      </AdminErrorBoundary>
    );
  };

  WithAdminInit.displayName = `withAdminInit(${Component.displayName || Component.name || 'Component'})`;

  return WithAdminInit;
}

// Add default export to support import statement in Dashboard.tsx
export default withAdminInit;
