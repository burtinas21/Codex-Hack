import React from 'react';
import { CodePanel } from './CodePanel';
import { AlertTriangle } from 'lucide-react';

interface DiffComparisonProps {
  originalCode: string;
  proposedCode: string;
  language: string;
  diffSummary?: string;
}

export const DiffComparison: React.FC<DiffComparisonProps> = ({
  originalCode,
  proposedCode,
  language,
  diffSummary
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1rem'
        }}
      >
        <div>
          <CodePanel
            code={originalCode}
            language={language}
            title="Original Code (Failing)"
            maxHeight="320px"
            badge={
              <span
                style={{
                  fontSize: '0.68rem',
                  backgroundColor: 'rgba(239, 68, 68, 0.2)',
                  color: '#fca5a5',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '3px'
                }}
              >
                Baseline
              </span>
            }
          />
        </div>

        <div>
          <CodePanel
            code={proposedCode}
            language={language}
            title="Proposed Code Fix"
            maxHeight="320px"
            badge={
              <span
                style={{
                  fontSize: '0.68rem',
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  color: '#93c5fd',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '3px'
                }}
              >
                Proposed
              </span>
            }
          />
        </div>
      </div>

      {diffSummary && (
        <div
          style={{
            backgroundColor: '#0d1117',
            border: '1px solid #30363d',
            borderRadius: '6px',
            padding: '0.65rem 0.85rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem'
          }}
        >
          <div style={{ color: '#8b949e', marginBottom: '0.35rem', fontWeight: 600 }}>
            Inline Diff Patch Preview:
          </div>
          {diffSummary.split('\n').map((line, idx) => {
            const isAdd = line.startsWith('+');
            const isRemove = line.startsWith('-');
            return (
              <div
                key={idx}
                style={{
                  color: isAdd ? '#86efac' : isRemove ? '#fca5a5' : '#8b949e',
                  backgroundColor: isAdd
                    ? 'rgba(34, 197, 94, 0.12)'
                    : isRemove
                    ? 'rgba(239, 68, 68, 0.12)'
                    : 'transparent',
                  padding: '0.1rem 0.35rem',
                  borderRadius: '2px'
                }}
              >
                {line}
              </div>
            );
          })}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.76rem',
          color: '#64748b',
          backgroundColor: '#f8fafc',
          padding: '0.45rem 0.75rem',
          borderRadius: '4px',
          border: '1px solid #e2e8f0'
        }}
      >
        <AlertTriangle size={14} className="text-amber-500 shrink-0" />
        <span>
          <strong>Notice:</strong> Code fixes are not considered correct until post-fix verification tests pass.
          Do not assume plausibility equals correctness.
        </span>
      </div>
    </div>
  );
};
