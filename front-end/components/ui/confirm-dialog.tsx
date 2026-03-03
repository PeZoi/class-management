'use client';

import { ReactNode, useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ConfirmDialogVariant = 'default' | 'destructive';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmDialogVariant;
  icon?: ReactNode;
  className?: string;
  confirmButtonClassName?: string;
  cancelButtonClassName?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  onOpenChange?: (open: boolean) => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  icon,
  className,
  confirmButtonClassName,
  cancelButtonClassName,
  onConfirm,
  onCancel,
  onOpenChange,
}: ConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = () => {
    if (isLoading) return;
    onCancel?.();
    onOpenChange?.(false);
  };

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      await onConfirm();
      onOpenChange?.(false);
    } catch (error) {
      // Keep dialog open on error; errors are handled/toasted by callers
      // eslint-disable-next-line no-console
      console.error('ConfirmDialog onConfirm error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        // Khi đang loading thì không cho đóng dialog bằng overlay/ESC
        if (isLoading && !isOpen) return;
        if (!isOpen) {
          onCancel?.();
        }
        onOpenChange?.(isOpen);
      }}
    >
      <DialogContent
        className={cn(
          'sm:max-w-md',
          'border-0 shadow-xl',
          'bg-white/95 dark:bg-slate-900/95',
          'backdrop-blur',
          className,
        )}
      >
        <DialogHeader className="space-y-3">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full border',
                'shrink-0',
                variant === 'destructive'
                  ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/60'
                  : 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/60',
              )}
            >
              {icon ?? (
                <AlertTriangle
                  className={cn(
                    'size-5',
                    variant === 'destructive'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-blue-600 dark:text-blue-400',
                  )}
                />
              )}
            </div>
            <div className="space-y-1.5 text-left">
              <DialogTitle className="text-base md:text-lg font-semibold leading-snug">
                {title}
              </DialogTitle>
              {description && (
                <DialogDescription className="text-sm text-slate-600 dark:text-slate-300">
                  {description}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className={cn(
              'sm:min-w-[96px]',
              'border-slate-200 dark:border-slate-700',
              'hover:bg-slate-100 dark:hover:bg-slate-800',
              cancelButtonClassName,
            )}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(
              'sm:min-w-[110px]',
              variant === 'destructive'
                ? 'bg-red-600 hover:bg-red-700 text-white dark:bg-red-600 dark:hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700',
              'font-semibold',
              confirmButtonClassName,
            )}
          >
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

