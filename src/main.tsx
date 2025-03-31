import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { SearchProvider } from "@/contexts/SearchContext";
import { AuthProvider } from "@/contexts/AuthContext";

// Add error boundary to catch and report React rendering errors
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("React error boundary caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          backgroundColor: '#0f172a',
          color: '#fff',
          minHeight: '100vh',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <h1 style={{ marginBottom: '20px' }}>Something went wrong</h1>
          <p style={{ marginBottom: '10px' }}>The application failed to render properly. Here's the error:</p>
          <pre style={{
            padding: '15px',
            backgroundColor: '#1e293b',
            borderRadius: '4px',
            overflow: 'auto',
            marginBottom: '20px'
          }}>
            {this.state.error?.message || 'Unknown error'}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#059669',
              color: 'white',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Emergency Admin Access Handler
if (window.location.pathname === '/emergency-admin') {
  const root = document.getElementById("root");
  if (root) {
    console.log('Emergency admin access activated');
    
    // Create emergency admin UI
    root.innerHTML = `
      <div style="min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1rem; background-color: #111827; color: white;">
        <div style="max-width: 500px; width: 100%; background-color: #1f2937; border-radius: 0.5rem; padding: 2rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
          <h1 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">Emergency Admin Access</h1>
          <p style="margin-bottom: 1.5rem;">This page bypasses normal authentication to grant admin access to josef@holm.com.</p>
          
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <button id="forceAdmin" style="background-color: #10b981; color: white; padding: 0.5rem 1rem; border-radius: 0.25rem; font-weight: 500; cursor: pointer; border: none;">
              Force Josef as Admin
            </button>
            
            <button id="clearSession" style="background-color: #6b7280; color: white; padding: 0.5rem 1rem; border-radius: 0.25rem; font-weight: 500; cursor: pointer; border: none;">
              Clear Session Data
            </button>
          </div>
          
          <div id="message" style="margin-top: 1.5rem; padding: 1rem; border-radius: 0.25rem;"></div>
        </div>
      </div>
    `;
    
    // Add event listeners
    document.getElementById('forceAdmin')?.addEventListener('click', () => {
      try {
        // Set admin override in multiple storage locations for redundancy
        localStorage.setItem('akii_admin_override', 'true');
        localStorage.setItem('akii_admin_override_email', 'josef@holm.com');
        localStorage.setItem('akii_admin_override_expiry', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());
        
        sessionStorage.setItem('admin_override', 'true');
        sessionStorage.setItem('admin_override_email', 'josef@holm.com');
        
        // Legacy formats for compatibility
        localStorage.setItem('admin_override', 'true');
        localStorage.setItem('admin_override_email', 'josef@holm.com');
        
        // Update role in sessionStorage
        const userString = sessionStorage.getItem('supabase.auth.token');
        if (userString) {
          try {
            const userData = JSON.parse(userString);
            if (userData?.currentSession?.user) {
              userData.currentSession.user.role = 'admin';
              sessionStorage.setItem('supabase.auth.token', JSON.stringify(userData));
            }
          } catch (e) {
            console.error('Failed to update session data:', e);
          }
        }
        
        const messageEl = document.getElementById('message');
        if (messageEl) {
          messageEl.style.backgroundColor = '#059669';
          messageEl.textContent = 'Admin access granted! Redirecting to admin page in 3 seconds...';
        }
        
        // Redirect to admin page
        setTimeout(() => {
          window.location.href = '/admin';
        }, 3000);
      } catch (error) {
        const messageEl = document.getElementById('message');
        if (messageEl) {
          messageEl.style.backgroundColor = '#dc2626';
          messageEl.textContent = `Error: ${error instanceof Error ? error.message : String(error)}`;
        }
      }
    });
    
    document.getElementById('clearSession')?.addEventListener('click', () => {
      try {
        localStorage.clear();
        sessionStorage.clear();
        
        const messageEl = document.getElementById('message');
        if (messageEl) {
          messageEl.style.backgroundColor = '#059669';
          messageEl.textContent = 'Session data cleared! Refresh the page to see changes.';
        }
      } catch (error) {
        const messageEl = document.getElementById('message');
        if (messageEl) {
          messageEl.style.backgroundColor = '#dc2626';
          messageEl.textContent = `Error: ${error instanceof Error ? error.message : String(error)}`;
        }
      }
    });
    
    // Prevent normal app initialization
    throw new Error('Emergency admin mode active');
  }
}

// Add basic diagnostic for failed renderings
const diagnosticScript = document.createElement('script');
diagnosticScript.textContent = `
  console.log("Setting up diagnostic monitoring...");
  
  // Check if React renders anything
  setTimeout(() => {
    const rootElement = document.getElementById('root');
    
    if (rootElement && (!rootElement.children || rootElement.children.length === 0)) {
      console.error("React failed to render anything within 2 seconds");
      
      // Add fallback content when React fails to render
      rootElement.innerHTML = \`
        <div style="padding: 20px; color: white; background: #0f172a; min-height: 100vh; font-family: system-ui;">
          <h1 style="margin-bottom: 20px;">React App Failed to Render</h1>
          <p style="margin-bottom: 15px;">Please check the console for errors. You can try the emergency admin access at <a href="/emergency-admin" style="color: #10b981; text-decoration: underline;">/emergency-admin</a></p>
          <div style="margin: 30px 0;">
            <button id="reactRetryBtn" style="background-color: #10b981; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">Retry Loading App</button>
            <button id="reactClearBtn" style="background-color: #6b7280; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;">Clear Data & Retry</button>
          </div>
        </div>
      \`;
      
      // Add event listeners to the fallback buttons
      document.getElementById('reactRetryBtn')?.addEventListener('click', () => {
        window.location.reload();
      });
      
      document.getElementById('reactClearBtn')?.addEventListener('click', () => {
        localStorage.clear();
        sessionStorage.clear();
        window.location.reload();
      });
    }
  }, 2000);
`;
document.head.appendChild(diagnosticScript);

// Force dark mode for consistency
document.documentElement.classList.add('dark');

// Initialize React with robust error handling
try {
  console.log("Initializing React application...");
  
  // Set up global error handlers before initialization
  window.addEventListener('error', (event) => {
    console.error('Global error caught:', event.error || event.message);
    // Let the diagnostic script handle fallback UI
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    // Let the diagnostic script handle fallback UI
  });
  
  // Create and render React root with error boundaries
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  const root = ReactDOM.createRoot(rootElement);
  
  // Render with minimal dependencies first to avoid complex initialization issues
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <SearchProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </SearchProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
  
  console.log("React application initialized successfully");
} catch (error) {
  console.error("Critical error during React initialization:", error);
  
  // Manual fallback if initialization completely fails
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; color: white; background: #0f172a; min-height: 100vh; font-family: system-ui;">
        <h1 style="margin-bottom: 20px;">Critical Initialization Error</h1>
        <p style="margin-bottom: 15px;">React failed to initialize properly. Please check the console for errors.</p>
        <pre style="background: #1e293b; padding: 15px; border-radius: 4px; overflow: auto; margin-bottom: 20px; white-space: pre-wrap;">${error instanceof Error ? error.message : String(error)}</pre>
        <p style="margin-bottom: 15px;">Try the emergency admin access at <a href="/emergency-admin" style="color: #10b981; text-decoration: underline;">/emergency-admin</a></p>
        <button onclick="window.location.reload()" style="background-color: #10b981; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;">Retry</button>
      </div>
    `;
  }
}
