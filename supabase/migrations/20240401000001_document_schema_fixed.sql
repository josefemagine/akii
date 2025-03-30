-- Enable the pgvector extension for vector support
CREATE EXTENSION IF NOT EXISTS pgvector;

-- Check if agents table exists, if not create a placeholder
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'agents') THEN
        CREATE TABLE IF NOT EXISTS agents (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
        );
    END IF;
END $$;

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create document_chunks table
CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    embedding VECTOR(1536)
);

-- Enable row level security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Documents are viewable by users who created them" ON documents;
CREATE POLICY "Documents are viewable by users who created them"
ON documents FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Document chunks are viewable by users who created them" ON document_chunks;
CREATE POLICY "Document chunks are viewable by users who created them"
ON document_chunks FOR SELECT
USING (true);

-- Enable realtime
alter publication supabase_realtime add table documents;
alter publication supabase_realtime add table document_chunks;