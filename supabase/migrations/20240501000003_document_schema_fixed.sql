-- Fixed document schema with conflict resolution
-- Create documents table with proper IF NOT EXISTS checks
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    file_path TEXT,
    file_type TEXT,
    file_size BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS safely (fixing the incorrect rls_enabled check)
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see only their documents, safely checking if it exists first
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'documents' 
        AND policyname = 'Users can only see their own documents'
    ) THEN
        CREATE POLICY "Users can only see their own documents" 
        ON public.documents 
        FOR ALL 
        USING (auth.uid() = user_id);
    END IF;
END $$;

-- Document chunks table with proper existence checks
DO $$
DECLARE
    chunks_exist BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'document_chunks'
    ) INTO chunks_exist;
    
    IF NOT chunks_exist THEN
        -- Create chunks table only if it doesn't exist
        CREATE TABLE public.document_chunks (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
            content TEXT NOT NULL,
            metadata JSONB DEFAULT '{}'::jsonb,
            embedding VECTOR(1536),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Create an index on document_id for faster lookups
        CREATE INDEX IF NOT EXISTS document_chunks_document_id_idx ON public.document_chunks(document_id);
        
        -- Enable RLS
        ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
        
        -- Create policy that allows users to see only chunks of their documents
        CREATE POLICY "Users can only see chunks of their documents" 
        ON public.document_chunks 
        FOR ALL 
        USING (
            EXISTS (
                SELECT 1 FROM public.documents
                WHERE documents.id = document_chunks.document_id
                AND documents.user_id = auth.uid()
            )
        );
    
        -- Try to add table to realtime publication
        BEGIN
            -- Check if the table is already in the publication
            IF NOT EXISTS (
                SELECT 1 FROM pg_publication_tables 
                WHERE pubname = 'supabase_realtime' 
                AND schemaname = 'public' 
                AND tablename = 'document_chunks'
            ) THEN
                -- Add table to publication
                ALTER PUBLICATION supabase_realtime ADD TABLE document_chunks;
            END IF;
        EXCEPTION 
            WHEN OTHERS THEN
                RAISE NOTICE 'Error adding document_chunks to realtime: %', SQLERRM;
        END;
    END IF;
END $$; 