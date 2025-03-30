-- Create documents table for training data
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT,
  file_type TEXT,
  file_size INTEGER,
  status TEXT NOT NULL DEFAULT 'pending',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on documents
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create policy for documents
DROP POLICY IF EXISTS "Users can only see their own documents" ON documents;
CREATE POLICY "Users can only see their own documents"
ON documents FOR ALL
USING (auth.uid() = user_id);

-- Create document_chunks table for vector search
CREATE TABLE IF NOT EXISTS document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  embedding VECTOR(1536),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on document_chunks
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

-- Create policy for document_chunks
DROP POLICY IF EXISTS "Users can only see chunks of their documents" ON document_chunks;
CREATE POLICY "Users can only see chunks of their documents"
ON document_chunks FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM documents
    WHERE documents.id = document_chunks.document_id
    AND documents.user_id = auth.uid()
  )
);

-- Add realtime support
ALTER PUBLICATION supabase_realtime ADD TABLE documents;
ALTER PUBLICATION supabase_realtime ADD TABLE document_chunks;
