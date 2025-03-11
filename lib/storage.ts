type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

const STORAGE_KEY = 'rag-chat-history';

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
