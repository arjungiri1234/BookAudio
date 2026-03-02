# 📚 BookAudio AI

A web application that allows users to upload books (PDF/EPUB/TXT) and interact with the content through a **chat interface** and a **voice interface** powered by **Vapi AI**.

## Features

- **Book Upload** — Drag-and-drop PDF, EPUB, or TXT files
- **Semantic Search** — Vector-based content retrieval using pgvector
- **Chat Q&A** — Ask natural language questions, get answers with page/chapter citations
- **Voice Q&A** — Talk to your book using Vapi AI voice assistant
- **Book Library** — Dashboard to manage all uploaded books

## Tech Stack

| Layer       | Technology                           |
|-------------|--------------------------------------|
| Frontend    | React.js, TailwindCSS, Vite         |
| Backend     | Node.js, Express.js                 |
| Database    | Supabase (PostgreSQL + pgvector)    |
| Voice AI    | Vapi AI                             |
| Auth        | Supabase Auth                       |
| Storage     | Supabase Storage                    |
| Embeddings  | OpenAI `text-embedding-3-small`     |
| LLM         | OpenAI GPT-4o / Anthropic Claude    |

## Getting Started

### Prerequisites

- Node.js v18+
- Supabase project with pgvector enabled
- OpenAI API key
- Vapi AI account

### Setup

```bash
# Clone the repo
git clone <your-repo-url>
cd book-audio-project

# Install dependencies
cd client && npm install
cd ../server && npm install

# Copy env files
cp .env.example client/.env
cp .env.example server/.env
# Fill in your API keys in both .env files

# Start development servers
cd server && npm run dev    # Express on port 5000
cd client && npm run dev    # Vite on port 5173
```

## Project Structure

```
├── client/          # React Frontend (Vite)
├── server/          # Node.js + Express Backend
├── supabase/        # Database migrations & seeds
├── .env.example     # Environment variable template
└── README.md
```

## License

MIT
