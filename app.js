// Journal Service for Supabase integration
class JournalService {
    constructor(supabase) {
        this.supabase = supabase;
    }

    // Save a conversation to Supabase
    async saveConversation(conversation) {
        try {
            const { data, error } = await this.supabase
                .from('conversations')
                .insert([{
                    id: conversation.id,
                    user_id: await this.getUserId(),
                    date: conversation.date,
                    title: this.generateTitle(conversation.userMessage),
                    created_at: conversation.timestamp,
                    updated_at: new Date().toISOString()
                }])
                .select()

            if (error) throw error

            // Save individual messages
            await this.saveMessages(conversation.id, conversation.messages)
            
            return data[0]
        } catch (error) {
            console.error('Error saving conversation:', error)
            throw error
        }
    }

    // Save messages for a conversation
    async saveMessages(conversationId, messages) {
        try {
            const messageData = messages.map(msg => ({
                conversation_id: conversationId,
                role: msg.role,
                content: msg.content,
                timestamp: msg.timestamp,
                created_at: new Date().toISOString()
            }))

            const { error } = await this.supabase
                .from('messages')
                .insert(messageData)

            if (error) throw error
        } catch (error) {
            console.error('Error saving messages:', error)
            throw error
        }
    }

    // Get all conversations for a user
    async getConversations() {
        try {
            const userId = await this.getUserId()
            
            const { data, error } = await this.supabase
                .from('conversations')
                .select(`
                  *,
                  messages (*)
                `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false })

            if (error) throw error
            return data || []
        } catch (error) {
            console.error('Error fetching conversations:', error)
            return []
        }
    }

    // Search conversations
    async searchConversations(query) {
        try {
            const userId = await this.getUserId()
            
            const { data, error } = await this.supabase
                .from('conversations')
                .select(`
                  *,
                  messages (*)
                `)
                .eq('user_id', userId)
                .or(`title.ilike.%${query}%,messages.content.ilike.%${query}%`)
                .order('created_at', { ascending: false })

            if (error) throw error
            return data || []
        } catch (error) {
            console.error('Error searching conversations:', error)
            return []
        }
    }

    // Get or create user ID (using device fingerprint)
    async getUserId() {
        let userId = localStorage.getItem('voice_journal_user_id')
        
        if (!userId) {
            // Generate a unique user ID based on device characteristics
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
            localStorage.setItem('voice_journal_user_id', userId)
        }
        
        return userId
    }

    // Generate a title for the conversation
    generateTitle(userMessage) {
        const words = userMessage.split(' ').slice(0, 5)
        return words.join(' ') + (userMessage.split(' ').length > 5 ? '...' : '')
    }

    // Sync local data with Supabase
    async syncLocalData() {
        try {
            const localConversations = JSON.parse(localStorage.getItem('conversations') || '[]')
            
            for (const conversation of localConversations) {
                // Check if conversation already exists in Supabase
                const existing = await this.getConversation(conversation.id)
                
                if (!existing) {
                    // Convert local format to Supabase format
                    const supabaseConversation = {
                        id: conversation.id,
                        date: conversation.date,
                        title: this.generateTitle(conversation.userMessage),
                        timestamp: conversation.timestamp,
                        messages: [
                            {
                                role: 'user',
                                content: conversation.userMessage,
                                timestamp: conversation.timestamp
                            },
                            {
                                role: 'assistant',
                                content: conversation.aiResponse,
                                timestamp: conversation.timestamp
                            }
                        ]
                    }
                    
                    await this.saveConversation(supabaseConversation)
                }
            }
            
            console.log('Local data synced with Supabase')
        } catch (error) {
            console.error('Error syncing local data:', error)
        }
    }

    // Get a specific conversation with messages
    async getConversation(conversationId) {
        try {
            const { data, error } = await this.supabase
                .from('conversations')
                .select(`
                  *,
                  messages (*)
                `)
                .eq('id', conversationId)
                .single()

            if (error) throw error
            return data
        } catch (error) {
            console.error('Error fetching conversation:', error)
            return null
        }
    }
}

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
        this.supabase = null;
        this.journalService = null;
        this.supabaseEnabled = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupVoiceRecognition();
        this.setupSupabase();
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

    async saveConversation(userMessage, aiResponse) {
        const conversation = {
            id: Date.now(),
            date: new Date().toISOString(),
            userMessage,
            aiResponse,
            timestamp: new Date().toISOString(),
            messages: [
                {
                    role: 'user',
                    content: userMessage,
                    timestamp: new Date().toISOString()
                },
                {
                    role: 'assistant',
                    content: aiResponse,
                    timestamp: new Date().toISOString()
                }
            ]
        };

        // Save to local storage (fallback)
        this.conversations.unshift(conversation);
        
        // Keep only last 100 conversations locally
        if (this.conversations.length > 100) {
            this.conversations = this.conversations.slice(0, 100);
        }

        localStorage.setItem('conversations', JSON.stringify(this.conversations));

        // Save to Supabase if enabled
        if (this.supabaseEnabled && this.journalService) {
            try {
                await this.journalService.saveConversation(conversation);
                console.log('Conversation saved to Supabase');
            } catch (error) {
                console.error('Failed to save to Supabase:', error);
                // Continue with local storage as fallback
            }
        }

        this.loadJournalEntries();
    }

    async loadJournalEntries() {
        const entriesContainer = document.getElementById('journalEntries');
        entriesContainer.innerHTML = '';

        try {
            let conversations = this.conversations;

            // Load from Supabase if enabled
            if (this.supabaseEnabled && this.journalService) {
                const supabaseConversations = await this.journalService.getConversations();
                if (supabaseConversations.length > 0) {
                    // Convert Supabase format to local format for display
                    conversations = supabaseConversations.map(conv => ({
                        id: conv.id,
                        date: conv.date,
                        userMessage: conv.messages?.find(m => m.role === 'user')?.content || '',
                        aiResponse: conv.messages?.find(m => m.role === 'assistant')?.content || '',
                        timestamp: conv.created_at
                    }));
                }
            }

            if (conversations.length === 0) {
                entriesContainer.innerHTML = '<p class="no-entries">No journal entries yet. Start a conversation!</p>';
                return;
            }

            conversations.forEach(conversation => {
                const entryDiv = document.createElement('div');
                entryDiv.className = 'journal-entry';
                entryDiv.innerHTML = `
                    <div class="entry-header">
                        <span class="entry-date">${new Date(conversation.date).toLocaleDateString()}</span>
                        <span class="entry-time">${new Date(conversation.timestamp).toLocaleTimeString()}</span>
                        ${this.supabaseEnabled ? '<span class="cloud-sync">☁️</span>' : ''}
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
        } catch (error) {
            console.error('Error loading journal entries:', error);
            entriesContainer.innerHTML = '<p class="no-entries">Error loading entries. Using local storage.</p>';
        }
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

    async searchEntries(query) {
        if (!query.trim()) {
            // Show all entries if no query
            const entries = document.querySelectorAll('.journal-entry');
            entries.forEach(entry => entry.style.display = 'block');
            return;
        }

        try {
            let conversations = this.conversations;

            // Search in Supabase if enabled
            if (this.supabaseEnabled && this.journalService) {
                const searchResults = await this.journalService.searchConversations(query);
                if (searchResults.length > 0) {
                    conversations = searchResults.map(result => ({
                        id: result.conversation_id,
                        date: result.date,
                        userMessage: result.content_preview,
                        aiResponse: result.content_preview,
                        timestamp: result.date
                    }));
                }
            }

            // Filter local entries if not using Supabase
            if (!this.supabaseEnabled) {
                const lowerQuery = query.toLowerCase();
                conversations = this.conversations.filter(conv => 
                    conv.userMessage.toLowerCase().includes(lowerQuery) ||
                    conv.aiResponse.toLowerCase().includes(lowerQuery)
                );
            }

            // Update the display
            this.displaySearchResults(conversations);
        } catch (error) {
            console.error('Error searching entries:', error);
            // Fallback to local search
            this.searchEntriesLocal(query);
        }
    }

    searchEntriesLocal(query) {
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

    displaySearchResults(conversations) {
        const entriesContainer = document.getElementById('journalEntries');
        entriesContainer.innerHTML = '';

        if (conversations.length === 0) {
            entriesContainer.innerHTML = '<p class="no-entries">No matching entries found.</p>';
            return;
        }

        conversations.forEach(conversation => {
            const entryDiv = document.createElement('div');
            entryDiv.className = 'journal-entry';
            entryDiv.innerHTML = `
                <div class="entry-header">
                    <span class="entry-date">${new Date(conversation.date).toLocaleDateString()}</span>
                    <span class="entry-time">${new Date(conversation.timestamp).toLocaleTimeString()}</span>
                    ${this.supabaseEnabled ? '<span class="cloud-sync">☁️</span>' : ''}
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

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('open');
    }

    openSettings() {
        document.getElementById('settingsModal').classList.add('open');
        document.getElementById('apiKey').value = this.apiKey;
        document.getElementById('autoListen').checked = this.autoListen;
        document.getElementById('supabaseUrl').value = localStorage.getItem('supabase_url') || '';
        document.getElementById('supabaseKey').value = localStorage.getItem('supabase_anon_key') || '';
    }

    closeSettings() {
        document.getElementById('settingsModal').classList.remove('open');
    }

    async saveSettings() {
        this.apiKey = document.getElementById('apiKey').value.trim();
        this.autoListen = document.getElementById('autoListen').checked;
        const supabaseUrl = document.getElementById('supabaseUrl').value.trim();
        const supabaseKey = document.getElementById('supabaseKey').value.trim();
        
        localStorage.setItem('openai_api_key', this.apiKey);
        localStorage.setItem('autoListen', this.autoListen.toString());
        localStorage.setItem('supabase_url', supabaseUrl);
        localStorage.setItem('supabase_anon_key', supabaseKey);
        
        // Update listening state based on new setting
        if (this.autoListen && !this.isListening) {
            this.startContinuousListening();
        } else if (!this.autoListen && this.isListening) {
            this.stopContinuousListening();
        }
        
        // Reinitialize Supabase if configured
        if (supabaseUrl && supabaseKey) {
            await this.setupSupabase();
        }
        
        this.updateApiStatus();
        this.closeSettings();
        
        if (this.apiKey) {
            if (this.supabaseEnabled) {
                alert('Settings saved successfully! API key and Supabase configured.');
            } else {
                alert('Settings saved successfully! API key configured.');
            }
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

    async setupSupabase() {
        // Check if Supabase is configured
        const supabaseUrl = localStorage.getItem('supabase_url');
        const supabaseKey = localStorage.getItem('supabase_anon_key');
        
        if (supabaseUrl && supabaseKey) {
            try {
                // Dynamically import Supabase
                const { createClient } = await import('https://cdn.skypack.dev/@supabase/supabase-js@2');
                this.supabase = createClient(supabaseUrl, supabaseKey);
                this.supabaseEnabled = true;
                
                // Initialize journal service
                this.journalService = new JournalService(this.supabase);
                
                // Sync local data with Supabase
                await this.journalService.syncLocalData();
                
                console.log('Supabase connected successfully');
                this.updateSupabaseStatus(true);
            } catch (error) {
                console.error('Supabase connection failed:', error);
                this.updateSupabaseStatus(false);
            }
        } else {
            console.log('Supabase not configured');
            this.updateSupabaseStatus(false);
        }
    }

    updateSupabaseStatus(connected) {
        const statusElement = document.getElementById('apiStatus');
        if (connected) {
            statusElement.textContent = '🟢 API + Cloud Sync';
            statusElement.className = 'api-status configured';
        } else {
            statusElement.textContent = '🔴 API Not Configured';
            statusElement.className = 'api-status';
        }
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
