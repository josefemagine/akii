/**
 * Simple test script for the /api/super-action API endpoint
 * Run with Node.js: node test-super-action.js
 */

const BASE_URL = "https://www.akii.com"; // Replace with your actual base URL in production

// Test function to make authenticated requests to the API
async function testSuperAction() {
  try {
    console.log("Testing POST to /api/super-action...");
    
    // You need a valid JWT token to test this endpoint
    // This is just an example - you'll need to replace with a real token
    const JWT_TOKEN = "your_jwt_token_here";
    
    const response = await fetch(`${BASE_URL}/api/super-action`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${JWT_TOKEN}`
      },
      body: JSON.stringify({
        action: "testEnvironment",
        data: {}
      })
    });
    
    console.log(`Response status: ${response.status}`);
    
    // Handle different response types
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      console.log("Response data:", JSON.stringify(data, null, 2));
    } else {
      const text = await response.text();
      console.log("Response text:", text);
    }
  } catch (error) {
    console.error("Error testing API:", error);
  }
}

// Run the test
testSuperAction(); 