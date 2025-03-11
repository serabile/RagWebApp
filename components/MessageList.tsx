import React from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`p-4 rounded-lg ${
            message.role === 'user'
              ? 'bg-blue-100 ml-8'
              : 'bg-gray-100 mr-8'
          }`}
        >
          <div className="flex items-center mb-1">
            <div className={`font-medium ${
              message.role === 'user' ? 'text-blue-700' : 'text-gray-800'
            }`}>
              {message.role === 'user' ? 'You' : 'AI Assistant'}
            </div>
            <div className="text-xs text-gray-500 ml-2">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
          <div className="whitespace-pre-wrap">{message.content}</div>
        </div>
      ))}
    </div>
  );
}
