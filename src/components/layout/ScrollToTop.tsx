import React from "react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
interface ScrollToTopProps {}

/**
 * ScrollToTop is a component that scrolls the window to the top
 * whenever the location (route) changes. It's meant to be used
 * near the top of your component tree, typically alongside or
 * within Router components.
 */
export default function ScrollToTop() {
    const { pathname } = useLocation();
    useEffect(() => {
        // Scroll to top with smooth behavior
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "instant" // Use "instant" instead of "smooth" to avoid visual issues during navigation
        });
        // Alternative method if the above doesn't work in some browsers
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0; // For Safari
    }, [pathname]);
    // This is a utility component that doesn't render anything
    return null;
}
