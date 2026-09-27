import { Component } from "react";
import type { ReactNode } from "react";
import ErrorScreen, { errorButton, errorButtonSecondary } from "./ErrorScreen";

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
        backdrop="Oops"
        note="Something on our side went wrong. It's not you."
        title="Something went wrong"
        description="This page could not be shown. Please try again."
        actions={
          <>
            <button type="button" onClick={() => window.location.reload()} className={errorButton}>
              Try Again
            </button>
            <a href="/" className={errorButtonSecondary}>
              Back to Home
            </a>
          </>
        }
      />
    );
  }
}

export default ErrorBoundary;
