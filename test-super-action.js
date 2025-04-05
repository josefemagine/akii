/**
 * This script tests the /api/super-action endpoint
 * to verify it's working correctly with various HTTP methods.
 * 
 * Run with: node test-super-action.js
 */

async function testSuperAction() {
  console.log('========== Testing /api/super-action endpoint ==========');
  
  // Determine base URL
  const isLocalhost = process.env.NODE_ENV === 'development';
  const baseUrl = isLocalhost ? 'http://localhost:3000' : 'https://www.akii.com';
  const endpoint = `${baseUrl}/api/super-action`;
  
  console.log(`Testing endpoint: ${endpoint}`);
  
  // Test OPTIONS request (CORS preflight)
  try {
    console.log('\n1. Testing OPTIONS request (CORS preflight)');
    const optionsResponse = await fetch(endpoint, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://www.akii.com',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    
    console.log(`Status: ${optionsResponse.status}`);
    console.log('Headers:');
    for (const [key, value] of optionsResponse.headers.entries()) {
      if (key.toLowerCase().startsWith('access-control')) {
        console.log(`  ${key}: ${value}`);
      }
    }
  } catch (error) {
    console.error('OPTIONS request failed:', error);
  }
  
  // Test POST request with listInstances action
  try {
    console.log('\n2. Testing POST request with listInstances action');
    const postResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer dummy-token'
      },
      body: JSON.stringify({
        action: 'listInstances',
        data: {}
      })
    });
    
    console.log(`Status: ${postResponse.status}`);
    
    if (postResponse.ok) {
      const data = await postResponse.json();
      console.log('Response data:', JSON.stringify(data, null, 2));
    } else {
      console.log('Response text:', await postResponse.text());
    }
  } catch (error) {
    console.error('POST request failed:', error);
  }
  
  // Test GET request with listInstances action in query parameters
  try {
    console.log('\n3. Testing GET request with action in query parameters');
    const getResponse = await fetch(`${endpoint}?action=listInstances`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer dummy-token'
      }
    });
    
    console.log(`Status: ${getResponse.status}`);
    
    if (getResponse.ok) {
      const data = await getResponse.json();
      console.log('Response data:', JSON.stringify(data, null, 2));
    } else {
      console.log('Response text:', await getResponse.text());
    }
  } catch (error) {
    console.error('GET request failed:', error);
  }
  
  // Test POST with no action parameter
  try {
    console.log('\n4. Testing POST request with missing action parameter');
    const badPostResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer dummy-token'
      },
      body: JSON.stringify({
        data: {}
      })
    });
    
    console.log(`Status: ${badPostResponse.status}`);
    console.log('Response text:', await badPostResponse.text());
  } catch (error) {
    console.error('Bad POST request failed:', error);
  }
  
  console.log('\n========== Test completed ==========');
}

// Run the test
testSuperAction(); 