# AWS Bedrock Integration with Supabase Edge Functions

This project demonstrates the integration of AWS Bedrock with a React application using Supabase Edge Functions. The integration allows for provisioning and managing AWS Bedrock model throughput instances through a secure and scalable backend.

## Architecture

The solution consists of three main components:

1. **Frontend React Application**: Provides a user interface for managing AWS Bedrock instances.
2. **Supabase Edge Functions**: Serverless functions that handle AWS Bedrock API operations.
3. **Supabase Database**: Stores metadata about provisioned AWS Bedrock instances.

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
   - `BEDROCK_API_KEY`: Custom API key for securing your edge functions

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
   supabase functions deploy bedrock
   ```

### 3. Configure the Frontend

1. Set the following environment variables in your frontend application:
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_BEDROCK_API_KEY=your-custom-api-key
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

## Usage

1. Navigate to the admin section of your application
2. Select "Supabase Bedrock" from the sidebar
3. Use the interface to:
   - View existing Bedrock model instances
   - Provision new instances by selecting a plan
   - Delete instances when they are no longer needed
   - Test your environment configuration

## API Endpoints

The Supabase Edge Function exposes the following endpoints:

- `GET /bedrock/instances`: List all provisioned Bedrock instances
- `POST /bedrock/provision-instance`: Create a new Bedrock instance
- `DELETE /bedrock/delete-instance`: Delete an existing Bedrock instance
- `GET /bedrock/test-env`: Diagnostic endpoint for environment configuration

## Security

- All edge function endpoints are protected with API key authentication
- Supabase Row-Level Security (RLS) policies protect the database table
- AWS credentials are securely stored as Supabase secrets and not exposed to the client

## Troubleshooting

If you encounter issues with the integration:

1. Use the "Test Environment" button to check your configuration
2. Verify that your AWS credentials have the necessary permissions for Bedrock
3. Check the browser console and Supabase function logs for error messages
4. Ensure your Supabase URL and API keys are correctly configured

## License

This project is licensed under the MIT License - see the LICENSE file for details. 