export type SimilarityLevel = 'low' | 'moderate' | 'high';

export interface SentenceMatch {
  text: string;
  matched: boolean;
  similarity: number;
  source: {
    title: string;
    excerpt: string;
  } | null;
}

export interface SourceOverlap {
  title: string;
  percent: number;
}

export interface PlagiarismAnalysis {
  similarity: number;
  wordCount: number;
  sentences: SentenceMatch[];
  sources: SourceOverlap[];
}

export interface DocumentRecord {
  id: string;
  title: string;
  content: string;
  file_type?: string;
  word_count?: number;
  created_at?: string;
}

export interface ReportRecord {
  id: string;
  title: string;
  reference_label: string;
  similarity: number;
  word_count: number;
  sentences: SentenceMatch[];
  sources: SourceOverlap[];
  created_at: string;
}

export interface ReportListItem {
  id: string;
  title: string;
  reference_label: string;
  similarity: number;
  word_count: number;
  created_at: string;
}

export interface DocumentInput {
  title: string;
  text: string;
  fileType: string;
}

