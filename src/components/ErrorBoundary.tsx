import { Component } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an exception:", error, errorInfo);
    
    // Automatically reload on ChunkLoadErrors (Vite Dynamic Import Failures)
    if (error?.message?.includes('Failed to fetch dynamically imported module') || error?.name === 'ChunkLoadError') {
      window.location.reload();
      return;
    }
    
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div data-testid="error-boundary-container" className="flex-center p-xxl text-white" style={{ minHeight: '100vh', background: 'var(--bg-obsidian)', fontFamily: 'sans-serif' }}>
          <div className="glass-card flex-column align-center p-xxl text-center" style={{
            maxWidth: '550px',
            width: '100%',
            border: '2px solid rgba(239, 68, 68, 0.25)',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05), rgba(10, 13, 20, 0.7))',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
          }}>
            <div className="flex-center rounded-full mb-xl" style={{
              width: '64px',
              height: '64px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}>
              <AlertTriangle size={32} color="#ef4444" />
            </div>

            <h2 className="text-xl font-bold mb-sm text-white">
              Something went wrong
            </h2>
            
            <p className="text-sm text-secondary mb-xl line-height-relaxed">
              FloorVision encountered a rendering exception. This could be due to malformed local cache or database sync conflicts.
            </p>

            {this.state.error && (
              <div data-testid="error-readout" className="text-left text-xs text-error rounded-md p-md mb-xl overflow-y-auto" style={{
                background: 'rgba(0, 0, 0, 0.25)',
                border: '1px solid var(--border-glass)',
                fontFamily: 'monospace',
                maxHeight: '150px',
                whiteSpace: 'pre-wrap'
              }}>
                {this.state.error.toString()}
              </div>
            )}

            <button 
              className="btn btn-primary flex-row align-center gap-sm px-xl py-md cursor-pointer"
              style={{ fontWeight: 700 }}
              onClick={this.handleReset}
              data-testid="error-boundary-reload-btn"
            >
              <RotateCcw size={16} /> Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

