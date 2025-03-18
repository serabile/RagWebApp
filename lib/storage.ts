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

const STORAGE_KEY = 'rag-chat-history';
const QA_STORAGE_KEY = 'rag-qa-pairs';

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

export const saveQuestionAnswers = (questionAnswers: QuestionAnswer[]): void => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(QA_STORAGE_KEY, JSON.stringify(questionAnswers));
    }
  } catch (error) {
    console.error('Failed to save question/answers to localStorage:', error);
  }
};

export const loadQuestionAnswers = (): QuestionAnswer[] => {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(QA_STORAGE_KEY);
      if (!stored) return [];
      
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load question/answers from localStorage:', error);
  }
  return [];
};

export const clearQuestionAnswers = (): void => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(QA_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Failed to clear question/answers from localStorage:', error);
  }
};
