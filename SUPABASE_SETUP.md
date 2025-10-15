# 🗄️ Supabase Setup Guide for Voice Journal PWA

This guide will help you set up Supabase to store your journal entries in the cloud, allowing you to access them from any device.

## 🚀 **Step 1: Create a Supabase Project**

1. **Go to [Supabase](https://supabase.com/)**
2. **Sign up/Login** with your GitHub account
3. **Click "New Project"**
4. **Fill in project details:**
   - Organization: Choose or create one
   - Project name: `voice-journal-pwa`
   - Database password: Create a strong password
   - Region: Choose closest to you
5. **Click "Create new project"**
6. **Wait for setup to complete** (2-3 minutes)

## 🗃️ **Step 2: Set Up Database Schema**

1. **Go to your project dashboard**
2. **Click "SQL Editor"** in the left sidebar
3. **Click "New query"**
4. **Copy and paste the contents of `supabase-schema.sql`** into the editor
5. **Click "Run"** to execute the SQL

This will create:
- `conversations` table for storing journal entries
- `messages` table for storing individual messages
- Proper indexes and security policies

## 🔑 **Step 3: Get Your API Keys**

1. **Go to "Settings" → "API"** in your project
2. **Copy the following values:**
   - **Project URL** (looks like: `https://your-project.supabase.co`)
   - **Anon/Public Key** (starts with `eyJ...`)

## ⚙️ **Step 4: Configure the App**

1. **Open your Voice Journal app**
2. **Click Settings (⚙️)**
3. **Enter your Supabase credentials:**
   - **Supabase URL**: Paste your Project URL
   - **Supabase Anon Key**: Paste your Anon/Public Key
4. **Click "Save Settings"**

## ✅ **Step 5: Test Cloud Sync**

1. **Create a new journal entry** by talking or typing
2. **Check the journal entries sidebar** - you should see a ☁️ cloud icon
3. **Open the app on another device** - your entries should sync!

## 🔒 **Security Features**

- **Row Level Security (RLS)** enabled
- **User isolation** - each device gets a unique user ID
- **Data encryption** in transit and at rest
- **No personal data** stored - only journal content

## 📱 **Multi-Device Sync**

Your journal entries will automatically sync across:
- ✅ **Desktop browsers**
- ✅ **Mobile browsers** 
- ✅ **PWA installations**
- ✅ **Different devices**

## 🛠️ **Troubleshooting**

### **"Supabase connection failed"**
- Check your URL and API key are correct
- Ensure your project is active
- Try refreshing the page

### **"No cloud sync icon"**
- Verify Supabase credentials in settings
- Check browser console for errors
- Ensure database schema is set up correctly

### **"Data not syncing"**
- Check your internet connection
- Verify Supabase project is not paused
- Try clearing browser cache and re-entering credentials

## 🎯 **Benefits of Cloud Sync**

- **📱 Access from any device** - your journal follows you
- **🔄 Real-time sync** - changes appear instantly
- **🔍 Powerful search** - find entries across all devices
- **💾 Backup protection** - never lose your thoughts
- **⚡ Offline support** - works even without internet

## 📊 **Database Structure**

```
conversations
├── id (TEXT) - Unique conversation ID
├── user_id (TEXT) - Device-specific user ID
├── date (TIMESTAMP) - When the conversation happened
├── title (TEXT) - Auto-generated title
└── created_at (TIMESTAMP) - When saved to cloud

messages
├── id (SERIAL) - Auto-incrementing ID
├── conversation_id (TEXT) - Links to conversation
├── role (TEXT) - 'user' or 'assistant'
├── content (TEXT) - The actual message
└── timestamp (TIMESTAMP) - When the message was sent
```

## 🚀 **Advanced Features**

### **Full-Text Search**
- Search across all your journal entries
- Find conversations by keywords
- Search works across all devices

### **Data Export**
- Export your journal data as JSON
- Download conversations for backup
- Import data to other systems

### **Privacy Controls**
- All data is encrypted
- No personal information stored
- User isolation ensures privacy
- GDPR compliant

---

**🎉 You're all set! Your Voice Journal now has cloud sync capabilities!**

Your journal entries will be safely stored in the cloud and accessible from any device where you install the PWA.
