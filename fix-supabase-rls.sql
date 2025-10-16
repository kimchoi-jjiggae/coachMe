-- Fix Supabase RLS policies for Voice Journal
-- Run this in your Supabase SQL Editor

-- Check current RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'conversations';

-- Check existing policies
SELECT policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'conversations';

-- Drop any existing policies
DROP POLICY IF EXISTS "Allow all operations on conversations" ON conversations;
DROP POLICY IF EXISTS "Allow all operations" ON conversations;
DROP POLICY IF EXISTS "Users can view their own conversations." ON conversations;
DROP POLICY IF EXISTS "Users can insert their own conversations." ON conversations;
DROP POLICY IF EXISTS "Users can update their own conversations." ON conversations;
DROP POLICY IF EXISTS "Users can delete their own conversations." ON conversations;

-- Create a simple policy that allows all operations
CREATE POLICY "Allow all operations on conversations" ON conversations
    FOR ALL USING (true) WITH CHECK (true);

-- Test the policy with a simple insert
INSERT INTO conversations (id, user_id, user_message, ai_response, date, created_at, updated_at)
VALUES (
    'test_rls_' || extract(epoch from now()),
    'test_user',
    'Testing RLS policy fix',
    '',
    now(),
    now(),
    now()
);

-- Check if the test record was inserted
SELECT * FROM conversations WHERE id LIKE 'test_rls_%' ORDER BY created_at DESC LIMIT 1;

-- If the above works, clean up the test record
DELETE FROM conversations WHERE id LIKE 'test_rls_%';
