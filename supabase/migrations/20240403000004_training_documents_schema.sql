-- Enable the pgvector extension for vector support safely
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'vector'
  ) THEN
    CREATE EXTENSION vector;
  END IF;
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Insufficient privilege to create vector extension, continuing...';
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating vector extension: %', SQLERRM;
END $$;

-- Create training_documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS training_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT,
  file_type TEXT,
  file_size INTEGER,
  status TEXT NOT NULL DEFAULT 'pending',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE training_documents ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view their own documents" ON training_documents;
CREATE POLICY "Users can view their own documents"
  ON training_documents
  FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own documents" ON training_documents;
CREATE POLICY "Users can insert their own documents"
  ON training_documents
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own documents" ON training_documents;
CREATE POLICY "Users can update their own documents"
  ON training_documents
  FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own documents" ON training_documents;
CREATE POLICY "Users can delete their own documents"
  ON training_documents
  FOR DELETE
  USING (user_id = auth.uid());

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS training_documents_user_id_idx ON training_documents(user_id);

-- Enable realtime safely
DO $$
BEGIN
  -- Check if the table is already in the publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'training_documents'
  ) THEN
    -- Add table to publication
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE training_documents';
  END IF;
END $$;

-- Create training_document_tags table if it doesn't exist
CREATE TABLE IF NOT EXISTS training_document_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, user_id)
);

-- Enable row level security
ALTER TABLE training_document_tags ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view their own document tags" ON training_document_tags;
CREATE POLICY "Users can view their own document tags"
  ON training_document_tags
  FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own document tags" ON training_document_tags;
CREATE POLICY "Users can insert their own document tags"
  ON training_document_tags
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own document tags" ON training_document_tags;
CREATE POLICY "Users can update their own document tags"
  ON training_document_tags
  FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own document tags" ON training_document_tags;
CREATE POLICY "Users can delete their own document tags"
  ON training_document_tags
  FOR DELETE
  USING (user_id = auth.uid());

-- Create document_tag_relations table for many-to-many relationship
CREATE TABLE IF NOT EXISTS document_tag_relations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES training_documents(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES training_document_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(document_id, tag_id)
);

-- Enable row level security
ALTER TABLE document_tag_relations ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view their own document tag relations" ON document_tag_relations;
CREATE POLICY "Users can view their own document tag relations"
  ON document_tag_relations
  FOR SELECT
  USING (
    document_id IN (
      SELECT id FROM training_documents WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert their own document tag relations" ON document_tag_relations;
CREATE POLICY "Users can insert their own document tag relations"
  ON document_tag_relations
  FOR INSERT
  WITH CHECK (
    document_id IN (
      SELECT id FROM training_documents WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete their own document tag relations" ON document_tag_relations;
CREATE POLICY "Users can delete their own document tag relations"
  ON document_tag_relations
  FOR DELETE
  USING (
    document_id IN (
      SELECT id FROM training_documents WHERE user_id = auth.uid()
    )
  );

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS document_tag_relations_document_id_idx ON document_tag_relations(document_id);
CREATE INDEX IF NOT EXISTS document_tag_relations_tag_id_idx ON document_tag_relations(tag_id);

-- Enable realtime for new tables safely
DO $$
BEGIN
  -- Check if training_document_tags is already in the publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'training_document_tags'
  ) THEN
    -- Add table to publication
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE training_document_tags';
  END IF;
  
  -- Check if document_tag_relations is already in the publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'document_tag_relations'
  ) THEN
    -- Add table to publication
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE document_tag_relations';
  END IF;
END $$;
