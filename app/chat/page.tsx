"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ChatInterface from '@/components/ChatInterface';
import DocumentDisplay from '@/components/DocumentDisplay';

export default function Chat() {
  const [loading, setLoading] = useState(true);
  const [documentData, setDocumentData] = useState<{
    id: string;
    name: string;
    content?: string;
  } | null>(null);
  
  const searchParams = useSearchParams();
  const documentId = searchParams.get('documentId');

  useEffect(() => {
    if (!documentId) {
      setLoading(false);
      return;
    }

    const fetchDocument = async () => {
      try {
        const response = await fetch(`/api/documents/${documentId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch document');
        }
        
        const data = await response.json();
        setDocumentData(data);
      } catch (error) {
        console.error('Error fetching document:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [documentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading document...</div>
      </div>
    );
  }

  if (!documentId || !documentData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">No document selected. Please upload a document first.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <div className="w-full md:w-1/3 p-4 border-r">
        <DocumentDisplay document={documentData} />
      </div>
      <div className="w-full md:w-2/3 h-full">
        <ChatInterface documentId={documentId} />
      </div>
    </div>
  );
}
