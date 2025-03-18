'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { processDocument } from '@/lib/api-client';

export default function Upload() {
  const [fileUrl, setFileUrl] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileUrl(e.target.value);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileUrl.trim()) {
      setError('Please enter a PDF URL');
      return;
    }

    // Validate if it looks like a PDF URL
    if (!fileUrl.toLowerCase().endsWith('.pdf')) {
      setError('URL must point to a PDF file');
      return;
    }

    setError(null);
    setProcessing(true);

    try {
      // Process the file with the RAG service using the direct URL
      const result = await processDocument(fileUrl);
      
      if (result.processing_time && result.processing_time.doc_processing_response_info === 'Succeed') {
        setSuccess(true);
        // Redirect to chat page after success
        setTimeout(() => {
          router.push('/chat');
        }, 2000);
      } else {
        setError('Failed to process the document');
      }
    } catch (err) {
      setError('An error occurred while processing your request');
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Process a Document
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter the URL of a PDF file to process with our RAG system
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm">
            <div className="mb-4">
              <label htmlFor="pdf-url" className="block text-sm font-medium text-gray-700">
                PDF Document URL
              </label>
              <input
                id="pdf-url"
                name="pdfUrl"
                type="url"
                placeholder="http://example.com/document.pdf"
                value={fileUrl}
                onChange={handleUrlChange}
                className="mt-2 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter the full URL to a PDF document (must end with .pdf)
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              Document processed successfully! Redirecting to chat...
            </div>
          )}

          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Back to home
            </Link>
            
            <button
              type="submit"
              disabled={processing || success}
              className={`group relative flex w-auto justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium text-white ${
                processing || success 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              }`}
            >
              {processing ? 'Processing...' : 'Process Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
