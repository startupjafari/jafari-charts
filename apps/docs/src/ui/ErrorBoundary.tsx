import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useT } from '../i18n';

interface Props {
  children: ReactNode;
  /** Changing this resets the boundary (e.g. the route path). */
  resetKey?: string;
  /**
   * What failed, in the current language, as it reads in the sentence
   * (`t.errors.page`, `t.errors.example(title)`…). Defaults to “this example”.
   */
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
      return <ErrorMessage label={this.props.label} message={this.state.error.message} />;
    }
    return this.props.children;
  }
}

function ErrorMessage({ label, message }: { label: string | undefined; message: string }) {
  const t = useT().errors;
  return (
    <div className="error-box" role="alert">
      <strong>{t.failed(label ?? t.thisExample)}</strong>
      <span>{message}</span>
    </div>
  );
}
