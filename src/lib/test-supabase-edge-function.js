// Test script for Supabase Edge Function
async function testSupabaseEdgeFunction() {
  const apiKey = localStorage.getItem('bedrock-api-key');
  
  if (!apiKey) {
    console.error('No API key found in localStorage');
    return {
      success: false,
      error: 'No API key found'
    };
  }
  
  try {
    // First attempt with x-api-key header
    console.log('Testing with x-api-key header...');
    const response1 = await fetch('https://hndbdiquvotjxcmjzlgu.supabase.co/functions/v1/bedrock/test-env', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-api-key': apiKey
      }
    });
    
    // Check first response
    if (response1.ok) {
      const data1 = await response1.json();
      console.log('Edge Function environment (x-api-key):', data1);
      return {
        success: true,
        method: 'x-api-key',
        data: data1
      };
    } else {
      console.log(`x-api-key attempt failed with status: ${response1.status}`);
      
      // Second attempt with Authorization header
      console.log('Testing with Authorization header...');
      const response2 = await fetch('https://hndbdiquvotjxcmjzlgu.supabase.co/functions/v1/bedrock/test-env', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      });
      
      if (!response2.ok) {
        const errorText = await response2.text();
        console.error(`Both header approaches failed. Last error: ${response2.status} ${errorText}`);
        return {
          success: false,
          status: response2.status,
          error: errorText
        };
      }
      
      const data2 = await response2.json();
      console.log('Edge Function environment (Authorization):', data2);
      return {
        success: true,
        method: 'Authorization',
        data: data2
      };
    }
  } catch (error) {
    console.error('Error testing edge function:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Export function for console testing
window.testSupabaseEdgeFunction = testSupabaseEdgeFunction;

export default testSupabaseEdgeFunction; 