# AWS Bedrock Integration

This document describes the AWS Bedrock integration in the application, which allows users to connect their AWS Bedrock credentials to access foundation models.

## Overview

The AWS Bedrock integration provides:

- Management of AWS Bedrock credentials
- Direct access to AWS Bedrock foundation models
- Listing and viewing available models
- Testing AWS connectivity
- Fallback data for development and testing

## Components

The integration consists of the following primary components:

1. **AWS Bedrock Client** (`/src/lib/aws-bedrock-client.js`): Direct wrapper around the AWS SDK for Bedrock
2. **Supabase AWS Credentials** (`/src/lib/supabase-aws-credentials.js`): Retrieves and stores AWS credentials in Supabase
3. **Admin UI** (`/src/pages/admin/SupabaseBedrock.tsx`): Admin interface for managing AWS Bedrock integration

## Setup

### Database Setup

The integration requires a `bedrock_credentials` table in your Supabase database. You can create it by running the migration script:

```sql
-- Found in /src/migrations/create_bedrock_credentials_table.sql
CREATE TABLE IF NOT EXISTS bedrock_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  aws_access_key_id TEXT NOT NULL,
  aws_secret_access_key TEXT NOT NULL,
  aws_region TEXT NOT NULL DEFAULT 'us-east-1',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Ensure only one row per user
  CONSTRAINT unique_user_credentials UNIQUE (user_id)
);

-- Row Level Security policies are also defined in the migration script
```

### AWS IAM Setup

For this integration to work, you need AWS IAM credentials with the following minimum permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:ListFoundationModels",
        "bedrock:GetFoundationModel",
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": "*"
    }
  ]
}
```

## Usage

### Initializing the Client

```javascript
import { initBedrockClientWithSupabaseCredentials } from '@/lib/supabase-aws-credentials';

// Initialize with user's credentials
const { client, success, message, usingFallback } = await initBedrockClientWithSupabaseCredentials({
  userId: 'user-id-here',
  useFallbackOnError: true // Will use mock data if credentials fail
});

// Now you can use the client
const models = await client.listFoundationModels();
```

### Admin Interface

The admin interface at `/admin/supabase-bedrock` provides:

1. A form to enter and save AWS credentials
2. Testing of the AWS Bedrock connection
3. Listing of available foundation models
4. Status indicators for connection health

## Fallback Mechanism

To ensure the application functions even without valid AWS credentials, the integration includes a fallback mechanism that provides mock data. This is especially useful during development or when users haven't yet configured their AWS credentials.

The fallback models include:
- Titan Text Express
- Claude V2
- Claude Instant

## Security

The integration securely stores AWS credentials with the following security measures:

1. Row Level Security (RLS) policies ensure users can only access their own credentials
2. Admin users can manage all credentials
3. The AWS secret key is never exposed to the client side
4. All API calls are authenticated through Supabase

## Troubleshooting

### Common Issues

1. **Connection Failed**: Verify that the AWS credentials are correct and have the appropriate permissions.
2. **Models Not Loading**: Check that the configured region has AWS Bedrock available.
3. **Permission Denied**: Ensure the IAM user has the necessary permissions for Bedrock operations.

### Error Logging

The integration includes detailed error logging:

- Client-side logs provide information about connection status
- Fallback data usage is clearly indicated
- Error messages include actionable steps for resolution

## Future Enhancements

Planned enhancements include:

1. Support for model invocation directly from the admin interface
2. Provisioning of model throughput resources
3. Usage and cost tracking integration
4. Advanced filtering and searching of available models 