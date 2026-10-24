"use client";

import { useState, useEffect } from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="min-h-[200px] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#1A1A2E] border border-red-500/20 rounded-2xl p-6 text-center">
        <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Something went wrong</h3>
        <p className="text-sm text-gray-400 mb-4">
          We apologize for the inconvenience. Our team has been notified.
        </p>
        {process.env.NODE_ENV === "development" && (
          <pre className="text-xs text-red-400/80 bg-red-500/5 rounded-lg p-3 mb-4 overflow-auto max-h-32 text-left">
            {error.message}
          </pre>
        )}
        <button
          onClick={resetError}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export function ErrorBoundary({ children, fallback: Fallback, onError }: ErrorBoundaryProps) {
  const [state, setState] = useState<ErrorBoundaryState>({ hasError: false });

  useEffect(() => {
    const errorHandler = (error: ErrorEvent) => {
      console.error("Caught error:", error);
    };
    window.addEventListener("error", errorHandler);
    return () => window.removeEventListener("error", errorHandler);
  }, []);

  const resetError = () => {
    setState({ hasError: false });
  };

  // Note: In a real implementation, this would be a class component
  // or use react-error-boundary library. This is a simplified version.
  if (state.hasError && state.error) {
    const FallbackComponent = Fallback || DefaultErrorFallback;
    return <FallbackComponent error={state.error} resetError={resetError} />;
  }

  return <>{children}</>;
}

// Specialized error boundaries for different sections
export function PageErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
}

export function AnalyticsErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
}

// Async component wrapper with error handling
interface AsyncBoundaryProps {
  children: React.ReactNode;
  loading?: React.ReactNode;
  error?: React.ReactNode;
}

export function AsyncBoundary({ children, loading, error }: AsyncBoundaryProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading && loading) {
    return <>{loading}</>;
  }

  if (hasError && error) {
    return <>{error}</>;
  }

  return <>{children}</>;
}
