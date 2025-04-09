/**
 * TEMPO DEVTOOLS PATCH
 *
 * This module patches the TempoDevtools library to use our React singleton
 * to prevent "Invalid hook call" errors caused by multiple React instances.
 */
import { SingletonReact } from '../react-singleton';
// Attempt to patch the TempoDevtools library to use our React singleton
export function patchTempoDevtools() {
    try {
        // Find the TempoDevtools in the global scope
        const globalAny = window;
        if (globalAny.__TEMPO_DEVTOOLS__) {
            console.log('Patching TempoDevTools to use React singleton...');
            // Store the original React reference
            const originalReact = globalAny.__TEMPO_DEVTOOLS__._React;
            // Replace with our singleton
            globalAny.__TEMPO_DEVTOOLS__._React = SingletonReact;
            // If TempoDevtools has already initialized React hooks, reinitialize them
            if (globalAny.__TEMPO_DEVTOOLS__._initialized) {
                console.log('Reinitializing TempoDevTools with React singleton...');
                // Force reinitialization on next use
                globalAny.__TEMPO_DEVTOOLS__._initialized = false;
                // Trigger initialization with our React singleton
                if (typeof globalAny.__TEMPO_DEVTOOLS__.init === 'function') {
                    globalAny.__TEMPO_DEVTOOLS__.init();
                }
            }
            console.log('TempoDevTools patched successfully!');
            return true;
        }
        else {
            console.log('TempoDevTools not found in global scope, skipping patch.');
            return false;
        }
    }
    catch (error) {
        console.error('Failed to patch TempoDevTools:', error);
        return false;
    }
}
// Export a function to verify the patch was applied
export function verifyTempoPatch() {
    try {
        const globalAny = window;
        if (globalAny.__TEMPO_DEVTOOLS__) {
            const tempoReact = globalAny.__TEMPO_DEVTOOLS__._React;
            const usingSingleton = tempoReact === SingletonReact;
            console.log('TempoDevTools React patch verification:', usingSingleton ? 'SUCCESS - Using React singleton' : 'FAILED - Not using React singleton');
            return usingSingleton;
        }
        return false;
    }
    catch (error) {
        console.error('Failed to verify TempoDevTools patch:', error);
        return false;
    }
}
