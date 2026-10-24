import React, { useState } from 'react';
import { ProposedFix, ExecutionMode } from '../types';
import { Check, ShieldCheck, AlertCircle, Lock, RefreshCw, X } from 'lucide-react';

interface FixApprovalProps {
  proposedFix: ProposedFix | null;
  isFixApproved: boolean;
  isFixApplied: boolean;
  isLoading: boolean;
  mode: ExecutionMode;
  onApplyFix: () => void;
}

export const FixApproval: React.FC<FixApprovalProps> = ({
  proposedFix,
  isFixApproved,
  isFixApplied,
  isLoading,
  mode,
  onApplyFix
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [hasConfirmedCheckbox, setHasConfirmedCheckbox] = useState(false);

  const canApply = !!proposedFix && !isFixApplied && !isLoading && mode === 'verified';

  const handleOpenConfirm = () => {
    if (!canApply) return;
    setHasConfirmedCheckbox(false);
    setShowConfirmModal(true);
  };

  const handleConfirmAndApply = () => {
    setShowConfirmModal(false);
    onApplyFix();
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <ShieldCheck size={16} />
          <span>Human Approval & Fix Application</span>
        </div>
        {isFixApplied ? (
          <span className="source-pill verified">
            <Check size={12} /> Fix Applied
          </span>
        ) : isFixApproved ? (
          <span className="source-pill verified">
            <Check size={12} /> Fix Approved
          </span>
        ) : (
          <span
            style={{
              fontSize: '0.74rem',
              backgroundColor: '#fef3c7',
              color: '#92400e',
              padding: '0.15rem 0.5rem',
              borderRadius: '4px',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <Lock size={11} /> Awaiting Human Approval
          </span>
        )}
      </div>

      <div className="card-body">
        <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
          {isFixApplied ? (
            <div className="alert alert-success">
              <Check size={16} className="shrink-0 mt-0.5" />
              <div>
                <strong>Fix Approved and Injected:</strong> The proposed code change was applied to the fixture workspace.
                The verification test suite was executed to prove compliance.
              </div>
            </div>
          ) : proposedFix ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p>
                FixProof adheres to the human-in-the-loop principle: <strong>no AI-generated fix is ever applied automatically</strong>.
                Review the proposed patch above and confirm application to run the post-fix verification test.
              </p>

              {mode === 'analysis_only' && (
                <div className="alert alert-warning">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>
                    Fix application is disabled in <strong>Analysis-only Mode</strong> to prevent code execution.
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleOpenConfirm}
                  disabled={!canApply}
                  aria-haspopup="dialog"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Applying & Verifying...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={15} />
                      Apply Approved Fix
                    </>
                  )}
                </button>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Step 4 of 5: Requires manual confirmation
                </span>
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: '1.5rem 1rem',
                textAlign: 'center',
                color: '#64748b',
                backgroundColor: '#f8fafc',
                border: '1px dashed #cbd5e1',
                borderRadius: '6px'
              }}
            >
              Approval will unlock after baseline test failure and AI diagnosis.
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 id="modal-title" className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} className="text-blue-600" />
                Confirm Code Fix Application
              </h3>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                aria-label="Close confirmation dialog"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '0.2rem'
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ marginBottom: '0.85rem' }}>
                You are about to apply the proposed AI code fix to the target project and trigger the verification test suite.
              </p>

              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  marginBottom: '1rem',
                  fontSize: '0.82rem'
                }}
              >
                <strong>Summary of Changes:</strong>
                <p style={{ marginTop: '0.25rem', color: '#334155' }}>{proposedFix?.summary}</p>
              </div>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.6rem',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  color: '#1e293b'
                }}
              >
                <input
                  type="checkbox"
                  checked={hasConfirmedCheckbox}
                  onChange={(e) => setHasConfirmedCheckbox(e.target.checked)}
                  style={{ marginTop: '0.2rem' }}
                />
                <span>
                  I have inspected the diff and approve applying this change to execute verification tests.
                </span>
              </label>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleConfirmAndApply}
                disabled={!hasConfirmedCheckbox || isLoading}
              >
                Confirm & Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
