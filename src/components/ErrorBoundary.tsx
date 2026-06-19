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
    if (error.message && (error.message.includes('Failed to fetch dynamically imported module') || error.name === 'ChunkLoadError')) {
      window.location.reload();
      return;
    }
    
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    // Reset cache if it's a corruption issue
    localStorage.removeItem('bby_active_shift');
    localStorage.removeItem('bby_roster_history');
    localStorage.removeItem('bby_active_period');
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0d14',
          color: '#fff',
          padding: '2rem',
          fontFamily: 'sans-serif'
        }}>
          <div className="glass-card" style={{
            maxWidth: '550px',
            width: '100%',
            padding: '2.5rem',
            textAlign: 'center',
            border: '2px solid rgba(239, 68, 68, 0.25)',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05), rgba(10, 13, 20, 0.7))',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto'
            }}>
              <AlertTriangle size={32} color="#ef4444" />
            </div>

            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem', color: '#fff' }}>
              Something went wrong
            </h2>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              FloorVision encountered a rendering exception. This could be due to malformed local cache or database sync conflicts.
            </p>

            {this.state.error && (
              <div style={{
                background: 'rgba(0, 0, 0, 0.25)',
                border: '1px solid var(--border-glass)',
                padding: '1rem',
                borderRadius: '12px',
                textAlign: 'left',
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                color: '#f87171',
                maxHeight: '150px',
                overflowY: 'auto',
                marginBottom: '1.5rem',
                whiteSpace: 'pre-wrap'
              }}>
                {this.state.error.toString()}
              </div>
            )}

            <button 
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: 'var(--bby-blue)',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onClick={this.handleReset}
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

