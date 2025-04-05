# AWS Bedrock Integration with Supabase

This document describes the implementation of AWS Bedrock within the Akii AI-as-a-Service platform, secured through Supabase authentication and Edge Functions.

## System Overview

Akii leverages AWS Bedrock to provision AI instances via throughput, allowing each user to have their own private provisioned AI instances. The implementation follows these core principles:

- **Secure Backend**: All AWS Bedrock API calls are handled through Supabase Edge Functions
- **Authentication**: JWT tokens from Supabase Auth are used to authenticate all requests
- **User Isolation**: Each provisioned model is tied to a specific user
- **Usage Tracking**: Token usage is monitored and enforced according to plan limits

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

## API Endpoints

The Edge Function provides the following actions:

| Action             | Description                                     | Authentication |
|--------------------|-------------------------------------------------|---------------|
| listInstances      | Retrieve user's provisioned instances           | Required      |
| provisionInstance  | Create a new Bedrock throughput instance        | Required      |
| deleteInstance     | Delete an existing instance                     | Required      |
| invokeModel        | Send a prompt to a provisioned model            | Required      |
| getUsageStats      | Retrieve token usage statistics                  | Required      |

## Security Measures

1. **JWT Authentication**: All requests to the Edge Function require a valid JWT token from Supabase Auth
2. **Authorization**: Ownership of instances is verified before any operation
3. **Isolation**: Users can only access their own provisioned instances 
4. **Plan Enforcement**: Token usage is tracked and limited based on subscription plan
5. **AWS Credentials**: Stored securely as environment variables, never exposed to frontend

## Edge Function Implementation

The Edge Function handles:

1. Validating JWT tokens from incoming requests
2. Extracting user information from the verified token
3. Initializing AWS SDK clients with proper credentials
4. Managing Bedrock instance provisioning, deletion, and invocation
5. Tracking token usage in the database
6. Enforcing plan limits and restrictions
7. Returning appropriate responses and error handling

## Frontend Client

The frontend client:

1. Authenticates users via Supabase Auth
2. Sends authenticated requests to the Edge Function
3. Provides UI for managing instances, viewing usage, and testing models
4. Never directly communicates with AWS Bedrock

## Usage Monitoring

The system tracks token usage per instance and per user, providing:

1. Real-time usage statistics
2. Token limit enforcement based on subscription plan
3. Alerts when approaching usage limits
4. Detailed usage history for billing and analytics

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
        "bedrock:ListProvisionedModelThroughputs"
      ],
      "Resource": "arn:aws:bedrock:us-east-1:*:provisioned-model-throughput/*"
    }
  ]
}
```

## API Access

You can access the Bedrock API through the following endpoints:

- For local development with Vite proxy: `/api/super-action`
- For production: `/api/super-action` (proxied via Next.js API route)
- Direct Edge Function access: `https://injxxchotrvgvvzelhvj.supabase.co/functions/v1/super-action`

> **Important**: The `/api/bedrock` path is deprecated and will be removed in future versions. 
> Please update your code to use `/api/super-action` instead.

## Implementation Files

- `supabase/functions/super-action/index.ts` - Edge Function implementation
- `pages/api/super-action/index.js` - Next.js API route for proxying to the Edge Function
- `src/lib/supabase-bedrock-client.js` - Frontend client for Bedrock API
- `src/pages/admin/SupabaseBedrock.tsx` - Admin interface for Bedrock instances
- `src/components/BedrockChat.tsx` - Chat interface for testing models

## Environment Variables

The following environment variables are required:

```
AWS_ACCESS_KEY_ID=xxxxx
AWS_SECRET_ACCESS_KEY=xxxxx
AWS_REGION=us-east-1
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxxx
```

## Development and Testing

For local development:
1. Use the mock implementation in the frontend client
2. Test with the Supabase CLI: `supabase functions serve super-action`
3. Verify authentication with: `supabase functions invoke super-action --body '{"action":"listInstances"}' --header "Authorization: Bearer <jwt-token>"`

## Deployment

To deploy the Edge Function:
```
supabase functions deploy super-action
```

## Error Handling

The system provides specific error messages for:
1. Authentication failures
2. Resource not found
3. Insufficient permissions
4. Exceeded quotas
5. AWS service errors

## Best Practices

1. Never expose AWS credentials to the frontend
2. Always verify user authentication before any AWS operation
3. Track all token usage for billing and quotas
4. Implement proper error handling and retries
5. Use the most restricted IAM permissions possible 