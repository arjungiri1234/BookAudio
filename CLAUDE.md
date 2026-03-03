# CLAUDE.md — BookAudio AI Project

## 🧠 Project Overview

A web application that allows users to upload books (PDF/EPUB/TXT) and interact with the content through:
- A **chat interface** (text-based Q&A)
- A **voice interface** powered by **Vapi AI**

The system extracts and indexes book content, enabling semantic search across pages, chapters, and sections. Users can ask natural language questions and receive answers with precise references (page numbers, chapter titles).

---

## 🏗️ Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React.js, TailwindCSS, HTML         |
| Backend     | Node.js, Express.js                 |
| Database    | Supabase (PostgreSQL + pgvector)    |
| Voice AI    | Vapi AI                             |
| Auth        | Supabase Auth                       |
| Storage     | Supabase Storage (book file uploads)|
| Embeddings  | OpenAI `text-embedding-3-small` (or similar) |
| LLM (Q&A)  | OpenAI GPT-4o / Anthropic Claude    |

---

## 📁 Project Structure

```
/
├── client/                         # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── ui/                 # Reusable UI components (Button, Modal, Input)
│   │   │   ├── BookUploader.jsx    # Drag-and-drop file upload component
│   │   │   ├── ChatBox.jsx         # Text-based Q&A interface
│   │   │   ├── VoiceAssistant.jsx  # Vapi AI voice interaction component
│   │   │   ├── BookViewer.jsx      # Display book content / highlight sections
│   │   │   ├── SectionCard.jsx     # Display matched chapter/section result
│   │   │   └── Navbar.jsx
│   │   ├── hooks/
│   │   │   ├── useVapi.js          # Custom hook for Vapi AI integration
│   │   │   ├── useChat.js          # Custom hook for chat state management
│   │   │   └── useBook.js          # Custom hook for book state
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Dashboard.jsx       # Main app page after login
│   │   │   ├── BookDetail.jsx      # View + interact with a specific book
│   │   │   └── Auth.jsx            # Login / Signup
│   │   ├── services/
│   │   │   ├── api.js              # Axios instance + API calls to backend
│   │   │   ├── supabase.js         # Supabase client initialization
│   │   │   └── vapiService.js      # Vapi AI SDK setup and call handlers
│   │   ├── store/                  # Zustand or Context API state
│   │   │   ├── bookStore.js
│   │   │   └── authStore.js
│   │   ├── utils/
│   │   │   └── formatters.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css               # Tailwind base styles
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── server/                         # Node.js + Express Backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── supabase.js         # Supabase admin client
│   │   │   └── openai.js           # OpenAI client
│   │   ├── controllers/
│   │   │   ├── bookController.js   # Upload, parse, index book
│   │   │   ├── chatController.js   # Handle Q&A queries
│   │   │   └── vapiController.js   # Handle Vapi webhook / tool calls
│   │   ├── middleware/
│   │   │   ├── auth.js             # Supabase JWT verification
│   │   │   ├── upload.js           # Multer file upload middleware
│   │   │   └── errorHandler.js
│   │   ├── routes/
│   │   │   ├── bookRoutes.js
│   │   │   ├── chatRoutes.js
│   │   │   └── vapiRoutes.js
│   │   ├── services/
│   │   │   ├── bookParser.js       # Parse PDF/EPUB/TXT into sections
│   │   │   ├── embeddings.js       # Generate + store vector embeddings
│   │   │   ├── search.js           # Semantic search via pgvector
│   │   │   └── llm.js              # LLM query answering with context
│   │   ├── utils/
│   │   │   └── chunker.js          # Split book into semantic chunks
│   │   └── app.js                  # Express app setup
│   ├── index.js                    # Server entry point
│   └── package.json
│
├── supabase/
│   ├── migrations/                 # SQL migration files
│   │   └── 001_initial_schema.sql
│   └── seed.sql
│
├── .env.example
├── .gitignore
└── README.md
```

---

## 🗄️ Supabase Database Schema

```sql
-- Users (handled by Supabase Auth)

-- Books table
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT,
  file_url TEXT,                  -- Supabase Storage URL
  file_type TEXT,                 -- 'pdf' | 'epub' | 'txt'
  total_pages INT,
  total_chunks INT,
  status TEXT DEFAULT 'processing', -- 'processing' | 'ready' | 'error'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Book chunks (indexed sections)
CREATE TABLE book_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  chunk_index INT,
  content TEXT NOT NULL,
  page_number INT,
  chapter_title TEXT,
  section_title TEXT,
  embedding VECTOR(1536),         -- pgvector for semantic search
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Chat history
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,             -- 'user' | 'assistant'
  content TEXT NOT NULL,
  source_chunks JSONB,            -- referenced chunks [{chunk_id, page, title}]
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Semantic search function
CREATE OR REPLACE FUNCTION match_book_chunks(
  query_embedding VECTOR(1536),
  match_book_id UUID,
  match_threshold FLOAT DEFAULT 0.75,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID, content TEXT, page_number INT,
  chapter_title TEXT, section_title TEXT, similarity FLOAT
)
LANGUAGE SQL STABLE AS $$
  SELECT id, content, page_number, chapter_title, section_title,
    1 - (embedding <=> query_embedding) AS similarity
  FROM book_chunks
  WHERE book_id = match_book_id
    AND 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;
```

---

## 🔌 API Endpoints

### Books
```
POST   /api/books/upload          # Upload + process a book
GET    /api/books                 # Get all books for current user
GET    /api/books/:id             # Get single book details
DELETE /api/books/:id             # Delete a book
GET    /api/books/:id/chunks      # Get all chunks (for debug/preview)
```

### Chat
```
POST   /api/chat/query            # Ask a question about a book
GET    /api/chat/:bookId/history  # Get chat history for a book
DELETE /api/chat/:bookId/history  # Clear chat history
```

### Vapi
```
POST   /api/vapi/tool-call        # Webhook for Vapi tool calls
POST   /api/vapi/end-of-call      # Webhook for call completion logs
```

---

## 🎙️ Vapi AI Integration

### Setup
```js
// client/src/services/vapiService.js
import Vapi from "@vapi-ai/web";

const vapi = new Vapi(process.env.VITE_VAPI_PUBLIC_KEY);

export const startBookSession = (bookId, bookTitle) => {
  vapi.start({
    assistant: {
      name: "Book Assistant",
      firstMessage: `Hello! I'm ready to help you explore "${bookTitle}". What would you like to know?`,
      model: {
        provider: "openai",
        model: "gpt-4o",
        systemPrompt: `You are an expert assistant for the book "${bookTitle}". 
          Use the search_book tool to find relevant sections before answering.
          Always cite the page number and chapter when referencing content.`,
        tools: [{ type: "function", function: searchBookTool }],
      },
      voice: { provider: "11labs", voiceId: "rachel" },
    },
  });
};
```

### Vapi Tool Definition (Book Search)
```js
const searchBookTool = {
  name: "search_book",
  description: "Search the book for content related to a question. Returns relevant sections with page numbers and chapter titles.",
  parameters: {
    type: "object",
    properties: {
      query: { type: "string", description: "The search query or question" },
      book_id: { type: "string", description: "The ID of the book to search" },
    },
    required: ["query", "book_id"],
  },
};
```

### Vapi Webhook Handler (Backend)
```js
// server/src/controllers/vapiController.js
export const handleToolCall = async (req, res) => {
  const { toolCall } = req.body;
  if (toolCall.name === "search_book") {
    const { query, book_id } = toolCall.parameters;
    const results = await searchService.semanticSearch(query, book_id);
    return res.json({ result: JSON.stringify(results) });
  }
};
```

---

## ⚙️ Core Service Logic

### Book Processing Pipeline
```
Upload File → Store in Supabase Storage
           → Parse text (pdf-parse / epub / txt)
           → Split into chunks (by paragraph/page, ~500 tokens)
           → Generate embeddings (OpenAI)
           → Store chunks + embeddings in Supabase
           → Mark book status as 'ready'
```

### Q&A Flow (Chat & Voice)
```
User Question → Generate query embedding
             → pgvector similarity search → top 5 relevant chunks
             → Build prompt: [system] + [context chunks] + [question]
             → LLM generates answer with citations
             → Return answer + source references (page, chapter)
```

---

## 🌐 Environment Variables

```env
# client/.env
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_VAPI_PUBLIC_KEY=your_vapi_public_key

# server/.env
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
VAPI_WEBHOOK_SECRET=your_vapi_webhook_secret
```

---

## 📦 Key Dependencies

### Frontend
```json
{
  "@vapi-ai/web": "latest",
  "@supabase/supabase-js": "^2",
  "axios": "^1",
  "react-router-dom": "^6",
  "zustand": "^4",
  "react-dropzone": "^14",
  "react-hot-toast": "^2"
}
```

### Backend
```json
{
  "@supabase/supabase-js": "^2",
  "openai": "^4",
  "express": "^4",
  "multer": "^1",
  "pdf-parse": "^1",
  "epub2": "^3",
  "cors": "^2",
  "dotenv": "^16",
  "uuid": "^9"
}
```

---

## 🚀 Development Workflow

```bash
# Start backend
cd server && npm run dev      # nodemon on port 5000

# Start frontend
cd client && npm run dev      # Vite on port 5173
```

---

## ✅ Implementation Checklist

### Phase 1 — Foundation
- [ ] Supabase project setup + schema migration
- [ ] Express server boilerplate + auth middleware
- [ ] React app setup with Tailwind + routing

### Phase 2 — Book Upload & Processing
- [ ] File upload UI (drag-and-drop)
- [ ] Backend: parse PDF/EPUB/TXT
- [ ] Backend: chunk + embed + store in Supabase

### Phase 3 — Chat Interface
- [ ] ChatBox component (send message, display response)
- [ ] Backend: semantic search endpoint
- [ ] Backend: LLM answer generation with citations

### Phase 4 — Voice Interface
- [ ] Vapi SDK integration (`useVapi` hook)
- [ ] Backend: Vapi webhook tool-call handler
- [ ] Voice session UI (start/stop call button)

### Phase 5 — Polish
- [ ] Loading states, error handling
- [ ] Book library dashboard
- [ ] Chat history persistence
- [ ] Mobile responsiveness

---

## 🔒 Security Notes

- Always verify Supabase JWT on every protected backend route
- Use Supabase Row Level Security (RLS) — users can only access their own books
- Validate file types and size before processing (max 50MB, PDF/EPUB/TXT only)
- Store `SUPABASE_SERVICE_ROLE_KEY` only on the backend — never expose it client-side
- Verify Vapi webhook signatures using `VAPI_WEBHOOK_SECRET`

---

## 📝 Notes for Claude (AI Assistant)

When helping with this codebase:
- Always consider the book processing pipeline when modifying chunk/embedding logic
- The `book_id` must be threaded through all search calls (chat and voice)
- Vapi tool calls are server-side webhooks — do not handle them client-side
- Use Supabase RLS policies, not manual user_id checks in every query
- Prefer streaming responses for the chat interface (SSE or WebSocket)
- Book details (title, author, chapter structure) will be provided later — design schemas to be flexible
