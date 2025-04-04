# AWS Bedrock Edge Function

This Supabase Edge Function provides an API for managing AWS Bedrock provisioned model throughput instances.

## Features

- List all Bedrock instances
- Create new Bedrock instances
- Delete existing Bedrock instances
- Environment diagnostics endpoint

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
   - `BEDROCK_API_KEY`: API key for securing edge function access

   You can set these in the Supabase dashboard under Settings > API > Edge Functions.

5. Deploy the function:
   ```bash
   supabase functions deploy bedrock
   ```

## API Endpoints

### GET /bedrock/instances
Lists all Bedrock instances stored in the database.

### POST /bedrock/provision-instance
Creates a new Bedrock provisioned model throughput instance.

Request body:
```json
{
  "modelId": "anthropic.claude-3-sonnet-20240229-v1:0",
  "commitmentDuration": "ONE_MONTH",
  "modelUnits": 1
}
```

### DELETE /bedrock/delete-instance
Deletes a Bedrock provisioned model throughput instance.

Request body:
```json
{
  "instanceId": "arn:aws:bedrock:us-east-1:123456789012:provisioned-model/abcdefg"
}
```

### GET /bedrock/test-env
Provides diagnostic information about the environment configuration.

## Database Requirements

This function expects a `bedrock_instances` table in your Supabase database. Make sure to run the migration script to create this table.

## Authentication

All API endpoints require an `x-api-key` header that matches the `BEDROCK_API_KEY` environment variable. 