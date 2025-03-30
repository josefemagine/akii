-- Add foreign key constraint to messages table referencing agents table
ALTER TABLE messages
ADD COLUMN agent_id UUID REFERENCES agents(id);

-- Create index for better performance
CREATE INDEX idx_messages_agent_id ON messages(agent_id);
