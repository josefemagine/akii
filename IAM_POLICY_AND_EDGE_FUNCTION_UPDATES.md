# AWS Bedrock Provisioned Throughput Tagging Implementation

## Overview

We've implemented the ability to add tags to AWS Bedrock provisioned throughput instances, including automatically tagging with the user's Akii ID and allowing custom instance names.

## IAM Policy Requirements

To successfully create provisioned throughput instances and apply tags, you need the following IAM policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:ListFoundationModels",
        "bedrock:GetFoundationModel",
        "bedrock:ListProvisionedModelThroughputs",
        "bedrock:CreateProvisionedModelThroughput",
        "bedrock:DeleteProvisionedModelThroughput",
        "bedrock:GetProvisionedModelThroughput",
        "bedrock:TagResource",
        "bedrock:UntagResource",
        "bedrock:ListTagsForResource"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": "iam:PassRole",
      "Resource": "arn:aws:iam::471529887547:role/AkiiExecutionRole"
    }
  ]
}
```

## Changes Made

### 1. Edge Function Changes

#### File: supabase/functions/super-action/aws.ts
- Updated the `createProvisionedModelThroughput` function to support tags
- Added support for custom instance names via `provisionedModelName` parameter
- Added automatic tagging with timestamp, source, and user ID
- Added support for custom tags via the `tags` parameter

#### File: supabase/functions/super-action/index.ts
- Added a function to extract the user ID from JWT token
- Modified the CreateProvisionedModelThroughput handler to:
  - Pass the extracted user ID to tag the instance
  - Support custom names for instances
  - Include all tags in the response object

### 2. Client-Side Changes

#### File: src/lib/supabase-bedrock-client.js
- Updated the `createInstance` function to accept and pass through:
  - `provisionedModelName` for custom instance naming
  - `tags` for adding custom tags to instances

#### File: src/pages/admin/SupabaseBedrock.tsx
- Added UI form field for custom instance name
- Updated the `handleProvisionInstance` function to use the custom name and add default tags

## How to Deploy

1. Authenticate with Supabase CLI:
   ```bash
   supabase login
   ```

2. Deploy the Edge Function:
   ```bash
   cd supabase/functions
   supabase functions deploy super-action
   ```

3. Update the IAM policy in AWS console to include the necessary permissions, especially:
   - `bedrock:TagResource`
   - `bedrock:UntagResource`
   - `bedrock:ListTagsForResource`

## Benefits

1. **User Tracking**: Automatically tag instances with the user ID who created them
2. **Custom Naming**: Allow users to name their instances for better identification
3. **Enhanced Organization**: Add tags for project organization and filtering in AWS console

## Viewing Tags in AWS Console

To view the tags applied to provisioned throughput instances:

1. Go to the AWS Bedrock console
2. Navigate to "Provisioned throughput"
3. Select an instance
4. Click on the "Tags" tab

This allows you to easily identify which Akii user created each instance. 