# 🎙️ Voice Journal PWA

A Progressive Web App for voice-powered journaling with AI conversations. This app allows you to have interactive voice conversations with an LLM for daily journaling and can reference past entries.

## ✨ Features

- 🎤 **Interactive Voice Recording**: Click once to start continuous listening - no more holding buttons!
- 💬 **AI Conversations**: Chat with an AI assistant for journaling and reflection
- 📖 **Journal Entries**: View and search through past conversations
- 📱 **PWA Support**: Install as a native app on your device
- 🔍 **Smart Search**: Find past entries by content with real-time search
- 💾 **Local Storage**: All data stored locally on your device for privacy
- 🌙 **Dark Mode**: Automatic dark mode support
- ⚡ **Real-time Transcription**: See your words appear as you speak

## 🚀 Quick Start

### Option 1: Use the Live Demo
1. Visit the deployed app (link will be provided after GitHub Pages setup)
2. Click Settings (⚙️) and enter your OpenAI API key
3. Start journaling with voice or text!

### Option 2: Run Locally
1. Clone this repository
2. Install dependencies: `npm install`
3. Start the server: `node server.js`
4. Open `http://localhost:3001` in your browser

## 🔧 Setup

1. **Get an OpenAI API Key**:
   - Visit [OpenAI Platform](https://platform.openai.com/)
   - Create an account and generate an API key
   - Copy your API key

2. **Configure the App**:
   - Open the app in your browser
   - Click the Settings button (⚙️)
   - Enter your OpenAI API key
   - Click "Test API Key" to verify it works
   - Save settings

3. **Start Journaling**:
   - Click the microphone button to start continuous listening
   - Just talk naturally - the AI will respond automatically
   - Or type your message in the text area

## 📱 Installing as PWA

### On Mobile (iPhone/Android):
1. Open the app in Safari (iOS) or Chrome (Android)
2. Tap the Share button
3. Select "Add to Home Screen"
4. The app will appear on your home screen like a native app!

### On Desktop:
1. Look for the install prompt in your browser
2. Or use the browser menu: "Install Voice Journal"
3. The app will open in its own window

## 🎯 Usage

### Interactive Voice Recording
- **Click the microphone button** to start continuous listening
- **Just start talking** - your speech is transcribed in real-time
- **When you pause** - the AI automatically responds
- **Keep talking** - the conversation continues naturally
- **Click microphone again** to stop listening

### Text Chat
- Type your message in the text area
- Press Enter or click Send
- The AI will respond with helpful insights

### Viewing Past Entries
- Click the Search button (🔍) to open the sidebar
- Browse through your journal entries
- Click on any entry to view the full conversation
- Use the search box to find specific entries

### Settings
- **Auto-start voice listening**: Automatically start listening when the app loads
- **Auto-save conversations**: Automatically save all your journal entries
- **OpenAI API Key**: Configure your AI assistant

## 🛠️ Technical Details

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Node.js with Express
- **Voice**: Web Speech API for speech-to-text
- **AI**: OpenAI GPT-3.5-turbo for conversations
- **Storage**: LocalStorage for data persistence
- **PWA**: Service Worker for offline functionality
- **Icons**: SVG-based icon system

## 🌐 Browser Support

- **Voice Recording**: Chrome, Edge, Safari (iOS 14.5+)
- **PWA Features**: Chrome, Edge, Firefox, Safari
- **Best Experience**: Chrome or Edge on desktop, Safari on iOS

## 🔒 Privacy

- All conversations are stored locally on your device
- Your API key is stored locally and never shared
- No data is sent to external servers except for AI responses
- You can delete all data by clearing your browser's local storage

## 🐛 Troubleshooting

### Voice Not Working
- Make sure you're using Chrome, Edge, or Safari
- Check that microphone permissions are enabled
- Try refreshing the page

### AI Not Responding
- Check that your API key is correctly entered in settings
- Use the "Test API Key" button to verify it works
- Verify you have credits in your OpenAI account
- Check your internet connection

### App Not Installing
- Make sure you're using a supported browser
- Try refreshing the page and waiting for the install prompt
- Check that the app is served over HTTPS (required for PWA)

### Rate Limit Errors
- Wait 1-2 minutes and try again
- Check your OpenAI usage at [OpenAI Platform](https://platform.openai.com/usage)
- Consider upgrading your OpenAI plan if needed

## 🚀 Deployment

This app is designed to be deployed on GitHub Pages or any static hosting service.

### GitHub Pages Deployment:
1. Push your code to a GitHub repository
2. Go to repository Settings → Pages
3. Select "Deploy from a branch" → main branch
4. Your app will be available at `https://yourusername.github.io/repository-name`

### Custom Domain:
- Add a `CNAME` file with your domain name
- Configure your domain's DNS to point to GitHub Pages

## 🛠️ Development

### Local Development:
```bash
# Clone the repository
git clone https://github.com/yourusername/voice-journal-pwa.git
cd voice-journal-pwa

# Install dependencies
npm install

# Start the development server
node server.js

# Open http://localhost:3001 in your browser
```

### Project Structure:
```
voice-journal-pwa/
├── index.html          # Main app interface
├── app.js             # Core application logic
├── styles.css         # Modern responsive styling
├── manifest.json      # PWA manifest
├── sw.js             # Service worker
├── server.js          # Node.js backend server
├── package.json       # Project configuration
├── icons/             # PWA icons (SVG format)
└── README.md          # This file
```

## 📄 License

MIT License - Feel free to modify and use for your own projects.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Open an issue on GitHub
3. Make sure you're using a supported browser
4. Verify your OpenAI API key is valid

---

**Made with ❤️ for voice-powered journaling**
