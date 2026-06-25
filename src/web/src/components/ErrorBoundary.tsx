import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, info);
  }

  override render(): ReactNode {
    if (this.state.error) {
      return (
        <div
          role="alert"
          className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground"
        >
          <div className="w-full max-w-md space-y-4 rounded-base border-2 border-border bg-secondary-background p-6 shadow-shadow">
            <h1 className="font-heading text-lg">Something went wrong</h1>
            <pre className="overflow-auto rounded-base border-2 border-border bg-background p-3 text-xs">
              {this.state.error.message}
            </pre>
            <Button variant="neutral" size="sm" onClick={() => window.location.reload()}>
              Reload
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
