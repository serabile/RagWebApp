# RAG Service API Documentation

This documentation covers the REST API endpoints provided by the RAG (Retrieval Augmented Generation) service and details how your front-end application should interact with them.

## Authentication

All endpoints accept an optional `api_key` header for authentication. Include this header with your API requests if required:

```
api_key: your-api-key-here
```

## Endpoints

### 1. Query Processing (`/answer`)

Sends a query to the RAG system to get a response based on the knowledge base.

- **Method:** POST
- **Content-Type:** application/json

**Request Body:**
```json
{
  "query": "What is RAG?",
  "prompt": "Optional custom prompt to guide the model",
  "provider": "Optional LLM provider (e.g., openai)",
  "model": "Optional model name (e.g., gpt-4)",
  "conversation_id": "Optional ID of an existing conversation"
}
```

**Response:**
```json
{
  "answer": "RAG stands for Retrieval Augmented Generation...",
  "source": "llm",
  "timing": {
    "total_time": 0.854,
    "llm_response_time": 0.652,
    "similarity_database_search_time": 0.112
  },
  "conversation_id": "uuid-of-conversation",
  "activity_info": {}
}
```

**Important Notes:**
- If no `conversation_id` is provided, the system will use the current active conversation in the RAG instance or create a new one.
- The `answer` field indicates whether the response came from the database or the LLM model.
- `activity_info` will be populated if the conversation is linked to an activity.

### 2. Document Processing (`/processing`)

Uploads and processes a document to be added to the knowledge base.

- **Method:** POST
- **Content-Type:** application/json

**Request Body:**
```json
{
  "file": "/path/to/document.pdf",
  "provider": "Optional LLM provider",
  "model": "Optional model name",
  "conversation_id": "Optional ID of an existing conversation",
  "conversation_name": "Optional name for a new conversation"
}
```

**Response:**
```json
{
  "document_id": "uuid-of-processed-document",
  "conversation_id": "uuid-of-conversation",
  "processing_time": {
    "total_processing_time": 12.45,
    "document_loading_time": 0.35,
    "document_splitting_time": 0.12,
    "embedding_generation_time": 8.65,
    "database_insertion_time": 3.33
  }
}
```

**Important Notes:**
- If `conversation_id` is not provided, a new conversation will be automatically created with either:
  - The name provided in `conversation_name` if specified
  - A generic name based on the conversation ID if not specified
- The front-end should store and use the returned `conversation_id` for future interactions
- This represents the new behavior we discussed: automatic conversation creation when uploading files

### 3. Create Conversation (`/conversations`)

Creates a new empty conversation.

- **Method:** POST
- **Content-Type:** application/json

**Request Body:**
```json
{
  "name": "Optional conversation name",
  "description": "Optional conversation description"
}
```

**Response:**
```json
{
  "conversation_id": "uuid-of-new-conversation",
  "name": "Conversation name (if provided)",
  "description": "Conversation description (if provided)",
  "created_at": "2025-04-02T14:30:00.000Z"
}
```

### 4. List Conversations (`/conversations`)

Returns a list of all available conversations.

- **Method:** GET

**Response:**
```json
{
  "conversations": [
    {
      "id": "conversation-uuid-1",
      "name": "First Conversation",
      "description": "Description of first conversation",
      "created_at": "2025-04-01T10:00:00.000Z",
      "document_count": 2
    },
    {
      "id": "conversation-uuid-2",
      "name": "Second Conversation",
      "description": null,
      "created_at": "2025-04-02T09:30:00.000Z",
      "document_count": 1
    }
  ]
}
```

### 5. Delete Conversation (`/conversations/{conversation_id}`)

Deletes a specific conversation.

- **Method:** DELETE
- **URL Parameter:** conversation_id - The ID of the conversation to delete

**Response:**
```json
{
  "status": "success",
  "message": "Conversation abc123 deleted"
}
```

**Error Response:**
```json
{
  "status": "error",
  "message": "Conversation abc123 not found"
}
```


**Important Notes:**
- If a conversation for this activity already exists, it will be reused
- If `document_url` is provided, the document will be processed and added to the conversation
- Front-end should use the returned `conversation_id` for subsequent queries

### 7. Clear Database (`/database`)

Removes all stored documents from the database.

- **Method:** DELETE

**Response:**
```json
{
  "status": "success",
  "message": "Database cleared successfully"
}
```

### 8. Get Conversation Q/A Pairs (`/conversations/{conversation_id}/qa`)

Retrieves all question/answer pairs generated during document processing for a specific conversation.

- **Method:** GET
- **URL Parameter:** conversation_id - The ID of the conversation

**Response:**
```json
{
  "status": "success",
  "conversation_id": "uuid-of-conversation",
  "qa_count": 2,
  "qa_pairs": [
    {
      "question": "What is RAG?",
      "answer": "RAG stands for Retrieval Augmented Generation..."
    },
    {
      "question": "How does RAG work?",
      "answer": "RAG works by retrieving relevant documents..."
    }
  ]
}
```

**Error Responses:**
```json
{
  "status": "error",
  "message": "Conversation abc123 not found"
}
```

or

```json
{
  "status": "success",
  "qa_pairs": [],
  "message": "No documents found for this conversation"
}
```

## Front-End Implementation Guidelines

### File Upload and Conversation Creation

To properly implement document uploading with the new conversation creation behavior:

1. **Direct Upload Without Conversation:**
   ```javascript
   async function uploadDocument(file) {
     try {
       const response = await fetch('/api/processing', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           file: file.path
           // No conversation_id means a new one will be created
         })
       });
       
       const data = await response.json();
       
       // IMPORTANT: Store the returned conversation ID
       const newConversationId = data.conversation_id;
       
       // Update UI to show the new conversation
       addConversationToUI({
         id: newConversationId,
         name: `Conversation ${newConversationId.substring(0, 8)}...`,
         created_at: new Date().toISOString()
       });
       
       return data;
     } catch (error) {
       console.error('Error uploading document:', error);
     }
   }
   ```

2. **Upload to Existing Conversation:**
   ```javascript
   async function uploadToConversation(file, conversationId) {
     try {
       const response = await fetch('/api/processing', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           file: file.path,
           conversation_id: conversationId
         })
       });
       
       return await response.json();
     } catch (error) {
       console.error('Error uploading to conversation:', error);
     }
   }
   ```

3. **Create Conversation with Name First, Then Upload:**
   ```javascript
   async function createNamedConversationAndUpload(file, name, description = '') {
     try {
       // Step 1: Create conversation
       const conversationResponse = await fetch('/api/conversations', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ name, description })
       });
       
       const conversationData = await conversationResponse.json();
       const conversationId = conversationData.conversation_id;
       
       // Step 2: Upload to this conversation
       const uploadResponse = await fetch('/api/processing', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           file: file.path,
           conversation_id: conversationId
         })
       });
       
       return await uploadResponse.json();
     } catch (error) {
       console.error('Error in create and upload workflow:', error);
     }
   }
   ```

### Querying with Conversations

When sending queries to the system, always include the conversation ID if you want to maintain conversation context:

```javascript
async function sendQuery(query, conversationId) {
  try {
    const response = await fetch('/api/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: query,
        conversation_id: conversationId
        // Include prompt, provider, model if needed
      })
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error sending query:', error);
  }
}
```

### Managing Conversations

The front-end should provide UI for creating, listing, and deleting conversations. It should also properly handle the automatic conversation creation when uploading documents.

1. **List all conversations:**
   - Call the `/conversations` GET endpoint
   - Display conversations in UI with name, creation date, and document count
   
2. **Create explicit conversation:**
   - Use a form to collect conversation name and description
   - Call `/conversations` POST endpoint
   - Update UI with the new conversation
   
3. **Delete conversation:**
   - Add delete button to each conversation in UI
   - Call `/conversations/{id}` DELETE endpoint
   - Remove conversation from UI on successful deletion
   
4. **Handling auto-created conversations:**
   - After document upload with no conversation ID, extract the returned ID
   - Add this conversation to the UI list, using a generic name based on ID
   - Allow renaming the conversation later if needed

## Error Handling

Implement proper error handling for all API calls:

1. Network errors (API unreachable)
2. Authentication errors (invalid API key) 
3. Processing errors (invalid file format, etc.)
4. Missing resources (conversation not found)

Display appropriate error messages to users and implement retry mechanisms where appropriate.

## Conclusion

This API provides comprehensive functionality for managing conversations, processing documents, and generating responses using the RAG system. The front-end implementation should take advantage of the conversation management features to provide a seamless user experience.

The most important update to implement is handling the automatic conversation creation when uploading documents without specifying a conversation ID. The front-end should store the returned conversation ID and use it for subsequent interactions.