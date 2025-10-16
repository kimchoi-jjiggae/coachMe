-- Fix RLS policies for Voice Journal
-- Run this in your Supabase SQL Editor

-- First, check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'conversations';

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations on conversations" ON conversations;
DROP POLICY IF EXISTS "Allow all operations" ON conversations;

-- Create a simple policy that allows all operations
CREATE POLICY "Allow all operations on conversations" ON conversations
    FOR ALL USING (true) WITH CHECK (true);

-- Also check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'conversations';

-- If RLS is too restrictive, we can temporarily disable it for testing
-- (Only do this if the policy above doesn't work)
-- ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;

-- Test the policy by trying to insert a test record
INSERT INTO conversations (id, user_id, user_message, ai_response, date, created_at, updated_at)
VALUES (
    'test_policy_' || extract(epoch from now()),
    'test_user',
    'Testing RLS policy',
    '',
    now(),
    now(),
    now()
);

-- Check if the test record was inserted
SELECT * FROM conversations WHERE id LIKE 'test_policy_%';

-- Clean up test record
DELETE FROM conversations WHERE id LIKE 'test_policy_%';
