// Test Supabase connection and create tables if needed
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mzalbqlqedfwzltmsiqd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16YWxibHFiZWRmd3psdG1zaXFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NTg5MzYsImV4cCI6MjA3NjAzNDkzNn0.X9_SmptOJCNzXGGiwXUSSd8Ql6EKUhQYOY6nVVdv6UQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabase() {
    console.log('🔍 Testing Supabase connection...');
    
    try {
        // Test connection
        const { data, error } = await supabase.from('conversations').select('count').limit(1);
        
        if (error) {
            console.log('❌ Error accessing conversations table:', error.message);
            
            if (error.message.includes('relation "conversations" does not exist')) {
                console.log('📝 Creating conversations table...');
                await createTables();
            }
        } else {
            console.log('✅ Supabase connection successful!');
            console.log('📊 Conversations count:', data.length);
        }
        
        // Test inserting a sample conversation
        console.log('🧪 Testing conversation insertion...');
        const testConversation = {
            id: 'test-' + Date.now(),
            user_message: 'Test message from setup script',
            ai_response: 'This is a test response to verify Supabase is working.',
            date: new Date().toISOString(),
            created_at: new Date().toISOString()
        };
        
        const { data: insertData, error: insertError } = await supabase
            .from('conversations')
            .insert([testConversation]);
            
        if (insertError) {
            console.log('❌ Error inserting test conversation:', insertError.message);
        } else {
            console.log('✅ Test conversation inserted successfully!');
            
            // Clean up test data
            await supabase.from('conversations').delete().eq('id', testConversation.id);
            console.log('🧹 Test data cleaned up');
        }
        
    } catch (error) {
        console.error('❌ Supabase test failed:', error.message);
    }
}

async function createTables() {
    console.log('🔨 Creating database tables...');
    
    // Note: This would typically be done through Supabase SQL editor
    // For now, we'll just log the SQL that needs to be run
    const sql = `
-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create journal_entries table  
CREATE TABLE IF NOT EXISTS journal_entries (
    id TEXT PRIMARY KEY,
    conversation_id TEXT REFERENCES conversations(id),
    content TEXT NOT NULL,
    entry_type TEXT CHECK (entry_type IN ('user', 'assistant')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_date ON conversations(date);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_journal_entries_conversation_id ON journal_entries(conversation_id);
    `;
    
    console.log('📋 Please run this SQL in your Supabase SQL Editor:');
    console.log('=' .repeat(50));
    console.log(sql);
    console.log('=' .repeat(50));
    console.log('🌐 Go to: https://supabase.com/dashboard/project/mzalbqlqedfwzltmsiqd/sql');
}

testSupabase();

