-- Create document_chunks table if it doesn't exist
CREATE TABLE IF NOT EXISTS document_chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES training_documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::JSONB,
  embedding VECTOR(1536),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view their own document chunks" ON document_chunks;
CREATE POLICY "Users can view their own document chunks"
  ON document_chunks
  FOR SELECT
  USING (
    document_id IN (
      SELECT id FROM training_documents WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert their own document chunks" ON document_chunks;
CREATE POLICY "Users can insert their own document chunks"
  ON document_chunks
  FOR INSERT
  WITH CHECK (
    document_id IN (
      SELECT id FROM training_documents WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their own document chunks" ON document_chunks;
CREATE POLICY "Users can update their own document chunks"
  ON document_chunks
  FOR UPDATE
  USING (
    document_id IN (
      SELECT id FROM training_documents WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete their own document chunks" ON document_chunks;
CREATE POLICY "Users can delete their own document chunks"
  ON document_chunks
  FOR DELETE
  USING (
    document_id IN (
      SELECT id FROM training_documents WHERE user_id = auth.uid()
    )
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS document_chunks_document_id_idx ON document_chunks(document_id);

-- Enable realtime safely using a DO block
DO $$
BEGIN
  -- Check if the table is already in the publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND schemaname = 'public'
    AND tablename = 'document_chunks'
  ) THEN
    -- Add table to publication
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE document_chunks';
  END IF;
END $$;
