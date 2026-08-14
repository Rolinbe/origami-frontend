import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { useLocation } from "react-router-dom";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ResetAwareErrorBoundaryProps extends ErrorBoundaryProps {
  resetKey: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

class ErrorBoundary extends Component<ResetAwareErrorBoundaryProps, ErrorBoundaryState> {
  private timer: number | null = null;
  constructor(props: ResetAwareErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error?.message ?? "Erreur inconnue" };
  }

  componentDidUpdate(prevProps: ResetAwareErrorBoundaryProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, message: "" });
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Erreur de rendu interceptée:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  componentDidMount() {
    if (this.state.hasError) {
      this.timer = window.setTimeout(() => this.handleReload(), 6000);
    }
  }

  componentWillUnmount() {
    if (this.timer) window.clearTimeout(this.timer);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-app flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-lg">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <h1 className="text-lg font-semibold">Une erreur est survenue</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Cette page a rencontré un problème inattendu. Rechargement
              automatique…
            </p>
            {this.state.message && (
              <pre className="mt-4 overflow-x-auto rounded-lg bg-muted p-3 text-left text-xs text-destructive">
                {this.state.message}
              </pre>
            )}
            <button
              type="button"
              onClick={this.handleReload}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <RotateCcw className="h-4 w-4" />
              Recharger maintenant
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const RouteAwareErrorBoundary = ({ children }: ErrorBoundaryProps) => {
  const { pathname } = useLocation();
  return (
    <ErrorBoundary resetKey={pathname}>{children}</ErrorBoundary>
  );
};

export default RouteAwareErrorBoundary;