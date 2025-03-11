// Instead of using absolute URLs with the RAG service IP,
// use relative URLs to our Next.js API routes

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

export async function processDocument(fileUrl: string): Promise<ProcessingResponse> {
  const response = await fetch(`/api/processing`, {
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
  const response = await fetch(`/api/answer`, {
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
