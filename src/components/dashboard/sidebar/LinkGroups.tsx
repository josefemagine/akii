import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import * as Icons from "lucide-react";
import { SidebarLink, NestedLink, AdminBadge } from "./SidebarComponents";
import { navigationConfig, NavLinkConfig, NavSectionConfig } from "./navigationConfig";

interface LinkGroupsProps {
  expanded: Record<string, boolean>;
  toggleExpanded: (section: string) => void;
  isCollapsed: boolean;
  isSuper: boolean;
  isAdmin: boolean;
  subscribedProducts: string[];
}

export const LinkGroups: React.FC<LinkGroupsProps> = ({
  expanded,
  toggleExpanded,
  isCollapsed,
  isSuper,
  isAdmin,
  subscribedProducts,
}) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const isDev = process.env.NODE_ENV === "development";
  
  // Debug admin status
  useEffect(() => {
    console.log("Sidebar admin status:", { 
      isAdmin, 
      isSuper,
      isDev,
      currentPath,
    });
  }, [isAdmin, isSuper, currentPath, isDev]);

  // For debugging purposes, show admin in development mode
  const shouldShowAdmin = isAdmin || isSuper || isDev;
  
  // Helper to get icon component by name
  const getIcon = (iconName: string) => {
    const IconComponent = (Icons as Record<string, React.FC<Icons.LucideProps>>)[iconName];
    return IconComponent ? <IconComponent className="h-5 w-5" /> : null;
  };
  
  // Helper to check if link should be visible based on requirements
  const shouldShowLink = (link: NavLinkConfig) => {
    if (link.requiresSubscription && !subscribedProducts.includes(link.requiresSubscription)) {
      return false;
    }
    
    if (link.requiresAdmin && !isAdmin && !isDev) {
      return false;
    }
    
    if (link.requiresSuper && !isSuper && !isDev) {
      return false;
    }
    
    return true;
  };
  
  // Helper to check if section should be visible
  const shouldShowSection = (section: NavSectionConfig) => {
    if (section.requiresAdmin && !shouldShowAdmin) {
      return false;
    }
    
    if (section.requiresSuper && !isSuper && !isDev) {
      return false;
    }
    
    // Check if section has any visible links
    return section.links.some(link => shouldShowLink(link));
  };

  return (
    <>
      {navigationConfig.map((section, index) => {
        if (!shouldShowSection(section)) return null;
        
        const visibleLinks = section.links.filter(shouldShowLink);
        if (visibleLinks.length === 0) return null;
        
        return (
          <div key={index} className={isCollapsed ? "py-2" : "px-3 py-2"}>
            <div className="mb-2">
              {/* Show admin badge if admin section */}
              {section.requiresAdmin && section.title === "Admin" && (
                <AdminBadge isCollapsed={isCollapsed} />
              )}
              
              <h2 className={isCollapsed ? "sr-only" : "mb-2 px-4 text-lg font-semibold tracking-tight"}>
                {section.title}
              </h2>
              
              <div className="space-y-1">
                {visibleLinks.map((link) => (
                  <React.Fragment key={link.to}>
                    <SidebarLink
                      to={link.to}
                      icon={getIcon(link.iconName)}
                      label={link.label}
                      isActive={currentPath === link.to || currentPath.startsWith(link.to + "/")}
                      isCollapsed={isCollapsed}
                      isExpanded={!!expanded[link.section]}
                      hasNestedLinks={link.isExpandable && !!link.subLinks && link.subLinks.length > 0}
                      toggleExpanded={() => toggleExpanded(link.section)}
                    />
                    {link.isExpandable && expanded[link.section] && link.subLinks && (
                      <div className="pt-1 pl-6">
                        {link.subLinks.map((subLink) => (
                          <NestedLink
                            key={subLink.to}
                            to={subLink.to}
                            label={subLink.label}
                            isActive={currentPath === subLink.to}
                            isCollapsed={isCollapsed}
                          />
                        ))}
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}; 