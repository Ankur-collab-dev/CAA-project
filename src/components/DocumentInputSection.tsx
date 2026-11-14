import React, { useId, useState } from 'react';
import { Upload, ClipboardPaste, X, LoaderCircle, FileText } from 'lucide-react';
import { DocumentInput } from '../types';
import { extractTextFromFile, getFileExtension } from '../lib/fileExtractor';
import { countWords } from '../lib/analysis';

interface DocumentInputSectionProps {
  label: string;
  helper: string;
  value: DocumentInput;
  onChange: (val: DocumentInput) => void;
}

export const DocumentInputSection: React.FC<DocumentInputSectionProps> = ({
  label,
  helper,
  value,
  onChange,
}) => {
  const [tab, setTab] = useState<'upload' | 'paste'>('upload');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputId = useId();

  const hasText = value.text.trim().length > 0;
  const wordCount = countWords(value.text);

  const processFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setLoading(true);
    try {
      const extracted = await extractTextFromFile(file);
      if (!extracted.trim()) {
        setError('No readable text was found in that file. Scanned PDFs need to be converted to text first.');
        return;
      }
      onChange({
        title: file.name.replace(/\.[^.]+$/, ''),
        text: extracted,
        fileType: getFileExtension(file.name),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We could not read that file. Please try another one.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    setError(null);
    onChange({ title: '', text: '', fileType: '' });
  };

  const inputClass =
    'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100';

  return (
    <section className="flex flex-col rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{label}</h2>
          <p className="text-sm text-slate-500">{helper}</p>
        </div>
        <div className="mt-3 flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 sm:mt-0">
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
              tab === 'upload' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="h-3.5 w-3.5" />
            Upload file
          </button>
          <button
            type="button"
            onClick={() => setTab('paste')}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
              tab === 'paste' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ClipboardPaste className="h-3.5 w-3.5" />
            Paste text
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        {/* Title Input */}
        <div>
          <label htmlFor={`title-${fileInputId}`} className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Document title
          </label>
          <input
            id={`title-${fileInputId}`}
            type="text"
            value={value.title}
            onChange={(e) => onChange({ ...value, title: e.target.value })}
            placeholder="e.g. History Essay Draft 2"
            className={`mt-1.5 ${inputClass}`}
          />
        </div>

        {tab === 'upload' ? (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              File upload
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`mt-1.5 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
                dragOver
                  ? 'border-blue-500 bg-blue-50/70'
                  : 'border-slate-300 bg-slate-50/50 hover:border-blue-400 hover:bg-blue-50/30'
              }`}
            >
              <input
                id={fileInputId}
                type="file"
                accept=".pdf,.docx,.txt"
                className="hidden"
                onChange={(e) => processFile(e.target.files?.[0])}
              />
              <label
                htmlFor={fileInputId}
                className="flex cursor-pointer flex-col items-center justify-center gap-3"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 shadow-sm">
                  {loading ? (
                    <LoaderCircle className="h-6 w-6 animate-spin text-blue-600" />
                  ) : (
                    <Upload className="h-6 w-6" />
                  )}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    <span className="text-blue-600 underline">Click to upload</span> or drag and drop
                  </p>
                  <p className="mt-1 text-xs text-slate-500">PDF, DOCX or TXT (up to 10 MB)</p>
                </div>
              </label>
            </div>
          </div>
        ) : (
          <div>
            <label htmlFor={`text-${fileInputId}`} className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Document text
            </label>
            <textarea
              id={`text-${fileInputId}`}
              rows={8}
              value={value.text}
              onChange={(e) => onChange({ ...value, text: e.target.value, fileType: 'pasted' })}
              placeholder="Paste the full text of your document here..."
              className={`mt-1.5 ${inputClass} font-mono text-xs`}
            />
          </div>
        )}

        {/* Text preview if file uploaded */}
        {hasText && (
          <div className="flex flex-col gap-2 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-700">
                <FileText className="h-4 w-4" />
                {wordCount.toLocaleString('en-US')} words loaded
                {value.fileType && ` (${value.fileType.toUpperCase()})`}
              </span>
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-white hover:text-red-600"
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </button>
            </div>
            <p className="line-clamp-3 text-xs leading-relaxed text-slate-600">
              {value.text}
            </p>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {error}
          </p>
        )}
      </div>
    </section>
  );
};

