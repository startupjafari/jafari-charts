import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Changing this resets the boundary (e.g. the route path). */
  resetKey?: string;
  label?: string;
}

interface State {
  error: Error | null;
  resetKey: string | undefined;
}

/** Keeps one broken example from taking the whole page down. */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null, resetKey: this.props.resetKey };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    return props.resetKey !== state.resetKey ? { error: null, resetKey: props.resetKey } : null;
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(`[docs] ${this.props.label ?? 'Example'} failed to render`, error, info);
  }

  override render(): ReactNode {
    if (this.state.error) {
      return (
        <div className="error-box" role="alert">
          <strong>{this.props.label ?? 'This example'} could not be rendered.</strong>
          <span>{this.state.error.message}</span>
        </div>
      );
    }
    return this.props.children;
  }
}
