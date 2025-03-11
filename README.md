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
│   ├── api/             # API routes
│   ├── chat/            # Chat interface page
│   ├── upload/          # File upload page
│   └── page.tsx         # Home page
├── components/          # React components
├── lib/                 # Utility functions, hooks, and services
├── public/              # Static assets
└── types/               # TypeScript type definitions
```

## Deployment

This application can be easily deployed on Vercel:

```bash
npm run build
npm run start
```

For production deployment, use the Vercel platform or your preferred hosting service.

## License

[MIT](LICENSE)
```
