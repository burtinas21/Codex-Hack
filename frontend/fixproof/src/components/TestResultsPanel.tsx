import React from 'react';
import { TestExecutionResult, ExecutionMode } from '../types';
import { StatusBadge } from './StatusBadge';
import { Terminal, Clock, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

interface TestResultsPanelProps {
  title: string;
  testResult: TestExecutionResult | null;
  command: string;
  isLoading?: boolean;
  onRunTest?: () => void;
  runButtonLabel?: string;
  mode: ExecutionMode;
  emptyMessage?: string;
  isVerification?: boolean;
}

export const TestResultsPanel: React.FC<TestResultsPanelProps> = ({
  title,
  testResult,
  command,
  isLoading = false,
  onRunTest,
  runButtonLabel = 'Run Test',
  mode,
  emptyMessage = 'Test has not been executed yet.',
  isVerification = false
}) => {
  const isAnalysisMode = mode === 'analysis_only';
  const effectiveStatus = isAnalysisMode ? 'not_run' : testResult ? testResult.status : 'not_run';

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <Terminal size={16} />
          <span>{title}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {testResult?.retried && (
            <span
              style={{
                fontSize: '0.72rem',
                backgroundColor: '#fef3c7',
                color: '#92400e',
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontWeight: 600
              }}
              title="Backend automatically retried this test once"
            >
              <RefreshCw size={11} />
              Retried (1x)
            </span>
          )}

          {testResult?.isRecordedDemo && !isAnalysisMode && (
            <span
              style={{
                fontSize: '0.7rem',
                backgroundColor: '#fef9c3',
                color: '#854d0e',
                border: '1px solid #fde047',
                padding: '0.1rem 0.4rem',
                borderRadius: '4px',
                fontWeight: 500
              }}
            >
              Recorded demo — not a live run
            </span>
          )}

          <StatusBadge status={effectiveStatus} />
        </div>
      </div>

      <div className="card-body">
        {/* Command info line */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#f1f5f9',
            padding: '0.5rem 0.75rem',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontFamily: 'var(--font-mono)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#64748b' }}>$</span>
            <span style={{ color: '#0f172a', fontWeight: 600 }}>{command}</span>
          </div>

          {onRunTest && (
            <button
              type="button"
              className="btn btn-primary"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
              onClick={onRunTest}
              disabled={isLoading || isAnalysisMode}
              title={isAnalysisMode ? 'Disabled in Analysis-only mode' : undefined}
            >
              {isLoading ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  Running...
                </>
              ) : (
                runButtonLabel
              )}
            </button>
          )}
        </div>

        {/* In Analysis-only mode warning */}
        {isAnalysisMode && (
          <div className="alert alert-warning" style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}>
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>
              <strong>Analysis-only Mode:</strong> Execution is skipped to prevent any code execution.
              Status is locked to "Not run" by policy.
            </span>
          </div>
        )}

        {/* Verification failure callout */}
        {isVerification && !isAnalysisMode && testResult && testResult.status === 'failed' && (
          <div className="alert alert-error" style={{ fontSize: '0.82rem' }}>
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div>
              <strong>Could not verify this fix:</strong> The test suite failed after applying the proposed fix.
              The fix is NOT certified.
            </div>
          </div>
        )}

        {/* Verification success callout */}
        {isVerification && !isAnalysisMode && testResult && testResult.status === 'passed' && (
          <div className="alert alert-success" style={{ fontSize: '0.82rem' }}>
            <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
            <div>
              <strong>Verification Confirmed:</strong> The post-fix test passed with exit code 0.
            </div>
          </div>
        )}

        {/* Terminal viewer */}
        {!isAnalysisMode && testResult ? (
          <div className="terminal-view">
            <div className="terminal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ color: testResult.exitCode === 0 ? '#4ade80' : '#f87171' }}>
                  Exit code: {testResult.exitCode !== null ? testResult.exitCode : 'N/A'}
                </span>
                {testResult.durationMs !== null && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={11} />
                    {testResult.durationMs}ms
                  </span>
                )}
              </div>
              <span style={{ fontSize: '0.7rem' }}>
                {testResult.status === 'passed' ? 'PASS' : 'FAIL'}
              </span>
            </div>

            <div
              className={`terminal-output ${
                testResult.status === 'passed' ? 'pass-output' : 'fail-output'
              }`}
            >
              {testResult.stdout || testResult.stderr || '(No output recorded)'}
            </div>
          </div>
        ) : !isAnalysisMode ? (
          <div
            style={{
              padding: '2rem 1rem',
              textAlign: 'center',
              color: '#64748b',
              backgroundColor: '#f8fafc',
              border: '1px dashed #cbd5e1',
              borderRadius: '6px',
              fontSize: '0.85rem'
            }}
          >
            {emptyMessage}
          </div>
        ) : null}
      </div>
    </div>
  );
};

