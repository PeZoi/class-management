'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import * as React from 'react';

interface FloatingLabelSelectProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  placeholder?: string;
  id?: string;
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
}

export function FloatingLabelSelect({
  label,
  value,
  onValueChange,
  children,
  placeholder,
  id,
  className,
  triggerClassName,
  disabled,
}: FloatingLabelSelectProps) {
  const selectId = id || `floating-select-${label.toLowerCase().replace(/\s+/g, '-')}`;
  // Có giá trị khi value tồn tại và không rỗng (bao gồm cả 'all')
  const hasValue = value !== undefined && value !== '';
  const isRoundedFull = triggerClassName?.includes('rounded-full');

  return (
    <div className={cn('relative', className)}>
      {/* Label luôn floating lên trên khi có value (kể cả 'all') */}
      <Label
        htmlFor={selectId}
        className={cn(
          'pointer-events-none absolute z-10 text-slate-500 dark:text-slate-400 transition-all duration-200 ease-in-out',
          isRoundedFull ? 'left-4' : 'left-3',
          hasValue
            ? 'top-0 -translate-y-1/2 text-[10px] font-medium leading-tight px-1.5 bg-white dark:bg-slate-900'
            : 'top-1/2 -translate-y-1/2 text-sm px-0'
        )}
      >
        {label}
      </Label>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger
          id={selectId}
          className={cn(
            'h-9 w-full bg-white dark:bg-slate-900',
            hasValue 
              ? isRoundedFull 
                ? 'pt-3.5 pb-1.5' 
                : 'pt-4 pb-1.5'
              : 'py-2',
            isRoundedFull ? 'rounded-full' : 'rounded-md',
            'border-slate-200 dark:border-slate-700',
            'text-sm',
            'focus-visible:ring-2 focus-visible:ring-blue-500/20',
            triggerClassName
          )}
        >
          <SelectValue placeholder={placeholder || label} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </div>
  );
}

