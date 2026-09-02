import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by StreamFlix ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="max-w-md w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl p-8 shadow-2xl space-y-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-950/60 border border-red-800/80 flex items-center justify-center text-[#E50914] shadow-lg">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black font-display tracking-wide text-white">
                Something went wrong
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                StreamFlix encountered an unexpected error. Don't worry, your watch history and preferences remain saved.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="bg-black/60 p-3 rounded-lg border border-zinc-800/80 text-left overflow-x-auto max-h-24">
                <code className="text-[11px] font-mono text-red-400/90 block">
                  {this.state.error.message}
                </code>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full py-2.5 px-4 rounded-xl bg-[#E50914] hover:bg-[#b80710] font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-950/40 transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload StreamFlix</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs flex items-center justify-center gap-2 border border-zinc-700/80 transition-all cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Return Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
