-- Fix existing Supabase schema for Voice Journal
-- Run this in your Supabase SQL Editor

-- First, let's see what columns exist in the conversations table
-- (This is just for reference, don't run this)
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'conversations';

-- Add missing columns to conversations table
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS user_id TEXT,
ADD COLUMN IF NOT EXISTS user_message TEXT,
ADD COLUMN IF NOT EXISTS ai_response TEXT,
ADD COLUMN IF NOT EXISTS date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- If the table doesn't exist at all, create it
CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id TEXT REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('user', 'assistant')) NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);

-- Enable Row Level Security (RLS)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and create new ones
DROP POLICY IF EXISTS "Allow all operations on conversations" ON conversations;
DROP POLICY IF EXISTS "Allow all operations on messages" ON messages;

-- Create RLS policies (allow all operations for now)
CREATE POLICY "Allow all operations on conversations" ON conversations
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on messages" ON messages
    FOR ALL USING (true);
