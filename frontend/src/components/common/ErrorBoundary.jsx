import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import Button from '@/components/buttons/Button';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[300px] flex flex-col items-center justify-center p-6 text-center glass-card">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-gs-text-main mb-1">Something went wrong</h3>
          <p className="text-xs text-gs-text-muted max-w-sm mb-4">
            {this.state.error?.message || 'An unexpected rendering error occurred in this view.'}
          </p>
          <Button variant="outline" size="sm" onClick={this.handleReset}>
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

