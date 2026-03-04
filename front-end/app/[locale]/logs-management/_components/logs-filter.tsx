'use client';

import { Button } from '@/components/ui/button';
import { DatePickerRange } from '@/components/ui/date-range-picker';
import { FloatingLabelSelect } from '@/components/ui/floating-label-select';
import { Input } from '@/components/ui/input';
import { SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AuditLogFilterState } from '@/types';
import {
  Calendar,
  CheckCircle2,
  CircleOff,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

interface LogsFilterProps {
  filters: AuditLogFilterState;
  onFilterChange: (filters: AuditLogFilterState) => void;
  className?: string;
}

export function LogsFilter({
  filters,
  onFilterChange,
  className,
}: LogsFilterProps) {
  const t = useTranslations('logs-management');

  const handleSearchChange = (value: string) => {
    onFilterChange({ ...filters, searchQuery: value });
  };

  const handleMethodChange = (value: string) => {
    onFilterChange({
      ...filters,
      method: value as AuditLogFilterState['method'],
    });
  };

  const handleStatusChange = (value: string) => {
    onFilterChange({
      ...filters,
      status: value as AuditLogFilterState['status'],
    });
  };

  const handleDateRangeChange = (value: { startDate: string; endDate: string }) => {
    onFilterChange({
      ...filters,
      startDate: value.startDate,
      endDate: value.endDate,
    });
  };

  const handleResetFilters = () => {
    onFilterChange({
      searchQuery: '',
      username: '',
      method: 'all',
      status: 'all',
      startDate: undefined,
      endDate: undefined,
    });
  };

  const hasActiveFilters =
    filters.searchQuery ||
    filters.method !== 'all' ||
    filters.status !== 'all' ||
    filters.startDate ||
    filters.endDate;

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
        {/* Method Filter */}
        <FloatingLabelSelect
          label={t('filterByMethod')}
          value={filters.method}
          onValueChange={handleMethodChange}
          className="w-auto min-w-[140px]"
          triggerClassName="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
        >
          <SelectItem value="all">{t('filter_all_methods')}</SelectItem>
          <SelectItem value="GET">
            <span className="text-blue-600 dark:text-blue-400 font-semibold">GET</span>
          </SelectItem>
          <SelectItem value="POST">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">POST</span>
          </SelectItem>
          <SelectItem value="PUT">
            <span className="text-amber-600 dark:text-amber-400 font-semibold">PUT</span>
          </SelectItem>
          <SelectItem value="PATCH">
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">PATCH</span>
          </SelectItem>
          <SelectItem value="DELETE">
            <span className="text-rose-600 dark:text-rose-400 font-semibold">DELETE</span>
          </SelectItem>
        </FloatingLabelSelect>

        {/* Status Filter */}
        <FloatingLabelSelect
          label={t('filterByStatus')}
          value={filters.status}
          onValueChange={handleStatusChange}
          className="w-auto min-w-[160px]"
          triggerClassName="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
        >
          <SelectItem value="all">{t('filter_all_status')}</SelectItem>
          <SelectItem value="success">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-500" />
              <span>{t('filter_status_success')}</span>
            </div>
          </SelectItem>
          <SelectItem value="failed">
            <div className="flex items-center gap-2">
              <CircleOff className="size-4 text-rose-500" />
              <span>{t('filter_status_failed')}</span>
            </div>
          </SelectItem>
        </FloatingLabelSelect>

        {/* Date Range */}
        <DatePickerRange
          label={t('filterByDate')}
          placeholder={t('filterByDatePlaceholder')}
          startDate={filters.startDate}
          endDate={filters.endDate}
          onChangeValue={handleDateRangeChange}
        />

        {/* Clear Filters */}
        {hasActiveFilters && (
          <>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
            <Button
              type="button"
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
            <Badge
              variant="outline"
              className="text-xs gap-1.5 px-2.5 py-1 bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-300"
            >
              <Search className="size-3" />
              {filters.searchQuery}
            </Badge>
          )}
          {filters.method !== 'all' && (
            <Badge
              variant="outline"
              className={cn(
                'text-xs gap-1.5 px-2.5 py-1 font-semibold',
                filters.method === 'GET' &&
                  'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-300',
                filters.method === 'POST' &&
                  'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300',
                filters.method === 'PUT' &&
                  'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-300',
                filters.method === 'PATCH' &&
                  'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/30 dark:border-indigo-800 dark:text-indigo-300',
                filters.method === 'DELETE' &&
                  'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-300',
              )}
            >
              <ShieldCheck className="size-3" />
              {filters.method}
            </Badge>
          )}
          {filters.status !== 'all' && (
            <Badge
              variant="outline"
              className={cn(
                'text-xs gap-1.5 px-2.5 py-1 font-semibold',
                filters.status === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-300',
              )}
            >
              {filters.status === 'success' ? (
                <CheckCircle2 className="size-3" />
              ) : (
                <CircleOff className="size-3" />
              )}
              {filters.status === 'success' ? t('success') : t('failed')}
            </Badge>
          )}
          {(filters.startDate || filters.endDate) && (
            <Badge
              variant="outline"
              className="text-xs gap-1.5 px-2.5 py-1 bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-950/30 dark:border-purple-800 dark:text-purple-300"
            >
              <Calendar className="size-3" />
              {filters.startDate && filters.endDate
                ? t('dateFilter_range', {
                    start: filters.startDate,
                    end: filters.endDate,
                  })
                : filters.startDate
                ? t('dateFilter_from', { date: filters.startDate })
                : t('dateFilter_to', { date: filters.endDate ?? '' })}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

