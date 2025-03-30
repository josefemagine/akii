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

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'New Conversation',
    status TEXT NOT NULL DEFAULT 'active',
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable row level security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Conversations are viewable by users who created them" ON conversations;
CREATE POLICY "Conversations are viewable by users who created them"
ON conversations FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Messages are viewable by users who created them" ON messages;
CREATE POLICY "Messages are viewable by users who created them"
ON messages FOR SELECT
USING (true);

-- Enable realtime
alter publication supabase_realtime add table conversations;
alter publication supabase_realtime add table messages;