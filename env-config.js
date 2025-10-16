// Environment Configuration for Voice Journal
// This file contains environment variables for deployment

// You can set these as environment variables in your deployment platform
// or update the values directly in this file for GitHub Pages

const ENV_CONFIG = {
    // OpenAI Configuration - Replace with your actual API key
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || 'your_openai_api_key_here',

    // Supabase Configuration - Replace with your actual credentials
    SUPABASE_URL: process.env.SUPABASE_URL || 'your_supabase_url_here',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'your_supabase_anon_key_here',

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
}
