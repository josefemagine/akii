# Bedrock Frontend Client

**NEVER USE MOCK DATA, NOT EVEN FOR TESTING. THIS IS A LIVE APP.**

This document describes the frontend client implementation for integrating with AWS Bedrock through Supabase Edge Functions.

## CRITICAL: Always Use Real AWS Services

The Bedrock client **MUST ALWAYS** connect to real AWS Bedrock services. Mock data is strictly prohibited in all environments including:
- Production environments
- Testing environments
- Development environments
- UI development
- QA environments

This is a live application with real users and financial implications. Any use of mock data can lead to:
- Incorrect billing information
- Misleading user experiences
- Security vulnerabilities
- Service expectation mismatches
- Potential breach of service contracts

## Overview

The `supabase-bedrock-client.js` provides a secure way for the frontend application to interact with AWS Bedrock services without directly exposing AWS credentials or endpoints. All operations are authenticated and routed through Supabase Edge Functions using JWT tokens from Supabase Auth. This approach eliminates the need for custom API keys, ensuring a more secure and standardized authentication flow.

## Client Architecture

```
┌────────────────────┐     ┌───────────────────┐     ┌─────────────────┐
│                    │     │                   │     │                 │
│  BedrockClient    │────▶│  Supabase Client  │────▶│  Edge Function  │
│                    │     │                   │     │                 │
└────────────────────┘     └───────────────────┘     └─────────────────┘
         │                         │                         │
         ▼                         ▼                         ▼
┌────────────────────┐     ┌───────────────────┐     ┌─────────────────┐
│                    │     │                   │     │                 │
│  UI Components     │◀────│   Auth Context    │     │  AWS Bedrock    │
│                    │     │                   │     │                 │
└────────────────────┘     └───────────────────┘     └─────────────────┘
```

## Client Methods

### Initialize Client

```javascript
import { BedrockClient } from '~/lib/supabase-bedrock-client';

// The client automatically uses the Supabase auth session
const bedrockClient = new BedrockClient();
```

### Get User's Instances

```javascript
const { data, error } = await bedrockClient.listInstances();
// data = [{ id, model_type, throughput_name, status, ... }]
```

### Create New Instance

```javascript
const instanceDetails = {
  model_id: "anthropic.claude-v2",
  model_type: "Claude",
  commitment_term: 1, // months
  model_units: 1
};

const { data, error } = await bedrockClient.createInstance(instanceDetails);
// data = { id, instance_id, throughput_name, ... }
```

### Delete Instance

```javascript
const { data, error } = await bedrockClient.deleteInstance(instanceId);
// data = { success, message }
```

### Send Message to Bedrock Model

```javascript
const message = {
  instance_id: 1,
  prompt: "What is the capital of France?",
  max_tokens: 100
};

const { data, error } = await bedrockClient.invokeModel(message);
// data = { response, usage: { input_tokens, output_tokens, total_tokens } }
```

### Get Usage Statistics

```javascript
// For all instances
const { data, error } = await bedrockClient.getUsageStats();

// For a specific instance
const { data, error } = await bedrockClient.getUsageStats({
  instance_id: 1,
  timeframe: "month" // "day", "week", "month", "year"
});
// data = { usage: {...}, limits: {...} }
```

## PROHIBITED: No Mock Implementations

**CRITICAL NOTE: ANY MOCK OR SIMULATED IMPLEMENTATION IS STRICTLY PROHIBITED**

~~Mock data is used when:~~
~~1. Running in development mode and VITE_USE_MOCK_BEDROCK is set to 'true'~~
~~2. Edge Function fails to respond (fallback)~~

The client must ALWAYS:
- Connect to real AWS Bedrock services
- Use valid AWS credentials
- Handle errors appropriately
- Track actual resource usage
- Report actual costs

Do not attempt to create simulations, mock data, or fake implementations for ANY reason. This application has real financial and service implications.

## Error Handling

The client provides standardized error handling:

```javascript
const { data, error } = await bedrockClient.listInstances();

if (error) {
  console.error('Error listing instances:', error.message);
  // Handle specific error codes
  if (error.code === 'AUTH_REQUIRED') {
    // Redirect to login
  }
}
```

## Authentication

The client automatically handles authentication with Supabase:

1. Uses the current user session for authentication
2. Sends the JWT token with each request to the Edge Function
3. Handles cases where authentication is missing or expired

## UI Components

### BedrockChat Component

The `BedrockChat` component provides a ready-to-use chat interface for interacting with Bedrock models:

```javascript
import { BedrockChat } from '~/components/BedrockChat';

// In your component
return (
  <BedrockChat
    instanceId={1}
    initialMessages={[]}
    onError={(error) => console.error(error)}
  />
);
```

### BedrockAdmin Component

The `BedrockAdmin` component provides a comprehensive interface for managing Bedrock instances:

```javascript
import { BedrockAdmin } from '~/pages/admin/BedrockAdmin';

// In your route component
return <BedrockAdmin />;
```

Features include:
- Listing all user instances
- Creating new instances
- Deleting instances
- Viewing usage statistics
- Testing chat with models

## Usage Examples

### Basic Usage

```javascript
import { BedrockClient } from '~/lib/supabase-bedrock-client';

function MyComponent() {
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(true);
  const bedrockClient = new BedrockClient();

  useEffect(() => {
    async function loadInstances() {
      setLoading(true);
      const { data, error } = await bedrockClient.listInstances();
      
      if (error) {
        console.error('Error loading instances:', error.message);
      } else {
        setInstances(data || []);
      }
      
      setLoading(false);
    }
    
    loadInstances();
  }, []);

  // Component rendering...
}
```

### Creating an Instance

```javascript
async function handleCreateInstance() {
  const { data, error } = await bedrockClient.createInstance({
    model_id: selectedModel,
    model_type: getModelType(selectedModel),
    commitment_term: commitmentTerm,
    model_units: modelUnits
  });
  
  if (error) {
    setError(error.message);
  } else {
    setInstances([...instances, data]);
    setShowCreateModal(false);
  }
}
```

### Chat Implementation

```javascript
async function sendMessage(messageText) {
  setLoading(true);
  
  const { data, error } = await bedrockClient.invokeModel({
    instance_id: selectedInstance.id,
    prompt: messageText,
    max_tokens: 500
  });
  
  setLoading(false);
  
  if (error) {
    setError(error.message);
    return;
  }
  
  setMessages([
    ...messages,
    { role: 'user', content: messageText },
    { role: 'assistant', content: data.response }
  ]);
  
  // Update usage display
  setTokensUsed(data.usage.total_tokens);
}
```

## Best Practices

1. Always handle error responses from the client
2. Implement loading states during API calls
3. Provide feedback for rate limits and quota exceedances
4. Use the mock implementation for local development
5. Implement proper authentication checks before rendering components
6. Cache instance lists to reduce API calls
7. Implement retry logic for transient errors 