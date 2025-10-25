// Environment Configuration for Voice Journal
// This file contains environment variables for deployment

// You can set these as environment variables in your deployment platform
// or update the values directly in this file for GitHub Pages

const ENV_CONFIG = {
    // OpenAI Configuration - Now handled server-side for security
    // OPENAI_API_KEY: 'handled-server-side',

    // Supabase Configuration - Replace with your actual credentials
    SUPABASE_URL: (typeof process !== 'undefined' && process.env.SUPABASE_URL) || 'https://mzalblqbedfwzltmsiqd.supabase.co',
    SUPABASE_ANON_KEY: (typeof process !== 'undefined' && process.env.SUPABASE_ANON_KEY) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16YWxibHFiZWRmd3psdG1zaXFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NTg5MzYsImV4cCI6MjA3NjAzNDkzNn0.X9_SmptOJCNzXGGiwXUSSd8Ql6EKUhQYOY6nVVdv6UQ',

    // App Settings
    AUTO_START_VOICE: (typeof process !== 'undefined' && process.env.AUTO_START_VOICE === 'true') || false,
    AUTO_SAVE_CONVERSATIONS: (typeof process !== 'undefined' && process.env.AUTO_SAVE_CONVERSATIONS !== 'false') || true
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
