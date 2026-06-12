import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[CyberKit] Erreur interface:', error, info.componentStack);
  }

  private reload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center px-6 py-16">
          <div className="max-w-md text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-500/10 text-red-400 mb-5">
              <AlertTriangle className="w-7 h-7" aria-hidden="true" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Un problème est survenu</h1>
            <p className="text-slate-400 text-sm mb-6">
              Cette page n&apos;a pas pu s&apos;afficher correctement. Vous pouvez réessayer ou
              revenir à l&apos;accueil.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={this.reload}
                className="focus-ring inline-flex items-center justify-center gap-2 px-5 py-3 bg-brand-orange text-white rounded-xl font-semibold"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                Réessayer
              </button>
              <a
                href="/"
                className="focus-ring inline-flex items-center justify-center px-5 py-3 bg-slate-800 text-white rounded-xl font-semibold"
              >
                Accueil
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
