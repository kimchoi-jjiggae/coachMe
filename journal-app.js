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
    
    // Generate title from entry content
    generateTitle() {
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
        
        // Generate a smart title based on content
        const title = this.createSmartTitle(content);
        
        // Update the title field
        titleField.value = title;
        
        // Re-enable button
        generateBtn.disabled = false;
        generateBtn.textContent = '📝 Generate Title';
        
        this.showMessage('Title generated successfully!', 'success');
    }
    
    // Create a smart title from content
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
        
        // Add period at the end if missing
        let processed = text.trim();
        if (!processed.match(/[.!?]$/)) {
            processed += '.';
        }
        
        // Add commas before common conjunctions
        processed = processed.replace(/\s+(and|but|or|so|yet|for|nor)\s+/gi, ', $1 ');
        
        // Add comma before "and" in lists (simple heuristic)
        processed = processed.replace(/(\w+)\s+and\s+(\w+)/g, '$1, and $2');
        
        return processed;
    }
    
    // Initialize microphone permissions
    async initializeMicrophonePermissions() {
        try {
            // Check if Permissions API is supported
            if ('permissions' in navigator) {
                const permission = await navigator.permissions.query({ name: 'microphone' });
                this.microphonePermissionGranted = permission.state === 'granted';
                
                console.log('Microphone permission state:', permission.state);
                
                // Listen for permission changes
                permission.addEventListener('change', () => {
                    this.microphonePermissionGranted = permission.state === 'granted';
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
            console.log('Microphone permission granted');
            this.updateVoiceButton();
            
            return true;
        } catch (error) {
            console.log('Microphone permission denied:', error);
            this.microphonePermissionGranted = false;
            this.updateVoiceButton();
            return false;
        }
    }
}

// Initialize the app when the page loads
let journalApp;
document.addEventListener('DOMContentLoaded', () => {
    journalApp = new JournalApp();
    
    // Load any existing draft
    journalApp.loadDraft();
});
