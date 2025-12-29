'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React from 'react';

interface CurrencyInputFieldProps extends Omit<React.ComponentProps<'input'>, 'value' | 'onChange'> {
  label?: string;
  value: string | number | undefined;
  onChange: (value: number) => void;
  currencyLabel?: string;
  description?: string;
  required?: boolean;
}

export function CurrencyInputField({
  label,
  value,
  onChange,
  currencyLabel = 'VNĐ',
  description,
  required,
  className,
  ...props
}: CurrencyInputFieldProps) {
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
    <div className="space-y-2">
      {label && (
        <Label htmlFor={props.id}>
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <div className="flex items-center gap-2 mb-2">
        <Input
          
          type="text"
          value={formatNumber(value)}
          onChange={handleChange}
          className={className}
          required={required}
          {...props}
        />
        <p className="text-xs text-muted-foreground">
          {currencyLabel}
        </p>
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}

