'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { getAnswer, processDocument, createConversation, listConversations, 
  deleteConversation, Conversation, getConversationQA, QuestionAnswerPair 
} from '@/lib/api-client';
import { 
  saveMessages, loadMessages, clearMessages, 
  getCurrentConversation, setCurrentConversation,
  saveConversation, loadConversations as loadLocalConversations,
  deleteConversation as deleteLocalConversation,
  type StoredConversation
} from '@/lib/storage';

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
  const [qaLoading, setQaLoading] = useState(false);
  const [qaError, setQaError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [highlightedQA, setHighlightedQA] = useState<number | null>(null);
  const qaItemRefs = useRef<(HTMLLIElement | null)[]>([]);
  
  // Conversation states
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [showConversationModal, setShowConversationModal] = useState(false);
  const [newConversationName, setNewConversationName] = useState('');
  const [newConversationDesc, setNewConversationDesc] = useState('');
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  
  // File upload states
  const [showUploadInput, setShowUploadInput] = useState(false);
  const [fileUrl, setFileUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [useExistingConversation, setUseExistingConversation] = useState(true);
  const [newFileConversationName, setNewFileConversationName] = useState('');
  
  // Default system prompt
  const defaultPrompt = "Tu es un expert académique. Tu réponds aux questions selon le context fourni, et surtout ne sort pas du context.";
  
  // Fetch conversations on component mount
  useEffect(() => {
    fetchConversations();
    
    // Load current conversation ID
    const savedConversationId = getCurrentConversation();
    if (savedConversationId) {
      setCurrentConversationId(savedConversationId);
      // Load messages for this conversation will happen in another effect
    }
  }, []);
  
  // Load appropriate messages when current conversation changes
  useEffect(() => {
    if (currentConversationId) {
      // Load messages for the current conversation
      const conversation = loadLocalConversations().find(c => c.id === currentConversationId);
      if (conversation && conversation.messages) {
        setMessages(conversation.messages);
      } else {
        setMessages([]);
      }
      
      // Load Q/A pairs for this conversation from API
      fetchConversationQA(currentConversationId);
    } else {
      // Load general messages if no conversation is selected
      const savedMessages = loadMessages();
      if (savedMessages.length > 0) {
        setMessages(savedMessages);
      }
      
      // Clear Q/A pairs when no conversation is selected
      setQuestionAnswers([]);
    }
    
    // Save the current conversation ID
    setCurrentConversation(currentConversationId);
  }, [currentConversationId]);
  
  // Find matching Q/A when messages change
  useEffect(() => {
    if (messages.length > 0 && questionAnswers.length > 0) {
      findMatchingQA();
    }
    
    // Save messages to the appropriate storage based on conversation context
    if (messages.length > 0) {
      if (currentConversationId) {
        // Save to the current conversation
        const storedConversation: StoredConversation = {
          id: currentConversationId,
          name: conversations.find(c => c.id === currentConversationId)?.name || 'Conversation',
          description: conversations.find(c => c.id === currentConversationId)?.description || '',
          created_at: new Date().toISOString(),
          messages: messages
        };
        saveConversation(storedConversation);
      } else {
        // Save to general storage
        saveMessages(messages);
      }
    }
  }, [messages, questionAnswers, currentConversationId, conversations]);
  
  useEffect(() => {
    // Scroll to bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  // Fetch conversations from API
  const fetchConversations = async () => {
    try {
      setConversationsLoading(true);
      const response = await listConversations();
      // Handle the new response format which has a "conversations" array
      setConversations(response.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setConversationsLoading(false);
    }
  };

  // Create a new conversation
  const [createConversationError, setCreateConversationError] = useState<string | null>(null);
  
  const handleCreateConversation = async () => {
    if (!newConversationName.trim()) return;
    
    try {
      setCreateConversationError(null);
      setIsCreatingConversation(true);
      
      console.log('Creating conversation with name:', newConversationName);
      
      const response = await createConversation(newConversationName, newConversationDesc);
      console.log('Conversation created successfully:', response);
      
      // Map the response to our Conversation type format
      const newConversation: Conversation = {
        id: response.conversation_id,
        name: response.name || `Conversation ${response.conversation_id.substring(0, 8)}`,
        description: response.description || '',
        created_at: new Date(response.created_at).getTime(),
      };
      
      // Update conversations list
      setConversations((prev) => [...prev, newConversation]);
      
      // Switch to the new conversation
      setCurrentConversationId(response.conversation_id);
      
      // Clear form and close modal
      setNewConversationName('');
      setNewConversationDesc('');
      setShowConversationModal(false);
      
      // Clear messages for the new conversation
      setMessages([]);
      
    } catch (error: any) {
      console.error('Error creating conversation:', error);
      
      // Extract the most useful error message
      let errorMessage = 'Failed to create conversation';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.originalError && error.originalError.message) {
        errorMessage = error.originalError.message;
      }
      
      setCreateConversationError(errorMessage);
      
      // Keep modal open so user can see the error
    } finally {
      setIsCreatingConversation(false);
    }
  };

  // Handle conversation change
  const handleConversationChange = (conversationId: string | null) => {
    setCurrentConversationId(conversationId);
  };

  // Handle delete conversation
  const handleDeleteConversation = async (id: string) => {
    try {
      await deleteConversation(id);
      
      // Remove from local state
      setConversations((prev) => prev.filter((c) => c.id !== id));
      
      // Remove from local storage
      deleteLocalConversation(id);
      
      // If current conversation was deleted, reset
      if (currentConversationId === id) {
        setCurrentConversationId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const handleClearHistory = () => {
    if (currentConversationId) {
      // Just clear messages for this conversation
      setMessages([]);
    } else {
      // Clear general messages
      clearMessages();
      setMessages([]);
    }
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
      // Pass conversation ID if we have one
      const data = await getAnswer(input, defaultPrompt, currentConversationId || undefined);
      
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

  // Fetch Q/A pairs from the API
  const fetchConversationQA = async (conversationId: string) => {
    try {
      setQaLoading(true);
      setQaError(null);
      
      const response = await getConversationQA(conversationId);
      
      if (response.status === 'success') {
        if (response.qa_pairs && response.qa_pairs.length > 0) {
          // Map the API response format (question/answer) to our component's format (question/response)
          const formattedQA = response.qa_pairs.map(qa => ({
            question: qa.question,
            response: qa.answer
          }));
          
          setQuestionAnswers(formattedQA);
          // Open sidebar if we have Q/A pairs
          setSidebarOpen(true);
        } else {
          setQuestionAnswers([]);
          if (response.message) {
            setQaError(response.message);
          }
        }
      } else if (response.status === 'error') {
        setQuestionAnswers([]);
        setQaError(response.message || 'Failed to load Q/A pairs');
      }
    } catch (error) {
      console.error('Error fetching conversation Q/A:', error);
      setQaError('Failed to load document Q/A pairs');
      setQuestionAnswers([]);
    } finally {
      setQaLoading(false);
    }
  };
  
  // Handle document processing with conversation support
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
      // If we have a current conversation ID, always use it regardless of radio selection
      // This is the key change to ensure we use existing conversations
      if (currentConversationId) {
        console.log(`Using existing conversation: ${currentConversationId}`);
        
        // Force the useExistingConversation to true to maintain UI consistency
        if (!useExistingConversation) {
          setUseExistingConversation(true);
        }
        
        const result = await processDocument(
          fileUrl,
          currentConversationId,
          undefined // No need for conversation name when using existing ID
        );
        
        // Always fetch Q/A pairs with the current conversation ID
        if (result.processing_time && result.processing_time.doc_processing_response_info === 'Succeed') {
          fetchConversationQA(currentConversationId);
          
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
      } else {
        // No existing conversation ID, proceed with normal flow
        let conversationName = undefined;
        
        if (!useExistingConversation && newFileConversationName.trim()) {
          // User wants to create a named conversation
          conversationName = newFileConversationName.trim();
          console.log(`Creating new named conversation: ${conversationName}`);
        } else {
          // Using classic mode with default conversation
          console.log('Using classic mode with default conversation');
        }
        
        const result = await processDocument(
          fileUrl,
          undefined,
          !useExistingConversation ? conversationName : undefined
        );
        
        // After successful processing, if a conversation was created, load the Q/A pairs
        if (result.conversation_id) {
          setCurrentConversationId(result.conversation_id);
          
          // Always fetch Q/A pairs from the API after document processing
          fetchConversationQA(result.conversation_id);
          
          // Create a formatted name for auto-created conversations if none provided
          if (!conversationName) {
            // Format a readable name from the conversation ID - first 8 chars
            const formattedId = result.conversation_id.substring(0, 8);
            const timestamp = new Date().toLocaleDateString();
            const autoName = `Conversation ${formattedId}... (${timestamp})`;
            
            // Add this conversation to our list with the formatted name
            const newConversation: Conversation = {
              id: result.conversation_id,
              name: autoName,
              created_at: new Date().getTime(),
              document_count: 1
            };
            
            setConversations(prev => [...prev, newConversation]);
            
            // Also save this to local storage
            const storedConversation: StoredConversation = {
              id: result.conversation_id,
              name: autoName,
              created_at: new Date().toISOString(),
              messages: [] // Empty messages as this is new
            };
            saveConversation(storedConversation);
            
            console.log(`Auto-created conversation named: ${autoName}`);
          } else {
            // Refresh conversations list to include the new one
            fetchConversations();
          }
        }
        
        if (result.processing_time && result.processing_time.doc_processing_response_info === 'Succeed') {
          setUploadSuccess(true);
          
          setTimeout(() => {
            setUploadSuccess(false);
            setShowUploadInput(false);
            setFileUrl('');
            setNewFileConversationName('');
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
            <div className="flex-shrink-0 w-10 h-10 mr-3">
              <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-sm">
                <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
            </div>
            <h1 className="text-xl font-medium text-neutral-900 font-display">Document Chat</h1>
            
            {/* Conversation selector */}
            <div className="ml-4">
              <div className="relative inline-block">
                <button
                  onClick={() => setShowConversationModal(true)}
                  className="text-sm px-3 py-1.5 rounded-lg transition-all duration-200 bg-primary-100 text-primary-700 hover:bg-primary-200 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>New Conversation</span>
                </button>
              </div>
                
              <div className="relative inline-block ml-2">
                <select
                  value={currentConversationId || ''}
                  onChange={(e) => handleConversationChange(e.target.value || null)}
                  className="text-sm px-3 py-1.5 rounded-lg transition-all duration-200 border border-neutral-300 bg-neutral-50 text-neutral-700 hover:bg-neutral-100 appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[180px]"
                >
                  <option value="">Choose a conversation...</option>
                  {conversations.length === 0 && conversationsLoading ? (
                    <option disabled>Loading conversations...</option>
                  ) : conversations.length === 0 ? (
                    <option disabled>No conversations available</option>
                  ) : (
                    conversations.map((conversation) => (
                      <option key={conversation.id} value={conversation.id} className="py-1">
                        {conversation.name || 'Unnamed conversation'} 
                        {conversation.document_count !== undefined && 
                          ` (${conversation.document_count} document${conversation.document_count !== 1 ? 's' : ''})`
                        }
                      </option>
                    ))
                  )}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="h-4 w-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
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
                <svg viewBox="0 0 24 24" className={`h-4 w-4 mr-1.5 transition-transform duration-300 ${sidebarOpen ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor">
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
      
      {/* New Conversation Modal */}
      {showConversationModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-scale-in">
            <div className="px-6 py-4 bg-gradient-to-r from-neutral-50 to-primary-50/20 border-b border-neutral-200">
              <h3 className="text-lg font-medium text-neutral-900">Create New Conversation</h3>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label htmlFor="conv-name" className="block text-sm font-medium text-neutral-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="conv-name"
                  value={newConversationName}
                  onChange={(e) => setNewConversationName(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                  placeholder="e.g., French History"
                  required
                />
              </div>
              <div className="mb-6">
                <label htmlFor="conv-desc" className="block text-sm font-medium text-neutral-700 mb-1">
                  Description (optional)
                </label>
                <input
                  type="text"
                  id="conv-desc"
                  value={newConversationDesc}
                  onChange={(e) => setNewConversationDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                  placeholder="e.g., Documents about French historical events"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowConversationModal(false)}
                  className="px-4 py-2 border border-neutral-300 rounded-md text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!newConversationName.trim() || isCreatingConversation}
                  onClick={handleCreateConversation}
                  className={`px-4 py-2 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                    !newConversationName.trim() || isCreatingConversation
                      ? 'bg-neutral-400 cursor-not-allowed'
                      : 'bg-primary-600 hover:bg-primary-700'
                  }`}
                >
                  {isCreatingConversation ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </div>
                  ) : (
                    'Create Conversation'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex flex-1 overflow-hidden">
        {/* Q&A Sidebar */}
        {sidebarOpen && questionAnswers.length > 0 && (
          <div className="bg-white border-r border-neutral-200 flex-shrink-0 overflow-y-auto w-80 transition-all duration-300 ease-in-out">
            <div className="p-4 border-b border-neutral-200 bg-gradient-to-r from-neutral-50 to-primary-50/20 sticky top-0 z-10">
              <h2 className="font-medium text-neutral-900 flex items-center">
                <svg viewBox="0 0 24 24" className="h-5 w-5 mr-2 text-primary-500" fill="none" stroke="currentColor">
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
                    <div className="w-40 h-40 mb-6">
                      <svg viewBox="0 0 200 200" className="w-full h-full" fill="none">
                        <circle cx="100" cy="100" r="80" fill="#F0F9FF" />
                        <path d="M70 100a30 30 0 1160 0 30 30 0 01-60 0z" fill="#DBEAFE" />
                        <path d="M100 70v60" stroke="#60A5FA" strokeWidth="4" strokeLinecap="round" />
                        <path d="M70 100h60" stroke="#60A5FA" strokeWidth="4" strokeLinecap="round" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-medium text-neutral-900 mb-2 font-display">
                      Welcome to Document Chat
                    </h3>
                    <p className="text-neutral-600 max-w-md mx-auto">
                      Upload your PDF documents using the button below and ask questions to get AI-powered insights from your content.
                    </p>
                    <button
                      onClick={() => setShowUploadInput(true)}
                      className="mt-6 flex items-center px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-lg hover:from-primary-700 hover:to-primary-600 transition duration-200 shadow-md"
                    >
                      <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2" fill="none" stroke="currentColor">
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
              <div className={`mb-4 overflow-hidden transition-all duration-300 ease-in-out ${showUploadInput ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
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
                  
                  {/* Conversation options */}
                  <div className="mt-3 bg-white rounded-lg border border-neutral-200 p-2.5 mb-2">
                    <div className="text-xs font-medium text-neutral-500 mb-2">Conversation Settings</div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <input
                          id="use-existing"
                          type="radio"
                          checked={useExistingConversation}
                          onChange={() => setUseExistingConversation(true)}
                          name="conversation-option"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300"
                          disabled={isProcessing}
                        />
                        <label htmlFor="use-existing" className="ml-2 text-sm text-neutral-700">
                          {currentConversationId ? 'Use current conversation' : 'Create default conversation'}
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="create-new"
                          type="radio"
                          checked={!useExistingConversation}
                          onChange={() => setUseExistingConversation(false)}
                          name="conversation-option"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300"
                          disabled={isProcessing}
                        />
                        <label htmlFor="create-new" className="ml-2 text-sm text-neutral-700">
                          Create new conversation
                        </label>
                      </div>
                    </div>
                    
                    {!useExistingConversation && (
                      <div className="mt-2">
                        <input
                          type="text"
                          placeholder="New conversation name"
                          value={newFileConversationName}
                          onChange={(e) => setNewFileConversationName(e.target.value)}
                          className="w-full p-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500 text-sm shadow-sm"
                          disabled={isProcessing}
                        />
                      </div>
                    )}
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
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor">
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
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor">
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
