import { Settings } from '@/types/settings';

// Types for responses
export interface ProcessingResponse {
  processing_time: {
    doc_processing_load_time: number;
    doc_processing_llm_extract_time: number;
    doc_processing_response_info: string;
    doc_processing_save_response_in_database_time: number;
    total_time: number;
  };
}

export interface AnswerResponse {
  answer: string;
  source: string;
  metrics: {
    similarity_database_search_sec: number;
    llm_response_sec: number;
    total_time_sec: number;
  };
}

// Helper function to get API endpoint from settings or use default
function getApiEndpoint(): string {
  if (typeof window === 'undefined') {
    return '/api'; // Default for server-side
  }
  
  // Try to get from localStorage
  try {
    const savedSettings = localStorage.getItem('rag-app-settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      if (settings.apiEndpoint) {
        return '/api'; // Always use API routes
      }
    }
  } catch (error) {
    console.error('Failed to parse saved settings', error);
  }
  
  return '/api'; // Default fallback
}

export async function processDocument(fileUrl: string): Promise<ProcessingResponse> {
  const apiBase = getApiEndpoint();
  
  const response = await fetch(`${apiBase}/processing`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      file: fileUrl,
    }),
  });

  if (!response.ok) {
    throw new Error(`Processing failed: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

export async function getAnswer(query: string, prompt: string): Promise<AnswerResponse> {
  const apiBase = getApiEndpoint();
  
  const response = await fetch(`${apiBase}/answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      prompt,
    }),
  });

  if (!response.ok) {
    throw new Error(`Answer failed: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}
