/**
 * This file disables specific warnings that are not errors
 * but can clutter the console
 */
// Disable GoTrueClient warning by modifying console.warn
// Run this once at application startup
export function disableGoTrueClientWarning() {
    if (typeof window !== 'undefined') {
        // Save the original console.warn
        const originalWarn = console.warn;
        // Replace with filtered version
        console.warn = function (...args) {
            // Filter out the GoTrueClient warning
            if (args[0] && typeof args[0] === 'string' &&
                args[0].includes('Multiple GoTrueClient instances detected')) {
                // Ignore this specific warning
                return;
            }
            // Pass through all other warnings
            originalWarn.apply(console, args);
        };
        console.log('[Warnings] GoTrueClient instance warnings have been disabled');
    }
}
