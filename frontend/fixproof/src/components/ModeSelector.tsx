import React from 'react';
import { ExecutionMode } from '../types';
import { ShieldCheck, Cpu } from 'lucide-react';

interface ModeSelectorProps {
  mode: ExecutionMode;
  onModeChange: (mode: ExecutionMode) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ mode, onModeChange }) => {
  return (
    <div className={`alert ${mode === 'verified' ? 'alert-info' : 'alert-warning'}`} role="region" aria-label="Mode notice">
      {mode === 'verified' ? (
        <>
          <ShieldCheck size={18} className="mt-0.5 shrink-0" />
          <div style={{ flex: 1 }}>
            <strong>Verified Mode Active:</strong> FixProof enforces the complete proof contract.
            Fixes are applied to the fixture, original tests are executed, and real failure vs passing exit codes prove the fix.
          </div>
          <button
            type="button"
            className="btn btn-secondary text-xs"
            onClick={() => onModeChange('analysis_only')}
            style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
          >
            Switch to Analysis-only
          </button>
        </>
      ) : (
        <>
          <Cpu size={18} className="mt-0.5 shrink-0" />
          <div style={{ flex: 1 }}>
            <strong>Analysis-only Mode Active:</strong> Static inspection only. Tests are not executed, and test execution
            results are strictly recorded as <span className="status-badge not_run" style={{ padding: '0.1rem 0.4rem' }}>Not run</span>.
            Zero execution evidence is fabricated.
          </div>
          <button
            type="button"
            className="btn btn-primary text-xs"
            onClick={() => onModeChange('verified')}
            style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
          >
            Switch to Verified Mode
          </button>
        </>
      )}
    </div>
  );
};
