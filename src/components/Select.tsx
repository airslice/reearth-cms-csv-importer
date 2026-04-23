import React from 'react';
import type { SelectProps } from '@/types';
import { Label } from './ui/label';
import {
  Select as ShadSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

export const Select: React.FC<SelectProps> = ({
  label,
  name,
  placeholder,
  value,
  onChange,
  options,
  error,
  required = false,
  disabled = false,
  className,
  'data-testid': dataTestId,
}) => {
  return (
    <div className={label ? "mb-4 space-y-2" : ""}>
      {label && (
        <Label htmlFor={name}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <ShadSelect value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          id={name}
          data-testid={dataTestId}
          className={`${error ? 'border-destructive' : ''} ${className || ''}`}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </ShadSelect>
      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
    </div>
  );
};
