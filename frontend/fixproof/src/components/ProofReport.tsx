import React from 'react';
import { VerificationReport, ExecutionMode } from '../types';
import { StatusBadge } from './StatusBadge';
import { ShieldCheck, AlertCircle, FileCheck2, Clock, CheckCircle2, XCircle } from 'lucide-react';

interface ProofReportProps {
  report: VerificationReport | null;
  mode: ExecutionMode;
}

export const ProofReport: React.FC<ProofReportProps> = ({ report, mode }) => {
  const isAnalysis = mode === 'analysis_only';

  if (!report) {
    return (
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <FileCheck2 size={16} />
            <span>FixProof Verification Report</span>
          </div>
        </div>
        <div className="card-body">
          <div
            style={{
              padding: '2.5rem 1rem',
              textAlign: 'center',
              color: '#64748b',
              backgroundColor: '#f8fafc',
              border: '1px dashed #cbd5e1',
              borderRadius: '6px',
              fontSize: '0.85rem'
            }}
          >
            The formal Proof Report will be synthesized once the full verification cycle completes.
          </div>
        </div>
      </div>
    );
  }

  // Enforce the verification invariant:
  // A fix is verified ONLY if:
  // 1. Not in analysis_only mode
  // 2. originalTestStatus was 'failed'
  // 3. postFixTestStatus was 'passed'
  const isTrulyVerified =
    !isAnalysis &&
    report.originalTestStatus === 'failed' &&
    report.postFixTestStatus === 'passed';

  const displayOriginalStatus = isAnalysis ? 'not_run' : report.originalTestStatus;
  const displayPostFixStatus = isAnalysis ? 'not_run' : report.postFixTestStatus;

  return (
    <section className="proof-report" aria-label="Verification Proof Report">
      <div className="proof-report-header">
        <div className="proof-headline">
          <ShieldCheck size={24} style={{ color: isTrulyVerified ? '#15803d' : '#475569' }} />
          <span>FixProof Official Verification Certificate</span>
        </div>

        <div>
          {isTrulyVerified ? (
            <span
              style={{
                backgroundColor: '#dcfce7',
                color: '#166534',
                border: '1px solid #86efac',
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <CheckCircle2 size={16} /> VERIFIED FIX PROVEN
            </span>
          ) : isAnalysis ? (
            <span
              style={{
                backgroundColor: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                fontWeight: 600,
                fontSize: '0.85rem'
              }}
            >
              ANALYSIS ONLY (NOT EXECUTED)
            </span>
          ) : (
            <span
              style={{
                backgroundColor: '#fee2e2',
                color: '#991b1b',
                border: '1px solid #fca5a5',
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <XCircle size={16} /> UNVERIFIED / FAILED
            </span>
          )}
        </div>
      </div>

      {report.isRecordedDemo && !isAnalysis && (
        <div className="demo-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <AlertCircle size={15} />
            <span>
              <strong>Demo Disclaimer:</strong> Recorded demo — not a live run. Backend test sandbox was simulated with pre-recorded output.
            </span>
          </div>
        </div>
      )}

      {/* Proof Metrics Grid */}
      <div className="proof-grid">
        <div className="proof-metric">
          <span className="metric-label">Target Fixture</span>
          <span className="metric-value">{report.fixtureName}</span>
        </div>

        <div className="proof-metric">
          <span className="metric-label">Baseline Test Status</span>
          <div>
            <StatusBadge status={displayOriginalStatus} />
          </div>
        </div>

        <div className="proof-metric">
          <span className="metric-label">Post-Fix Test Status</span>
          <div>
            <StatusBadge status={displayPostFixStatus} />
          </div>
        </div>

        <div className="proof-metric">
          <span className="metric-label">Execution Mode</span>
          <span className="metric-value" style={{ textTransform: 'capitalize' }}>
            {mode.replace('_', ' ')}
          </span>
        </div>

        {report.durationMs !== null && !isAnalysis && (
          <div className="proof-metric">
            <span className="metric-label">Total Execution Time</span>
            <span className="metric-value" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Clock size={13} />
              {report.durationMs}ms
            </span>
          </div>
        )}

        {report.appliedAt && (
          <div className="proof-metric">
            <span className="metric-label">Timestamp</span>
            <span className="metric-value" style={{ fontSize: '0.78rem' }}>
              {new Date(report.appliedAt).toLocaleTimeString()} ({new Date(report.appliedAt).toLocaleDateString()})
            </span>
          </div>
        )}
      </div>

      {/* Diagnosis Summary */}
      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          padding: '0.85rem 1rem',
          fontSize: '0.85rem'
        }}
      >
        <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>
          Diagnosis & Verified Cause:
        </div>
        <p style={{ color: '#334155', lineHeight: 1.5 }}>{report.diagnosisSummary}</p>
      </div>

      {/* Verification Rule Assertion Callout */}
      <div
        style={{
          fontSize: '0.78rem',
          color: '#64748b',
          borderTop: '1px solid #f1f5f9',
          paddingTop: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem'
        }}
      >
        <ShieldCheck size={14} className="text-emerald-600" />
        <span>
          FixProof Rule: A fix is verified only if the original test actually failed, the approved fix was applied,
          and the exact same test passed afterward.
        </span>
      </div>
    </section>
  );
};

