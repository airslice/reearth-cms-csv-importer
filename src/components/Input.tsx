import React from 'react';
import type { InputProps } from '@/types';
import { Input as ShadInput } from './ui/input';
import { Label } from './ui/label';

export const Input: React.FC<InputProps> = ({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  'data-testid': dataTestId,
}) => {
  return (
    <div className="mb-4 space-y-2">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <ShadInput
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        data-testid={dataTestId}
        className={error ? 'border-destructive' : ''}
      />
      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
    </div>
  );
};
