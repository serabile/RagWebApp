type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metrics?: {
    similarity_database_search_sec: number;
    llm_response_sec: number;
    total_time_sec: number;
  };
  source?: string;
};

type QuestionAnswer = {
  question: string;
  response: string;
};

type StoredConversation = {
  id: string;
  name: string;
  description?: string;  // Making description optional
  created_at: string;
  updated_at?: string;
  messages: Message[];
};

const STORAGE_KEY = 'rag-chat-history';
const CONVERSATIONS_KEY = 'rag-conversations';
const CURRENT_CONVERSATION_KEY = 'rag-current-conversation';

// Messages management
export const saveMessages = (messages: Message[]): void => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        STORAGE_KEY, 
        JSON.stringify(messages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp.toISOString()
        })))
      );
    }
  } catch (error) {
    console.error('Failed to save messages to localStorage:', error);
  }
};

export const loadMessages = (): Message[] => {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      
      return JSON.parse(stored).map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    }
  } catch (error) {
    console.error('Failed to load messages from localStorage:', error);
  }
  return [];
};

export const clearMessages = (): void => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (error) {
    console.error('Failed to clear messages from localStorage:', error);
  }
};

// Conversation management
export const saveConversation = (conversation: StoredConversation): void => {
  try {
    if (typeof window !== 'undefined') {
      const conversations = loadConversations();
      const existingIndex = conversations.findIndex(c => c.id === conversation.id);
      
      // Update conversation if it exists, otherwise add it
      if (existingIndex >= 0) {
        conversations[existingIndex] = conversation;
      } else {
        conversations.push(conversation);
      }
      
      localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
    }
  } catch (error) {
    console.error('Failed to save conversation to localStorage:', error);
  }
};

export const loadConversations = (): StoredConversation[] => {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(CONVERSATIONS_KEY);
      if (!stored) return [];
      
      return JSON.parse(stored).map((conv: any) => ({
        ...conv,
        messages: conv.messages ? conv.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })) : []
      }));
    }
  } catch (error) {
    console.error('Failed to load conversations from localStorage:', error);
  }
  return [];
};

export const getConversation = (id: string): StoredConversation | undefined => {
  try {
    if (typeof window !== 'undefined') {
      const conversations = loadConversations();
      return conversations.find(c => c.id === id);
    }
  } catch (error) {
    console.error('Failed to get conversation from localStorage:', error);
  }
  return undefined;
};

export const deleteConversation = (id: string): void => {
  try {
    if (typeof window !== 'undefined') {
      const conversations = loadConversations();
      const updatedConversations = conversations.filter(c => c.id !== id);
      localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(updatedConversations));
      
      // If current conversation is being deleted, clear it
      const currentConversationId = localStorage.getItem(CURRENT_CONVERSATION_KEY);
      if (currentConversationId === id) {
        localStorage.removeItem(CURRENT_CONVERSATION_KEY);
      }
    }
  } catch (error) {
    console.error('Failed to delete conversation from localStorage:', error);
  }
};

export const setCurrentConversation = (id: string | null): void => {
  try {
    if (typeof window !== 'undefined') {
      if (id) {
        localStorage.setItem(CURRENT_CONVERSATION_KEY, id);
      } else {
        localStorage.removeItem(CURRENT_CONVERSATION_KEY);
      }
    }
  } catch (error) {
    console.error('Failed to set current conversation in localStorage:', error);
  }
};

export const getCurrentConversation = (): string | null => {
  try {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(CURRENT_CONVERSATION_KEY);
    }
  } catch (error) {
    console.error('Failed to get current conversation from localStorage:', error);
  }
  return null;
};

export const saveMessagesToConversation = (conversationId: string, messages: Message[]): void => {
  try {
    if (typeof window !== 'undefined') {
      const conversations = loadConversations();
      const conversation = conversations.find(c => c.id === conversationId);
      
      if (conversation) {
        conversation.messages = messages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp
        }));
        conversation.updated_at = new Date().toISOString();
        
        localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
      }
    }
  } catch (error) {
    console.error('Failed to save messages to conversation:', error);
  }
};

export type { Message, QuestionAnswer, StoredConversation };
