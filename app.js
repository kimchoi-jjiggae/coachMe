// Voice Journal PWA - Main Application
class VoiceJournal {
    constructor() {
        this.isRecording = false;
        this.recognition = null;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.apiKey = localStorage.getItem('openai_api_key') || '';
        this.conversations = JSON.parse(localStorage.getItem('conversations') || '[]');
        this.currentConversation = [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupVoiceRecognition();
        this.loadJournalEntries();
        this.registerServiceWorker();
        this.updateApiStatus();
    }

    setupEventListeners() {
        // Send button
        document.getElementById('sendBtn').addEventListener('click', () => this.sendMessage());
        
        // Enter key in textarea
        document.getElementById('messageInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Voice button - now toggles continuous listening
        const voiceBtn = document.getElementById('voiceBtn');
        voiceBtn.addEventListener('click', () => this.toggleContinuousListening());
        
        // Initialize auto-listen setting
        this.autoListen = localStorage.getItem('autoListen') === 'true';
        if (this.autoListen) {
            this.startContinuousListening();
        }

        // Search functionality
        document.getElementById('searchBtn').addEventListener('click', () => this.toggleSidebar());
        document.getElementById('closeSidebar').addEventListener('click', () => this.toggleSidebar());
        document.getElementById('searchInput').addEventListener('input', (e) => this.searchEntries(e.target.value));

        // Settings
        document.getElementById('settingsBtn').addEventListener('click', () => this.openSettings());
        document.getElementById('closeSettings').addEventListener('click', () => this.closeSettings());
        document.getElementById('saveSettings').addEventListener('click', () => this.saveSettings());
        document.getElementById('testApiKey').addEventListener('click', () => this.testApiKey());
        document.getElementById('debugBtn').addEventListener('click', () => this.debugState());
    }

    setupVoiceRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true; // Keep listening continuously
            this.recognition.interimResults = true; // Get interim results
            this.recognition.lang = 'en-US';
            this.isListening = false;

            this.recognition.onstart = () => {
                this.isListening = true;
                this.showVoiceIndicator();
                this.updateVoiceButton('listening');
            };

            this.recognition.onresult = (event) => {
                let finalTranscript = '';
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }

                // Update the input field with interim results
                const messageInput = document.getElementById('messageInput');
                if (interimTranscript) {
                    messageInput.value = interimTranscript;
                }

                // If we have a final result, send it
                if (finalTranscript.trim()) {
                    messageInput.value = finalTranscript;
                    this.sendMessage();
                }
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.hideVoiceIndicator();
                this.updateVoiceButton('idle');
                this.isListening = false;
                
                // Restart recognition after a short delay
                if (event.error !== 'aborted') {
                    setTimeout(() => {
                        if (this.autoListen) {
                            this.startContinuousListening();
                        }
                    }, 1000);
                }
            };

            this.recognition.onend = () => {
                this.hideVoiceIndicator();
                this.updateVoiceButton('idle');
                this.isListening = false;
                
                // Restart if auto-listen is enabled
                if (this.autoListen) {
                    setTimeout(() => {
                        this.startContinuousListening();
                    }, 500);
                }
            };
        }
    }

    toggleContinuousListening() {
        if (!this.recognition) {
            alert('Voice recognition not supported in this browser. Please use Chrome or Edge.');
            return;
        }

        if (this.autoListen) {
            this.stopContinuousListening();
        } else {
            this.startContinuousListening();
        }
    }

    startContinuousListening() {
        if (!this.recognition || this.isListening) return;
        
        this.autoListen = true;
        localStorage.setItem('autoListen', 'true');
        this.recognition.start();
        this.updateVoiceButton('listening');
    }

    stopContinuousListening() {
        this.autoListen = false;
        localStorage.setItem('autoListen', 'false');
        
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
        
        this.hideVoiceIndicator();
        this.updateVoiceButton('idle');
    }

    updateVoiceButton(state) {
        const voiceBtn = document.getElementById('voiceBtn');
        const voiceText = voiceBtn.querySelector('.voice-text');
        
        voiceBtn.className = 'btn btn-voice';
        
        if (state === 'listening') {
            voiceBtn.classList.add('listening');
            voiceText.textContent = 'Listening...';
        } else if (state === 'idle') {
            voiceBtn.classList.add('idle');
            voiceText.textContent = 'Click to start listening';
        }
    }

    showVoiceIndicator() {
        document.getElementById('voiceIndicator').classList.remove('hidden');
    }

    hideVoiceIndicator() {
        document.getElementById('voiceIndicator').classList.add('hidden');
    }

    async sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const message = messageInput.value.trim();
        
        if (!message) return;

        // Add user message to chat
        this.addMessageToChat(message, 'user');
        messageInput.value = '';

        // Show loading indicator
        this.showLoading();

        try {
            // Get AI response
            const response = await this.getAIResponse(message);
            this.addMessageToChat(response, 'assistant');
            
            // Save conversation
            this.saveConversation(message, response);
        } catch (error) {
            console.error('Error getting AI response:', error);
            let errorMessage = 'Sorry, I encountered an error. ';
            
            if (error.message.includes('No API key')) {
                errorMessage += 'Please add your OpenAI API key in settings.';
            } else if (error.message.includes('401')) {
                errorMessage += 'Invalid API key. Please check your OpenAI API key in settings.';
            } else if (error.message.includes('429')) {
                errorMessage += 'Rate limit exceeded. Please try again in a moment.';
            } else if (error.message.includes('403')) {
                errorMessage += 'API access forbidden. Please check your OpenAI account and API key.';
            } else {
                errorMessage += `Error: ${error.message}. Please check your API key and internet connection.`;
            }
            
            this.addMessageToChat(errorMessage, 'assistant');
        } finally {
            this.hideLoading();
        }
    }

    async getAIResponse(message) {
        console.log('API Key status:', this.apiKey ? 'Present' : 'Missing');
        console.log('API Key length:', this.apiKey ? this.apiKey.length : 0);
        
        if (!this.apiKey) {
            throw new Error('No API key configured');
        }

        // Prepare conversation context
        const conversationHistory = this.currentConversation.slice(-10); // Last 10 messages for context
        const messages = [
            {
                role: 'system',
                content: 'You are a helpful AI journaling companion. Help the user reflect on their day, provide insights, and engage in meaningful conversation. Be supportive, empathetic, and encouraging. Reference past conversations when relevant.'
            },
            ...conversationHistory,
            {
                role: 'user',
                content: message
            }
        ];

        console.log('Making API request with key:', this.apiKey.substring(0, 10) + '...');

        // Use local server to avoid CORS issues
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: messages,
                apiKey: this.apiKey
            })
        });

        console.log('API Response status:', response.status);
        console.log('API Response headers:', response.headers);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error response:', errorText);
            throw new Error(`API request failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('API Success response:', data);
        return data.choices[0].message.content;
    }

    addMessageToChat(message, sender) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const timestamp = new Date().toLocaleTimeString();
        messageDiv.innerHTML = `
            <div class="message-content">${this.formatMessage(message)}</div>
            <div class="message-time">${timestamp}</div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Add to current conversation
        this.currentConversation.push({
            role: sender === 'user' ? 'user' : 'assistant',
            content: message,
            timestamp: new Date().toISOString()
        });
    }

    formatMessage(message) {
        // Convert markdown-like formatting to HTML
        return message
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }

    saveConversation(userMessage, aiResponse) {
        const conversation = {
            id: Date.now(),
            date: new Date().toISOString(),
            userMessage,
            aiResponse,
            timestamp: new Date().toISOString()
        };

        this.conversations.unshift(conversation);
        
        // Keep only last 100 conversations
        if (this.conversations.length > 100) {
            this.conversations = this.conversations.slice(0, 100);
        }

        localStorage.setItem('conversations', JSON.stringify(this.conversations));
        this.loadJournalEntries();
    }

    loadJournalEntries() {
        const entriesContainer = document.getElementById('journalEntries');
        entriesContainer.innerHTML = '';

        if (this.conversations.length === 0) {
            entriesContainer.innerHTML = '<p class="no-entries">No journal entries yet. Start a conversation!</p>';
            return;
        }

        this.conversations.forEach(conversation => {
            const entryDiv = document.createElement('div');
            entryDiv.className = 'journal-entry';
            entryDiv.innerHTML = `
                <div class="entry-header">
                    <span class="entry-date">${new Date(conversation.date).toLocaleDateString()}</span>
                    <span class="entry-time">${new Date(conversation.timestamp).toLocaleTimeString()}</span>
                </div>
                <div class="entry-preview">
                    <strong>You:</strong> ${conversation.userMessage.substring(0, 100)}${conversation.userMessage.length > 100 ? '...' : ''}
                </div>
                <div class="entry-preview">
                    <strong>AI:</strong> ${conversation.aiResponse.substring(0, 100)}${conversation.aiResponse.length > 100 ? '...' : ''}
                </div>
            `;
            
            entryDiv.addEventListener('click', () => this.viewEntry(conversation));
            entriesContainer.appendChild(entryDiv);
        });
    }

    viewEntry(conversation) {
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = `
            <div class="entry-detail">
                <h3>Journal Entry - ${new Date(conversation.date).toLocaleDateString()}</h3>
                <div class="message user">
                    <div class="message-content">${this.formatMessage(conversation.userMessage)}</div>
                    <div class="message-time">${new Date(conversation.timestamp).toLocaleTimeString()}</div>
                </div>
                <div class="message assistant">
                    <div class="message-content">${this.formatMessage(conversation.aiResponse)}</div>
                    <div class="message-time">${new Date(conversation.timestamp).toLocaleTimeString()}</div>
                </div>
            </div>
        `;
        this.toggleSidebar();
    }

    searchEntries(query) {
        const entries = document.querySelectorAll('.journal-entry');
        const lowerQuery = query.toLowerCase();

        entries.forEach(entry => {
            const text = entry.textContent.toLowerCase();
            if (text.includes(lowerQuery)) {
                entry.style.display = 'block';
            } else {
                entry.style.display = 'none';
            }
        });
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('open');
    }

    openSettings() {
        document.getElementById('settingsModal').classList.add('open');
        document.getElementById('apiKey').value = this.apiKey;
        document.getElementById('autoListen').checked = this.autoListen;
    }

    closeSettings() {
        document.getElementById('settingsModal').classList.remove('open');
    }

    saveSettings() {
        this.apiKey = document.getElementById('apiKey').value.trim();
        this.autoListen = document.getElementById('autoListen').checked;
        
        localStorage.setItem('openai_api_key', this.apiKey);
        localStorage.setItem('autoListen', this.autoListen.toString());
        
        // Update listening state based on new setting
        if (this.autoListen && !this.isListening) {
            this.startContinuousListening();
        } else if (!this.autoListen && this.isListening) {
            this.stopContinuousListening();
        }
        
        this.updateApiStatus();
        this.closeSettings();
        
        if (this.apiKey) {
            alert('Settings saved successfully! API key configured.');
        } else {
            alert('Settings saved, but no API key provided.');
        }
    }

    updateApiStatus() {
        const statusElement = document.getElementById('apiStatus');
        if (this.apiKey && this.apiKey.length > 0) {
            statusElement.textContent = '🟢 API Configured';
            statusElement.className = 'api-status configured';
        } else {
            statusElement.textContent = '🔴 API Not Configured';
            statusElement.className = 'api-status';
        }
    }

    // Debug function to check current state
    debugState() {
        console.log('=== DEBUG STATE ===');
        console.log('API Key:', this.apiKey ? this.apiKey.substring(0, 10) + '...' : 'None');
        console.log('API Key Length:', this.apiKey ? this.apiKey.length : 0);
        console.log('Auto Listen:', this.autoListen);
        console.log('Is Listening:', this.isListening);
        console.log('Conversations Count:', this.conversations.length);
        console.log('Current Conversation Count:', this.currentConversation.length);
        console.log('==================');
    }

    async testApiKey() {
        const testKey = document.getElementById('apiKey').value.trim();
        if (!testKey) {
            alert('Please enter an API key first.');
            return;
        }

        const testBtn = document.getElementById('testApiKey');
        const originalText = testBtn.textContent;
        testBtn.textContent = 'Testing...';
        testBtn.disabled = true;

        try {
            const response = await fetch('/api/test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    apiKey: testKey
                })
            });

            if (response.ok) {
                alert('✅ API key is working correctly!');
            } else {
                const errorData = await response.json();
                alert(`❌ API key test failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
            }
        } catch (error) {
            alert(`❌ API key test failed: ${error.message}`);
        } finally {
            testBtn.textContent = originalText;
            testBtn.disabled = false;
        }
    }

    showLoading() {
        document.getElementById('loadingIndicator').classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loadingIndicator').classList.add('hidden');
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered successfully');
            } catch (error) {
                console.log('Service Worker registration failed:', error);
            }
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new VoiceJournal();
});

// Handle PWA install prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show install button or notification
    const installBtn = document.createElement('button');
    installBtn.textContent = 'Install Voice Journal';
    installBtn.className = 'btn btn-primary install-btn';
    installBtn.addEventListener('click', () => {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            }
            deferredPrompt = null;
        });
    });
    
    document.querySelector('.header-controls').appendChild(installBtn);
});
