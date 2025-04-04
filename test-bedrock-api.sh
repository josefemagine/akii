#!/bin/bash

# Script to build and test the Bedrock API implementation

echo "=== Bedrock API Test ==="
echo "This script builds and tests just the Bedrock API functionality"
echo "=================================================="

# Export required environment variables
echo "Setting up environment..."

# Use mock API URL for testing
export VITE_BEDROCK_API_URL="https://www.akii.com/api/bedrock"
# Export a placeholder API key for testing
export VITE_BEDROCK_AWS_KEY="test_api_key_for_build_validation"
# Set the focused build flag
export FOCUS_BEDROCK=true

# Build the library
echo "Building Bedrock API library..."
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
  echo "Build failed!"
  exit 1
fi

echo "Build successful!"
echo "=================================================="
echo "Testing Bedrock API library..."

# Print the output directory contents
echo "Generated files:"
ls -la dist-bedrock

# Create a simple HTML test file
cat > bedrock-test.html << EOF
<!DOCTYPE html>
<html>
<head>
  <title>Bedrock API Test</title>
  <script type="module">
    import { testBedrockApi, BedrockConfig } from './dist-bedrock/bedrock.es.js';
    
    window.onload = function() {
      // Test the Bedrock API
      const result = testBedrockApi();
      
      // Display the results
      document.getElementById('results').innerHTML = JSON.stringify(result, null, 2);
      
      // Log configuration
      console.log('Bedrock Config:', BedrockConfig);
      console.log('Test Result:', result);
    };
  </script>
</head>
<body>
  <h1>Bedrock API Test</h1>
  <p>This page tests the Bedrock API implementation.</p>
  <h2>Results:</h2>
  <pre id="results" style="background-color: #f5f5f5; padding: 10px; border-radius: 5px;"></pre>
</body>
</html>
EOF

echo "Created test file: bedrock-test.html"
echo "=================================================="
echo "To view the test results, open bedrock-test.html in a browser"
echo "To test with real API keys, set the VITE_BEDROCK_AWS_KEY environment variable"
echo "==================================================" 