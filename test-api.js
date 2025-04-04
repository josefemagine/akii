// Simple test script for the Bedrock API endpoints
const fetch = require('node-fetch');

// Configuration
const BASE_URL = 'http://localhost:3000/api/bedrock'; // Replace with your Vercel dev URL if needed
const API_KEY = 'test-key-1234'; // Use the test key from config.js

// Test functions
async function testGetEndpoint() {
  console.log('\nTesting GET /api/bedrock');
  try {
    const response = await fetch(BASE_URL);
    const data = await response.json();
    console.log('  Status:', response.status);
    console.log('  API version:', data.version);
    console.log('  Status:', data.status);
    console.log('  Test key:', data.testing.apiKey);
    return true;
  } catch (error) {
    console.error('  Error:', error.message);
    return false;
  }
}

async function testGetInstances() {
  console.log('\nTesting GET /api/bedrock/instances');
  try {
    const response = await fetch(`${BASE_URL}/instances`, {
      headers: {
        'x-api-key': API_KEY
      }
    });
    const data = await response.json();
    console.log('  Status:', response.status);
    if (response.ok) {
      console.log('  Instances count:', data.instances.length);
      data.instances.forEach((instance, index) => {
        console.log(`  Instance ${index + 1}:`, instance.name, `(${instance.status})`);
      });
    } else {
      console.log('  Error:', data.error);
    }
    return response.ok;
  } catch (error) {
    console.error('  Error:', error.message);
    return false;
  }
}

async function testProvisionInstance() {
  console.log('\nTesting POST /api/bedrock/provision-instance');
  try {
    const response = await fetch(`${BASE_URL}/provision-instance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify({
        name: 'Test Instance',
        modelId: 'amazon.titan-text-express-v1',
        throughputName: 'pro-throughput'
      })
    });
    const data = await response.json();
    console.log('  Status:', response.status);
    if (response.ok) {
      console.log('  Success:', data.success);
      console.log('  Message:', data.message);
      console.log('  Instance ID:', data.instance.id);
    } else {
      console.log('  Error:', data.error);
    }
    return response.ok;
  } catch (error) {
    console.error('  Error:', error.message);
    return false;
  }
}

async function testDeleteInstance() {
  console.log('\nTesting POST /api/bedrock/delete-instance');
  try {
    const response = await fetch(`${BASE_URL}/delete-instance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify({
        instanceId: 'instance-123456',
        throughputName: 'pro-throughput'
      })
    });
    const data = await response.json();
    console.log('  Status:', response.status);
    if (response.ok) {
      console.log('  Success:', data.success);
      console.log('  Message:', data.message);
    } else {
      console.log('  Error:', data.error);
    }
    return response.ok;
  } catch (error) {
    console.error('  Error:', error.message);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('=== Testing Bedrock API Endpoints ===');
  console.log('Base URL:', BASE_URL);
  console.log('API Key:', API_KEY);
  
  let results = {};
  
  results.baseEndpoint = await testGetEndpoint();
  results.getInstances = await testGetInstances();
  results.provisionInstance = await testProvisionInstance();
  results.deleteInstance = await testDeleteInstance();
  
  console.log('\n=== Test Results Summary ===');
  Object.entries(results).forEach(([test, success]) => {
    console.log(`${test}: ${success ? '✅ Passed' : '❌ Failed'}`);
  });
  
  const allPassed = Object.values(results).every(result => result === true);
  console.log('\nAll tests passed:', allPassed ? '✅ Yes' : '❌ No');
}

// Run the tests
runTests().catch(error => {
  console.error('Error running tests:', error);
  process.exit(1);
}); 