/**
 * React Error Boundary — catches uncaught JavaScript errors anywhere in its
 * child component tree and displays a fallback UI instead of crashing the whole app.
 *
 * This is a class component because React error boundaries require the
 * getDerivedStateFromError and componentDidCatch lifecycle methods, which
 * are not available in function components.
 *
 * Wraps the entire app in App.jsx.
 */
import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary__content">
            <div className="error-boundary__icon">⚠️</div>
            <h1>
              Something went wrong
            </h1>
            <p>
              An unexpected error occurred. Please try again.
            </p>
            <div className="error-boundary__actions">
              <button
                onClick={this.handleReset}
                className="ui-button ui-button--primary"
              >
                Try Again
              </button>
              <button
                onClick={() => (window.location.href = "/home")}
                className="ui-button ui-button--secondary"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
