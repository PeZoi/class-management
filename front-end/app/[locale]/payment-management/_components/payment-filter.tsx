'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SelectItem } from '@/components/ui/select';
import { FloatingLabelSelect } from '@/components/ui/floating-label-select';
import { cn } from '@/lib/utils';
import {
  CheckCircle,
  CreditCard,
  Search,
  SortAsc,
  X,
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  Banknote,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { PaymentFilterState } from '@/types/payment-type';

interface PaymentFilterProps {
  filters: PaymentFilterState;
  onFilterChange: (filters: PaymentFilterState) => void;
  availableClasses: string[];
  className?: string;
}

export function PaymentFilter({ 
  filters, 
  onFilterChange, 
  availableClasses,
  className 
}: PaymentFilterProps) {
  const t = useTranslations('payment-management');

  const handleSearchChange = (value: string) => {
    onFilterChange({ ...filters, searchQuery: value });
  };

  const handleChange = (field: keyof PaymentFilterState, value: string) => {
    onFilterChange({ ...filters, [field]: value });
  };

  const handleClassChange = (value: string) => {
    onFilterChange({ ...filters, className: value });
  };

  const handlePaymentMethodChange = (value: string) => {
    onFilterChange({ ...filters, paymentMethod: value as PaymentFilterState['paymentMethod'] });
  };

  const handleSortByChange = (value: string) => {
    onFilterChange({ ...filters, sortBy: value as PaymentFilterState['sortBy'] });
  };

  const handleSortOrderToggle = () => {
    onFilterChange({
      ...filters,
      sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
    });
  };

  const handleResetFilters = () => {
    onFilterChange({
      searchQuery: '',
      type: 'all',
      status: 'all',
      className: 'all',
      paymentMethod: 'all',
      sortBy: 'createdDate',
      sortOrder: 'desc',
    });
  };

  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.type !== 'all' ||
    filters.status !== 'all' ||
    filters.className !== 'all' ||
    filters.paymentMethod !== 'all';

  // Config objects for active filter pills and matching select styles
  const typeFilterConfig = {
    income: {
      icon: ArrowDownRight,
      className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
      label: t('type_income'),
    },
    expense: {
      icon: ArrowUpRight,
      className: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
      label: t('type_expense'),
    },
  } as const;

  const statusFilterConfig = {
    paid: {
      icon: CheckCircle,
      className: 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300',
      label: t('filter_status_paid'),
    },
    partial: {
      icon: ArrowDownRight,
      className: 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300',
      label: t('filter_status_partial'),
    },
  } as const;

  const methodFilterConfig = {
    cash: {
      icon: Banknote,
      className: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
      label: t('method_cash'),
    },
    bank_transfer: {
      icon: ArrowDownRight,
      className: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
      label: t('method_bank_transfer'),
    },
    credit_card: {
      icon: CreditCard,
      className: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300',
      label: t('method_credit_card'),
    },
    e_wallet: {
      icon: Wallet,
      className: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300',
      label: t('method_e_wallet'),
    },
  } as const;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search Bar - Standalone */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
        <Input
          placeholder={t('searchPlaceholder')}
          value={filters.searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="h-12 pl-12 pr-4 text-base bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md focus-visible:shadow-md focus-visible:ring-2 focus-visible:ring-blue-500/20 transition-all"
        />
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Type Filter */}
        <FloatingLabelSelect
          label={t('filterByType')}
          value={filters.type}
          onValueChange={(value) => handleChange('type', value)}
          className="w-auto min-w-[160px]"
          triggerClassName="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
        >
          <SelectItem value="all">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 dark:text-slate-200">
              {t('filter_all_types')}
            </span>
          </SelectItem>
          <SelectItem value="income">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
              <ArrowDownRight className="size-3" />
              {t('type_income')}
            </span>
          </SelectItem>
          <SelectItem value="expense">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-700 dark:text-rose-300">
              <ArrowUpRight className="size-3" />
              {t('type_expense')}
            </span>
          </SelectItem>
        </FloatingLabelSelect>

        {/* Status Filter */}
        <FloatingLabelSelect
          label={t('filterByStatus')}
          value={filters.status}
          onValueChange={(value) => handleChange('status', value)}
          className="w-auto min-w-[160px]"
          triggerClassName="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
        >
          <SelectItem value="all">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 dark:text-slate-200">
              {t('filter_all_status_payment')}
            </span>
          </SelectItem>
          <SelectItem value="paid">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 dark:text-green-400">
              <CheckCircle className="size-3" />
              {t('filter_status_paid')}
            </span>
          </SelectItem>
          <SelectItem value="partial">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-700 dark:text-orange-400">
              <ArrowDownRight className="size-3" />
              {t('filter_status_partial')}
            </span>
          </SelectItem>
        </FloatingLabelSelect>

        {/* Class Filter */}
        <FloatingLabelSelect
          label={t('filterByClass')}
          value={filters.className}
          onValueChange={handleClassChange}
          className="w-auto min-w-[140px]"
          triggerClassName="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
        >
          <SelectItem value="all">{t('filter_all_classes')}</SelectItem>
          {availableClasses.map((cls) => (
            <SelectItem key={cls} value={cls}>
              {cls}
            </SelectItem>
          ))}
        </FloatingLabelSelect>

        {/* Payment Method Filter */}
        <FloatingLabelSelect
          label={t('filterByMethod')}
          value={filters.paymentMethod}
          onValueChange={handlePaymentMethodChange}
          className="w-auto min-w-[160px]"
          triggerClassName="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
        >
          <SelectItem value="all">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 dark:text-slate-200">
              {t('filter_all_methods')}
            </span>
          </SelectItem>
          <SelectItem value="cash">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-300">
              <Banknote className="size-3" />
              {t('method_cash')}
            </span>
          </SelectItem>
          <SelectItem value="bank_transfer">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 dark:text-blue-300">
              <ArrowDownRight className="size-3" />
              {t('method_bank_transfer')}
            </span>
          </SelectItem>
          <SelectItem value="credit_card">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-700 dark:text-purple-300">
              <CreditCard className="size-3" />
              {t('method_credit_card')}
            </span>
          </SelectItem>
          <SelectItem value="e_wallet">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-700 dark:text-indigo-300">
              <Wallet className="size-3" />
              {t('method_e_wallet')}
            </span>
          </SelectItem>
        </FloatingLabelSelect>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

        {/* Sort By */}
        <FloatingLabelSelect
          label={t('sortBy')}
          value={filters.sortBy}
          onValueChange={handleSortByChange}
          className="w-auto min-w-[140px]"
          triggerClassName="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
        >
          <SelectItem value="createdDate">{t('sort_by_created_date')}</SelectItem>
          <SelectItem value="amount">{t('sort_by_amount')}</SelectItem>
          <SelectItem value="studentName">{t('sort_by_student')}</SelectItem>
        </FloatingLabelSelect>

        {/* Sort Order Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleSortOrderToggle}
          title={filters.sortOrder === 'asc' ? t('sort_ascending') : t('sort_descending')}
          className="h-9 w-9 rounded-full border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
        >
          <SortAsc
            className={cn(
              'size-4 transition-transform duration-300',
              filters.sortOrder === 'desc' && 'rotate-180'
            )}
          />
        </Button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="h-9 rounded-full text-slate-600 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-950/50 transition-all text-sm"
            >
              <X className="size-4 mr-1.5" />
              {t('clearFilters')}
            </Button>
          </>
        )}
      </div>

      {/* Active Filters Pills */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {t('activeFilters')}
          </span>
          {filters.searchQuery && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 text-xs font-medium">
              <Search className="size-3" />
              <span>{filters.searchQuery}</span>
            </div>
          )}
          {filters.type !== 'all' && (
            (() => {
              const cfg = typeFilterConfig[filters.type as 'income' | 'expense'];
              if (!cfg) return null;
              const Icon = cfg.icon;
              return (
                <div
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                    cfg.className,
                  )}
                >
                  <Icon className="size-3" />
                  <span>{cfg.label}</span>
                </div>
              );
            })()
          )}
          {filters.status !== 'all' && (
            (() => {
              const cfg = statusFilterConfig[filters.status as 'paid' | 'partial'];
              if (!cfg) return null;
              const Icon = cfg.icon;
              return (
                <div
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                    cfg.className,
                  )}
                >
                  <Icon className="size-3" />
                  <span>{cfg.label}</span>
                </div>
              );
            })()
          )}
          {filters.className !== 'all' && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 text-xs font-medium">
              {filters.className}
            </div>
          )}
          {filters.paymentMethod !== 'all' && (
            (() => {
              const cfg =
                methodFilterConfig[
                  filters.paymentMethod as 'cash' | 'bank_transfer' | 'credit_card' | 'e_wallet'
                ];
              if (!cfg) return null;
              const Icon = cfg.icon;
              return (
                <div
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                    cfg.className,
                  )}
                >
                  <Icon className="size-3" />
                  <span>{cfg.label}</span>
                </div>
              );
            })()
          )}
        </div>
      )}
    </div>
  );
}
