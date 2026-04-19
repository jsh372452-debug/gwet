import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      
      return (
        <div style={{ 
            padding: '4rem', 
            textAlign: 'center', 
            color: 'var(--text-main)', 
            background: 'var(--bg-dark)',
            minHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--glass-border)',
            borderRadius: '16px'
        }}>
          <h2 style={{ color: '#ff4d4d', fontWeight: 900 }}>SYSTEM MALFUNCTION</h2>
          <p style={{ color: 'var(--text-dim)', maxWidth: '400px', margin: '1rem 0 2rem 0' }}>
            A critical interface error occurred. This is likely due to a database sync priority issue.
          </p>
          <button 
            className="btn primary" 
            onClick={() => window.location.reload()}
          >
            REBOOT INTERFACE
          </button>
          <div style={{ marginTop: '2rem', fontSize: '10px', color: 'rgba(255,255,255,0.1)' }}>
            {this.state.error?.message}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
