import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-blue-100 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-slate-500 sm:flex-row">
        <div className="flex items-center gap-2 font-medium text-slate-700">
          <ShieldCheck className="h-4 w-4 text-blue-600" />
          OriginCheck
        </div>
        <p>Built for college projects. Similarity scores highlight overlap for human review.</p>
      </div>
    </footer>
  );
};

