import fetch from 'node-fetch';

// Function to test if the response is valid JSON
async function testJsonValidity() {
  console.log('Testing JSON validity from API server...');
  const BASE_URL = 'http://localhost:3000';
  
  try {
    console.log('\nTesting GET /api/bedrock/instances...');
    const response = await fetch(`${BASE_URL}/api/bedrock/instances`);
    
    // Get the response as text first
    const responseText = await response.text();
    console.log('Raw response text:', responseText);
    
    // Try to parse it as JSON
    try {
      const data = JSON.parse(responseText);
      console.log('Successfully parsed as JSON:', data);
      console.log('✅ API is returning valid JSON!');
    } catch (parseError) {
      console.error('❌ Failed to parse response as JSON:', parseError.message);
      console.error('First 100 characters of response:', responseText.substring(0, 100));
    }
  } catch (error) {
    console.error('❌ Request error:', error.message);
  }
}

// Run the test
testJsonValidity().catch(error => {
  console.error('Test script error:', error);
}); 