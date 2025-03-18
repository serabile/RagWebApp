import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="mt-6 text-center text-4xl font-extrabold text-gray-900">
            RAG Assistant
          </h1>
          <p className="mt-3 text-center text-xl text-gray-600">
            Upload documents and chat with their content
          </p>
        </div>
        <div className="mt-10 space-y-6">
          <Link 
            href="/upload" 
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
          >
            Upload a Document
          </Link>
          <Link
            href="/chat"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150"
          >
            Chat with Documents
          </Link>
        </div>
        
        <div className="mt-4 text-center">
          <Link href="/settings" className="text-sm text-blue-600 hover:text-blue-500">
            Settings
          </Link>
        </div>
      </div>
    </div>
  );
}
