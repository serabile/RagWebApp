import { withRetry, classifyError, getUserFriendlyErrorMessage } from './error-utils';

export type Conversation = {
  id: string;
  name: string;
  description?: string;
  created_at: number;
  document_count?: number; // Added to track number of documents
};

export type QuestionAnswerPair = {
  question: string;
  answer: string;
};

// Base API call function with error handling and retries
async function apiCall<T>(
  url: string, 
  options: RequestInit = {}, 
  shouldRetry: boolean = true
): Promise<T> {
  const fetchFn = async () => {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      // Extract error message from response if possible
      let errorMessage = 'An error occurred';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        // Ignore JSON parsing errors
      }
      
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      throw error;
    }
    
    return await response.json() as T;
  };
  
  try {
    return shouldRetry ? await withRetry(fetchFn) : await fetchFn();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// Function to get answer from the API
export interface AnswerResponse {
  answer: string;
  source?: string;
  metrics?: {
    similarity_database_search_sec: number;
    llm_response_sec: number;
    total_time_sec: number;
  };
  message?: string;
  error?: string;
}

export async function getAnswer(
  query: string, 
  prompt?: string, 
  conversationId?: string
): Promise<{ 
  answer: string; 
  source?: string; 
  metrics?: { 
    similarity_database_search_sec: number; 
    llm_response_sec: number; 
    total_time_sec: number; 
  } 
}> {
  try {
    console.log('Sending query to API:', { query, prompt, conversation_id: conversationId });
    
    const response = await apiCall<AnswerResponse>('/api/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        query,
        prompt,
        conversation_id: conversationId
      }),
    }, true); // Enable retries for this call
    
    console.log('Received API response:', response);
    
    // Check if we have a valid response object
    if (!response) {
      console.error('Empty response received from API');
      return { answer: "Sorry, received an empty response from the server." };
    }
    
    // The API returns answer directly instead of response field
    if (response.answer === undefined) {
      console.error('Response missing expected "answer" field:', response);
      
      // If we have an error message in the response, use it
      if (response.message || response.error) {
        return { 
          answer: `Error: ${response.message || response.error}` 
        };
      }
      
      return { answer: "Sorry, the server response was not in the expected format." };
    }
    
    return {
      answer: response.answer,
      source: response.source,
      metrics: response.metrics ? {
        similarity_database_search_sec: response.metrics.similarity_database_search_sec,
        llm_response_sec: response.metrics.llm_response_sec,
        total_time_sec: response.metrics.total_time_sec
      } : undefined
    };
  } catch (error) {
    // Log detailed error information for debugging
    console.error('Error getting answer:', error);
    
    const apiError = classifyError(error);
    console.error('Classified error:', apiError);
    
    // Return a more helpful error message to the user
    return { 
      answer: `Error: ${getUserFriendlyErrorMessage(apiError)}. Please try again or check your connection.` 
    };
  }
}

// Function to process a document
export interface ProcessDocumentResponse {
  document_id?: string;
  conversation_id: string;
  processing_time?: {
    total_processing_time?: number;
    document_loading_time?: number;
    document_splitting_time?: number;
    embedding_generation_time?: number;
    database_insertion_time?: number;
    doc_processing_response_info?: string;
  };
}

export async function processDocument(
  file: string,
  conversationId?: string,
  conversationName?: string
): Promise<ProcessDocumentResponse> {
  try {
    return await apiCall<ProcessDocumentResponse>('/api/processing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file,
        conversation_id: conversationId,
        conversation_name: conversationName
      }),
    }, true); // Enable retries for this call
  } catch (error) {
    const apiError = classifyError(error);
    console.error('Error processing document:', apiError);
    throw new Error(getUserFriendlyErrorMessage(apiError));
  }
}

// Function to create a new conversation
export async function createConversation(name?: string, description?: string): Promise<{
  conversation_id: string;
  name?: string;
  description?: string;
  created_at: string;
}> {
  try {
    const response = await apiCall<{
      conversation_id: string;
      name?: string;
      description?: string;
      created_at: string;
    }>('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    }, false); // No retries for creation operations
    
    console.log('Create conversation response:', response);
    
    if (!response || !response.conversation_id) {
      throw new Error('Invalid response format from server. Missing conversation_id');
    }
    
    return response;
  } catch (error) {
    const apiError = classifyError(error);
    console.error('Error creating conversation:', apiError);
    
    // Add the original error object for debugging
    const enhancedError = new Error(getUserFriendlyErrorMessage(apiError));
    (enhancedError as any).originalError = error;
    (enhancedError as any).apiError = apiError;
    
    throw enhancedError;
  }
}

// Function to list all conversations
export async function listConversations() {
  try {
    return await apiCall<{ conversations: Conversation[] }>('/api/conversations', {
      method: 'GET',
    }, true); // Enable retries for this call
  } catch (error) {
    const apiError = classifyError(error);
    console.error('Error listing conversations:', apiError);
    throw new Error(getUserFriendlyErrorMessage(apiError));
  }
}

// Function to delete a conversation
export async function deleteConversation(id: string) {
  try {
    return await apiCall(`/api/conversations/${id}`, {
      method: 'DELETE',
    }, false); // No retries for deletion operations
  } catch (error) {
    const apiError = classifyError(error);
    console.error('Error deleting conversation:', apiError);
    throw new Error(getUserFriendlyErrorMessage(apiError));
  }
}

// Function to get conversation Q/A pairs
export interface ConversationQAResponse {
  status: 'success' | 'error';
  conversation_id?: string;
  qa_count?: number;
  qa_pairs?: QuestionAnswerPair[];
  message?: string;
}

export async function getConversationQA(conversationId: string): Promise<ConversationQAResponse> {
  try {
    return await apiCall<ConversationQAResponse>(`/api/conversations/${conversationId}/qa`, {
      method: 'GET',
    }, true); // Enable retries for this call
  } catch (error) {
    const apiError = classifyError(error);
    console.error('Error getting conversation QA:', apiError);
    throw new Error(getUserFriendlyErrorMessage(apiError));
  }
}

// Function to clear the database (admin function)
export interface ClearDatabaseResponse {
  status: 'success' | 'error';
  message: string;
  execution_time_sec?: number;
}

export async function clearDatabase(): Promise<ClearDatabaseResponse> {
  try {
    return await apiCall<ClearDatabaseResponse>('/api/database', {
      method: 'DELETE',
    }, false); // No retries for admin operations
  } catch (error) {
    const apiError = classifyError(error);
    console.error('Error clearing database:', apiError);
    throw new Error(getUserFriendlyErrorMessage(apiError));
  }
}
