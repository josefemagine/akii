// Simple test script for the Bedrock API endpoints
import fetch from 'node-fetch';

async function testApi() {
  console.log('Testing API endpoints...');
  const BASE_URL = 'http://localhost:3000';
  
  let passCount = 0;
  let failCount = 0;
  
  // Test base endpoint
  try {
    console.log('\n1. Testing GET /api/bedrock...');
    const response = await fetch(`${BASE_URL}/api/bedrock`);
    const data = await response.json();
    
    console.log('✅ Base endpoint working:', data);
    passCount++;
  } catch (error) {
    console.error('❌ Base endpoint error:', error.message);
    failCount++;
  }

  // Test instances endpoint
  try {
    console.log('\n2. Testing GET /api/bedrock/instances...');
    const response = await fetch(`${BASE_URL}/api/bedrock/instances`);
    const data = await response.json();
    
    console.log('✅ Instances endpoint working:', data);
    passCount++;
  } catch (error) {
    console.error('❌ Instances endpoint error:', error.message);
    failCount++;
  }

  // Test provision instance endpoint
  try {
    console.log('\n3. Testing POST /api/bedrock/provision-instance...');
    const response = await fetch(`${BASE_URL}/api/bedrock/provision-instance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test Instance',
        modelId: 'amazon.titan-text-express-v1',
        throughputName: 'pro-throughput'
      })
    });
    const data = await response.json();
    
    console.log('✅ Provision instance endpoint working:', data);
    passCount++;
  } catch (error) {
    console.error('❌ Provision instance endpoint error:', error.message);
    failCount++;
  }

  // Test delete instance endpoint
  try {
    console.log('\n4. Testing POST /api/bedrock/delete-instance...');
    const response = await fetch(`${BASE_URL}/api/bedrock/delete-instance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        instanceId: 'instance-001',
        throughputName: 'pro-throughput'
      })
    });
    const data = await response.json();
    
    console.log('✅ Delete instance endpoint working:', data);
    passCount++;
  } catch (error) {
    console.error('❌ Delete instance endpoint error:', error.message);
    failCount++;
  }
  
  console.log('\n--- Test Summary ---');
  console.log(`Tests passed: ${passCount}`);
  console.log(`Tests failed: ${failCount}`);
}

// Run the tests
testApi().catch(error => {
  console.error('Test script error:', error);
}); 