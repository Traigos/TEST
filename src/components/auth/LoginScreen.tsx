import { useState } from 'react';
import { Sparkles, Globe, ArrowRight } from 'lucide-react';

interface LoginScreenProps {
  onConnect: (baseUrl: string, token: string) => void;
  onDemo: () => void;
}

export function LoginScreen({ onConnect, onDemo }: LoginScreenProps) {
  const [baseUrl, setBaseUrl] = useState('');
  const [token, setToken] = useState('');

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (baseUrl.trim()) {
      onConnect(baseUrl.trim(), token.trim());
    }
  };

  return (
    <div className="login-screen">
      <div className="login-scene" />
      <div className="login-content">
        <div className="login-card glass-panel-solid glass-reveal">
          <div className="login-logo">
            <div className="login-logo-icon">
              <Sparkles size={32} />
            </div>
            <h1>Power Glass</h1>
            <p className="login-subtitle">
              A Liquid Glass experience for Power Platform
            </p>
          </div>

          <form onSubmit={handleConnect} className="login-form">
            <div className="glass-form-group">
              <label className="glass-form-label">Environment URL</label>
              <div className="glass-search">
                <Globe size={16} style={{ opacity: 0.5 }} />
                <input
                  type="url"
                  placeholder="https://org.crm.dynamics.com"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                />
              </div>
              <span className="glass-form-hint">
                Your Dataverse environment URL
              </span>
            </div>

            <div className="glass-form-group">
              <label className="glass-form-label">Access Token</label>
              <input
                type="password"
                className="glass-input"
                placeholder="Bearer token (optional for demo)"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
              <span className="glass-form-hint">
                OAuth 2.0 access token for Dataverse Web API
              </span>
            </div>

            <button
              type="submit"
              className="glass-button primary"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={!baseUrl.trim()}
            >
              Connect <ArrowRight size={16} />
            </button>
          </form>

          <div className="login-divider">
            <span>or</span>
          </div>

          <button
            onClick={onDemo}
            className="glass-button"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <Sparkles size={16} />
            Explore Demo Mode
          </button>

          <p className="login-footer">
            Demo mode uses sample data to showcase the Liquid Glass UI.
            Connect to a live environment to render your actual model-driven apps.
          </p>
        </div>
      </div>
    </div>
  );
}
