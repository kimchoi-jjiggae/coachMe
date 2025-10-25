const { createClient } = require('@supabase/supabase-js');

// Load configuration
const supabaseUrl = 'https://mzalbqlqedfwzltmsiqd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16YWxibHFiZWRmd3psdG1zaXFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NTg5MzYsImV4cCI6MjA3NjAzNDkzNn0.X9_SmptOJCNzXGGiwXUSSd8Ql6EKUhQYOY6nVVdv6UQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSupabase() {
    console.log('🔍 Checking Supabase database...\n');
    
    try {
        // Check if conversations table exists and get its structure
        console.log('1. Checking conversations table...');
        const { data: conversations, error: convError } = await supabase
            .from('conversations')
            .select('*')
            .limit(5);
        
        if (convError) {
            if (convError.message.includes('relation "conversations" does not exist')) {
                console.log('❌ conversations table does not exist');
                console.log('   You need to create the database tables first.');
            } else {
                console.log('❌ Error accessing conversations table:', convError.message);
            }
        } else {
            console.log(`✅ conversations table exists with ${conversations.length} entries`);
            if (conversations.length > 0) {
                console.log('   Sample entry:', conversations[0]);
            }
        }
        
        // Check if messages table exists
        console.log('\n2. Checking messages table...');
        const { data: messages, error: msgError } = await supabase
            .from('messages')
            .select('*')
            .limit(5);
        
        if (msgError) {
            if (msgError.message.includes('relation "messages" does not exist')) {
                console.log('❌ messages table does not exist');
            } else {
                console.log('❌ Error accessing messages table:', msgError.message);
            }
        } else {
            console.log(`✅ messages table exists with ${messages.length} entries`);
        }
        
        // Check what tables exist
        console.log('\n3. Checking available tables...');
        const { data: tables, error: tableError } = await supabase
            .rpc('get_table_names');
        
        if (tableError) {
            console.log('❌ Could not list tables:', tableError.message);
        } else {
            console.log('✅ Available tables:', tables);
        }
        
    } catch (error) {
        console.error('❌ Unexpected error:', error.message);
    }
}

checkSupabase();
