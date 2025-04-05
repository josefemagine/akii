# Super-Action Edge Function

This Supabase Edge Function securely handles all AWS Bedrock operations for the Akii platform.

## Overview

The Edge Function serves as the secure middleware between the frontend application and AWS Bedrock, ensuring:

1. All requests are properly authenticated using JWT tokens
2. User permissions are verified before operations
3. Resource ownership is enforced
4. Usage limits are tracked and enforced
5. AWS credentials remain secure

## Deployment

To deploy this function to your Supabase project, follow these steps:

1. Make sure you have the Supabase CLI installed:
   ```bash
   npm install -g supabase
   ```

2. Login to the Supabase CLI:
   ```bash
   supabase login
   ```

3. Initialize your local Supabase development environment (if not already done):
   ```bash
   supabase init
   ```

4. Set the required environment variables in your Supabase project:
   - `AWS_ACCESS_KEY_ID`: Your AWS access key
   - `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
   - `AWS_REGION`: AWS region (e.g., 'us-east-1')
   - `SUPABASE_URL`: Supabase URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key

   You can set these in the Supabase dashboard under Settings > API > Edge Functions.

5. Deploy the function:
   ```bash
   supabase functions deploy super-action
   ```

Make sure to set all required secrets:

```bash
supabase secrets set AWS_ACCESS_KEY_ID=xxxxx
supabase secrets set AWS_SECRET_ACCESS_KEY=xxxxx
supabase secrets set AWS_REGION=us-east-1
supabase secrets set SUPABASE_URL=https://xxxxx.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=xxxxx
```

## Testing Locally

```bash
supabase functions serve super-action
```

To test with authentication:

```bash
supabase functions invoke super-action --body '{"action":"listInstances"}' \
  --header "Authorization: Bearer <jwt-token>"
```

## Edge Function API

### Authentication

All requests require a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

### Request Format

```json
{
  "action": "actionName",
  "data": {
    // Action-specific parameters
  }
}
```

### Actions

#### List Instances

Retrieves all Bedrock instances owned by the authenticated user.

```json
{
  "action": "listInstances"
}
```

**Response:**
```json
{
  "instances": [
    {
      "id": 1,
      "user_id": "user-uuid",
      "instance_id": "bedrock-instance-id",
      "throughput_name": "akii-starter-001",
      "model_id": "anthropic.claude-v2",
      "model_type": "Claude",
      "status": "active",
      "commitment_term": 1,
      "model_units": 1,
      "created_at": "2023-06-15T00:00:00Z",
      "updated_at": "2023-06-15T00:00:00Z"
    }
  ]
}
```

#### Provision Instance

Creates a new Bedrock instance.

```json
{
  "action": "provisionInstance",
  "data": {
    "model_id": "anthropic.claude-v2",
    "model_type": "Claude",
    "commitment_term": 1,
    "model_units": 1
  }
}
```

**Response:**
```json
{
  "instance": {
    "id": 1,
    "user_id": "user-uuid",
    "instance_id": "bedrock-instance-id",
    "throughput_name": "akii-starter-001",
    "model_id": "anthropic.claude-v2",
    "model_type": "Claude",
    "status": "provisioning",
    "commitment_term": 1,
    "model_units": 1,
    "created_at": "2023-06-15T00:00:00Z",
    "updated_at": "2023-06-15T00:00:00Z"
  }
}
```

#### Delete Instance

Deletes an existing Bedrock instance.

```json
{
  "action": "deleteInstance",
  "data": {
    "instance_id": 1
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Instance deleted successfully"
}
```

#### Invoke Model

Sends a prompt to a Bedrock model and returns the response.

```json
{
  "action": "invokeModel",
  "data": {
    "instance_id": 1,
    "prompt": "What is the capital of France?",
    "max_tokens": 100
  }
}
```

**Response:**
```json
{
  "response": "The capital of France is Paris.",
  "usage": {
    "input_tokens": 6,
    "output_tokens": 7,
    "total_tokens": 13
  }
}
```

#### Get Usage Stats

Retrieves token usage statistics for the user's instances.

```json
{
  "action": "getUsageStats",
  "data": {
    "instance_id": 1, // Optional, if omitted returns stats for all user instances
    "timeframe": "month" // Optional: "day", "week", "month", "year"
  }
}
```

**Response:**
```json
{
  "usage": {
    "total_tokens": 10000,
    "input_tokens": 4000,
    "output_tokens": 6000,
    "instances": [
      {
        "instance_id": 1,
        "total_tokens": 10000,
        "input_tokens": 4000,
        "output_tokens": 6000
      }
    ]
  },
  "limits": {
    "max_tokens": 100000,
    "usage_percentage": 10
  }
}
```

## Error Handling

The Edge Function returns standardized error responses:

```json
{
  "error": {
    "message": "Error message description",
    "code": "ERROR_CODE"
  }
}
```

Common error codes:

| Code                | Description                                     |
|---------------------|-------------------------------------------------|
| AUTH_REQUIRED       | No valid authentication token provided          |
| AUTH_INVALID        | Authentication token is invalid or expired      |
| INSTANCE_NOT_FOUND  | Bedrock instance not found                      |
| NOT_AUTHORIZED      | User not authorized to access this resource     |
| PLAN_LIMIT_EXCEEDED | User has exceeded their plan's token limit      |
| SERVICE_ERROR       | Error from AWS Bedrock service                  |
| INVALID_REQUEST     | Request parameters are invalid                  |

## Implementation Notes

1. The service uses AWS SDK v3 for Bedrock integration
2. Token usage is tracked per request in the database
3. Plan limits are enforced before allowing model invocation
4. Database operations use the Supabase client with service role key
5. All errors are properly handled and logged 