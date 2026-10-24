import React from 'react';
import { ExecutionMode, BackendConnectionState } from '../types';
import { ShieldCheck, Server, WifiOff, Wifi, HelpCircle } from 'lucide-react';

interface AppHeaderProps {
  mode: ExecutionMode;
  onModeChange: (mode: ExecutionMode) => void;
  backendState: BackendConnectionState;
  onCheckBackend: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  mode,
  onModeChange,
  backendState,
  onCheckBackend
}) => {
  const getBackendBadge = () => {
    switch (backendState) {
      case 'connected':
        return (
          <div
            className="backend-indicator"
            title="Backend Express API is connected and responding"
            role="status"
            aria-label="Backend status: connected"
          >
            <span className="status-dot connected" />
            <Wifi size={13} className="text-emerald-400" />
            <span>API Online</span>
          </div>
        );
      case 'disconnected':
        return (
          <button
            className="backend-indicator cursor-pointer"
            onClick={onCheckBackend}
            title="Backend disconnected. Click to recheck connection."
            aria-label="Backend status: disconnected. Click to retry."
          >
            <span className="status-dot disconnected" />
            <WifiOff size={13} />
            <span>Demo Mode (Offline)</span>
          </button>
        );
      case 'unknown':
      default:
        return (
          <div
            className="backend-indicator"
            title="Checking backend connection..."
            role="status"
            aria-label="Backend status: checking"
          >
            <span className="status-dot unknown" />
            <HelpCircle size={13} />
            <span>Checking API...</span>
          </div>
        );
    }
  };

  return (
    <header className="app-header">
      <div className="brand-section">
        <div className="brand-icon" aria-hidden="true">
          <ShieldCheck size={22} strokeWidth={2.2} />
        </div>
        <div className="brand-titles">
          <div className="brand-name">
            FixProof
            <span className="brand-tag">v1.0</span>
          </div>
          <span className="brand-subtitle">AI Code Fix Verification</span>
        </div>
      </div>

      <div className="header-controls">
        {/* Mode Selector */}
        <div className="mode-toggle" role="group" aria-label="Execution Mode">
          <button
            type="button"
            className={`mode-btn ${mode === 'verified' ? 'active' : ''}`}
            onClick={() => onModeChange('verified')}
            title="Execute real tests to verify fixes"
            aria-pressed={mode === 'verified'}
          >
            <ShieldCheck size={14} />
            <span>Verified Mode</span>
          </button>
          <button
            type="button"
            className={`mode-btn ${mode === 'analysis_only' ? 'active' : ''}`}
            onClick={() => onModeChange('analysis_only')}
            title="Static analysis only — no tests will be executed"
            aria-pressed={mode === 'analysis_only'}
          >
            <Server size={14} />
            <span>Analysis-only Mode</span>
          </button>
        </div>

        {/* Backend Indicator */}
        {getBackendBadge()}
      </div>
    </header>
  );
};

