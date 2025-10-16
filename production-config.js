// Production Configuration for GitHub Pages
// This file contains the API keys for the live version

const PRODUCTION_CONFIG = {
    // OpenAI API Configuration - Replace with your actual key
    OPENAI_API_KEY: 'your_openai_api_key_here',

    // Supabase Configuration - Replace with your actual credentials
    SUPABASE_URL: 'your_supabase_url_here',
    SUPABASE_ANON_KEY: 'your_supabase_anon_key_here',

    // App Settings
    AUTO_START_VOICE: false,
    AUTO_SAVE_CONVERSATIONS: true
};

// Make it available globally
if (typeof window !== 'undefined') {
    window.PRODUCTION_CONFIG = PRODUCTION_CONFIG;
    // Also set as MY_KEYS for compatibility
    window.MY_KEYS = PRODUCTION_CONFIG;
}
