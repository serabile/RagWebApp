'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { getAnswer } from '@/lib/api-client';
import { saveMessages, loadMessages, clearMessages, loadQuestionAnswers } from '@/lib/storage';

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
  
  useEffect(() => {
    // Scroll to bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // Save to local storage whenever messages change
    if (messages.length > 0) {
      saveMessages(messages);
    }
  }, [messages]);

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
      // Use the getAnswer function from api-client.ts
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

  // Fonction utilitaire pour formater le temps
  const formatTime = (seconds: number): string => {
    if (seconds < 0.001) {
      return `${(seconds * 1000).toFixed(2)}ms`;
    } else if (seconds < 1) {
      return `${(seconds * 1000).toFixed(0)}ms`;
    } else {
      return `${seconds.toFixed(2)}s`;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">Document Chat</h1>
          <div className="flex space-x-4">
            {/* N'afficher le bouton Hide/Show Q&A que si des Q&A sont disponibles */}
            {questionAnswers.length > 0 && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-sm font-medium text-gray-600 hover:text-gray-500"
              >
                {sidebarOpen ? 'Hide' : 'Show'} Q&A
              </button>
            )}
            <button
              onClick={handleClearHistory}
              className="text-sm font-medium text-red-600 hover:text-red-500"
            >
              Clear History
            </button>
            <Link
              href="/"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </header>
      
      {/* Main content with sidebar and chat */}
      <div className="flex flex-1 overflow-hidden">
        {/* Q&A Sidebar */}
        {sidebarOpen && questionAnswers.length > 0 && (
          <div className="bg-white w-80 border-r border-gray-200 flex-shrink-0 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-medium text-gray-900">Document Q&A</h2>
            </div>
            <ul className="divide-y divide-gray-200">
              {questionAnswers.map((qa, index) => (
                <li key={index} className="p-4 hover:bg-gray-50">
                  <div className="mb-1 font-medium text-gray-900">{qa.question}</div>
                  <div className="text-sm text-gray-600">{qa.response}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Chat container - fixed scroll issue */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Centered content wrapper */}
          <div className={`flex-1 overflow-y-auto ${(!sidebarOpen || questionAnswers.length === 0) ? 'max-w-3xl' : 'max-w-4xl'} w-full mx-auto`}>
            {/* Messages area */}
            <div className="p-4 sm:p-6">
              <div className="space-y-6">
                {messages.length === 0 ? (
                  <div className="text-center py-10">
                    <h3 className="text-lg font-medium text-gray-900">Welcome to Document Chat</h3>
                    <p className="mt-1 text-gray-500">Ask questions about your uploaded documents</p>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-lg rounded-lg px-4 py-2 ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        
                        <div
                          className={`flex items-center text-xs mt-1 ${
                            message.role === 'user' ? 'text-blue-200' : 'text-gray-500'
                          }`}
                        >
                          <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                          
                          {message.role === 'assistant' && message.metrics && (
                            <div className="flex items-center ml-2">
                              <span className="inline-block w-1 h-1 rounded-full bg-gray-400 mx-1"></span>
                              <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span title={`Recherche: ${formatTime(message.metrics.similarity_database_search_sec)}, LLM: ${formatTime(message.metrics.llm_response_sec)}`}>
                                  {formatTime(message.metrics.total_time_sec)}
                                </span>
                              </div>
                              
                              {message.source && (
                                <div className="ml-2 flex items-center" title="Source">
                                  <span className="inline-block w-1 h-1 rounded-full bg-gray-400 mx-1"></span>
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                  </svg>
                                  <span>{message.source}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-200 rounded-lg px-4 py-2 max-w-lg">
                      <div className="flex space-x-2">
                        <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></div>
                        <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>
          
          {/* Input area - centered to match conversation */}
          <div className="border-t border-gray-200">
            <div className={`mx-auto ${(!sidebarOpen || questionAnswers.length === 0) ? 'max-w-3xl' : 'max-w-4xl'} w-full p-4`}>
              <form onSubmit={handleSubmit} className="flex space-x-4">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  placeholder="Ask a question about your document..."
                  className="flex-1 focus:ring-blue-500 focus:border-blue-500 block w-full rounded-md sm:text-sm border-gray-300 shadow-sm"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                    isLoading || !input.trim()
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  }`}
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
