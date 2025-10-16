# Supabase Setup Guide

## 🚀 **Create a New Supabase Project**

### **Step 1: Go to Supabase**
1. **Visit**: https://supabase.com/dashboard
2. **Sign up/Login** with your account
3. **Click "New Project"**

### **Step 2: Create Project**
1. **Choose your organization**
2. **Enter project name**: `voice-journal`
3. **Enter database password** (save this!)
4. **Choose region** (closest to you)
5. **Click "Create new project"**

### **Step 3: Wait for Setup**
- **Takes 2-3 minutes** to set up
- **You'll see a progress bar**
- **Don't close the tab!**

### **Step 4: Get Your Credentials**
1. **Go to Settings → API**
2. **Copy the Project URL** (looks like: `https://your-project-id.supabase.co`)
3. **Copy the anon/public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### **Step 5: Create Database Tables**
1. **Go to SQL Editor**
2. **Click "New Query"**
3. **Paste this SQL**:

```sql
-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_message TEXT,
    ai_response TEXT,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
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

-- Create RLS policies (allow all operations for now)
CREATE POLICY "Allow all operations on conversations" ON conversations
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on messages" ON messages
    FOR ALL USING (true) WITH CHECK (true);
```

4. **Click "Run"**

### **Step 6: Update Your Configuration**
1. **Copy your new Project URL**
2. **Copy your new anon key**
3. **Update `env-config.js`** with the new credentials

---

## 🎯 **Quick Test**

After setup, test your new Supabase project:
1. **Go to**: https://kimchoi-jjiggae.github.io/coachMe/test-supabase-direct.html
2. **Update the URL and key** in the test page
3. **Run the test** to verify it works

---

## 🔧 **Alternative: Use Existing Project**

If you have an existing Supabase project:
1. **Go to your Supabase dashboard**
2. **Find your project**
3. **Go to Settings → API**
4. **Copy the correct URL and key**
5. **Update the configuration**

---

## 📱 **After Setup**

Once you have a working Supabase project:
1. **Update `env-config.js`** with your new credentials
2. **Commit and push** the changes
3. **Test your Voice Journal app** - it should now save to Supabase!

---

**Need help?** Let me know your new Supabase credentials and I'll update the configuration for you! 🚀✨
