import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  FileSearch,
  Download,
  LoaderCircle,
  TriangleAlert,
  SearchX,
  FileText,
  BookOpen,
  Layers,
} from 'lucide-react';
import { ReportRecord } from '../types';
import { fetchReportById } from '../lib/supabase';
import {
  getSimilarityLevel,
  SIMILARITY_LABELS,
  SIMILARITY_BADGE_CLASSES,
} from '../lib/analysis';
import { downloadHtmlReport } from '../lib/reportExporter';
import { navigateTo } from './router';

interface ReportDetailsPageProps {
  id: string;
}

export const ReportDetailsPage: React.FC<ReportDetailsPageProps> = ({ id }) => {
  const [state, setState] = useState<{
    status: 'loading' | 'ready' | 'missing' | 'error';
    report?: ReportRecord;
    message?: string;
  }>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    fetchReportById(id)
      .then((rep) => {
        if (!active) return;
        if (rep) {
          setState({ status: 'ready', report: rep });
        } else {
          setState({ status: 'missing' });
        }
      })
      .catch((err) => {
        if (active) {
          setState({
            status: 'error',
            message: err instanceof Error ? err.message : 'We could not load this report.',
          });
        }
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (state.status === 'loading') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-slate-500">
        <LoaderCircle className="h-7 w-7 animate-spin text-blue-600" />
        <p className="text-sm">Loading report...</p>
      </div>
    );
  }

  if (state.status === 'missing' || state.status === 'error') {
    const isMissing = state.status === 'missing';
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          {isMissing ? <SearchX className="h-7 w-7" /> : <TriangleAlert className="h-7 w-7" />}
        </span>
        <h1 className="text-2xl font-bold text-slate-900">
          {isMissing ? 'Report not found' : 'Report unavailable'}
        </h1>
        <p className="text-sm leading-relaxed text-slate-600">
          {isMissing
            ? 'This report may have been removed or the link is incorrect.'
            : `Something went wrong while loading this report. ${state.message}`}
        </p>
        <button
          type="button"
          onClick={() => navigateTo('/reports')}
          className="mt-2 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to reports
        </button>
      </div>
    );
  }

  const { report } = state;
  if (!report) return null;

  const level = getSimilarityLevel(report.similarity);
  const dateStr = new Date(report.created_at).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const matchedSentenceCount = report.sentences.filter((s) => s.matched).length;

  return (
    <div className="bg-gradient-to-b from-blue-50/70 to-white">
      <div className="mx-auto max-w-6xl px-6 py-10 md:py-14">
        {/* Top Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => navigateTo('/reports')}
              className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-900"
            >
              <ArrowLeft className="h-4 w-4" />
              All reports
            </button>
            <h1 className="truncate text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              {report.title}
            </h1>
            <p className="mt-2 text-sm text-slate-500">Checked {dateStr}</p>
          </div>

          <button
            type="button"
            onClick={() => navigateTo('/check')}
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50 sm:self-auto"
          >
            <FileSearch className="h-4 w-4" />
            New check
          </button>
        </div>

        {/* Overview Score Card */}
        <div className="mt-8">
          <section className="grid gap-6 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm md:grid-cols-[auto_1fr] md:p-8">
            <div className="flex flex-col items-center justify-center gap-4">
              {/* Circular Gauge / Percentage Display */}
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-blue-50 p-3 ring-8 ring-blue-100/50">
                <div className="flex flex-col items-center text-center">
                  <span className="text-3xl font-extrabold text-blue-700">
                    {report.similarity.toFixed(1)}%
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Similarity
                  </span>
                </div>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${SIMILARITY_BADGE_CLASSES[level]}`}
              >
                {SIMILARITY_LABELS[level]}
              </span>
            </div>

            <div className="flex min-w-0 flex-col gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-blue-50/70 p-4">
                  <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                    <FileText className="h-3.5 w-3.5 text-blue-600" />
                    Total words
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {report.word_count.toLocaleString('en-US')}
                  </p>
                </div>

                <div className="rounded-xl bg-blue-50/70 p-4">
                  <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                    <BookOpen className="h-3.5 w-3.5 text-blue-600" />
                    Matched sentences
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {matchedSentenceCount} of {report.sentences.length}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Compared against
                </p>
                <p className="mt-1 font-medium text-slate-900">
                  {report.reference_label}
                </p>
                {report.sources.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {report.sources.map((src, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700"
                      >
                        <Layers className="h-3 w-3 text-blue-600" />
                        {src.title}:{' '}
                        <strong className="text-blue-700">{src.percent.toFixed(1)}%</strong>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => downloadHtmlReport(report)}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700"
                >
                  <Download className="h-4 w-4" />
                  Download HTML report
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Highlighted text and matched passages */}
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          {/* Document with matches */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Document with matches
              </h2>
              <span className="flex items-center gap-2 text-xs text-slate-500">
                <span className="inline-block h-3 w-3 rounded-sm bg-amber-200" />
                Matching sentence
              </span>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-white p-6 text-[15px] leading-[1.75] text-slate-800 shadow-sm md:p-8">
              {report.sentences.map((sent, i) =>
                sent.matched ? (
                  <mark
                    key={i}
                    title={sent.source ? `Matches: ${sent.source.title}` : 'Matching sentence'}
                    className="rounded-sm bg-amber-100 px-0.5 text-slate-900 shadow-[inset_0_-2px_0_0_#f59e0b] transition-colors hover:bg-amber-200"
                  >
                    {sent.text}{' '}
                  </mark>
                ) : (
                  <span key={i}>{sent.text} </span>
                )
              )}
              {report.sentences.length === 0 && (
                <p className="text-slate-500">This report does not contain any text.</p>
              )}
            </div>
          </section>

          {/* Matched passages breakdown */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Matched passages
            </h2>
            {report.sentences.filter((s) => s.matched).length === 0 ? (
              <p className="rounded-2xl border border-dashed border-blue-200 bg-white p-6 text-sm text-slate-500">
                No sentences matched any reference document.
              </p>
            ) : (
              <ul className="flex flex-col gap-4">
                {report.sentences
                  .filter((s) => s.matched)
                  .map((sent, i) => (
                    <li
                      key={i}
                      className="rounded-xl border border-blue-100 border-l-4 border-l-amber-400 bg-white p-5 shadow-sm"
                    >
                      <p className="text-[15px] italic leading-relaxed text-slate-900">
                        “{sent.text}”
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="rounded-full bg-blue-50 px-2.5 py-0.5 font-semibold text-blue-700">
                          {sent.similarity.toFixed(0)}% overlap
                        </span>
                        {sent.source && (
                          <span className="truncate">
                            Source: <strong>{sent.source.title}</strong>
                          </span>
                        )}
                      </div>
                      {sent.source && (
                        <p className="mt-2 text-xs text-slate-600">
                          Matched text: {sent.source.excerpt}
                        </p>
                      )}
                    </li>
                  ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

