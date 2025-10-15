// Voice Journal PWA Configuration
// Update these values with your actual API keys

const CONFIG = {
    // OpenAI API Configuration
    OPENAI_API_KEY: 'your_openai_api_key_here',
    
    // Supabase Configuration (replace with your actual values)
    SUPABASE_URL: 'https://your-project.supabase.co',
    SUPABASE_ANON_KEY: 'your_supabase_anon_key_here',
    
    // App Settings
    AUTO_START_VOICE: false,
    AUTO_SAVE_CONVERSATIONS: true,
    
    // Feature Flags
    ENABLE_CLOUD_SYNC: true,
    ENABLE_VOICE_RECOGNITION: true,
    ENABLE_AI_CHAT: true
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}
