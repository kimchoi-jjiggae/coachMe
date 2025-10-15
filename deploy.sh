#!/bin/bash

# Deploy script for GitHub Pages
echo "🚀 Deploying Voice Journal PWA to GitHub Pages..."

# Create a simple index.html for GitHub Pages (since we can't run Node.js on GitHub Pages)
cat > index-pages.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Voice Journal - Daily Conversations</title>
    <link rel="manifest" href="manifest.json">
    <link rel="stylesheet" href="styles.css">
    <meta name="theme-color" content="#6366f1">
    <meta name="description" content="Voice-powered journal with AI conversations">
    <link rel="apple-touch-icon" href="icons/icon-192x192.svg">
</head>
<body>
    <div id="app">
        <!-- Header -->
        <header class="header">
            <h1>🎙️ Voice Journal</h1>
            <div class="header-controls">
                <span id="apiStatus" class="api-status">🔴 API Not Configured</span>
                <button id="debugBtn" class="btn btn-secondary" style="font-size: 0.75rem;">🐛 Debug</button>
                <button id="searchBtn" class="btn btn-secondary">🔍 Search</button>
                <button id="settingsBtn" class="btn btn-secondary">⚙️ Settings</button>
            </div>
        </header>

        <!-- Main Content -->
        <main class="main-content">
            <!-- Chat Interface -->
            <div class="chat-container">
                <div id="chatMessages" class="chat-messages">
                    <div class="welcome-message">
                        <h2>Welcome to your Voice Journal!</h2>
                        <p>🎤 Click the microphone to start continuous listening - just talk naturally and I'll respond! You can also type messages. I'm here to help you reflect on your day.</p>
                        <p><strong>💡 Pro tip:</strong> Enable "Auto-start voice listening" in settings for hands-free journaling!</p>
                        <div class="deployment-notice">
                            <h3>📱 For Full PWA Experience:</h3>
                            <p>This is a demo version. For the complete experience with AI integration, please:</p>
                            <ol>
                                <li>Clone the repository: <code>git clone https://github.com/yourusername/voice-journal-pwa.git</code></li>
                                <li>Run locally: <code>npm install && node server.js</code></li>
                                <li>Open <code>http://localhost:3001</code></li>
                            </ol>
                        </div>
                    </div>
                </div>
                
                <!-- Input Area -->
                <div class="input-area">
                    <div class="input-container">
                        <textarea id="messageInput" placeholder="Type your message or use voice..." rows="3"></textarea>
                        <div class="input-controls">
                            <button id="voiceBtn" class="btn btn-voice">
                                <span class="voice-icon">🎤</span>
                                <span class="voice-text">Click to start listening</span>
                            </button>
                            <button id="sendBtn" class="btn btn-primary">Send</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Sidebar for Journal Entries -->
            <aside id="sidebar" class="sidebar">
                <div class="sidebar-header">
                    <h3>📖 Journal Entries</h3>
                    <button id="closeSidebar" class="btn btn-close">×</button>
                </div>
                <div class="search-container">
                    <input type="text" id="searchInput" placeholder="Search past entries...">
                </div>
                <div id="journalEntries" class="journal-entries">
                    <p class="no-entries">No journal entries yet. Start a conversation!</p>
                </div>
            </aside>
        </main>

        <!-- Settings Modal -->
        <div id="settingsModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Settings</h3>
                    <button id="closeSettings" class="btn btn-close">×</button>
                </div>
                <div class="modal-body">
                    <div class="setting-group">
                        <label for="apiKey">OpenAI API Key:</label>
                        <input type="password" id="apiKey" placeholder="Enter your OpenAI API key">
                        <small>Your API key is stored locally and never shared.</small>
                        <button id="testApiKey" class="btn btn-secondary" style="margin-top: 0.5rem;">Test API Key</button>
                    </div>
                    <div class="setting-group">
                        <label for="voiceEnabled">Enable Voice:</label>
                        <input type="checkbox" id="voiceEnabled" checked>
                    </div>
                    <div class="setting-group">
                        <label for="autoSave">Auto-save conversations:</label>
                        <input type="checkbox" id="autoSave" checked>
                    </div>
                    <div class="setting-group">
                        <label for="autoListen">Auto-start voice listening:</label>
                        <input type="checkbox" id="autoListen">
                        <small>Automatically start listening when the app loads</small>
                    </div>
                </div>
                <div class="modal-footer">
                    <button id="saveSettings" class="btn btn-primary">Save Settings</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Loading Indicator -->
    <div id="loadingIndicator" class="loading hidden">
        <div class="spinner"></div>
        <p>AI is thinking...</p>
    </div>

    <!-- Voice Recording Indicator -->
    <div id="voiceIndicator" class="voice-indicator hidden">
        <div class="pulse"></div>
        <p>Listening...</p>
    </div>

    <script src="app.js"></script>
</body>
</html>
EOF

# Add deployment notice CSS
cat >> styles.css << 'EOF'

/* Deployment Notice */
.deployment-notice {
    background: #f0f9ff;
    border: 1px solid #0ea5e9;
    border-radius: 0.5rem;
    padding: 1rem;
    margin-top: 1rem;
}

.deployment-notice h3 {
    color: #0369a1;
    margin-bottom: 0.5rem;
}

.deployment-notice code {
    background: #e0f2fe;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.875rem;
}

.deployment-notice ol {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
}

.deployment-notice li {
    margin-bottom: 0.5rem;
}
EOF

echo "✅ Deployment files created!"
echo "📝 Next steps:"
echo "1. Create a GitHub repository"
echo "2. Push your code: git add . && git commit -m 'Initial commit' && git push"
echo "3. Enable GitHub Pages in repository settings"
echo "4. Your app will be available at https://yourusername.github.io/repository-name"
