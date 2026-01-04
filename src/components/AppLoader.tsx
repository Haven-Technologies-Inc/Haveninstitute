import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface AppLoaderProps {
  children: React.ReactNode;
}

export const AppLoader: React.FC<AppLoaderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [stylesLoaded, setStylesLoaded] = useState(false);

  useEffect(() => {
    // Check if styles are loaded
    const checkStyles = () => {
      const stylesheets = Array.from(document.styleSheets);
      const loaded = stylesheets.length > 0 && 
        stylesheets.every(sheet => {
          try {
            return sheet.cssRules.length > 0;
          } catch (e) {
            // Cross-origin stylesheets might throw errors
            return true;
          }
        });
      
      setStylesLoaded(loaded);
    };

    // Initial check
    checkStyles();

    // Monitor for new stylesheets
    const observer = new MutationObserver(() => {
      checkStyles();
    });

    observer.observe(document.head, {
      childList: true,
      subtree: true
    });

    // Minimum loading time to prevent flash
    const minLoadTime = setTimeout(() => {
      setIsLoading(false);
      document.getElementById('root')?.classList.add('loaded');
    }, 300);

    // Hide loading when styles are ready
    if (stylesLoaded) {
      clearTimeout(minLoadTime);
      setIsLoading(false);
      document.getElementById('root')?.classList.add('loaded');
    }

    return () => {
      observer.disconnect();
      clearTimeout(minLoadTime);
    };
  }, [stylesLoaded]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Haven Institute
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Loading your NCLEX preparation platform...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AppLoader;
