/**
 * API Route: /api/super-action-test
 * 
 * Simple diagnostic endpoint to check the status of the Supabase Edge Function
 * and help diagnose boot errors.
 */

/**
 * Diagnostic endpoint for testing Supabase Edge Function connectivity
 * This helps diagnose issues with the edge function including timeouts,
 * authentication problems, and boot errors
 */
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  
  // Accept both GET and POST for easier testing
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }
  
  try {
    const startTime = Date.now();
    const supabaseUrl = process.env.SUPABASE_URL || 'https://injxxchotrvgvvzelhvj.supabase.co';
    const functionName = process.env.SUPABASE_FUNCTION_NAME || 'super-action';
    const functionUrl = `${supabaseUrl}/functions/v1/${functionName}`;
    
    console.log(`[DIAGNOSTIC] Testing connection to: ${functionUrl}`);
    
    // Extract auth header if provided
    const authHeader = req.headers.authorization;
    let formattedAuthHeader = '';
    
    if (authHeader) {
      // Format auth header properly
      if (authHeader.trim().startsWith('Bearer ')) {
        formattedAuthHeader = authHeader.trim();
      } else {
        const cleanToken = authHeader.trim().replace(/^(bearer|jwt|token)\s+/i, '');
        formattedAuthHeader = `Bearer ${cleanToken}`;
      }
    }
    
    // Prepare diagnostic request
    const headers = {
      'Content-Type': 'application/json',
      'x-client-info': 'Akii Diagnostic Tool'
    };
    
    // Only include auth header if provided
    if (formattedAuthHeader) {
      headers['Authorization'] = formattedAuthHeader;
    }
    
    // Simple diagnostic payload
    const payload = {
      action: 'diagnosticCheck',
      timestamp: new Date().toISOString(),
      requestInfo: {
        method: req.method,
        authProvided: !!authHeader,
        headers: Object.keys(req.headers)
      }
    };
    
    // Use AbortController to implement timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    // Attempt connection with timeout
    try {
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const responseTime = Date.now() - startTime;
      const contentType = response.headers.get('content-type');
      let data;
      
      try {
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }
      } catch (parseError) {
        data = { error: 'Failed to parse response', message: parseError.message };
      }
      
      // Return diagnostic information
      res.status(200).json({
        status: 'completed',
        diagnostics: {
          statusCode: response.status,
          responseTime: `${responseTime}ms`,
          headers: Object.fromEntries([...response.headers.entries()]),
          endpoint: functionUrl,
          authHeaderProvided: !!authHeader,
          authHeaderFormatted: !!formattedAuthHeader,
          response: data
        }
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      // Handle timeout/abort specifically
      if (fetchError.name === 'AbortError') {
        res.status(200).json({
          status: 'timeout',
          diagnostics: {
            error: 'Function Timeout',
            message: 'The edge function did not respond within the timeout period (8 seconds)',
            endpoint: functionUrl,
            authHeaderProvided: !!authHeader,
            authHeaderFormatted: !!formattedAuthHeader,
            elapsedTime: `${Date.now() - startTime}ms`
          }
        });
        return;
      }
      
      // Handle other fetch errors
      res.status(200).json({
        status: 'error',
        diagnostics: {
          error: 'Connection Failed',
          message: fetchError.message,
          endpoint: functionUrl,
          authHeaderProvided: !!authHeader,
          authHeaderFormatted: !!formattedAuthHeader,
          elapsedTime: `${Date.now() - startTime}ms`
        }
      });
    }
  } catch (error) {
    // Handle any other errors
    console.error('[DIAGNOSTIC] Error testing Supabase Edge Function:', error);
    res.status(200).json({
      status: 'error',
      diagnostics: {
        error: 'Internal Server Error',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    });
  }
} 