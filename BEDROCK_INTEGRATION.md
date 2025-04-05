# AWS Bedrock Integration Guide

This guide explains how to set up and use the AWS Bedrock integration with your application.

## Overview

The Bedrock integration allows you to manage AWS Bedrock model throughput instances from your application. The integration supports two authentication methods:

1. **JWT Authentication** (recommended): Uses Supabase authentication tokens
2. **API Key Authentication**: Uses a dedicated API key for Bedrock operations

## Architecture

The integration supports two deployment modes:

1. **Supabase Edge Functions** (recommended for production): Runs AWS operations in serverless Supabase Edge Functions
2. **Local API Proxy**: Routes requests through your application's API proxy (useful for development)

## Setup

### 1. Environment Variables

Copy the variables from `.env.example` to your `.env` file and fill in the values:

```
# Required Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id

# Optional API Configuration
VITE_BEDROCK_API_URL=/api/bedrock
VITE_BEDROCK_API_KEY=your-bedrock-api-key
VITE_USE_EDGE_FUNCTIONS=true
```

### 2. Supabase Edge Function Setup

1. Deploy the Bedrock Edge Function to your Supabase project:

```bash
cd supabase
supabase functions deploy bedrock --project-ref your-project-id
```

2. Set the necessary secrets in your Supabase project:

```bash
supabase secrets set AWS_ACCESS_KEY_ID=your-aws-access-key --project-ref your-project-id
supabase secrets set AWS_SECRET_ACCESS_KEY=your-aws-secret-key --project-ref your-project-id
supabase secrets set AWS_REGION=us-east-1 --project-ref your-project-id
supabase secrets set BEDROCK_API_KEY=your-bedrock-api-key --project-ref your-project-id
```

### 3. Local Development Setup

For local development without Edge Functions:

1. Set `VITE_USE_EDGE_FUNCTIONS=false` in your `.env` file
2. Ensure the API proxy routes in `vercel.json` or `next.config.js` are properly configured

## Authentication

The integration prioritizes authentication methods in this order:

1. JWT token from Supabase authentication (if logged in)
2. API key from localStorage (if saved by the user)
3. API key from environment variables (fallback)

## Usage

### Admin Interface

Access the Bedrock admin interface at `/admin/bedrock` in your application. This interface provides:

- List of provisioned Bedrock instances
- Creation of new instances
- Deletion of instances
- Environment diagnostics
- API key configuration

### Programmatic Usage

Import the Bedrock client in your code:

```javascript
import { BedrockClient } from '../lib/supabase-bedrock-client';

// List instances
const { instances, error } = await BedrockClient.listInstances();

// Create instance
const { instance, error } = await BedrockClient.createInstance({
  modelId: 'amazon.titan-text-express-v1',
  commitmentDuration: 'MONTH_1',
  modelUnits: 1
});

// Delete instance
const { success, error } = await BedrockClient.deleteInstance(instanceId);

// Test environment
const { environment, error } = await BedrockClient.testEnvironment();
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**: 
   - Verify you're logged in for JWT authentication
   - Check that the API key is correctly set in localStorage or environment variables

2. **CORS Errors**:
   - When using Edge Functions, ensure CORS headers are properly configured
   - For local development, use the API proxy to avoid CORS issues

3. **Edge Function Errors**:
   - Verify the Supabase project ID is correct
   - Confirm the Edge Function is deployed
   - Check AWS credentials are properly set in Supabase secrets

### Diagnostic Tool

Use the diagnostic tab in the admin interface to:
- Check environment configuration
- Test connectivity to the API
- View detailed error messages

## Security Considerations

1. **JWT Authentication** is preferred over API keys for better security
2. API keys stored in localStorage should be treated as sensitive information
3. In production, set proper access controls on your Supabase Edge Functions

## Configuration Options

### Feature Flags

- `VITE_USE_EDGE_FUNCTIONS`: Set to `true` to use Supabase Edge Functions, `false` to use your API proxy
- `VITE_DEBUG`: Set to `true` to enable verbose logging in the browser console

### API URLs

- `VITE_BEDROCK_API_URL`: The base URL for the Bedrock API
  - For API proxy: `/api/bedrock` (default)
  - For direct Edge Function access: `https://{project-id}.supabase.co/functions/v1/bedrock`

## API Access

You can access the Bedrock API through the following endpoints:

- For local development with Vite proxy: `/api/super-action`
- For direct Edge Function access: `https://api.akii.com/functions/v1/super-action` 