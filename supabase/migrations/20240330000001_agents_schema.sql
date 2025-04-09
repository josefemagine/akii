-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create agents table
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  industry TEXT,
  behavior_settings JSONB DEFAULT '{}'::jsonb,
  response_style JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  version INT DEFAULT 1,
  parent_id UUID REFERENCES public.agents(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create agent_platforms table for integration settings
CREATE TABLE IF NOT EXISTS public.agent_platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  platform_type TEXT NOT NULL, -- 'web', 'mobile', 'whatsapp', 'telegram', 'shopify', 'wordpress'
  settings JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(agent_id, platform_type)
);

-- Create training_documents table
CREATE TABLE IF NOT EXISTS public.training_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT,
  file_type TEXT,
  file_size INT,
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create document_chunks table for processed document chunks
CREATE TABLE IF NOT EXISTS public.document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.training_documents(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  embedding VECTOR(1536),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create agent_documents junction table
CREATE TABLE IF NOT EXISTS public.agent_documents (
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  document_id UUID REFERENCES public.training_documents(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  PRIMARY KEY (agent_id, document_id)
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id),
  external_user_id TEXT,
  platform TEXT NOT NULL, -- 'web', 'mobile', 'whatsapp', 'telegram', 'shopify', 'wordpress'
  metadata JSONB DEFAULT '{}'::jsonb,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_type TEXT NOT NULL, -- 'user', 'agent', 'system'
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Agents policies
DROP POLICY IF EXISTS "Users can view their own agents" ON public.agents;
CREATE POLICY "Users can view their own agents"
  ON public.agents
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own agents" ON public.agents;
CREATE POLICY "Users can create their own agents"
  ON public.agents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own agents" ON public.agents;
CREATE POLICY "Users can update their own agents"
  ON public.agents
  FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own agents" ON public.agents;
CREATE POLICY "Users can delete their own agents"
  ON public.agents
  FOR DELETE
  USING (auth.uid() = user_id);

-- Agent platforms policies
DROP POLICY IF EXISTS "Users can view their own agent platforms" ON public.agent_platforms;
CREATE POLICY "Users can view their own agent platforms"
  ON public.agent_platforms
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.agents
      WHERE agents.id = agent_platforms.agent_id
      AND agents.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create their own agent platforms" ON public.agent_platforms;
CREATE POLICY "Users can create their own agent platforms"
  ON public.agent_platforms
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.agents
      WHERE agents.id = agent_platforms.agent_id
      AND agents.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their own agent platforms" ON public.agent_platforms;
CREATE POLICY "Users can update their own agent platforms"
  ON public.agent_platforms
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.agents
      WHERE agents.id = agent_platforms.agent_id
      AND agents.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete their own agent platforms" ON public.agent_platforms;
CREATE POLICY "Users can delete their own agent platforms"
  ON public.agent_platforms
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.agents
      WHERE agents.id = agent_platforms.agent_id
      AND agents.user_id = auth.uid()
    )
  );

-- Training documents policies
DROP POLICY IF EXISTS "Users can view their own training documents" ON public.training_documents;
CREATE POLICY "Users can view their own training documents"
  ON public.training_documents
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own training documents" ON public.training_documents;
CREATE POLICY "Users can create their own training documents"
  ON public.training_documents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own training documents" ON public.training_documents;
CREATE POLICY "Users can update their own training documents"
  ON public.training_documents
  FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own training documents" ON public.training_documents;
CREATE POLICY "Users can delete their own training documents"
  ON public.training_documents
  FOR DELETE
  USING (auth.uid() = user_id);

-- Document chunks policies
DROP POLICY IF EXISTS "Users can view their own document chunks" ON public.document_chunks;
CREATE POLICY "Users can view their own document chunks"
  ON public.document_chunks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.training_documents
      WHERE training_documents.id = document_chunks.document_id
      AND training_documents.user_id = auth.uid()
    )
  );

-- Agent documents policies
DROP POLICY IF EXISTS "Users can view their own agent documents" ON public.agent_documents;
CREATE POLICY "Users can view their own agent documents"
  ON public.agent_documents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.agents
      WHERE agents.id = agent_documents.agent_id
      AND agents.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create their own agent documents" ON public.agent_documents;
CREATE POLICY "Users can create their own agent documents"
  ON public.agent_documents
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.agents
      WHERE agents.id = agent_documents.agent_id
      AND agents.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete their own agent documents" ON public.agent_documents;
CREATE POLICY "Users can delete their own agent documents"
  ON public.agent_documents
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.agents
      WHERE agents.id = agent_documents.agent_id
      AND agents.user_id = auth.uid()
    )
  );

-- Conversations policies
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
CREATE POLICY "Users can view their own conversations"
  ON public.conversations
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.agents
      WHERE agents.id = conversations.agent_id
      AND agents.user_id = auth.uid()
    )
  );

-- Messages policies
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
CREATE POLICY "Users can view their own messages"
  ON public.messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND (
        conversations.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.agents
          WHERE agents.id = conversations.agent_id
          AND agents.user_id = auth.uid()
        )
      )
    )
  );

-- Enable realtime for all tables
alter publication supabase_realtime add table public.agents;
alter publication supabase_realtime add table public.agent_platforms;
alter publication supabase_realtime add table public.training_documents;
alter publication supabase_realtime add table public.document_chunks;
alter publication supabase_realtime add table public.agent_documents;
alter publication supabase_realtime add table public.conversations;
alter publication supabase_realtime add table public.messages;

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for updating timestamps
DROP TRIGGER IF EXISTS update_agents_updated_at ON public.agents;
CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_agent_platforms_updated_at ON public.agent_platforms;
CREATE TRIGGER update_agent_platforms_updated_at
  BEFORE UPDATE ON public.agent_platforms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_training_documents_updated_at ON public.training_documents;
CREATE TRIGGER update_training_documents_updated_at
  BEFORE UPDATE ON public.training_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();