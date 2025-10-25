// Environment Configuration for Voice Journal
// This file contains environment variables for deployment

// You can set these as environment variables in your deployment platform
// or update the values directly in this file for GitHub Pages

const ENV_CONFIG = {
    // OpenAI Configuration
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || 'your_openai_api_key_here',

    // Supabase Configuration - Replace with your actual credentials
    SUPABASE_URL: process.env.SUPABASE_URL || 'https://mzalblqbedfwzltmsiqd.supabase.co',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16YWxibHFiZWRmd3psdG1zaXFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NTg5MzYsImV4cCI6MjA3NjAzNDkzNn0.X9_SmptOJCNzXGGiwXUSSd8Ql6EKUhQYOY6nVVdv6UQ',

    // App Settings
    AUTO_START_VOICE: process.env.AUTO_START_VOICE === 'true' || false,
    AUTO_SAVE_CONVERSATIONS: process.env.AUTO_SAVE_CONVERSATIONS !== 'false'
};

// Make it available globally
if (typeof window !== 'undefined') {
    window.ENV_CONFIG = ENV_CONFIG;
    // Also set as the primary config for compatibility
    window.MY_KEYS = ENV_CONFIG;
    window.PRODUCTION_CONFIG = ENV_CONFIG;
    
    // Debug logging
    console.log('ENV_CONFIG loaded:', ENV_CONFIG);
    console.log('Supabase URL:', ENV_CONFIG.SUPABASE_URL);
    console.log('Supabase Key:', ENV_CONFIG.SUPABASE_ANON_KEY ? 'Present' : 'Missing');
}
