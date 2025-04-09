/**
 * API Endpoints
 *
 * Centralized location for all API endpoints used in the application
 */
// Supabase Edge Functions
export const USER_DATA_ENDPOINT = "https://injxxchotrvgvvzelhvj.supabase.co/functions/v1/user-data";
// API Base URLs
export const API_BASE_URL = "https://injxxchotrvgvvzelhvj.supabase.co";
// Function to construct full API URLs
export const getApiUrl = (path) => {
    return `${API_BASE_URL}${path}`;
};
