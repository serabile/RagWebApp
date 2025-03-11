export interface ProcessingMetrics {
  doc_processing_load_time: number;
  doc_processing_llm_extract_time: number;
  doc_processing_response_info: string;
  doc_processing_save_response_in_database_time: number;
  total_time: number;
}

export interface AnswerMetrics {
  similarity_database_search_sec: number;
  llm_response_sec: number;
  total_time_sec: number;
}
