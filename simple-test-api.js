// Simplified test script for the API endpoints
import fetch from 'node-fetch';

console.log('Testing API endpoints...');

const BASE_URL = 'http://localhost:3000';

async function testEndpoints() {
  // Test base endpoint
  try {
    console.log('Testing GET /api/bedrock...');
    const response = await fetch(`${BASE_URL}/api/bedrock`);
    const data = await response.json();
    
    console.log('✅ Base endpoint working:', data);
  } catch (error) {
    console.error('❌ Base endpoint error:', error.message);
  }

  // Test instances endpoint
  try {
    console.log('Testing GET /api/bedrock/instances...');
    const response = await fetch(`${BASE_URL}/api/bedrock/instances`);
    const data = await response.json();
    
    console.log('✅ Instances endpoint working:', data);
  } catch (error) {
    console.error('❌ Instances endpoint error:', error.message);
  }

  // Test provision instance endpoint
  try {
    console.log('Testing POST /api/bedrock/provision-instance...');
    const response = await fetch(`${BASE_URL}/api/bedrock/provision-instance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test Instance',
        modelId: 'amazon.titan-text-express-v1',
        throughputName: 'test-throughput'
      })
    });
    const data = await response.json();
    
    console.log('✅ Provision instance endpoint working:', data);
  } catch (error) {
    console.error('❌ Provision instance endpoint error:', error.message);
  }

  // Test delete instance endpoint
  try {
    console.log('Testing POST /api/bedrock/delete-instance...');
    const response = await fetch(`${BASE_URL}/api/bedrock/delete-instance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        instanceId: 'test-instance-id',
        throughputName: 'test-throughput'
      })
    });
    const data = await response.json();
    
    console.log('✅ Delete instance endpoint working:', data);
  } catch (error) {
    console.error('❌ Delete instance endpoint error:', error.message);
  }
}

testEndpoints().catch(error => {
  console.error('Test script error:', error);
}); 