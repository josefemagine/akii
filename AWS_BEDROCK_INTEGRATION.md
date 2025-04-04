# AWS Bedrock Integration

This document outlines how to set up and use the AWS Bedrock integration with Akii.

## Overview

The Bedrock integration allows you to provision and manage actual AWS Bedrock model throughput units directly from the Akii admin dashboard. This integration uses AWS SDK to communicate with AWS Bedrock API to create, list, and delete Bedrock instances.

## Prerequisites

Before you can use the AWS Bedrock integration, you need to:

1. Have an AWS account with access to Bedrock service
2. Create IAM credentials with permissions to manage Bedrock resources
3. Set up the required environment variables in Vercel

## Required Environment Variables

Set the following environment variables in your Vercel project:

- `AWS_ACCESS_KEY_ID`: Your AWS access key with Bedrock permissions
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret access key
- `AWS_REGION`: The AWS region where Bedrock is available (e.g., `us-east-1`) - **Important**: Use a hardcoded value (not a variable reference) to avoid interpolation issues
- `BEDROCK_API_KEY`: Your API key for authenticating requests to the Bedrock API

## Environment Variable Configuration

When setting up AWS environment variables in Vercel, ensure you're using hardcoded values for the AWS region rather than variable references. 

For example, in `vercel.json`:

```json
"env": {
  "AWS_REGION": "us-east-1",  // Use a direct value, not ${AWS_REGION}
  "AWS_ACCESS_KEY_ID": "${AWS_ACCESS_KEY_ID}",
  "AWS_SECRET_ACCESS_KEY": "${AWS_SECRET_ACCESS_KEY}",
  // other environment variables
}
```

This prevents issues with variable interpolation in the deployed environment.

## IAM Permissions

The AWS credentials used need the following permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:ListProvisionedModelThroughputs",
        "bedrock:CreateProvisionedModelThroughput",
        "bedrock:DeleteProvisionedModelThroughput",
        "bedrock:GetProvisionedModelThroughput"
      ],
      "Resource": "*"
    }
  ]
}
```

## How It Works

The Bedrock integration consists of:

1. `aws-utils.js`: Core functions to interact with AWS Bedrock API
2. `db-utils.js`: Database integration to sync AWS Bedrock instances with the database
3. `env-utils.js`: Utilities for accessing environment variables consistently across environments
4. API endpoints that use these utilities to manage instances

### Throughput Levels

The integration supports three throughput levels:

- **Starter**: 1 unit of throughput, ideal for testing and development
- **Pro**: 2 units of throughput, suitable for moderate production use
- **Business**: 5 units of throughput, designed for higher demand scenarios

Each throughput level is provisioned with a monthly commitment.

### Model Support

Currently, the integration supports:

- Amazon Titan Text Lite (amazon.titan-text-lite-v1)
- Amazon Titan Text Express (amazon.titan-text-express-v1)
- Anthropic Claude Instant (anthropic.claude-instant-v1)
- Anthropic Claude v2 (anthropic.claude-v2)

## Fallback Mechanisms

If AWS credentials are not available or there are issues with the AWS API:

1. The system will fallback to using the database to track instances
2. If both AWS and database are unavailable, mock instances will be displayed

This ensures that the application continues to function even without proper AWS configuration.

## Deployment Checklist

Before deploying to production:

1. Add all required AWS environment variables to Vercel:
   - Use a hardcoded region value (e.g., `us-east-1`)
   - Ensure both access key and secret access key are set
2. Test creating, listing, and deleting instances
3. Verify that instances appear in the AWS Bedrock console
4. Check the logs for any errors in the AWS integration

## Troubleshooting

### Common Issues

- **AWS Credentials**: Ensure your AWS credentials have the correct permissions
- **Region**: Use a region where Bedrock is available (e.g., `us-east-1`)
- **Quotas**: Check your AWS account quota limits for Bedrock resources
- **Logs**: Review application logs for AWS-specific error messages

### Variable Interpolation Errors

If you see errors like `getaddrinfo ENOTFOUND bedrock.${aws_region}.amazonaws.com`, it means the AWS_REGION environment variable isn't being properly resolved. To fix this:

1. Use a hardcoded region value in your `vercel.json` file (not a variable reference)
2. Check the logs using `vercel logs` to verify the environment variables are available
3. Use the environment utility functions in `env-utils.js` to access environment variables

### Mock Data Appearing Despite AWS Credentials

If you are seeing mock instances instead of real AWS Bedrock instances:

1. Check if your AWS credentials have the correct permissions
2. Verify that the AWS region you're using has Bedrock available
3. Look for any AWS-specific errors in the logs
4. Ensure you're not hitting any AWS Bedrock service quotas or limits

## Best Practices

- Monitor your AWS Bedrock usage and costs
- Delete unused instances to avoid unnecessary billing
- Use the lowest throughput level that meets your needs
- Consider throttling or rate limiting instance creation in high-traffic scenarios
- Always use the environment utility functions when accessing environment variables 