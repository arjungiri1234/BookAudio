-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Books table
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT,
  file_url TEXT,
  file_type TEXT,
  total_pages INT,
  total_chunks INT,
  status TEXT DEFAULT 'processing',
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
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Chat history
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  source_chunks JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

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

-- RLS Policies
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own books"
  ON books FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view chunks of their own books"
  ON book_chunks FOR SELECT
  USING (book_id IN (SELECT id FROM books WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage their own chat messages"
  ON chat_messages FOR ALL
  USING (auth.uid() = user_id);
