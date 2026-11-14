import React, { useState, useEffect } from 'react';
import {
  FileSearch,
  ArrowRight,
  TriangleAlert,
  LoaderCircle,
  Lock,
} from 'lucide-react';
import { ReportListItem } from '../types';
import { fetchReportsList } from '../lib/supabase';
import {
  getSimilarityLevel,
  SIMILARITY_LABELS,
  SIMILARITY_BADGE_CLASSES,
} from '../lib/analysis';
import { navigateTo } from './router';
import { useAuth } from '../lib/auth';
import { AuthModal } from './AuthModal';

export const ReportsListPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [state, setState] = useState<{
    status: 'loading' | 'ready' | 'error';
    reports?: ReportListItem[];
    message?: string;
  }>({ status: 'loading' });

  useEffect(() => {
    let active = true;

    // If user is not logged in and auth finished loading, do not fetch
    if (!authLoading && !user) {
      setState({ status: 'ready', reports: [] });
      return;
    }

    if (!user) return;

    fetchReportsList()
      .then((reports) => {
        if (active) setState({ status: 'ready', reports });
      })
      .catch((err) => {
        if (active)
          setState({
            status: 'error',
            message: err instanceof Error ? err.message : 'Reports could not be loaded.',
          });
      });

    return () => {
      active = false;
    };
  }, [user, authLoading]);

  // If user is not logged in, show Auth Gate
  if (!authLoading && !user) {
    return (
      <div className="bg-gradient-to-b from-blue-50/70 to-white">
        <div className="mx-auto flex min-h-[65vh] max-w-md flex-col items-center justify-center px-6 py-16 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 shadow-sm">
            <Lock className="h-8 w-8" />
          </span>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Sign in to view your reports
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            For privacy and security, all checked papers and past similarity reports are strictly private to each account.
          </p>
          <div className="mt-8 flex w-full flex-col gap-3">
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Sign in to your account
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => navigateTo('/')}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Back to Home
            </button>
          </div>
          <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-blue-50/70 to-white">
      <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Personal History
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Your reports
            </h1>
            <p className="mt-2 text-base text-slate-600">
              Only you can see the reports you have generated.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigateTo('/check')}
            className="inline-flex items-center gap-2 self-start rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-blue-700 sm:self-auto"
          >
            <FileSearch className="h-4 w-4" />
            New check
          </button>
        </div>

        <div className="mt-10">
          {(state.status === 'loading' || authLoading) && (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-500">
              <LoaderCircle className="h-7 w-7 animate-spin text-blue-600" />
              <p className="text-sm">Loading your private reports...</p>
            </div>
          )}

          {state.status === 'error' && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
              <p>We could not load your reports. {state.message}</p>
            </div>
          )}

          {state.status === 'ready' && !authLoading && state.reports?.length === 0 && (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-blue-200 bg-white px-6 py-16 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <FileSearch className="h-7 w-7" />
              </span>
              <h2 className="text-xl font-semibold text-slate-900">No reports yet</h2>
              <p className="max-w-sm text-sm text-slate-600">
                Run your first plagiarism check and its report will appear here.
              </p>
              <button
                type="button"
                onClick={() => navigateTo('/check')}
                className="mt-2 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Check a document
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {state.status === 'ready' && !authLoading && state.reports && state.reports.length > 0 && (
            <ul className="grid gap-4">
              {state.reports.map((report) => {
                const level = getSimilarityLevel(report.similarity);
                const dateStr = new Date(report.created_at).toLocaleString('en-US', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                });

                return (
                  <li key={report.id}>
                    <button
                      type="button"
                      onClick={() => navigateTo(`/reports/${report.id}`)}
                      className="group flex w-full flex-col gap-4 rounded-xl border border-blue-100 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-slate-900 group-hover:text-blue-700">
                          {report.title}
                        </p>
                        <p className="mt-1 truncate text-sm text-slate-500">
                          {dateStr} · {report.word_count.toLocaleString('en-US')} words · vs{' '}
                          {report.reference_label}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${SIMILARITY_BADGE_CLASSES[level]}`}
                        >
                          {SIMILARITY_LABELS[level]}
                        </span>
                        <span className="w-16 text-right text-xl font-bold text-blue-700">
                          {report.similarity.toFixed(1)}%
                        </span>
                        <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-600" />
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
