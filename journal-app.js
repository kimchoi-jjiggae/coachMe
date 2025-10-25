class JournalApp {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.autoListen = false;
        this.entries = [];
        this.currentEntryId = null;
        this.supabase = null;
        this.supabaseEnabled = false;
        this.microphonePermissionGranted = false;
        
        this.init();
    }

    async init() {
        console.log('Initializing Journal App...');
        
        // Load configuration
        this.loadConfiguration();
        
        // Initialize microphone permissions
        await this.initializeMicrophonePermissions();
        
        // For PWAs, proactively request permission on first load
        await this.ensureMicrophonePermission();
        
        // Setup voice recognition
        this.setupVoiceRecognition();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Setup Supabase if configured
        await this.setupSupabase();
        
        // Load existing entries
        this.loadEntries();
        
        console.log('Journal App initialized successfully');
    }

    loadConfiguration() {
        // OpenAI functionality commented out to avoid API key issues
        this.apiKey = ''; // OpenAI disabled

        // Load auto-listen preference
        this.autoListen = localStorage.getItem('autoListen') === 'true';
        
        console.log('Configuration loaded:', {
            hasApiKey: !!this.apiKey,
            autoListen: this.autoListen
        });
    }

    setupVoiceRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';
            this.recognition.maxAlternatives = 1;
            
            // Extended recording settings
            this.recordingStartTime = null;
            this.maxRecordingDuration = 5 * 60 * 1000; // 5 minutes in milliseconds
            this.autoRestartInterval = 25000; // Restart every 25 seconds to avoid browser timeouts
            this.restartTimer = null;
            
            this.recognition.onstart = () => {
                console.log('Voice recognition started');
                this.isListening = true;
                this.recordingStartTime = Date.now();
                this.updateVoiceButton();
                this.updateVoiceStatus('Listening...', 'listening');
                
                // Set up automatic restart to extend recording duration
                this.scheduleAutoRestart();
            };
            
            this.recognition.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';
                
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }
                
                if (finalTranscript) {
                    // Process the transcript to add punctuation
                    const processedTranscript = this.addPunctuation(finalTranscript);
                    this.appendToEntry(processedTranscript);
                }
                
                // Show interim results
                this.updateVoiceStatus(`Listening... "${interimTranscript}"`, 'listening');
            };
            
            this.recognition.onerror = (event) => {
                console.error('Voice recognition error:', event.error);
                this.isListening = false;
                this.clearRestartTimer();
                this.updateVoiceButton();
                this.updateVoiceStatus(`Error: ${event.error}`, 'error');
                
                // Restart if it was a temporary error or timeout
                if (event.error === 'no-speech' || event.error === 'audio-capture' || event.error === 'network') {
                    setTimeout(() => {
                        if (this.autoListen && this.isRecordingActive()) {
                            console.log('Auto-restarting voice recognition after error');
                            this.startVoiceInput();
                        }
                    }, 1000);
                }
            };
            
            this.recognition.onend = () => {
                console.log('Voice recognition ended');
                this.isListening = false;
                this.clearRestartTimer();
                this.updateVoiceButton();
                
                // Check if we should continue recording
                if (this.autoListen && this.isRecordingActive()) {
                    this.updateVoiceStatus('Restarting...', 'listening');
                    setTimeout(() => {
                        console.log('Auto-restarting voice recognition');
                        this.startVoiceInput();
                    }, 500);
                } else {
                    this.updateVoiceStatus('Ready to listen', 'idle');
                }
            };
        } else {
            console.warn('Speech recognition not supported');
            this.updateVoiceStatus('Voice input not supported in this browser', 'error');
        }
    }

    setupEventListeners() {
        // Voice button
        document.getElementById('voiceBtn').addEventListener('click', () => {
            this.toggleVoiceInput();
        });
        
        document.getElementById('generateTitleBtn').addEventListener('click', () => {
            this.generateTitle();
        });
        
        document.getElementById('permissionBtn').addEventListener('click', async () => {
            await this.requestMicrophonePermission();
        });
        
        // Save button
        document.getElementById('saveBtn').addEventListener('click', () => {
            this.saveEntry();
        });
        
        // Clear button
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearEntry();
        });
        
        // Refresh button
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.loadEntries();
        });
        
        // Auto-save on content change
        document.getElementById('entryContent').addEventListener('input', () => {
            this.autoSaveDraft();
        });
        
        document.getElementById('entryTitle').addEventListener('input', () => {
            this.autoSaveDraft();
        });
    }

    async setupSupabase() {
        // Load Supabase configuration
        let supabaseUrl, supabaseKey;
        
        console.log('Setting up Supabase...');
        console.log('MY_KEYS available:', !!window.MY_KEYS);
        console.log('CONFIG available:', !!window.CONFIG);
        
        // Hardcoded Supabase credentials for GitHub Pages deployment
        // Override any other configuration with working credentials
        supabaseUrl = 'https://mzalblqbedfwzltmsiqd.supabase.co';
        supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16YWxibHFiZWRmd3psdG1zaXFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NTg5MzYsImV4cCI6MjA3NjAzNDkzNn0.X9_SmptOJCNzXGGiwXUSSd8Ql6EKUhQYOY6nVVdv6UQ';
        
        console.log('Using hardcoded Supabase credentials for GitHub Pages');
        console.log('Hardcoded Supabase URL:', supabaseUrl);
        console.log('Hardcoded Supabase Key:', supabaseKey ? 'Present' : 'Missing');
        
        console.log('Using configuration from: HARDCODED (GitHub Pages) - CACHE BUST v2');
        
        console.log('Supabase URL:', supabaseUrl ? 'Found' : 'Missing');
        console.log('Supabase Key:', supabaseKey ? 'Found' : 'Missing');
        
        if (supabaseUrl && supabaseKey) {
            try {
                this.supabase = supabase.createClient(supabaseUrl, supabaseKey);
                this.supabaseEnabled = true;
                console.log('Supabase connected successfully');
            } catch (error) {
                console.error('Supabase connection failed:', error);
                this.supabaseEnabled = false;
            }
        } else {
            console.log('Supabase not configured, using local storage only');
            this.supabaseEnabled = false;
        }
    }

    toggleVoiceInput() {
        if (this.isListening) {
            this.stopVoiceInput();
        } else {
            this.startVoiceInput();
        }
    }

    async startVoiceInput() {
        if (!this.recognition) {
            this.updateVoiceStatus('Voice recognition not supported', 'error');
            return;
        }
        
        // Check if we need to request microphone permission
        if (!this.microphonePermissionGranted) {
            this.updateVoiceStatus('Requesting microphone permission...', 'listening');
            const granted = await this.requestMicrophonePermission();
            if (!granted) {
                this.updateVoiceStatus('Microphone permission required for voice input', 'error');
                return;
            }
        }
        
        try {
            this.recordingStartTime = Date.now();
            this.recognition.start();
        } catch (error) {
            console.error('Failed to start voice recognition:', error);
            this.updateVoiceStatus('Failed to start voice recognition', 'error');
        }
    }

    stopVoiceInput() {
        if (this.recognition && this.isListening) {
            this.clearRestartTimer();
            this.recognition.stop();
        }
    }

    updateVoiceButton() {
        const voiceBtn = document.getElementById('voiceBtn');
        const permissionBtn = document.getElementById('permissionBtn');
        
        if (this.isListening) {
            voiceBtn.textContent = '🛑 Stop listening';
            voiceBtn.className = 'btn-voice-journal listening';
            permissionBtn.style.display = 'none';
        } else if (!this.microphonePermissionGranted) {
            voiceBtn.textContent = '🎤 Click to start voice input';
            voiceBtn.className = 'btn-voice-journal idle';
            permissionBtn.style.display = 'inline-block';
        } else {
            voiceBtn.textContent = '🎤 Click to start voice input';
            voiceBtn.className = 'btn-voice-journal idle';
            permissionBtn.style.display = 'none';
        }
    }

    updateVoiceStatus(text, status = 'idle') {
        const statusElement = document.getElementById('voiceStatus');
        const statusText = document.getElementById('voiceStatusText');
        
        statusText.textContent = text;
        statusElement.className = `voice-status ${status}`;
    }

    appendToEntry(text) {
        const contentArea = document.getElementById('entryContent');
        const currentText = contentArea.value;
        
        // Add text with proper spacing
        if (currentText && !currentText.endsWith(' ')) {
            contentArea.value = currentText + ' ' + text;
        } else {
            contentArea.value = currentText + text;
        }
        
        // Trigger input event for auto-save
        contentArea.dispatchEvent(new Event('input'));
    }

    autoSaveDraft() {
        const title = document.getElementById('entryTitle').value;
        const content = document.getElementById('entryContent').value;
        
        if (title || content) {
            const draft = { title, content, timestamp: new Date().toISOString() };
            localStorage.setItem('journalDraft', JSON.stringify(draft));
        } else {
            localStorage.removeItem('journalDraft');
        }
    }

    loadDraft() {
        const draft = localStorage.getItem('journalDraft');
        if (draft) {
            try {
                const { title, content } = JSON.parse(draft);
                document.getElementById('entryTitle').value = title || '';
                document.getElementById('entryContent').value = content || '';
            } catch (error) {
                console.error('Failed to load draft:', error);
            }
        }
    }

    clearEntry() {
        if (confirm('Are you sure you want to clear this entry? This will delete any unsaved changes.')) {
            this.resetForm();
        }
    }
    
    resetForm() {
        document.getElementById('entryTitle').value = '';
        document.getElementById('entryContent').value = '';
        this.currentEntryId = null;
        localStorage.removeItem('journalDraft');
    }

    async saveEntry() {
        const title = document.getElementById('entryTitle').value.trim();
        const content = document.getElementById('entryContent').value.trim();
        
        if (!content) {
            alert('Please enter some content for your journal entry.');
            return;
        }
        
        const entry = {
            id: this.currentEntryId || this.generateId(),
            title: title || `Entry ${new Date().toLocaleDateString()}`,
            content: content,
            date: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        try {
            // Save to local storage
            this.entries = this.entries.filter(e => e.id !== entry.id);
            this.entries.unshift(entry);
            localStorage.setItem('journalEntries', JSON.stringify(this.entries));
            
            // Clear form
            this.resetForm();
            
            // Reload entries
            this.loadEntries();
            
            // Show success message
            this.showMessage('Entry saved successfully!', 'success');
            
            // Save to Supabase if enabled (non-blocking)
            if (this.supabaseEnabled) {
                this.saveToSupabase(entry).catch(error => {
                    console.warn('Supabase save failed (entry still saved locally):', error);
                });
            }
            
        } catch (error) {
            console.error('Failed to save entry:', error);
            this.showMessage('Failed to save entry. Please try again.', 'error');
        }
    }

    async saveToSupabase(entry) {
        if (!this.supabase || !this.supabaseEnabled) {
            console.log('Supabase not available, skipping cloud save');
            console.log('Supabase client:', !!this.supabase);
            console.log('Supabase enabled:', this.supabaseEnabled);
            return;
        }
        
        try {
            console.log('Attempting to save to Supabase:', entry.id);
            console.log('Supabase URL:', this.supabaseUrl);
            console.log('Supabase Key:', this.supabaseKey ? 'Present' : 'Missing');
            
            // Save as a conversation in Supabase using insert instead of upsert
            const userId = await this.getUserId();
            console.log('Saving with user_id:', userId);
            
            const { data, error } = await this.supabase
                .from('conversations')
                .insert({
                    id: entry.id,
                    user_id: userId,
                    user_message: entry.content,
                    ai_response: '', // Empty for journal entries
                    date: entry.date,
                    created_at: entry.created_at,
                    updated_at: entry.updated_at
                })
                .select();
            
            if (error) {
                console.error('Supabase insert error:', error);
                throw error;
            }
            
            console.log('Entry saved to Supabase successfully:', data);
        } catch (error) {
            console.error('Supabase save error:', error);
            throw error;
        }
    }

    async getUserId() {
        // Use a consistent user ID across all devices for cross-device sync
        // This allows entries to be shared across all devices
        return 'voice_journal_user';
    }

    loadEntries() {
        // Load from local storage
        const stored = localStorage.getItem('journalEntries');
        this.entries = stored ? JSON.parse(stored) : [];
        
        // Load from Supabase if enabled
        if (this.supabaseEnabled) {
            this.loadFromSupabase();
        } else {
            this.displayEntries();
        }
    }

    async loadFromSupabase() {
        if (!this.supabase || !this.supabaseEnabled) {
            console.log('Supabase not available for loading entries');
            return;
        }
        
        try {
            const userId = await this.getUserId();
            console.log('Loading entries from Supabase for user:', userId);
            
            const { data, error } = await this.supabase
                .from('conversations')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
            
            if (error) {
                console.error('Supabase load error:', error);
                throw error;
            }
            
            console.log('Loaded entries from Supabase:', data.length, 'entries');
            
            // Debug: Show what entries were found
            if (data.length > 0) {
                console.log('Found entries:', data.map(entry => ({
                    id: entry.id,
                    user_id: entry.user_id,
                    user_message: entry.user_message?.substring(0, 50) + '...'
                })));
            } else {
                console.log('No entries found. Checking all entries in database...');
                // Check what's actually in the database
                const { data: allData, error: allError } = await this.supabase
                    .from('conversations')
                    .select('id, user_id, user_message')
                    .limit(10);
                
                if (allError) {
                    console.error('Error checking all entries:', allError);
                } else {
                    console.log('All entries in database:', allData);
                }
            }
            
            // Convert Supabase format to local format
            this.entries = data.map(conv => ({
                id: conv.id,
                title: `Entry ${new Date(conv.date).toLocaleDateString()}`,
                content: conv.user_message,
                date: conv.date,
                created_at: conv.created_at,
                updated_at: conv.updated_at
            }));
            
            this.displayEntries();
        } catch (error) {
            console.error('Failed to load from Supabase:', error);
            this.displayEntries(); // Fallback to local entries
        }
    }

    displayEntries() {
        const container = document.getElementById('entriesContainer');
        
        if (this.entries.length === 0) {
            container.innerHTML = '<div class="no-entries">No journal entries yet. Start writing!</div>';
            return;
        }
        
        container.innerHTML = this.entries.map(entry => `
            <div class="entry-item">
                <div class="entry-item-header">
                    <h3 class="entry-item-title">${this.escapeHtml(entry.title)}</h3>
                    <div class="entry-item-date">${new Date(entry.date).toLocaleString()}</div>
                </div>
                <div class="entry-item-content">${this.escapeHtml(entry.content)}</div>
                <div class="entry-item-actions">
                    <button class="btn-edit" onclick="journalApp.editEntry('${entry.id}')" title="Edit entry">✏️</button>
                    <button class="btn-delete" onclick="journalApp.deleteEntry('${entry.id}')" title="Delete entry">🗑️</button>
                </div>
            </div>
        `).join('');
    }

    editEntry(entryId) {
        const entry = this.entries.find(e => e.id === entryId);
        if (!entry) return;
        
        document.getElementById('entryTitle').value = entry.title;
        document.getElementById('entryContent').value = entry.content;
        this.currentEntryId = entryId;
        
        // Scroll to form
        document.querySelector('.entry-form').scrollIntoView({ behavior: 'smooth' });
    }

    async deleteEntry(entryId) {
        if (!confirm('Are you sure you want to delete this entry?')) return;
        
        try {
            // Remove from local storage
            this.entries = this.entries.filter(e => e.id !== entryId);
            localStorage.setItem('journalEntries', JSON.stringify(this.entries));
            
            // Remove from Supabase if enabled
            if (this.supabaseEnabled) {
                await this.deleteFromSupabase(entryId);
            }
            
            // Reload display
            this.displayEntries();
            
            this.showMessage('Entry deleted successfully!', 'success');
        } catch (error) {
            console.error('Failed to delete entry:', error);
            this.showMessage('Failed to delete entry. Please try again.', 'error');
        }
    }

    async deleteFromSupabase(entryId) {
        if (!this.supabase || !this.supabaseEnabled) return;
        
        try {
            const { error } = await this.supabase
                .from('conversations')
                .delete()
                .eq('id', entryId);
            
            if (error) throw error;
        } catch (error) {
            console.error('Supabase delete error:', error);
            throw error;
        }
    }

    generateId() {
        return 'entry_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showMessage(message, type = 'info') {
        // Create a temporary message element
        const messageEl = document.createElement('div');
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        `;
        messageEl.textContent = message;
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.remove();
        }, 3000);
    }
    
    // Extended recording helper methods
    scheduleAutoRestart() {
        this.clearRestartTimer();
        this.restartTimer = setTimeout(() => {
            if (this.isListening && this.isRecordingActive()) {
                console.log('Auto-restarting to extend recording session');
                this.stopVoiceInput();
                // The onend event will handle the restart
            }
        }, this.autoRestartInterval);
    }
    
    clearRestartTimer() {
        if (this.restartTimer) {
            clearTimeout(this.restartTimer);
            this.restartTimer = null;
        }
    }
    
    isRecordingActive() {
        if (!this.recordingStartTime) return false;
        
        const elapsed = Date.now() - this.recordingStartTime;
        return elapsed < this.maxRecordingDuration;
    }
    
    getRecordingDuration() {
        if (!this.recordingStartTime) return 0;
        return Math.floor((Date.now() - this.recordingStartTime) / 1000);
    }
    
    // Generate title from entry content using OpenAI
    async generateTitle() {
        const content = document.getElementById('entryContent').value.trim();
        const titleField = document.getElementById('entryTitle');
        
        if (!content) {
            this.showMessage('Please write some content first before generating a title.', 'error');
            return;
        }
        
        // Disable button while generating
        const generateBtn = document.getElementById('generateTitleBtn');
        generateBtn.disabled = true;
        generateBtn.textContent = '🔄 Generating...';
        
        try {
            // Try OpenAI first, fallback to local generation
            const title = await this.generateTitleWithOpenAI(content);
            
            // Update the title field
            titleField.value = title;
            
            this.showMessage('Title generated successfully!', 'success');
        } catch (error) {
            console.log('OpenAI title generation failed, using fallback:', error);
            
            // Fallback to local title generation
            const fallbackTitle = this.createSmartTitle(content);
            titleField.value = fallbackTitle;
            
            this.showMessage('Title generated (using local method)', 'info');
        }
        
        // Re-enable button
        generateBtn.disabled = false;
        generateBtn.textContent = '📝 Generate Title';
    }
    
    // Generate title using OpenAI API
    async generateTitleWithOpenAI(content) {
        // Check if OpenAI API key is available
        const apiKey = window.ENV_CONFIG?.OPENAI_API_KEY || window.MY_KEYS?.OPENAI_API_KEY;
        
        if (!apiKey || apiKey === 'your_openai_api_key_here') {
            throw new Error('OpenAI API key not configured');
        }
        
        // Truncate content if too long (OpenAI has token limits)
        const maxLength = 2000;
        const truncatedContent = content.length > maxLength ? 
            content.substring(0, maxLength) + '...' : content;
        
        const prompt = `Generate a concise, descriptive title (3-8 words) for this journal entry. The title should capture the main theme, emotion, or topic. Make it personal and meaningful.

Journal Entry:
"${truncatedContent}"

Title:`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant that creates meaningful, concise titles for personal journal entries. Focus on the main emotion, theme, or topic. Keep titles short (3-8 words) and personal.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 20,
                temperature: 0.7
            })
        });
        
        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`);
        }
        
        const data = await response.json();
        const title = data.choices[0]?.message?.content?.trim();
        
        if (!title) {
            throw new Error('No title generated from OpenAI');
        }
        
        // Clean up the title
        return title.replace(/^["']|["']$/g, '').trim();
    }
    
    // Create a smart title from content (fallback method)
    createSmartTitle(content) {
        // Clean and process the content
        const cleanContent = content.replace(/\s+/g, ' ').trim();
        
        // Extract key phrases and topics
        const sentences = cleanContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const firstSentence = sentences[0] || '';
        
        // Common journal patterns to identify
        const patterns = [
            { regex: /today/i, prefix: 'Today: ' },
            { regex: /yesterday/i, prefix: 'Yesterday: ' },
            { regex: /this week/i, prefix: 'This Week: ' },
            { regex: /feeling|feel/i, prefix: 'Feeling: ' },
            { regex: /thinking about|thoughts/i, prefix: 'Thoughts: ' },
            { regex: /work|job|career/i, prefix: 'Work: ' },
            { regex: /family|kids|children/i, prefix: 'Family: ' },
            { regex: /relationship|partner|love/i, prefix: 'Relationships: ' },
            { regex: /goal|plan|future/i, prefix: 'Goals: ' },
            { regex: /problem|issue|challenge/i, prefix: 'Challenges: ' },
            { regex: /grateful|thankful|appreciate/i, prefix: 'Gratitude: ' },
            { regex: /dream|nightmare/i, prefix: 'Dreams: ' },
            { regex: /travel|trip|vacation/i, prefix: 'Travel: ' },
            { regex: /health|exercise|fitness/i, prefix: 'Health: ' },
            { regex: /learning|study|education/i, prefix: 'Learning: ' }
        ];
        
        // Find matching pattern
        for (const pattern of patterns) {
            if (pattern.regex.test(cleanContent)) {
                const title = this.extractTitleFromSentence(firstSentence, pattern.prefix);
                return title;
            }
        }
        
        // Default: create title from first sentence
        return this.extractTitleFromSentence(firstSentence, 'Journal: ');
    }
    
    // Extract and format title from sentence
    extractTitleFromSentence(sentence, prefix) {
        // Clean the sentence
        let title = sentence.trim();
        
        // Remove common filler words at the start
        title = title.replace(/^(so|well|um|uh|you know|i mean|like)\s+/i, '');
        
        // Capitalize first letter
        title = title.charAt(0).toUpperCase() + title.slice(1);
        
        // Limit length (max 50 characters)
        if (title.length > 50) {
            title = title.substring(0, 47) + '...';
        }
        
        // Add prefix if provided
        if (prefix) {
            return prefix + title;
        }
        
        return title;
    }
    
    // Add punctuation to voice transcript
    addPunctuation(text) {
        if (!text || text.trim().length === 0) return text;
        
        let processed = text.trim();
        
        // 1. Handle sentence endings - add periods for natural pauses
        processed = processed.replace(/\b(today|yesterday|this morning|this afternoon|this evening|tonight|this week|this month|this year)\b/gi, '$1.');
        processed = processed.replace(/\b(I think|I feel|I believe|I hope|I wish|I want|I need|I should|I could|I would)\b/gi, '$1,');
        processed = processed.replace(/\b(however|therefore|meanwhile|furthermore|moreover|additionally|also|then|next|finally|in conclusion)\b/gi, '. $1');
        
        // 2. Add commas for natural speech pauses
        processed = processed.replace(/\b(well|so|um|uh|you know|I mean|actually|basically|honestly|frankly)\b/gi, '$1,');
        processed = processed.replace(/\b(and|but|or|so|yet|for|nor)\s+/gi, ', $1 ');
        
        // 3. Handle lists and series
        processed = processed.replace(/(\w+)\s+and\s+(\w+)\s+and\s+(\w+)/g, '$1, $2, and $3');
        processed = processed.replace(/(\w+)\s+and\s+(\w+)/g, '$1, and $2');
        
        // 4. Add commas before relative clauses
        processed = processed.replace(/\b(who|which|that|where|when|why)\b/gi, ', $1');
        
        // 5. Handle questions
        processed = processed.replace(/\b(what|when|where|why|how|who|which|is|are|was|were|do|does|did|can|could|will|would|should|may|might)\b.*\?/gi, (match) => {
            if (!match.endsWith('?')) {
                return match + '?';
            }
            return match;
        });
        
        // 6. Handle exclamations
        processed = processed.replace(/\b(wow|amazing|incredible|fantastic|terrible|awful|great|wonderful|awesome|horrible)\b/gi, '$1!');
        
        // 7. Add periods after complete thoughts
        processed = processed.replace(/\b(I|we|they|he|she|it)\b.*\b(am|is|are|was|were|have|has|had|will|would|should|can|could|may|might)\b.*[^.!?]$/gi, (match) => {
            if (match.length > 20) { // Only for longer sentences
                return match + '.';
            }
            return match;
        });
        
        // 8. Clean up multiple punctuation
        processed = processed.replace(/\.{2,}/g, '.');
        processed = processed.replace(/,{2,}/g, ',');
        processed = processed.replace(/\s+/g, ' '); // Clean up extra spaces
        
        // 9. Ensure proper sentence ending
        if (!processed.match(/[.!?]$/)) {
            processed += '.';
        }
        
        // 10. Capitalize first letter
        processed = processed.charAt(0).toUpperCase() + processed.slice(1);
        
        return processed;
    }
    
    // Initialize microphone permissions
    async initializeMicrophonePermissions() {
        try {
            // Check localStorage first for PWA persistence
            const storedPermission = localStorage.getItem('microphonePermissionGranted');
            const storedTimestamp = localStorage.getItem('microphonePermissionTimestamp');
            
            // Check if permission is recent (within last 7 days)
            if (storedPermission === 'true' && storedTimestamp) {
                const permissionAge = Date.now() - parseInt(storedTimestamp);
                const sevenDays = 7 * 24 * 60 * 60 * 1000;
                
                if (permissionAge < sevenDays) {
                    this.microphonePermissionGranted = true;
                    console.log('Microphone permission restored from localStorage');
                    this.updateVoiceButton();
                    return;
                } else {
                    console.log('Microphone permission expired, clearing storage');
                    localStorage.removeItem('microphonePermissionGranted');
                    localStorage.removeItem('microphonePermissionTimestamp');
                }
            }
            
            // Check if Permissions API is supported
            if ('permissions' in navigator) {
                const permission = await navigator.permissions.query({ name: 'microphone' });
                this.microphonePermissionGranted = permission.state === 'granted';
                
                // Store permission state for PWA persistence with timestamp
                localStorage.setItem('microphonePermissionGranted', this.microphonePermissionGranted.toString());
                localStorage.setItem('microphonePermissionTimestamp', Date.now().toString());
                
                console.log('Microphone permission state:', permission.state);
                
                // Listen for permission changes
                permission.addEventListener('change', () => {
                    this.microphonePermissionGranted = permission.state === 'granted';
                    localStorage.setItem('microphonePermissionGranted', this.microphonePermissionGranted.toString());
                    localStorage.setItem('microphonePermissionTimestamp', Date.now().toString());
                    console.log('Microphone permission changed to:', permission.state);
                    this.updateVoiceButton();
                });
            } else {
                console.log('Permissions API not supported, will request permission on first use');
            }
        } catch (error) {
            console.log('Could not check microphone permissions:', error);
        }
    }
    
    // Request microphone permission proactively
    async requestMicrophonePermission() {
        try {
            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Stop the stream immediately as we just needed permission
            stream.getTracks().forEach(track => track.stop());
            
            this.microphonePermissionGranted = true;
            // Store permission state for PWA persistence with timestamp
            localStorage.setItem('microphonePermissionGranted', 'true');
            localStorage.setItem('microphonePermissionTimestamp', Date.now().toString());
            console.log('Microphone permission granted and stored');
            this.updateVoiceButton();
            
            return true;
        } catch (error) {
            console.log('Microphone permission denied:', error);
            this.microphonePermissionGranted = false;
            // Clear stored permission on denial
            localStorage.removeItem('microphonePermissionGranted');
            localStorage.removeItem('microphonePermissionTimestamp');
            this.updateVoiceButton();
            return false;
        }
    }
    
    // Test if microphone permission is still valid (for PWA persistence)
    async testMicrophonePermission() {
        try {
            // First check if we can enumerate devices (silent check)
            const devices = await navigator.mediaDevices.enumerateDevices();
            const hasAudioInput = devices.some(device => device.kind === 'audioinput');
            
            if (!hasAudioInput) {
                console.log('No audio input devices found');
                this.microphonePermissionGranted = false;
                localStorage.removeItem('microphonePermissionGranted');
                this.updateVoiceButton();
                return false;
            }
            
            // Try to get microphone access to verify permission is still valid
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Stop the stream immediately
            stream.getTracks().forEach(track => track.stop());
            
            console.log('Microphone permission test successful');
            return true;
        } catch (error) {
            console.log('Microphone permission test failed:', error);
            // Permission was revoked, update state
            this.microphonePermissionGranted = false;
            localStorage.removeItem('microphonePermissionGranted');
            this.updateVoiceButton();
            return false;
        }
    }
    
    // Ensure microphone permission is granted (PWA-specific approach)
    async ensureMicrophonePermission() {
        // Check if we already have permission stored
        if (this.microphonePermissionGranted) {
            console.log('Microphone permission already granted');
            return true;
        }
        
        // Check if this is a PWA (more aggressive permission request)
        const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                      window.navigator.standalone === true ||
                      document.referrer.includes('android-app://');
        
        if (isPWA) {
            console.log('PWA detected - requesting microphone permission proactively');
            
            // Show a user-friendly message
            this.updateVoiceStatus('Setting up microphone access for voice journaling...', 'listening');
            
            // Request permission immediately
            const granted = await this.requestMicrophonePermission();
            
            if (granted) {
                this.updateVoiceStatus('Microphone access granted! You can now use voice input.', 'listening');
                // Show success message
                this.showMessage('🎤 Microphone access granted! Voice journaling is ready.', 'success');
            } else {
                this.updateVoiceStatus('Microphone access needed for voice input', 'error');
                // Show permission button
                const permissionBtn = document.getElementById('permissionBtn');
                if (permissionBtn) {
                    permissionBtn.style.display = 'inline-block';
                }
            }
            
            return granted;
        }
        
        return false;
    }
}

// Initialize the app when the page loads
let journalApp;
document.addEventListener('DOMContentLoaded', () => {
    journalApp = new JournalApp();
    
    // Load any existing draft
    journalApp.loadDraft();
});
