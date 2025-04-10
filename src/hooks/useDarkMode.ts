import { useState, useEffect } from "react";

export interface DarkModeContext {
  isDarkMode: boolean;
  setIsDarkMode: (isDarkMode: boolean) => void;
}

/**
 * Custom hook to manage dark mode state
 * Syncs with localStorage and system preferences
 */
export const useDarkMode = (): DarkModeContext => {
  // Get initial dark mode state from localStorage or system preference
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode !== null) {
      return savedMode === "true";
    }
    // Check system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Update the document class when dark mode changes
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    // Save preference to localStorage
    localStorage.setItem("darkMode", isDarkMode.toString());
  }, [isDarkMode]);

  return { isDarkMode, setIsDarkMode };
};

export default useDarkMode; 