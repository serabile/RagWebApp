'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { processDocument } from '@/lib/api-client';

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // For demo purposes, we'll simulate uploading to a server
      // In a real app, you would upload the file to your server
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate the file being available at the URL
      const fileUrl = `http://192.168.1.26/${file.name}`;
      
      // Process the file with the RAG service
      setUploading(false);
      setProcessing(true);
      
      // Use the processDocument function from api-client.ts
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
            Upload a Document
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Select a PDF file to process with our RAG system
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm">
            <div className="mb-4">
              <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">
                Document File (PDF)
              </label>
              <input
                id="file-upload"
                name="file"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="mt-2 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none p-2"
              />
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
              disabled={uploading || processing || success}
              className={`group relative flex w-auto justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium text-white ${
                uploading || processing || success 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              }`}
            >
              {uploading ? 'Uploading...' : processing ? 'Processing...' : 'Upload & Process'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
