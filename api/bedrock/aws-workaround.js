/**
 * TEMPORARY WORKAROUND FOR AWS CREDENTIALS IN VERCEL
 * This file allows us to test if the issue is with environment variables
 * 
 * IMPORTANT: DO NOT PUT REAL CREDENTIALS HERE
 * Replace these with your actual credentials in your deployed environment
 * 
 * This is for TESTING ONLY
 */

// Define placeholder AWS credentials
// Replace these with real values directly in your deployed Vercel environment
export const hardcodedCredentials = {
  accessKeyId: "REPLACE_WITH_REAL_ACCESS_KEY_IN_PRODUCTION",
  secretAccessKey: "REPLACE_WITH_REAL_SECRET_KEY_IN_PRODUCTION",
  region: "us-east-1"
};

/**
 * Function to get AWS credentials, bypassing environment variables
 * In production, you would directly edit this file with real credentials
 */
export function getHardcodedCredentials() {
  return {
    region: hardcodedCredentials.region,
    credentials: {
      accessKeyId: hardcodedCredentials.accessKeyId,
      secretAccessKey: hardcodedCredentials.secretAccessKey
    }
  };
}

/**
 * Determines if we should use hardcoded credentials
 * Set this to true to use hardcoded credentials for testing
 */
export const useHardcodedCredentials = false; 