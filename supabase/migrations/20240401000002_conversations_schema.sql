-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Conversation',
  status TEXT NOT NULL DEFAULT 'active',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Create policy for conversations
DROP POLICY IF EXISTS "Users can only see their own conversations" ON conversations;
CREATE POLICY "Users can only see their own conversations"
ON conversations FOR ALL
USING (auth.uid() = user_id);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policy for messages
DROP POLICY IF EXISTS "Users can only see messages from their conversations" ON messages;
CREATE POLICY "Users can only see messages from their conversations"
ON messages FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND conversations.user_id = auth.uid()
  )
);

-- Add realtime support
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
