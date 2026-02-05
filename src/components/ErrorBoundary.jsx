import { Component } from 'react';

/**
 * ErrorBoundary - Catches JavaScript errors anywhere in the child component tree
 * and displays a fallback UI instead of crashing the whole app.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // In production, you'd want to send this to an error tracking service
    // e.g., Sentry, LogRocket, etc.
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">🤖💔</div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              Oops! Something went wrong
            </h1>
            <p className="text-text-secondary mb-6">
              SpendBot encountered an unexpected error. Don't worry — your data is safe!
            </p>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReset}
                className="w-full py-3 bg-accent text-white rounded-xl font-semibold"
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="w-full py-3 bg-surface-raised text-text-secondary rounded-xl font-medium"
              >
                Reload App
              </button>
            </div>

            {/* Show error details in development */}
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-sm text-text-muted cursor-pointer">
                  Technical Details
                </summary>
                <pre className="mt-2 p-3 bg-surface-raised rounded-lg text-xs text-danger overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
