-- Create documents table
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

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see only their documents
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

-- Document chunks table (already exists from agents schema)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'document_chunks'
    ) THEN
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
    
        -- Enable realtime
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE document_chunks;
        EXCEPTION 
            WHEN duplicate_object THEN 
                NULL; -- Do nothing, table already in publication
        END;
    END IF;
END $$;
