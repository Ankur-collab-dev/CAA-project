import { createClient } from '@supabase/supabase-js';
import { DocumentRecord, ReportRecord, ReportListItem } from '../types';

const SUPABASE_URL = 'https://ndbduspwjiuyxquzizip.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Unm1scqM4Zkeief1E0ZcMA_1mQ3giHE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function fetchDocuments(): Promise<DocumentRecord[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('id, title, content')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data as DocumentRecord[]) ?? [];
}

export async function insertDocument(doc: {
  title: string;
  content: string;
  fileType: string;
  wordCount: number;
}): Promise<void> {
  const { error } = await supabase.from('documents').insert({
    title: doc.title,
    content: doc.content,
    file_type: doc.fileType,
    word_count: doc.wordCount,
  });

  if (error) throw new Error(error.message);
}

export async function insertReport(report: {
  title: string;
  referenceLabel: string;
  analysis: {
    similarity: number;
    wordCount: number;
    sentences: any;
    sources: any;
  };
}): Promise<string> {
  const { data, error } = await supabase
    .from('reports')
    .insert({
      title: report.title,
      reference_label: report.referenceLabel,
      similarity: report.analysis.similarity,
      word_count: report.analysis.wordCount,
      sentences: report.analysis.sentences,
      sources: report.analysis.sources,
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  return data.id;
}

export async function fetchReportById(id: string): Promise<ReportRecord | null> {
  const { data, error } = await supabase
    .from('reports')
    .select('id, title, reference_label, similarity, word_count, sentences, sources, created_at')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as ReportRecord | null;
}

export async function fetchReportsList(): Promise<ReportListItem[]> {
  const { data, error } = await supabase
    .from('reports')
    .select('id, title, reference_label, similarity, word_count, created_at')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) throw new Error(error.message);
  return (data as ReportListItem[]) ?? [];
}

export async function countDocuments(): Promise<number> {
  const { count, error } = await supabase
    .from('documents')
    .select('id', { count: 'exact', head: true });

  if (error) throw new Error(error.message);
  return count ?? 0;
}
