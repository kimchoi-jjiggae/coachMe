-- Supabase Database Schema for Voice Journal PWA
-- Run this SQL in your Supabase SQL Editor

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_date ON conversations(date);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);

-- Create full-text search index for content search
CREATE INDEX IF NOT EXISTS idx_messages_content_search ON messages USING gin(to_tsvector('english', content));

-- Enable Row Level Security (RLS)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies for user data isolation
-- Users can only access their own conversations
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (user_id = auth.uid()::text OR user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can insert own conversations" ON conversations
  FOR INSERT WITH CHECK (user_id = auth.uid()::text OR user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can update own conversations" ON conversations
  FOR UPDATE USING (user_id = auth.uid()::text OR user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can delete own conversations" ON conversations
  FOR DELETE USING (user_id = auth.uid()::text OR user_id = current_setting('app.current_user_id', true));

-- Messages policies
CREATE POLICY "Users can view messages for own conversations" ON messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE user_id = auth.uid()::text OR user_id = current_setting('app.current_user_id', true)
    )
  );

CREATE POLICY "Users can insert messages for own conversations" ON messages
  FOR INSERT WITH CHECK (
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE user_id = auth.uid()::text OR user_id = current_setting('app.current_user_id', true)
    )
  );

CREATE POLICY "Users can update messages for own conversations" ON messages
  FOR UPDATE USING (
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE user_id = auth.uid()::text OR user_id = current_setting('app.current_user_id', true)
    )
  );

CREATE POLICY "Users can delete messages for own conversations" ON messages
  FOR DELETE USING (
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE user_id = auth.uid()::text OR user_id = current_setting('app.current_user_id', true)
    )
  );

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_conversations_updated_at 
  BEFORE UPDATE ON conversations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a function for full-text search
CREATE OR REPLACE FUNCTION search_conversations(search_query TEXT, user_id_param TEXT)
RETURNS TABLE (
  conversation_id TEXT,
  title TEXT,
  date TIMESTAMP WITH TIME ZONE,
  content_preview TEXT,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as conversation_id,
    c.title,
    c.date,
    LEFT(m.content, 100) as content_preview,
    ts_rank(to_tsvector('english', m.content), plainto_tsquery('english', search_query)) as rank
  FROM conversations c
  JOIN messages m ON c.id = m.conversation_id
  WHERE c.user_id = user_id_param
    AND (
      to_tsvector('english', c.title) @@ plainto_tsquery('english', search_query)
      OR to_tsvector('english', m.content) @@ plainto_tsquery('english', search_query)
    )
  ORDER BY rank DESC, c.date DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON conversations TO anon, authenticated;
GRANT ALL ON messages TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE messages_id_seq TO anon, authenticated;
