import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen bg-black text-white p-8 flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4 text-red-400">Something went wrong</h1>
          <pre className="bg-white/10 p-4 rounded-lg overflow-auto max-w-4xl text-sm">
            {this.state.error?.toString()}
            <br />
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-cyan-400/20 border border-cyan-400/40 text-cyan-300 rounded-lg hover:bg-cyan-400/30"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

