import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Healthy+Brain app:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#0a0a0a',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: 'Outfit, sans-serif',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '480px',
            width: '100%',
            backgroundColor: '#141414',
            border: '1px solid rgba(255,138,0,0.3)',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
          }}>
            <h1 style={{ fontSize: '20px', fontWeight: '900', color: '#ff8a00', marginBottom: '12px', textTransform: 'uppercase' }}>
              ⚠️ Healthy + Brain Reiniciado
            </h1>
            <p style={{ fontSize: '14px', color: '#cccccc', lineHeight: '1.6', marginBottom: '20px' }}>
              Se detectó un reinicio automático en el renderizado. Presiona el botón para reanudar la sesión limpia.
            </p>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              style={{
                backgroundColor: '#13ec5b',
                color: '#000000',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '16px',
                fontWeight: '900',
                fontSize: '13px',
                textTransform: 'uppercase',
                cursor: 'pointer'
              }}
            >
              Reactivar Aplicación
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);