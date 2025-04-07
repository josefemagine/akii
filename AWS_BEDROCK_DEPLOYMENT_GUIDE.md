# AWS Bedrock Provisioned Throughput Deployment Guide

This guide documents how to set up and deploy AWS Bedrock provisioned throughput in your Akii application.

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
      "Resource": "arn:aws:iam::*:role/AkiiExecutionRole"
    }
  ]
}
```

## Features Implemented

### 1. Automatic User ID Tagging

When creating a provisioned throughput instance, the user's Akii ID is automatically extracted from the JWT token and added as a tag to the AWS resource. This allows easy identification of which user created the instance.

### 2. Custom Instance Naming

Users can now provide a custom name for the provisioned throughput instance. If no name is provided, a default name will be generated in the format: `akii-pmt-[timestamp]`.

### 3. Enhanced Tagging System

The following tags are automatically applied to all provisioned throughput instances:

- **CreatedBy**: "AkiiApp"
- **CreatedAt**: ISO timestamp of creation
- **Source**: "akii-super-action"
- **userId**: The Akii user ID who created the instance (when available)

Additionally, users can provide custom tags via the `tags` parameter.

## API Usage

### Creating a Provisioned Throughput Instance

```javascript
const result = await BedrockClient.callEdgeFunctionDirect({
  action: "CreateProvisionedModelThroughput",
  data: {
    modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
    provisionedModelName: "my-custom-instance-name", // Optional, defaults to auto-generated name
    commitmentDuration: "ONE_MONTH",
    modelUnits: 1,
    tags: {                                          // Optional custom tags
      project: "customer-service",
      environment: "production"
    }
  }
});
```

## Deploying the Updated Edge Function

To deploy the updated Edge Function with these features:

1. Ensure your Supabase project has the correct environment variables set:
   - `AWS_REGION`
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

2. Deploy the Edge Function:
   ```bash
   cd supabase/functions
   supabase functions deploy super-action
   ```

## Troubleshooting

### Common Issues

1. **IAM Policy Errors**: If you encounter `AccessDenied` errors, ensure your IAM policy includes all the permissions listed above.

2. **User ID Not Being Tagged**: Verify that:
   - The client is sending a valid JWT token in the request
   - The Edge Function has access to the Supabase URL and service role key

3. **Tag Limitations**: AWS has a limit of 50 tags per resource. Keep this in mind when adding custom tags.

4. **Region Support**: Not all regions support all Bedrock models or provisioned throughput. Check the AWS documentation for region-specific limitations.

## Viewing Tagged Resources in AWS Console

To view the tags applied to your provisioned throughput instances:

1. Go to the AWS Bedrock console
2. Navigate to "Provisioned throughput"
3. Select the instance
4. Click on the "Tags" tab

This allows you to easily identify which user created each instance and filter instances by user ID or other tag values. 