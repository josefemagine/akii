import React from "react";
/**
 * API configuration
 *
 * This file defines the API endpoints for the application.
 * It determines whether to use local or production endpoints based on the environment.
 */
// Define the API base URLs
const LOCAL_API_BASE = 'http://localhost:3001/api'; // Local development server
const PROD_API_BASE = '/api'; // Production API paths
// Determine if we're in a development environment
const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';
interface LOCAL_API_BASEProps {}

// Select the appropriate base URL
export const API_BASE = isDevelopment ? LOCAL_API_BASE : PROD_API_BASE;
// API endpoints
export const API_ENDPOINTS = {
    // Bedrock API endpoints
    BEDROCK: {
        BASE: `${API_BASE}/super-action`,
        TEST: `${API_BASE}/super-action-test`,
        HEALTH: `${API_BASE}/health`,
    },
};
// Export configuration
export default {
    API_BASE,
    API_ENDPOINTS,
    isDevelopment,
};
