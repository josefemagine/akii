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

### Edge Function BOOT_ERROR with AWS Module

If you see a boot error related to missing exports in the AWS module, follow these steps:

#### Error: Missing Export `listAvailableFoundationModels`

The Edge Function fails with error: 
```
worker boot error: Uncaught SyntaxError: The requested module './aws.ts' does not provide an export named 'listAvailableFoundationModels'
```

**Root Cause:** The function name used in the import statement doesn't match the actual AWS API method name.

**Solution:**

1. In your Supabase Edge Function, locate the import statement in the `index.ts` file:

```typescript
// Incorrect import
import { listAvailableFoundationModels } from './aws.ts';
```

2. Update it to use the correct method name according to AWS documentation:

```typescript
// Correct import (case sensitive)
import { ListFoundationModels } from './aws.ts';
```

3. Then locate the `aws.ts` file and ensure the export is correctly named:

```typescript
// Export the function with the correct name
export const ListFoundationModels = async (filters = {}) => {
  // Implementation here
};
```

4. According to the [AWS Bedrock API Reference](https://docs.aws.amazon.com/bedrock/latest/APIReference/API_ListFoundationModels.html), the method is called `ListFoundationModels` with capital letters.

5. Redeploy your Supabase Edge Function.

For more information on the AWS Bedrock API, visit: https://docs.aws.amazon.com/bedrock/latest/APIReference/API_ListFoundationModels.html

## API Operations

### Supported AWS Bedrock API Operations

Our integration currently supports the following AWS Bedrock API operations:

| Operation | Description | Implementation Status |
|-----------|-------------|----------------------|
| ListFoundationModels | Lists available foundation models with filtering options | ✅ Implemented |
| GetFoundationModel | Gets detailed information about a specific foundation model | ✅ Implemented |
| CreateProvisionedModelThroughput | Creates a new provisioned model throughput (instance) | ✅ Implemented |
| DeleteProvisionedModelThroughput | Deletes a provisioned model throughput | ✅ Implemented |
| ListProvisionedModelThroughputs | Lists all provisioned model throughputs | ✅ Implemented |

### Recommended Additional Operations

The following AWS Bedrock API operations could be added to improve functionality:

| Operation | Description | Implementation Status |
|-----------|-------------|----------------------|
| GetModelInvocationLoggingConfiguration | Gets the current model invocation logging configuration | 🔧 Recommended |
| PutModelInvocationLoggingConfiguration | Configures logging for model invocations | 🔧 Recommended |
| GetProvisionedModelThroughput | Gets detailed information about a provisioned model throughput | 🔧 Recommended |
| UpdateProvisionedModelThroughput | Updates a provisioned model throughput | 🔧 Recommended |
| ListTagsForResource | Lists tags for a Bedrock resource | 🔧 Recommended |
| TagResource | Adds tags to a Bedrock resource | 🔧 Recommended |
| UntagResource | Removes tags from a Bedrock resource | 🔧 Recommended |

### Usage Metrics and Cost Tracking

AWS Bedrock itself doesn't provide direct API methods for detailed usage metrics or cost tracking. For comprehensive usage monitoring, we recommend:

1. **AWS Cost Explorer API**: Integrate with the AWS Cost Explorer API to obtain detailed cost information
   - `GetCostAndUsage`: Gets aggregated cost and usage metrics for AWS Bedrock
   - `GetDimensionValues`: Gets the dimension values for filtering (e.g., specific model types)

2. **CloudWatch Metrics**: Collect and analyze AWS Bedrock usage through CloudWatch
   - `GetMetricData`: Retrieves metrics about model invocations, tokens processed, etc.
   - `GetMetricStatistics`: Gets statistics for specified metrics

3. **Custom Usage Tracking**: Implement custom tracking by:
   - Recording metrics in your application database when making Bedrock calls
   - Storing token counts and model usage from API responses
   - Creating dashboards with aggregated metrics

To implement these additions, the Edge Function will need to be updated to include the corresponding AWS SDK calls, and the client will need new methods to access these features.

For more information on all available AWS Bedrock API operations, visit: https://docs.aws.amazon.com/bedrock/latest/APIReference/API_Operations_Amazon_Bedrock.html

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