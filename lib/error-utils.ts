// Error handling utilities for the RAG application
export type ErrorType = 
  | 'network'      // API unreachable
  | 'auth'         // Authentication errors
  | 'processing'   // Processing errors (file format etc)
  | 'not_found'    // Missing resources
  | 'timeout'      // Request timeout
  | 'unknown';     // Unknown error

export interface ApiError {
  type: ErrorType;
  message: string;
  originalError?: any;
  retryable: boolean;
}

/**
 * Classifies an error and returns a structured ApiError object
 */
export function classifyError(error: any): ApiError {
  // Network errors
  if (!navigator.onLine || error.message?.includes('Failed to fetch')) {
    return {
      type: 'network',
      message: 'Cannot connect to the server. Please check your internet connection.',
      originalError: error,
      retryable: true
    };
  }
  
  // Authentication errors
  if (error.status === 401 || error.status === 403) {
    return {
      type: 'auth',
      message: 'Authentication failed. Please check your API key.',
      originalError: error,
      retryable: false
    };
  }
  
  // Not found errors
  if (error.status === 404) {
    return {
      type: 'not_found',
      message: 'The requested resource was not found.',
      originalError: error,
      retryable: false
    };
  }
  
  // Processing errors (validation, file format issues)
  if (error.status === 400 || error.status === 422) {
    return {
      type: 'processing',
      message: error.message || 'Invalid request. Please check your input.',
      originalError: error,
      retryable: false
    };
  }
  
  // Timeout errors
  if (error.message?.includes('timeout') || error.code === 'ECONNABORTED') {
    return {
      type: 'timeout',
      message: 'Request timed out. The server is taking too long to respond.',
      originalError: error,
      retryable: true
    };
  }
  
  // Default to unknown error
  return {
    type: 'unknown',
    message: error.message || 'An unexpected error occurred.',
    originalError: error,
    retryable: true
  };
}

/**
 * Retry a function with exponential backoff
 * @param fn Function to retry
 * @param retries Number of retries
 * @param delay Initial delay in ms
 * @returns Promise with the result of the function
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    const apiError = classifyError(error);
    
    // Don't retry if the error is not retryable
    if (!apiError.retryable || retries <= 0) {
      throw apiError;
    }
    
    // Wait for delay ms
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Retry with exponential backoff
    return withRetry(fn, retries - 1, delay * 2);
  }
}

/**
 * Creates a user-friendly error message based on the error type
 */
export function getUserFriendlyErrorMessage(error: any): string {
  const apiError = error.type ? error : classifyError(error);
  
  switch (apiError.type) {
    case 'network':
      return 'Cannot connect to the server. Please check your internet connection and try again.';
    case 'auth':
      return 'Authentication failed. Please check your API key in the settings.';
    case 'not_found':
      return 'The requested resource could not be found.';
    case 'processing':
      return apiError.message || 'There was an error processing your request. Please check your input.';
    case 'timeout':
      return 'The server is taking too long to respond. Please try again later.';
    default:
      return 'An unexpected error occurred. Please try again later.';
  }
}