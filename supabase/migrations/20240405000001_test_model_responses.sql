-- Create a function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the test_model_responses table
CREATE TABLE IF NOT EXISTS test_model_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tier TEXT NOT NULL,
    model_id TEXT NOT NULL,
    latency INTEGER NOT NULL,
    tokens_used INTEGER NOT NULL,
    response_preview TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_test_model_responses_updated_at ON test_model_responses;
CREATE TRIGGER update_test_model_responses_updated_at
BEFORE UPDATE ON test_model_responses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Add RLS policies
ALTER TABLE test_model_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all test responses" ON test_model_responses;
CREATE POLICY "Admins can view all test responses"
ON test_model_responses FOR SELECT
USING (auth.jwt() ? 'role' AND auth.jwt()->>'role' = 'admin');

DROP POLICY IF EXISTS "Admins can insert test responses" ON test_model_responses;
CREATE POLICY "Admins can insert test responses"
ON test_model_responses FOR INSERT
WITH CHECK (auth.jwt() ? 'role' AND auth.jwt()->>'role' = 'admin');

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE test_model_responses;
