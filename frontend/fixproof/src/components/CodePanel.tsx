import React, { useState } from 'react';
import { Copy, Check, Code2 } from 'lucide-react';

interface CodePanelProps {
  code: string;
  language?: string;
  title?: string;
  maxHeight?: string;
  badge?: React.ReactNode;
}

export const CodePanel: React.FC<CodePanelProps> = ({
  code,
  language = 'text',
  title = 'Source Code',
  maxHeight = '380px',
  badge
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard API is restricted
      setCopied(false);
    }
  };

  const lines = code.trimEnd().split('\n');

  return (
    <div className="code-panel">
      <div className="code-panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Code2 size={14} style={{ color: '#8b949e' }} />
          <span style={{ fontWeight: 600, color: '#e6edf3' }}>{title}</span>
          <span
            style={{
              fontSize: '0.7rem',
              color: '#8b949e',
              background: 'rgba(255,255,255,0.06)',
              padding: '0.1rem 0.4rem',
              borderRadius: '3px'
            }}
          >
            {language}
          </span>
          {badge}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy code"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#8b949e',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            fontSize: '0.75rem',
            padding: '0.2rem 0.4rem',
            borderRadius: '4px'
          }}
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check size={13} style={{ color: '#4ade80' }} />
              <span style={{ color: '#4ade80' }}>Copied</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <div
        className="code-content"
        style={{
          maxHeight,
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: '0.75rem',
          padding: '0.75rem 0.85rem'
        }}
      >
        {/* Line numbers gutter */}
        <div
          aria-hidden="true"
          style={{
            userSelect: 'none',
            textAlign: 'right',
            color: '#484f58',
            fontSize: '0.8rem',
            lineHeight: 1.55,
            borderRight: '1px solid #21262d',
            paddingRight: '0.6rem'
          }}
        >
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Code lines */}
        <pre
          style={{
            margin: 0,
            overflowX: 'auto',
            lineHeight: 1.55,
            fontSize: '0.83rem',
            color: '#e6edf3'
          }}
        >
          {lines.map((line, i) => (
            <div key={i}>{line || ' '}</div>
          ))}
        </pre>
      </div>
    </div>
  );
};

