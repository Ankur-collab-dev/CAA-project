import { useState, useEffect } from 'react';

export function getHashPath(): string {
  return window.location.hash.replace(/^#/, '') || '/';
}

export function navigateTo(path: string): void {
  window.location.hash = path;
}

export function useCurrentPath(): string {
  const [currentPath, setCurrentPath] = useState(getHashPath);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(getHashPath());
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return currentPath;
}

