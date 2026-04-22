import React from 'react';
import type { ButtonProps } from '@/types';
import { Button as ShadButton } from './ui/button';
import { Loader2 } from 'lucide-react';

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  disabled = false,
  loading = false,
  className,
  'data-testid': dataTestId,
}) => {
  const variantMap: Record<string, 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'> = {
    primary: 'default',
    secondary: 'secondary',
    danger: 'destructive',
    default: 'default',
    outline: 'outline',
    destructive: 'destructive',
    ghost: 'ghost',
    link: 'link',
  };

  return (
    <ShadButton
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      data-testid={dataTestId}
      variant={variantMap[variant]}
      className={className}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </ShadButton>
  );
};
