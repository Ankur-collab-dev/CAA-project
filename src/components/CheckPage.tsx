import React, { useState, useEffect } from 'react';
import { Play, LoaderCircle, ShieldCheck, Layers, FileSearch } from 'lucide-react';
import { DocumentInput } from '../types';
import { DocumentInputSection } from './DocumentInputSection';
import {
  countWords,
  MIN_WORDS_FOR_CHECK,
  normalizeText,
  analyzePlagiarism,
} from '../lib/analysis';
import {
  countDocuments,
  fetchDocuments,
  insertDocument,
  insertReport,
} from '../lib/supabase';
import { navigateTo } from './router';

const EMPTY_DOC: DocumentInput = { title: '', text: '', fileType: '' };

const REFERENCE_OPTIONS = [
  { id: 'library', label: 'Saved library' },
  { id: 'specific', label: 'One specific document' },
];

export const CheckPage: React.FC = () => {
  const [targetDoc, setTargetDoc] = useState<DocumentInput>(EMPTY_DOC);
  const [referenceDoc, setReferenceDoc] = useState<DocumentInput>(EMPTY_DOC);
  const [referenceMode, setReferenceMode] = useState<string>('library');
  const [libraryCount, setLibraryCount] = useState<number | null>(null);
  const [saveToLibrary, setSaveToLibrary] = useState<boolean>(true);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    countDocuments()
      .then((c) => {
        if (active) setLibraryCount(c);
      })
      .catch(() => {
        if (active) setLibraryCount(0);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleRunCheck = async () => {
    setFormError(null);

    const targetWordCount = countWords(targetDoc.text);
    if (targetWordCount < MIN_WORDS_FOR_CHECK) {
      setFormError(`Please add at least ${MIN_WORDS_FOR_CHECK} words to your document before running a check.`);
      return;
    }

    if (referenceMode === 'specific' && countWords(referenceDoc.text) < MIN_WORDS_FOR_CHECK) {
      setFormError(`The reference document needs at least ${MIN_WORDS_FOR_CHECK} words, or switch to the saved library.`);
      return;
    }

    setIsChecking(true);

    try {
      const docTitle = targetDoc.title.trim() || 'Untitled document';
      let docsToCompare: Array<{ id: string; title: string; content: string }>;
      let refLabel: string;

      if (referenceMode === 'library') {
        const stored = await fetchDocuments();
        const normTarget = normalizeText(targetDoc.text);
        // Exclude exact matches with itself from library
        docsToCompare = stored.filter((d) => normalizeText(d.content) !== normTarget);
        refLabel =
          docsToCompare.length > 0
            ? `Saved library (${docsToCompare.length} ${docsToCompare.length === 1 ? 'document' : 'documents'})`
            : 'Saved library (no other documents yet)';
      } else {
        const refTitle = referenceDoc.title.trim() || 'Reference document';
        docsToCompare = [{ id: 'reference', title: refTitle, content: referenceDoc.text }];
        refLabel = refTitle;
      }

      // Run exact reverse-engineered algorithm
      const analysis = analyzePlagiarism(targetDoc.text, docsToCompare);

      // Save report in database
      const reportId = await insertReport({
        title: docTitle,
        referenceLabel: refLabel,
        analysis,
      });

      // Optionally save submitted document to library
      if (saveToLibrary) {
        await insertDocument({
          title: docTitle,
          content: targetDoc.text,
          fileType: targetDoc.fileType || 'pasted',
          wordCount: analysis.wordCount,
        });
      }

      // Navigate to report
      navigateTo(`/reports/${reportId}`);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong while running the check.');
      setIsChecking(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-blue-50/70 to-white">
      <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Plagiarism check
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Check a document
          </h1>
          <p className="mt-2 text-base text-slate-600">
            Compare your document against your saved library or another reference document to discover matching sentences.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          {/* Target Document Input Section */}
          <div className="flex flex-col gap-8">
            <DocumentInputSection
              label="Document to check"
              helper="Upload your essay, paper or coursework file, or paste its contents."
              value={targetDoc}
              onChange={setTargetDoc}
            />
          </div>

          {/* Reference Options & Trigger */}
          <div className="flex flex-col gap-8">
            <section className="flex flex-col gap-4 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Compare against</h2>
                <p className="text-sm text-slate-500">Choose what to compare your document with.</p>
              </div>

              <div className="flex flex-col gap-2">
                {REFERENCE_OPTIONS.map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${
                      referenceMode === opt.id
                        ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="referenceMode"
                        value={opt.id}
                        checked={referenceMode === opt.id}
                        onChange={(e) => setReferenceMode(e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-slate-900">{opt.label}</span>
                    </div>
                    {opt.id === 'library' ? (
                      <Layers className="h-4 w-4 text-slate-400" />
                    ) : (
                      <FileSearch className="h-4 w-4 text-slate-400" />
                    )}
                  </label>
                ))}
              </div>

              {referenceMode === 'library' && (
                <div className="rounded-xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-600">
                  {libraryCount === null ? (
                    <span className="flex items-center gap-2">
                      <LoaderCircle className="h-3.5 w-3.5 animate-spin text-blue-600" />
                      Loading your library...
                    </span>
                  ) : libraryCount === 0 ? (
                    'Your library is empty. Documents you check are saved here so future submissions can be compared against them.'
                  ) : (
                    `Your library holds ${libraryCount} saved ${
                      libraryCount === 1 ? 'document' : 'documents'
                    }. Your text will be compared against all of them.`
                  )}
                </div>
              )}
            </section>

            {referenceMode === 'specific' && (
              <DocumentInputSection
                label="Reference document"
                helper="The text to compare your document against."
                value={referenceDoc}
                onChange={setReferenceDoc}
              />
            )}

            {/* Run Check Button Card */}
            <section className="flex flex-col gap-4 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={saveToLibrary}
                  onChange={(e) => setSaveToLibrary(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">
                  Save this document to the library so future checks can be compared against it.
                </span>
              </label>

              {formError && (
                <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                  {formError}
                </p>
              )}

              <button
                type="button"
                onClick={handleRunCheck}
                disabled={isChecking}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {isChecking ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Checking your document...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Run plagiarism check
                  </>
                )}
              </button>

              <p className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                Each check produces a report you can download as a file.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

