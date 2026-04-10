import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component to catch JavaScript errors anywhere in the child
 * component tree, log those errors, and display a fallback UI.
 */
class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        this.setState({ errorInfo });
        // Log error to console (could also send to error reporting service)
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReset = (): void => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div style={styles.container}>
                    <div style={styles.card}>
                        <h1 style={styles.title}>Something went wrong</h1>
                        <p style={styles.message}>
                            An unexpected error occurred. Please try refreshing the page.
                        </p>
                        {this.state.error && (
                            <details style={styles.details}>
                                <summary style={styles.summary}>Error Details</summary>
                                <pre style={styles.errorText}>
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}
                        <div style={styles.buttonContainer}>
                            <button
                                onClick={this.handleReset}
                                style={styles.button}
                            >
                                Try Again
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                style={{ ...styles.button, ...styles.secondaryButton }}
                            >
                                Refresh Page
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#1a1a2e',
        padding: '20px',
    },
    card: {
        backgroundColor: '#16213e',
        borderRadius: '12px',
        padding: '40px',
        maxWidth: '600px',
        width: '100%',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        textAlign: 'center',
    },
    title: {
        color: '#e94560',
        fontSize: '2rem',
        marginBottom: '16px',
    },
    message: {
        color: '#a0a0a0',
        fontSize: '1.1rem',
        marginBottom: '24px',
    },
    details: {
        textAlign: 'left',
        marginBottom: '24px',
        backgroundColor: '#0f0f23',
        borderRadius: '8px',
        padding: '16px',
    },
    summary: {
        color: '#f0f0f0',
        cursor: 'pointer',
        fontWeight: 'bold',
    },
    errorText: {
        color: '#ff6b6b',
        fontSize: '0.85rem',
        overflow: 'auto',
        maxHeight: '200px',
        marginTop: '12px',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
    },
    buttonContainer: {
        display: 'flex',
        gap: '16px',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    button: {
        backgroundColor: '#e94560',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '8px',
        fontSize: '1rem',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        border: '2px solid #e94560',
        color: '#e94560',
    },
};

export default ErrorBoundary;
