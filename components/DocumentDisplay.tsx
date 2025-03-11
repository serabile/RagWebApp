import React from 'react';

interface DocumentDisplayProps {
  document: {
    id: string;
    name: string;
    content?: string;
  };
}

export default function DocumentDisplay({ docuxment }: DocumentDisplayProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="border-b pb-2 mb-4">
        <h2 className="text-lg font-semibold">Document</h2>
        <div className="text-sm text-gray-600">{document.name}</div>
      </div>
      
      <div className="overflow-auto flex-1 text-sm">
        {document.content ? (
          <pre className="whitespace-pre-wrap font-sans">{document.content}</pre>
        ) : (
          <div className="text-gray-500 italic">Content preview not available</div>
        )}
      </div>
    </div>
  );
}
