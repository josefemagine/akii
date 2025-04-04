// Test script for Supabase Edge Function
async function testEdgeFunction() {
  const apiKey = localStorage.getItem('bedrock-api-key');
  
  if (!apiKey) {
    console.error('No API key found in localStorage');
    return {
      success: false,
      error: 'No API key found'
    };
  }
  
  try {
    // Test the edge function directly
    const response = await fetch('https://api.akii.com/functions/v1/super-action/test-env', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-api-key': apiKey,
        // Also try with authorization header
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to test environment: ${response.status} ${errorText}`);
      return {
        success: false,
        status: response.status,
        error: errorText
      };
    }
    
    const data = await response.json();
    console.log('Edge Function environment:', data);
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error testing edge function:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Export function for console testing
window.testEdgeFunction = testEdgeFunction;

export default testEdgeFunction; 