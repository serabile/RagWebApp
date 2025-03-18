'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { getAnswer, processDocument } from '@/lib/api-client';
import { saveMessages, loadMessages, clearMessages, loadQuestionAnswers, saveQuestionAnswers } from '@/lib/storage';

const Lottie = dynamic(() => import('react-lottie-player'), { ssr: false });

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

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [questionAnswers, setQuestionAnswers] = useState<Array<{question: string; response: string}>>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [highlightedQA, setHighlightedQA] = useState<number | null>(null);
  const qaItemRefs = useRef<(HTMLLIElement | null)[]>([]);
  
  // File upload states
  const [showUploadInput, setShowUploadInput] = useState(false);
  const [fileUrl, setFileUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  // Default system prompt
  const defaultPrompt = "Tu es un expert académique. Tu réponds aux questions selon le context fourni, et surtout ne sort pas du context.";
  
  useEffect(() => {
    // Load messages from local storage on component mount
    const savedMessages = loadMessages();
    if (savedMessages.length > 0) {
      setMessages(savedMessages);
    }
    
    // Load question answers
    const savedQAs = loadQuestionAnswers();
    if (savedQAs.length > 0) {
      setQuestionAnswers(savedQAs);
    }
  }, []);
  
  // Find matching Q/A when messages change
  useEffect(() => {
    if (messages.length > 0 && questionAnswers.length > 0) {
      findMatchingQA();
    }
  }, [messages, questionAnswers]);
  
  useEffect(() => {
    // Scroll to bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // Save to local storage whenever messages change
    if (messages.length > 0) {
      saveMessages(messages);
    }
  }, [messages]);

  // Scroll to highlighted Q/A
  useEffect(() => {
    if (highlightedQA !== null && qaItemRefs.current[highlightedQA]) {
      setTimeout(() => {
        qaItemRefs.current[highlightedQA]?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
      }, 100);
    }
  }, [highlightedQA]);

  // Initialize refs when Q/A list changes
  useEffect(() => {
    qaItemRefs.current = new Array(questionAnswers.length).fill(null);
  }, [questionAnswers.length]);

  const handleClearHistory = () => {
    clearMessages();
    setMessages([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage = {
      role: 'user' as const,
      content: input,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const data = await getAnswer(input, defaultPrompt);
      
      const assistantMessage = {
        role: 'assistant' as const,
        content: data.answer || "Sorry, I couldn't process your request.",
        timestamp: new Date(),
        metrics: data.metrics,
        source: data.source
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      
      const errorMessage = {
        role: 'assistant' as const,
        content: "Sorry, an error occurred while processing your request. Please try again later.",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle document processing
  const handleProcessDocument = async () => {
    if (!fileUrl.trim()) {
      setUploadError('Please enter a PDF URL');
      return;
    }

    if (!fileUrl.toLowerCase().endsWith('.pdf')) {
      setUploadError('URL must point to a PDF file');
      return;
    }

    setUploadError(null);
    setIsProcessing(true);

    try {
      const result = await processDocument(fileUrl);
      
      if (result.content && result.content.questions) {
        saveQuestionAnswers(result.content.questions);
        setQuestionAnswers(result.content.questions);
        setSidebarOpen(true);
      }
      
      if (result.processing_time && result.processing_time.doc_processing_response_info === 'Succeed') {
        setUploadSuccess(true);
        
        setTimeout(() => {
          setUploadSuccess(false);
          setShowUploadInput(false);
          setFileUrl('');
        }, 3000);
        
        const systemMessage: Message = {
          role: 'assistant',
          content: "✅ Document processed successfully! You can now ask questions about it.",
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, systemMessage]);
      } else {
        setUploadError('Failed to process the document');
      }
    } catch (err) {
      setUploadError('An error occurred while processing your request');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Format time display
  const formatTime = (seconds: number): string => {
    if (seconds < 0.001) {
      return `${(seconds * 1000).toFixed(2)}ms`;
    } else if (seconds < 1) {
      return `${(seconds * 1000).toFixed(0)}ms`;
    } else {
      return `${seconds.toFixed(2)}s`;
    }
  };

  // Simplified function to find matching Q/A
  const findMatchingQA = () => {
    setHighlightedQA(null);
    
    const assistantMessages = messages.filter(msg => msg.role === 'assistant');
    if (assistantMessages.length === 0) return;
    
    const latestMessage = assistantMessages[assistantMessages.length - 1];
    
    // Skip system messages
    if (latestMessage.content.includes("Document processed successfully")) {
      return;
    }
    
    const latestContent = latestMessage.content.toLowerCase().trim();
    
    // Find matching Q/A
    for (let i = 0; i < questionAnswers.length; i++) {
      const qa = questionAnswers[i];
      const qaQuestion = qa.question.toLowerCase().trim();
      const qaResponse = qa.response.toLowerCase().trim();
      
      // Try different matching approaches
      const exactMatch = latestContent === qaResponse;
      const contentContainsResponse = latestContent.includes(qaResponse);
      const responseContainsContent = qaResponse.includes(latestContent) && latestContent.length > 15;
      const answersQuestion = latestContent.includes(qaQuestion.replace(/\?/g, '').trim());
      
      if (exactMatch || contentContainsResponse || responseContainsContent || answersQuestion) {
        setHighlightedQA(i);
        return;
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-neutral-50 to-primary-50/30">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-9 h-9 mr-3">
              <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
            </div>
            <h1 className="text-xl font-medium text-neutral-900 font-display">Document Chat</h1>
          </div>
          <div className="flex items-center space-x-2">
            {questionAnswers.length > 0 && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`text-sm px-3 py-1.5 rounded-lg transition-all duration-300 flex items-center ${
                  sidebarOpen 
                    ? 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-1.5 transition-transform duration-300 ${sidebarOpen ? 'rotate-180' : 'rotate-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">{sidebarOpen ? 'Hide Q&A' : 'Show Q&A'}</span>
                <span className="sm:hidden">{sidebarOpen ? 'Hide' : 'Q&A'}</span>
              </button>
            )}
            <button
              onClick={handleClearHistory}
              className="text-sm px-3 py-1.5 rounded-lg transition-all duration-200 bg-red-50 text-red-600 hover:bg-red-100 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="hidden sm:inline">Clear History</span>
              <span className="sm:hidden">Clear</span>
            </button>
            <Link
              href="/"
              className="text-sm px-3 py-1.5 rounded-lg transition-all duration-200 bg-neutral-100 text-neutral-700 hover:bg-neutral-200 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="hidden sm:inline">Home</span>
            </Link>
          </div>
        </div>
      </header>
      
      {/* Main content with sidebar and chat */}
      <div className="flex flex-1 overflow-hidden">
        {/* Q&A Sidebar */}
        {sidebarOpen && questionAnswers.length > 0 && (
          <div className="bg-white border-r border-neutral-200 flex-shrink-0 overflow-y-auto w-80 transition-all duration-300 ease-in-out">
            <div className="p-4 border-b border-neutral-200 bg-neutral-50 sticky top-0 z-10">
              <h2 className="font-medium text-neutral-900 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Document Q&A <span className="text-neutral-500 text-sm ml-1">({questionAnswers.length})</span>
              </h2>
            </div>
            <ul className="divide-y divide-neutral-200">
              {questionAnswers.map((qa, index) => {
                const isHighlighted = index === highlightedQA;
                
                return (
                  <li 
                    key={index} 
                    ref={el => { qaItemRefs.current[index] = el; }}
                    className={`relative transition-all duration-300 ease-in-out
                      ${isHighlighted 
                        ? 'bg-primary-50 border-l-4 border-primary-500' 
                        : 'hover:bg-neutral-50 border-l-4 border-transparent'
                      }`}
                  >
                    <div className="p-4">
                      <div className={`mb-2 font-medium ${isHighlighted ? 'text-primary-700' : 'text-neutral-800'}`}>
                        <div className="flex items-start">
                          {isHighlighted && (
                            <span className="flex-shrink-0 inline-block w-2 h-2 rounded-full bg-primary-500 mt-1.5 mr-2"></span>
                          )}
                          <span className="leading-tight">{qa.question}</span>
                        </div>
                      </div>
                      <div className="text-sm text-neutral-600 pl-4 border-l-2 border-neutral-200 leading-relaxed">
                        {qa.response}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        
        {/* Chat container */}
        <div className="flex-1 flex flex-col overflow-hidden bg-neutral-50/50">
          {/* Messages area */}
          <div className={`flex-1 overflow-y-auto ${(!sidebarOpen || questionAnswers.length === 0) ? 'max-w-3xl' : 'max-w-4xl'} w-full mx-auto`}>
            <div className="p-4 sm:p-6">
              <div className="space-y-6">
                {messages.length === 0 ? (
                  <div className="text-center py-16 flex flex-col items-center">
                    
                    <h3 className="text-xl font-medium text-neutral-900 mb-2 font-display">
                      Welcome to Document Chat
                    </h3>
                    <p className="text-neutral-600 max-w-md mx-auto">
                      Upload your PDF documents using the button below and ask questions to get AI-powered insights from your content.
                    </p>
                    <button
                      onClick={() => setShowUploadInput(true)}
                      className="mt-6 flex items-center px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors duration-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Upload a Document
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        } animate-message-entrance`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className={`group relative max-w-lg ${message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'}`}>
                          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                          
                          <div className={`flex items-center text-xs mt-2 opacity-70 group-hover:opacity-100 transition-opacity ${
                            message.role === 'user' ? 'text-white/70' : 'text-neutral-400'
                          }`}>
                            <span>{new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            
                            {message.role === 'assistant' && message.metrics && (
                              <div className="flex items-center ml-2">
                                <span className="inline-block w-1 h-1 rounded-full bg-neutral-300 mx-1"></span>
                                <div className="flex items-center tooltip" data-tip={`Search: ${formatTime(message.metrics.similarity_database_search_sec)}, Response: ${formatTime(message.metrics.llm_response_sec)}`}>
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span>{formatTime(message.metrics.total_time_sec)}</span>
                                </div>
                                
                                {message.source && (
                                  <div className="ml-2 flex items-center tooltip" data-tip="Source document">
                                    <span className="inline-block w-1 h-1 rounded-full bg-neutral-300 mx-1"></span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span className="truncate max-w-[100px]">{message.source}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start animate-message-entrance">
                        <div className="chat-bubble-loading">
                          <div className="flex items-center space-x-3">
                            <div className="typing-indicator">
                              <span></span>
                              <span></span>
                              <span></span>
                            </div>
                            <div className="text-sm text-neutral-500">AI is thinking...</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>
          
          {/* Input area */}
          <div className="border-t border-neutral-200 bg-white shadow-sm">
            <div className={`mx-auto ${(!sidebarOpen || questionAnswers.length === 0) ? 'max-w-3xl' : 'max-w-4xl'} w-full p-4`}>
              {/* Upload document UI */}
              <div className={`mb-4 overflow-hidden transition-all duration-300 ease-in-out ${showUploadInput ? 'max-h-36 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="rounded-xl bg-primary-50 border border-primary-100 p-3">
                  <div className="flex items-start space-x-2 mb-2">
                    <input
                      type="url"
                      value={fileUrl}
                      onChange={(e) => {
                        setFileUrl(e.target.value);
                        setUploadError(null);
                      }}
                      placeholder="Enter PDF URL (e.g. http://example.com/document.pdf)"
                      className="flex-1 p-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500 text-sm shadow-sm"
                      disabled={isProcessing}
                    />
                    <button
                      onClick={handleProcessDocument}
                      disabled={isProcessing || !fileUrl.trim()}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        isProcessing || !fileUrl.trim()
                          ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                          : 'bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm hover:shadow'
                      }`}
                    >
                      {isProcessing ? (
                        <div className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </div>
                      ) : 'Process'}
                    </button>
                  </div>
                  
                  {uploadError && (
                    <div className="text-sm text-red-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {uploadError}
                    </div>
                  )}
                  
                  {uploadSuccess && (
                    <div className="text-sm text-green-600 flex items-center animate-message-entrance">
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                      </svg>
                      Document processed successfully!
                    </div>
                  )}
                </div>
              </div>
              
              {/* Chat input form */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowUploadInput(!showUploadInput)}
                  className={`p-2 rounded-lg transition-all duration-200 ease-in-out ${showUploadInput ? 'bg-neutral-200 text-neutral-700' : 'bg-primary-100 text-primary-700'} hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
                  title={showUploadInput ? "Hide upload" : "Upload document"}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                  </svg>
                </button>
                
                <form onSubmit={handleSubmit} className="flex flex-1 space-x-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      disabled={isLoading || isProcessing}
                      placeholder="Ask a question about your document..."
                      className="block w-full pl-4 pr-12 py-3 border border-neutral-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 shadow-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || isProcessing || !input.trim()}
                    className={`inline-flex items-center px-4 py-2 rounded-lg shadow-sm text-white transition-all duration-200 ${
                      isLoading || isProcessing || !input.trim()
                        ? 'bg-neutral-400 cursor-not-allowed'
                        : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
