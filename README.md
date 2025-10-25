# Voice Journal App

A voice-powered journaling app with AI title generation, built with modern web technologies.

## Features

- 🎤 **Voice-to-Text Journaling** - Speak your thoughts naturally
- 🤖 **AI Title Generation** - Automatic meaningful titles using OpenAI
- ☁️ **Cloud Storage** - Sync with Supabase for data persistence
- 📱 **PWA Support** - Install as a mobile app
- 🔒 **Secure API** - OpenAI API key kept secure on server-side

## Quick Start

### Option 1: Simple Setup (No AI titles)
```bash
# Start with Python server (basic functionality)
python3 -m http.server 3001
```
Open: http://localhost:3001

### Option 2: Full Setup (With AI titles)
```bash
# Run the setup script
./setup.sh

# Set your OpenAI API key
export OPENAI_API_KEY='your_openai_api_key_here'

# Start the server
npm start
```
Open: http://localhost:3003

## OpenAI API Key Setup

1. **Get API Key**: Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. **Create New Key**: Click "Create new secret key"
3. **Set Environment Variable**:
   ```bash
   export OPENAI_API_KEY='sk-your-key-here'
   ```

## Server Options

### Node.js Server (Recommended)
- ✅ Full AI title generation
- ✅ Secure API key handling
- ✅ Production ready

```bash
npm start
# Runs on http://localhost:3003
```

### Python Server (Basic)
- ✅ Basic journaling features
- ❌ No AI titles (fallback to local generation)
- ✅ Simple setup

```bash
python3 -m http.server 3001
# Runs on http://localhost:3001
```

## API Endpoints

- `POST /api/generate-title` - Generate AI titles for journal entries
- `GET /` - Main journal app
- `GET /demo.html` - Demo page
- `GET /chat.html` - Chat mode (legacy)

## Environment Variables

```bash
# Required for AI titles
OPENAI_API_KEY=your_openai_api_key_here

# Optional Supabase configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
```

## Security Features

- 🔒 **API Key Protection** - OpenAI key never exposed to client
- 🛡️ **Server-Side Processing** - All AI requests handled securely
- 🔐 **Environment Variables** - Sensitive data in environment only

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build (if needed)
npm run build
```

## Deployment

### GitHub Pages (Static)
- Basic journaling features only
- No AI title generation
- Deploy by pushing to main branch

### Vercel/Netlify (Full Features)
- Full AI title generation
- Set `OPENAI_API_KEY` environment variable
- Deploy with Node.js support

## Troubleshooting

### AI Titles Not Working
1. Check if `OPENAI_API_KEY` is set
2. Verify API key is valid
3. Check server logs for errors
4. App will fallback to local title generation

### Voice Input Issues
1. Grant microphone permission
2. Check browser compatibility
3. Try different browser
4. Check HTTPS requirement for PWA

## Browser Support

- ✅ Chrome/Chromium
- ✅ Safari
- ✅ Firefox
- ✅ Edge
- ✅ Mobile browsers

## License

MIT License - Feel free to use and modify!