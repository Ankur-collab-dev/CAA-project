import React from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { CheckPage } from './components/CheckPage';
import { ReportsListPage } from './components/ReportsListPage';
import { ReportDetailsPage } from './components/ReportDetailsPage';
import { useCurrentPath } from './components/router';
import { AuthProvider, useAuth } from './lib/auth';

const REPORT_PATH_REGEX = /^\/reports\/([0-9a-f-]{36})$/i;

const MainContent: React.FC<{ currentPath: string }> = ({ currentPath }) => {
  const { user, isSigningOut } = useAuth();

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
    <main
      key={`${currentPath}-${user ? user.id : 'guest'}`}
      className={`flex-1 transition-all duration-200 ${
        isSigningOut
          ? 'opacity-0 scale-[0.99] blur-[1px]'
          : 'animate-page-enter'
      }`}
    >
      {renderCurrentView()}
    </main>
  );
};

export const App: React.FC = () => {
  const currentPath = useCurrentPath();

  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col bg-white font-sans text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
        <Header currentPath={currentPath} />
        <MainContent currentPath={currentPath} />
        <Footer />
      </div>
    </AuthProvider>
  );
};

export default App;
