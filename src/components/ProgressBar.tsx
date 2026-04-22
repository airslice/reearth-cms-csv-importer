import React from 'react';
import { formatPercentage } from '@/utils';
import type { ProgressBarProps } from '@/types';
import { Progress } from './ui/progress';

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  label,
  'data-testid': dataTestId,
}) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div data-testid={dataTestId} className="space-y-2">
      {label && (
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium">{label}</span>
          <span className="text-sm font-medium">
            {formatPercentage(current, total)}
          </span>
        </div>
      )}
      <Progress value={percentage} data-testid={`${dataTestId}-bar`} />
      <div className="flex justify-between mt-1 text-xs text-muted-foreground">
        <span>
          {current} of {total}
        </span>
      </div>
    </div>
  );
};
