import React from 'react';
import { TestStatus } from '../types';
import { CheckCircle2, XCircle, MinusCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: TestStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const isSmall = size === 'sm';
  const iconSize = isSmall ? 12 : 14;

  switch (status) {
    case 'passed':
      return (
        <span
          className={`status-badge passed ${isSmall ? 'text-xs' : ''}`}
          title="Test execution succeeded with zero exit code"
        >
          <CheckCircle2 size={iconSize} />
          Passed
        </span>
      );
    case 'failed':
      return (
        <span
          className={`status-badge failed ${isSmall ? 'text-xs' : ''}`}
          title="Test execution failed with non-zero exit code"
        >
          <XCircle size={iconSize} />
          Failed
        </span>
      );
    case 'not_run':
    default:
      return (
        <span
          className={`status-badge not_run ${isSmall ? 'text-xs' : ''}`}
          title="Test has not been executed"
        >
          <MinusCircle size={iconSize} />
          Not run
        </span>
      );
  }
};

