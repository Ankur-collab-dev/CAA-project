-- PostgreSQL Strict Schema with User Isolation & Authentication

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Documents library table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  file_type TEXT DEFAULT 'pasted',
  word_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents (user_id);

-- 2. Reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  reference_label TEXT NOT NULL,
  similarity NUMERIC(5, 2) NOT NULL,
  word_count INTEGER NOT NULL DEFAULT 0,
  sentences JSONB NOT NULL DEFAULT '[]'::jsonb,
  sources JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports (user_id);

-- 3. Strict Row Level Security (RLS)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can read their own documents
CREATE POLICY "Strict user read documents"
ON documents FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Strict user insert documents"
ON documents FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Only authenticated users can read their own reports
CREATE POLICY "Strict user read reports"
ON reports FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Strict user insert reports"
ON reports FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);
