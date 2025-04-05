# AWS Bedrock Integration with Supabase

**NEVER USE MOCK DATA, NOT EVEN FOR TESTING. THIS IS A LIVE APP.**

This document describes the implementation of AWS Bedrock within the Akii AI-as-a-Service platform, secured through Supabase authentication and Edge Functions.

## CRITICAL: Always Use Real AWS Services

The AWS Bedrock integration **MUST ALWAYS** connect to real AWS Bedrock services. Mock data is strictly prohibited in all environments including:
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

## System Overview

Akii leverages AWS Bedrock to provision AI instances via throughput, allowing each user to have their own private provisioned AI instances. The implementation follows these core principles:

- **Secure Backend**: All AWS Bedrock API calls are handled through Supabase Edge Functions
- **Authentication**: JWT tokens from Supabase Auth are used to authenticate all requests
- **User Isolation**: Each provisioned model is tied to a specific user
- **Usage Tracking**: Token usage is monitored and enforced according to plan limits
- **Real Data**: All interactions use real AWS Bedrock calls with no mocking

## Architecture

```
┌────────────┐     ┌─────────────────┐     ┌───────────────┐     ┌──────────────┐
│            │     │                 │     │               │     │              │
│  Frontend  │────▶│  Supabase Auth  │────▶│  Edge Function│────▶│  AWS Bedrock │
│            │     │                 │     │               │     │              │
└────────────┘     └─────────────────┘     └───────────────┘     └──────────────┘
                           │                       │                     │
                           ▼                       ▼                     │
                   ┌─────────────────┐     ┌───────────────┐            │
                   │                 │     │               │            │
                   │  User Profiles  │     │  DB Tables    │◀───────────┘
                   │                 │     │               │
                   └─────────────────┘     └───────────────┘
```

The solution consists of three main components:
1. **Frontend React Application**: Provides a user interface for managing AWS Bedrock instances
2. **Supabase Edge Functions**: Serverless functions that handle AWS Bedrock API operations
3. **Supabase Database**: Stores metadata about provisioned AWS Bedrock instances

## Database Schema

### Table: bedrock_instances

| Column           | Type      | Description                                  |
|------------------|-----------|----------------------------------------------|
| id               | bigint    | Primary key, auto-incrementing               |
| user_id          | uuid      | Foreign key to auth.users                    |
| instance_id      | text      | AWS Bedrock instance ID                      |
| throughput_name  | text      | Bedrock throughput name (e.g., akii-001)     |
| model_id         | text      | Bedrock model ID                             |
| model_type       | text      | Model type (e.g., Claude, Titan)             |
| status           | text      | Provisioning status                          |
| commitment_term  | integer   | Commitment duration in months                |
| model_units      | integer   | Number of model units provisioned            |
| created_at       | timestamp | Creation timestamp                           |
| updated_at       | timestamp | Last update timestamp                        |

### Table: bedrock_usage

| Column           | Type      | Description                                  |
|------------------|-----------|----------------------------------------------|
| id               | bigint    | Primary key, auto-incrementing               |
| instance_id      | integer   | Foreign key to bedrock_instances             |
| user_id          | uuid      | Foreign key to auth.users                    |
| input_tokens     | integer   | Number of input tokens used                  |
| output_tokens    | integer   | Number of output tokens used                 |
| total_tokens     | integer   | Total tokens consumed                        |
| created_at       | timestamp | Usage timestamp                              |

## Setup Instructions

### 1. Supabase Configuration

1. Create a Supabase project at [https://supabase.com](https://supabase.com)
2. Run the database migration to create the `bedrock_instances` table:
   ```bash
   supabase migration apply
   ```
3. Set up the required secrets in your Supabase project:
   - `AWS_ACCESS_KEY_ID`: Your AWS access key with Bedrock permissions
   - `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
   - `AWS_REGION`: AWS region (e.g., 'us-east-1')
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Service role key for database operations

### 2. Deploy the Edge Function

1. Install the Supabase CLI if you haven't already:
   ```bash
   npm install -g supabase
   ```

2. Login to the Supabase CLI:
   ```bash
   supabase login
   ```

3. Deploy the edge function:
   ```bash
   supabase functions deploy super-action
   ```

### 3. Configure the Frontend

1. Set the following environment variables in your frontend application:
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

The Edge Function provides the following actions:

| Action                | Description                                     | Authentication |
|-----------------------|-------------------------------------------------|---------------|
| listInstances         | Retrieve user's provisioned instances           | Required      |
| provisionInstance     | Create a new Bedrock throughput instance        | Required      |
| deleteInstance        | Delete an existing instance                     | Required      |
| invokeModel           | Send a prompt to a provisioned model            | Required      |
| getUsageStats         | Retrieve token usage statistics                 | Required      |
| aws-permission-test   | Test AWS IAM permissions                        | Required      |
| testEnvironment       | Check the API configuration                     | Required      |

## Security Measures

1. **JWT Authentication**: All requests to the Edge Function require a valid JWT token from Supabase Auth
2. **Authorization**: Ownership of instances is verified before any operation
3. **Isolation**: Users can only access their own provisioned instances 
4. **Plan Enforcement**: Token usage is tracked and limited based on subscription plan
5. **AWS Credentials**: Stored securely as environment variables, never exposed to frontend
6. **Row-Level Security**: Supabase RLS policies protect the database tables

## Edge Function Implementation

The Edge Function handles:

1. Validating JWT tokens from incoming requests
2. Extracting user information from the verified token
3. Initializing AWS SDK clients with proper credentials
4. Managing Bedrock instance provisioning, deletion, and invocation
5. Tracking token usage in the database
6. Enforcing plan limits and restrictions
7. Returning appropriate responses and error handling

## AWS SDK Integration (IMPORTANT)

### Always Use the Official AWS SDK with Real AWS Services

The AWS Bedrock integration **MUST** use the official AWS SDK packages with real AWS services:

```typescript
import { BedrockClient } from "@aws-sdk/client-bedrock";
import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
```

Benefits of using the official AWS SDK:
- Proper authentication and request signing
- Automatic retries with exponential backoff
- Type safety with TypeScript interfaces
- Comprehensive error handling
- Support for all AWS Bedrock operations

### NEVER Use Mock Data Under Any Circumstances

**CRITICAL**: Mock implementations **MUST NEVER** be used in this application - for production, testing, or development.
This application connects to real AWS Bedrock services with real billing implications for customers.

For all environments:
- Always connect to the real AWS Bedrock API
- Properly configure AWS credentials
- Ensure IAM permissions are correctly set
- Use proper error handling for all scenarios
- Always track actual usage and costs

Any mock or simulated implementations are strictly prohibited and will lead to:
- Misleading user experiences
- Incorrect billing data
- False expectations about model behavior
- Security vulnerabilities
- Potential breach of service contracts

This is a production application with real users and financial implications. Always use real AWS services.

## Frontend Client

The `supabase-bedrock-client.js` provides a secure way for the frontend application to interact with AWS Bedrock services without directly exposing AWS credentials or endpoints. All operations are authenticated and routed through Supabase Edge Functions using JWT tokens from Supabase Auth.

### Client Methods

#### Initialize Client

```javascript
import { BedrockClient } from '~/lib/supabase-bedrock-client';

// The client automatically uses the Supabase auth session
const bedrockClient = new BedrockClient();
```

#### Get User's Instances

```javascript
const { data, error } = await bedrockClient.listInstances();
// data = [{ id, model_type, throughput_name, status, ... }]
```

#### Create New Instance

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

#### Delete Instance

```javascript
const { data, error } = await bedrockClient.deleteInstance(instanceId);
// data = { success, message }
```

#### Send Message to Bedrock Model

```javascript
const message = {
  instance_id: 1,
  prompt: "What is the capital of France?",
  max_tokens: 100
};

const { data, error } = await bedrockClient.invokeModel(message);
// data = { response, usage: { input_tokens, output_tokens, total_tokens } }
```

#### Get Usage Statistics

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

#### Test AWS Permissions

```javascript
const { success, test_results, error } = await BedrockClient.testAwsPermissions();
// test_results = { readPermission: true, listProvisionedPermission: true, createPermission: true }
```

### Error Handling

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

### Authentication

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

The `BedrockAdmin` component provides a comprehensive interface for managing Bedrock instances.

Features include:
- Listing all user instances
- Creating new instances
- Deleting instances
- Viewing usage statistics
- Testing chat with models

## IAM Permissions

The AWS IAM role used by the Edge Function has permissions limited to:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModelWithProvisionedThroughput",
        "bedrock:CreateProvisionedModelThroughput",
        "bedrock:DeleteProvisionedModelThroughput",
        "bedrock:ListProvisionedModelThroughputs",
        "bedrock:GetProvisionedModelThroughput",
        "bedrock:ListFoundationModels"
      ],
      "Resource": "arn:aws:bedrock:us-east-1:*:provisioned-model-throughput/*"
    }
  ]
}
```

## API Access

You can access the Bedrock API through the following endpoints:

- For local development with Vite proxy: `/api/super-action`
- For production: Direct Edge Function access: `https://injxxchotrvgvvzelhvj.supabase.co/functions/v1/super-action`

## Usage Monitoring

The system tracks token usage per instance and per user, providing:

1. Real-time usage statistics
2. Token limit enforcement based on subscription plan
3. Alerts when approaching usage limits
4. Detailed usage history for billing and analytics

## Troubleshooting

If you encounter issues with the integration:

1. **CORS Errors**: If you experience CORS issues, check:
   - CORS headers in the Edge Function
   - Browser's developer console for specific error messages

2. **503 Service Unavailable**: If the Edge Function fails to start:
   - Check Supabase logs for errors
   - Verify your AWS credentials are valid and have the necessary permissions

3. **Authentication Errors**:
   - Ensure you have a valid JWT token from Supabase Auth
   - Check that the token is being passed in the Authorization header
   - Verify the JWT token has not expired

4. **AWS Permission Issues**:
   - Use the AWS permission tester component to verify your credentials have the right permissions
   - Check the IAM policy attached to the AWS user/role
   - Verify the region settings match the AWS resources

## Implementation Files

The key files for this implementation include:

- `supabase/functions/super-action/index.ts` - Edge Function implementation
- `supabase/functions/super-action/aws.ts` - AWS SDK integration
- `supabase/functions/super-action/aws-test.ts` - AWS permissions testing
- `src/lib/supabase-bedrock-client.js` - Frontend client for Bedrock API
- `src/lib/bedrock-config.js` - Configuration for Bedrock API
- `src/pages/admin/SupabaseBedrock.tsx` - Admin interface for Bedrock instances
- `src/components/aws-permission-tester.jsx` - AWS permissions testing component

## Development and Testing

For local development:
1. Deploy and test the Edge Function using Supabase CLI: `supabase functions serve super-action`
2. Test authentication with: `supabase functions invoke super-action --body '{"action":"listInstances"}' --header "Authorization: Bearer <jwt-token>"`

## Deployment

To deploy the Edge Function:
```
supabase functions deploy super-action --project-ref your-project-ref
```

## Best Practices

1. Always handle error responses from the client
2. Implement loading states during API calls
3. Provide feedback for rate limits and quota exceedances
4. Never expose AWS credentials to the frontend
5. Always verify user authentication before any AWS operation
6. Track all token usage for billing and quotas
7. Implement proper error handling and retries
8. Use the most restricted IAM permissions possible
9. Always use the official AWS SDK
10. Never use mock implementations under any circumstances 