import React from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { CheckPage } from './components/CheckPage';
import { ReportsListPage } from './components/ReportsListPage';
import { ReportDetailsPage } from './components/ReportDetailsPage';
import { useCurrentPath } from './components/router';
import { AuthProvider } from './lib/auth';

const REPORT_PATH_REGEX = /^\/reports\/([0-9a-f-]{36})$/i;

export const App: React.FC = () => {
  const currentPath = useCurrentPath();

  const renderCurrentView = () => {
    const reportMatch = currentPath.match(REPORT_PATH_REGEX);
    if (reportMatch) {
      return <ReportDetailsPage id={reportMatch[1]} />;
    }

    if (currentPath === '/check') {
      return <CheckPage />;
    }

    if (currentPath === '/reports') {
      return <ReportsListPage />;
    }

    return <HomePage />;
  };

  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col bg-white font-sans text-slate-900 antialiased">
        <Header currentPath={currentPath} />
        <main className="flex-1">{renderCurrentView()}</main>
        <Footer />
      </div>
    </AuthProvider>
  );
};

export default App;
