import { useState, useEffect } from "react";
import { safeLocalStorage } from "@/lib/browser-check";

export interface SidebarState {
  collapsed: boolean;
  mobileMenuOpen: boolean;
  toggleCollapsed: () => void;
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (isOpen: boolean) => void;
}

/**
 * Custom hook to manage sidebar state
 * Handles collapsed state and mobile menu state
 * Syncs with localStorage for persistence
 */
export const useSidebarState = (): SidebarState => {
  // Initialize sidebar collapsed state from localStorage
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const savedState = safeLocalStorage.getItem("sidebar-collapsed");
      return savedState === "true";
    } catch (e) {
      console.error("Error reading sidebar state from localStorage:", e);
      return false;
    }
  });
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Save sidebar state to localStorage when it changes
  useEffect(() => {
    try {
      safeLocalStorage.setItem("sidebar-collapsed", String(collapsed));
    } catch (e) {
      console.error("Error saving sidebar state to localStorage:", e);
    }
  }, [collapsed]);
  
  // Toggle sidebar collapsed state
  const toggleCollapsed = () => {
    setCollapsed(prev => !prev);
  };
  
  // Toggle mobile menu state
  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };
  
  return {
    collapsed,
    mobileMenuOpen,
    toggleCollapsed,
    toggleMobileMenu,
    setMobileMenuOpen
  };
};

export default useSidebarState; 