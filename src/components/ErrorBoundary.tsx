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
        <div data-testid="error-boundary-container" className="flex-center p-xxl text-white bg-obsidian-alpha" style={{ minHeight: '100vh' }}>
          <div className="glass-card flex-column align-center p-xxl text-center alert-card-danger max-w-550 w-full" style={{
            maxWidth: '550px',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
          }}>
            <div className="flex-center rounded-full mb-xl bg-error-alpha-20 border-error-alpha-20" style={{
              width: '64px',
              height: '64px'
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
              <div data-testid="error-readout" className="text-left text-xs text-error rounded-md p-md mb-xl overflow-y-auto bg-black-alpha-30 border-glass font-mono max-h-250px" style={{
                whiteSpace: 'pre-wrap'
              }}>
                {this.state.error.toString()}
              </div>
            )}

            <button 
              className="btn btn-primary flex-row align-center gap-sm px-xl py-md cursor-pointer font-bold"
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

