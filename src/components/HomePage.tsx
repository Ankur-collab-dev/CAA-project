import React from 'react';
import {
  FileType,
  ChartColumn,
  Highlighter,
  Download,
  Upload,
  ScanText,
  FileSearch,
  ArrowRight,
} from 'lucide-react';
import { navigateTo } from './router';

const FEATURES = [
  {
    icon: FileType,
    title: 'PDF and DOCX support',
    text: 'Upload the files you already have. Text is extracted directly in your browser, so nothing needs converting first.',
  },
  {
    icon: ChartColumn,
    title: 'Clear similarity score',
    text: 'Get one percentage that shows how much of your document overlaps with the material it was compared against.',
  },
  {
    icon: Highlighter,
    title: 'Highlighted matches',
    text: 'Every matching sentence is marked in place, with the source it appears to come from beside it.',
  },
  {
    icon: Download,
    title: 'Downloadable report',
    text: 'Save a polished report as a file to share with your tutor or keep with your submission records.',
  },
];

const STEPS = [
  {
    icon: Upload,
    title: 'Upload or paste',
    text: 'Add your document as a PDF, DOCX or TXT file, or paste the text directly.',
  },
  {
    icon: ScanText,
    title: 'We compare sentence by sentence',
    text: 'Your text is compared with your saved library or a reference document you choose.',
  },
  {
    icon: FileSearch,
    title: 'Review and download',
    text: 'Read the highlighted report, check each matched passage, and download it when you are ready.',
  },
];

export const HomePage: React.FC = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:py-24 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              Originality checks for students
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-[1.15] tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
              Check every essay for{' '}
              <span className="text-blue-600">originality</span> in seconds
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
              Upload a PDF, DOCX or TXT file, or paste your text. See a similarity
              score, highlighted matching sentences and a downloadable report you
              can share with your tutor.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigateTo('/check')}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700"
              >
                Check a document
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => navigateTo('/reports')}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-6 py-3.5 text-base font-semibold text-blue-700 transition-colors hover:bg-blue-50"
              >
                View past reports
              </button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-blue-100/70" />
            <img
              src="https://images.pexels.com/photos/6550173/pexels-photo-6550173.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
              alt="Student reviewing academic paper on laptop"
              className="h-auto w-full rounded-2xl object-cover shadow-2xl shadow-blue-900/10"
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="border-t border-blue-50 bg-white py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Engineered for coursework
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Everything you need to verify your writing before submitting
            </h2>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="flex flex-col rounded-2xl border border-blue-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="bg-slate-50/70 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Simple workflow
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Three steps to a complete originality check
            </h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="relative flex flex-col items-center rounded-2xl border border-blue-100 bg-white p-8 text-center shadow-sm"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-md shadow-blue-600/30">
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="mt-4 inline-block text-xs font-bold uppercase tracking-wider text-blue-600">
                    Step {idx + 1}
                  </span>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {step.text}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-12 flex justify-center">
            <button
              type="button"
              onClick={() => navigateTo('/check')}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700"
            >
              Start checking now
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
