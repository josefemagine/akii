# Deployment Steps to Fix CORS Error

## Summary of the Issue

The CORS issue is happening because the Edge Function's 'Access-Control-Allow-Origin' header is using a wildcard '*' when credentials mode is 'include'. When credentials are included in the request, the CORS specification requires that the 'Access-Control-Allow-Origin' header must specify the exact origin, not a wildcard.

## How to Deploy the Fix

1. Make sure you have Supabase CLI installed and authenticated:
   

2. Navigate to the project directory:
   

3. Deploy the updated Edge Function:
   

4. Verify the deployment was successful:
   

## Key Changes Made

1. Removed the wildcard '*' from CORS headers and replaced it with the specific origin
2. Created helper functions to correctly manage CORS headers for every response
3. Enhanced debugging/logging to help troubleshoot any remaining issues
4. Made sure every response includes the proper CORS headers
5. Always set 'Access-Control-Allow-Credentials' to 'true' in all responses
6. Added 'Vary: Origin' header to ensure correct browser caching behavior

## Testing

After deployment, test the API from production (https://www.akii.com) by:

1. Opening the browser console
2. Navigating to the AWS Bedrock section
3. Check for any CORS errors
4. Verify API requests are now completing successfully

If you still see CORS errors, check the Supabase Edge Function logs for details.
