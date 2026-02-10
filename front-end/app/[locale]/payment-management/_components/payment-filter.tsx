'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CheckCircle, CreditCard, Search, SortAsc, X } from 'lucide-react';
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
        <Select value={filters.type} onValueChange={(value) => handleChange('type', value)}>
          <SelectTrigger className="h-9 w-auto min-w-[160px] rounded-full border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm">
            <SelectValue placeholder={t('filterByType')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filter_all_types')}</SelectItem>
            <SelectItem value="income">{t('type_income')}</SelectItem>
            <SelectItem value="expense">{t('type_expense')}</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={filters.status} onValueChange={(value) => handleChange('status', value)}>
          <SelectTrigger className="h-9 w-auto min-w-[160px] rounded-full border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm">
            <SelectValue placeholder={t('filterByStatus')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filter_all_status_payment')}</SelectItem>
            <SelectItem value="paid">{t('filter_status_paid')}</SelectItem>
            <SelectItem value="partial">{t('filter_status_partial')}</SelectItem>
          </SelectContent>
        </Select>

        {/* Class Filter */}
        <Select value={filters.className} onValueChange={handleClassChange}>
          <SelectTrigger className="h-9 w-auto min-w-[140px] rounded-full border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm">
            <SelectValue placeholder={t('filterByClass')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filter_all_classes')}</SelectItem>
            {availableClasses.map((cls) => (
              <SelectItem key={cls} value={cls}>
                {cls}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Payment Method Filter */}
        <Select value={filters.paymentMethod} onValueChange={handlePaymentMethodChange}>
          <SelectTrigger className="h-9 w-auto min-w-[160px] rounded-full border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm">
            <SelectValue placeholder={t('filterByMethod')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filter_all_methods')}</SelectItem>
            <SelectItem value="cash">{t('method_cash')}</SelectItem>
            <SelectItem value="bank_transfer">{t('method_bank_transfer')}</SelectItem>
            <SelectItem value="credit_card">{t('method_credit_card')}</SelectItem>
            <SelectItem value="e_wallet">{t('method_e_wallet')}</SelectItem>
          </SelectContent>
        </Select>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

        {/* Sort By */}
        <Select value={filters.sortBy} onValueChange={handleSortByChange}>
          <SelectTrigger className="h-9 w-auto min-w-[140px] rounded-full border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm">
            <SelectValue placeholder={t('sortBy')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdDate">{t('sort_by_created_date')}</SelectItem>
            <SelectItem value="amount">{t('sort_by_amount')}</SelectItem>
            <SelectItem value="studentName">{t('sort_by_student')}</SelectItem>
          </SelectContent>
        </Select>

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
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 text-xs font-medium">
              {t(`type_${filters.type}`)}
            </div>
          )}
          {filters.status !== 'all' && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs font-medium">
              <CheckCircle className="size-3" />
              {filters.status === 'paid' ? t('filter_status_paid') : t('filter_status_partial')}
            </div>
          )}
          {filters.className !== 'all' && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 text-xs font-medium">
              {filters.className}
            </div>
          )}
          {filters.paymentMethod !== 'all' && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 text-xs font-medium">
              <CreditCard className="size-3" />
              {t(`method_${filters.paymentMethod}`)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
