-- Drop the table if it exists to ensure a clean start
DROP TABLE IF EXISTS bedrock_instances;

-- Create a table for storing AWS Bedrock provisioned model instances
CREATE TABLE bedrock_instances (
  id SERIAL PRIMARY KEY,
  instance_id TEXT NOT NULL UNIQUE,
  model_id TEXT NOT NULL,
  commitment_duration TEXT NOT NULL,
  model_units INTEGER NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create index on instance_id for faster lookups
CREATE INDEX bedrock_instances_instance_id_idx ON bedrock_instances (instance_id);

-- Create RLS policies for the table
ALTER TABLE bedrock_instances ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "Enable read access for all authenticated users"
  ON bedrock_instances
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow insert/update/delete for authenticated users with service role
CREATE POLICY "Enable full access for service role"
  ON bedrock_instances
  USING (auth.jwt() ->> 'role' = 'service_role');