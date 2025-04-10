import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import { DashboardPageContainer } from "@/components/layout/DashboardPageContainer";
import useDashboardLayoutAuth from "@/hooks/useDashboardLayoutAuth";
import { useDarkMode } from "@/hooks/useDarkMode";
import DashboardHeader from "./DashboardHeader";
import DashboardErrorHandler from "./DashboardErrorHandler";
import SimpleSidebar from "./Sidebar";
import "@/styles/dashboard.css";

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  // Authentication and user data
  const {
    user,
    profile,
    loading,
    hasStorageAuth,
    connectionError,
    isAdmin,
    isSuperAdmin,
    isTeamOwner,
    handleSignOut,
    getData,
    loadUserData,
    tryToRecoverAuth
  } = useDashboardLayoutAuth();

  // Dark mode state
  const { isDarkMode, setIsDarkMode } = useDarkMode();

  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Rendering state
  const [isRendering, setIsRendering] = useState(true);

  // Helper to toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Helper to toggle sidebar
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Show content once we've confirmed rendering is working
  useEffect(() => {
    // Set a timer to indicate rendering is complete
    const timer = setTimeout(() => {
      console.log("DashboardLayout: Initial render complete");
      setIsRendering(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // More robust loading state detection
  const isLoadingOrHasAuth = loading || hasStorageAuth || !!user || !!profile;
  
  // Get user data before rendering
  const userDisplayData = getData();

  // Show loading indicator while initial loading
  if (loading && !isRendering) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <DashboardErrorHandler 
      connectionError={connectionError} 
      onRetry={loadUserData}
    >
      <div className={cn(
        "flex min-h-screen flex-col bg-background",
        isRendering ? "opacity-0" : "opacity-100 transition-opacity duration-300"
      )}>
        <DashboardHeader
          userData={userDisplayData}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          toggleSidebar={toggleSidebar}
          handleSignOut={handleSignOut}
          isAdmin={isAdmin}
          isSuperAdmin={isSuperAdmin}
          loading={loading}
        />
        
        <div className="flex flex-1">
          <SimpleSidebar 
            collapsed={sidebarCollapsed} 
            onToggle={toggleSidebar} 
          />
          
          <main className={cn(
            "flex-1 transition-all duration-200",
            sidebarCollapsed ? "md:ml-[80px]" : "md:ml-[240px]"
          )}>
            <DashboardPageContainer>
              {children || <Outlet />}
            </DashboardPageContainer>
          </main>
        </div>
      </div>
    </DashboardErrorHandler>
  );
};

export default DashboardLayout;
