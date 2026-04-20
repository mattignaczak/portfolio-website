import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

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
        <div className="error-boundary" role="alert">
          <div className="window" style={{ width: 420 }}>
            <div className="title-bar">
              <div className="title-bar-text">Fatal Error</div>
            </div>
            <div className="window-body">
              <p>
                Something went wrong. A fatal exception 0E has occurred at 0028:
                {this.state.error.name}.
              </p>
              <pre className="error-message">{this.state.error.message}</pre>
              <p>
                <button type="button" onClick={() => window.location.reload()}>
                  Reload
                </button>
              </p>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
