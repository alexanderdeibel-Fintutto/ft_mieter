import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState(prev => ({
      error,
      errorInfo,
      errorCount: prev.errorCount + 1
    }));

    // Log to error tracking service
    if (typeof window !== 'undefined') {
      console.error('Error caught by boundary:', error, errorInfo);
      // Send to analytics
      window.__errorLog?.push({ error, errorInfo, timestamp: new Date() });
    }
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/10 flex items-center justify-center p-6"
        >
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
            <div className="flex justify-center mb-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <AlertTriangle className="w-12 h-12 text-red-600" />
              </motion.div>
            </div>

            <h1 className="text-2xl font-bold text-center mb-2">Oops! Something went wrong</h1>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              Wir entschuldigen uns für das Missgeschick. Unser Team wurde benachrichtigt.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 rounded text-xs font-mono overflow-auto max-h-32">
                <p className="font-bold text-red-600 mb-2">Error Details:</p>
                <p className="text-red-700 dark:text-red-300">{this.state.error.toString()}</p>
                {this.state.errorInfo && (
                  <p className="text-red-700 dark:text-red-300 mt-2 text-xs">
                    {this.state.errorInfo.componentStack?.split('\n')[0]}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Button
                onClick={this.handleReset}
                className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => window.location.href = createPageUrl('MieterHome')}
              >
                <Home className="w-4 h-4" />
                Go Home
              </Button>
            </div>

            {this.state.errorCount > 2 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
                Multiple errors detected. Please refresh the page.
              </p>
            )}
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}