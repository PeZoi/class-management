'use client';

import { Input } from '@/components/ui/input';
import React from 'react';

interface CurrencyInputFieldProps extends Omit<React.ComponentProps<'input'>, 'value' | 'onChange'> {
  label?: string;
  value: string | number | undefined;
  onChange: (value: number) => void;
  currencyLabel?: string;
  description?: string;
  required?: boolean;
}

export function CurrencyInputField({ value, onChange, required, className, ...props }: CurrencyInputFieldProps) {
  // Format number with thousand separators
  const formatNumber = (num: string | number | undefined): string => {
    if (!num) return '';
    return Number(num).toLocaleString('vi-VN');
  };

  // Remove formatting and convert to number
  const unformatNumber = (str: string): number => {
    const cleaned = str.replace(/[.,]/g, '');
    return parseInt(cleaned) || 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const unformatted = unformatNumber(e.target.value || '');
    onChange(unformatted);
  };

  return (
    <Input
      type="text"
      value={formatNumber(value)}
      onChange={handleChange}
      className={className}
      required={required}
      {...props}
    />
  );
}
