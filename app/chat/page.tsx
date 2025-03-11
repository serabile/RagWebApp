'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { getAnswer } from '@/lib/api-client';
import { saveMessages, loadMessages, clearMessages } from '@/lib/storage';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Default system prompt
  const defaultPrompt = "Tu es un expert académique. Tu réponds aux questions selon le context fourni, et surtout ne sort pas du context.";
  
  useEffect(() => {
    // Load messages from local storage on component mount
    const savedMessages = loadMessages();
    if (savedMessages.length > 0) {
      setMessages(savedMessages);
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

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">Document Chat</h1>
          <div className="flex space-x-4">
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
      
      {/* Chat container */}
      <div className="flex-1 overflow-hidden flex flex-col max-w-5xl mx-auto w-full">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
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
                      className={`text-xs mt-1 ${
                        message.role === 'user' ? 'text-blue-200' : 'text-gray-500'
                      }`}
                    >
                      {new Date(message.timestamp).toLocaleTimeString()}
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
        
        {/* Input area */}
        <div className="border-t border-gray-200 p-4">
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
  );
}
