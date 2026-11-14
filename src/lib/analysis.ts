import { PlagiarismAnalysis, SentenceMatch, SourceOverlap, SimilarityLevel } from '../types';

// Constants calibrated exactly from original site
export const MIN_WORDS_FOR_CHECK = 15;
export const NGRAM_SIZE = 5;
export const SENTENCE_SIMILARITY_THRESHOLD = 0.5;
export const SOURCE_OVERLAP_THRESHOLD = 0.5;

export const SIMILARITY_LABELS: Record<SimilarityLevel, string> = {
  low: 'Low similarity',
  moderate: 'Moderate similarity',
  high: 'High similarity',
};

export const SIMILARITY_BADGE_CLASSES: Record<SimilarityLevel, string> = {
  low: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  moderate: 'bg-amber-50 text-amber-800 ring-amber-200',
  high: 'bg-red-50 text-red-700 ring-red-200',
};

export function getSimilarityLevel(score: number): SimilarityLevel {
  return score < 15 ? 'low' : score < 40 ? 'moderate' : 'high';
}

/**
 * Tokenizes text into lowercase unicode words, stripping punctuation
 */
export function tokenizeWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Splits document into sentences using punctuation boundaries (. ? !) or newlines
 */
export function splitSentences(text: string): string[] {
  return text
    .split(new RegExp('(?<=[.!?])\\s+|\\n+'))
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Counts total words
 */
export function countWords(text: string): number {
  return tokenizeWords(text).length;
}

/**
 * Extracts 5-word shingles (n-grams) from text
 */
export function extractNgrams(text: string): string[] {
  const words = tokenizeWords(text);
  if (words.length === 0) return [];
  if (words.length < NGRAM_SIZE) return [words.join(' ')];

  const ngrams: string[] = [];
  for (let i = 0; i + NGRAM_SIZE <= words.length; i++) {
    ngrams.push(words.slice(i, i + NGRAM_SIZE).join(' '));
  }
  return ngrams;
}

/**
 * Truncates excerpt safely
 */
export function truncateExcerpt(text: string): string {
  return text.length > 220 ? `${text.slice(0, 217).trimEnd()}...` : text;
}

export function normalizeText(text: string): string {
  return text.replace(/\s+/g, ' ').trim().toLowerCase();
}

/**
 * Core Plagiarism Detection Engine
 * Matches exact reverse-engineered algorithm zA(l, e)
 */
export function analyzePlagiarism(
  targetText: string,
  referenceDocs: Array<{ id: string; title: string; content: string }>
): PlagiarismAnalysis {
  const ngramMap = new Map<string, { title: string; sentence: string }>();

  const docNgramSets = referenceDocs.map((doc) => {
    const set = new Set<string>();
    for (const sentence of splitSentences(doc.content)) {
      for (const ngram of extractNgrams(sentence)) {
        set.add(ngram);
        if (!ngramMap.has(ngram)) {
          ngramMap.set(ngram, { title: doc.title, sentence });
        }
      }
    }
    return set;
  });

  let totalNgrams = 0;
  let totalMatchedNgrams = 0;

  const sentences: SentenceMatch[] = splitSentences(targetText).map((sentence) => {
    const ngrams = extractNgrams(sentence);
    const matchedNgrams = ngrams.filter((ng) => ngramMap.has(ng));

    totalNgrams += ngrams.length;
    totalMatchedNgrams += matchedNgrams.length;

    const sentenceRatio = ngrams.length > 0 ? matchedNgrams.length / ngrams.length : 0;
    const isMatched = sentenceRatio >= SENTENCE_SIMILARITY_THRESHOLD;
    const matchedSource = isMatched && matchedNgrams.length > 0 ? ngramMap.get(matchedNgrams[0]) : undefined;

    return {
      text: sentence,
      matched: isMatched,
      similarity: Math.round(sentenceRatio * 1000) / 10,
      source: matchedSource
        ? {
            title: matchedSource.title,
            excerpt: truncateExcerpt(matchedSource.sentence),
          }
        : null,
    };
  });

  const allTargetNgrams = sentences.flatMap((s) => extractNgrams(s.text));

  const sources: SourceOverlap[] = referenceDocs
    .map((doc, idx) => {
      const docSet = docNgramSets[idx];
      const matchCount = allTargetNgrams.filter((ng) => docSet.has(ng)).length;
      const percent = totalNgrams > 0 ? (matchCount / totalNgrams) * 100 : 0;
      return {
        title: doc.title,
        percent: Math.round(percent * 10) / 10,
      };
    })
    .filter((s) => s.percent >= SOURCE_OVERLAP_THRESHOLD)
    .sort((a, b) => b.percent - a.percent);

  const overallSimilarity = totalNgrams > 0 ? (totalMatchedNgrams / totalNgrams) * 100 : 0;

  return {
    similarity: Math.round(overallSimilarity * 100) / 100,
    wordCount: countWords(targetText),
    sentences,
    sources,
  };
}
