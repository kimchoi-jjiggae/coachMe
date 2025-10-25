// Supabase configuration for Voice Journal PWA
import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database schema for journal entries
export const JOURNAL_TABLES = {
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages'
}

// Helper functions for journal operations
export class JournalService {
  constructor() {
    this.supabase = supabase
  }

  // Save a conversation to Supabase
  async saveConversation(conversation) {
    try {
      const { data, error } = await this.supabase
        .from(JOURNAL_TABLES.CONVERSATIONS)
        .insert([{
          id: conversation.id,
          user_id: await this.getUserId(),
          date: conversation.date,
          title: conversation.title || this.generateTitle(conversation.userMessage),
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
        .from(JOURNAL_TABLES.MESSAGES)
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
        .from(JOURNAL_TABLES.CONVERSATIONS)
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

  // Get a specific conversation with messages
  async getConversation(conversationId) {
    try {
      const { data, error } = await this.supabase
        .from(JOURNAL_TABLES.CONVERSATIONS)
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

  // Search conversations
  async searchConversations(query) {
    try {
      const userId = await this.getUserId()
      
      const { data, error } = await this.supabase
        .from(JOURNAL_TABLES.CONVERSATIONS)
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

  // Delete a conversation
  async deleteConversation(conversationId) {
    try {
      // Delete messages first
      const { error: messagesError } = await this.supabase
        .from(JOURNAL_TABLES.MESSAGES)
        .delete()
        .eq('conversation_id', conversationId)

      if (messagesError) throw messagesError

      // Delete conversation
      const { error } = await this.supabase
        .from(JOURNAL_TABLES.CONVERSATIONS)
        .delete()
        .eq('id', conversationId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting conversation:', error)
      throw error
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
}
