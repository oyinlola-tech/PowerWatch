import { Component } from "react";
import type { ReactNode } from "react";
import ErrorScreen, { errorButton } from "./ErrorScreen";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <ErrorScreen
        figure={
          <img src="/brand/emblem.png" alt="" width={773} height={512} className="h-auto w-[180px]" />
        }
        title="Something went wrong"
        description="This page could not be shown. Please try again."
        action={
          <button type="button" onClick={() => window.location.reload()} className={errorButton}>
            Try Again
          </button>
        }
      />
    );
  }
}

export default ErrorBoundary;
