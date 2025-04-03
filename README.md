# RagWebApp - Document Q&A Application

A Next.js application that allows users to upload documents and ask questions about them using RAG (Retrieval-Augmented Generation) technology, similar to Claude's chat functionality.

## Features

- 📄 File upload and processing
- 💬 Interactive Q&A with your documents
- 🔍 Semantic search within document content
- 📱 Responsive design for desktop and mobile devices

## Tech Stack

- **Frontend:** Next.js, React, Tailwind CSS
- **AI/ML:** LangChain, OpenAI/Claude API
- **Vector Database:** (Pinecone/Weaviate/Qdrant)
- **File Processing:** PDF.js, DOCX parser

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- OpenAI API key or Claude API key

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/serabile/RagWebApp.git
   cd RagWebApp
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory and add your API keys
   ```
   OPENAI_API_KEY=your_openai_api_key
   # or
   ANTHROPIC_API_KEY=your_claude_api_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser

## How It Works

1. **Upload Document**: Users can upload various document types (PDF, DOCX, TXT, etc.)
2. **Document Processing**: The app extracts text, splits it into chunks, and creates embeddings
3. **Vector Storage**: Embeddings are stored in a vector database for efficient retrieval
4. **User Questions**: Users can ask questions about the uploaded document
5. **RAG Process**: The app retrieves relevant context from the vector DB and uses AI to generate accurate answers

## Project Structure

```
/RagWebApp
├── app/                  # Next.js app directory
│   ├── api/             # API routes for backend functionality
│   ├── chat/            # Chat interface page for Q&A interactions
│   ├── settings/        # Application settings page
│   ├── upload/          # File upload page for document processing
│   └── page.tsx         # Home page
├── contexts/            # React contexts for state management
├── lib/                 # Utility functions, hooks, and services
│   ├── api-client.ts    # API client for backend communication
│   ├── error-utils.ts   # Error handling utilities
│   ├── storage.ts       # Local storage management
│   └── env.ts           # Environment configuration
├── public/              # Static assets
└── types/               # TypeScript type definitions
```

## Deployment

### Vercel Deployment

This application can be easily deployed on Vercel:

```bash
npm run build
npm run start
```

### Docker Deployment

The application can also be deployed using Docker:

1. Build the Docker image:
   ```bash
   docker build -t rag-web-app .
   ```

2. Run the container:
   ```bash
   docker run -p 3000:3000 rag-web-app
   ```

3. Access the application at [http://localhost:3000](http://localhost:3000)

## TypeScript Support

This project is fully typed with TypeScript, providing:

- Type-safe API client for backend communication
- Proper error handling with typed responses
- Strong typing for all React components and contexts

## License

[MIT](LICENSE)
