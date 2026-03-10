'use client';

import { Button } from '@/components/ui/button';
import { DatePickerRange } from '@/components/ui/date-range-picker';
import { FloatingLabelSelect } from '@/components/ui/floating-label-select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SelectItem } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { NotificationFilterState } from '@/types';
import {
  Bell,
  Calendar,
  CheckCircle2,
  CircleOff,
  Info,
  Search,
  TriangleAlert,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

interface NotificationsFilterProps {
  filters: NotificationFilterState;
  onFilterChange: (filters: NotificationFilterState) => void;
  className?: string;
}

export function NotificationsFilter({
  filters,
  onFilterChange,
  className,
}: NotificationsFilterProps) {
  const t = useTranslations('notifications-page');

  const handleReset = () => {
    onFilterChange({
      searchQuery: '',
      type: 'all',
      status: 'all',
      startDate: undefined,
      endDate: undefined,
    });
  };

  const hasActiveFilters =
    !!filters.searchQuery ||
    filters.type !== 'all' ||
    filters.status !== 'all' ||
    !!filters.startDate ||
    !!filters.endDate;

  const TYPE_ICON: Record<string, React.ReactNode> = {
    info:    <Info className="size-3.5 text-blue-500" />,
    success: <CheckCircle2 className="size-3.5 text-green-500" />,
    warning: <TriangleAlert className="size-3.5 text-yellow-500" />,
    error:   <CircleOff className="size-3.5 text-red-500" />,
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
        <Input
          placeholder={t('searchPlaceholder')}
          value={filters.searchQuery}
          onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
          className="h-12 pl-12 pr-4 text-base bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md focus-visible:shadow-md focus-visible:ring-2 focus-visible:ring-blue-500/20 transition-all"
        />
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Type filter */}
        <FloatingLabelSelect
          label={t('filterByType')}
          value={filters.type}
          onValueChange={(v) => onFilterChange({ ...filters, type: v as NotificationFilterState['type'] })}
          className="w-auto min-w-[160px]"
          triggerClassName="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
        >
          <SelectItem value="all">{t('filter_all_types')}</SelectItem>
          <SelectItem value="info">
            <div className="flex items-center gap-2">
              <Info className="size-4 text-blue-500" />
              {t('filter_type_info')}
            </div>
          </SelectItem>
          <SelectItem value="success">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-green-500" />
              {t('filter_type_success')}
            </div>
          </SelectItem>
          <SelectItem value="warning">
            <div className="flex items-center gap-2">
              <TriangleAlert className="size-4 text-yellow-500" />
              {t('filter_type_warning')}
            </div>
          </SelectItem>
          <SelectItem value="error">
            <div className="flex items-center gap-2">
              <CircleOff className="size-4 text-red-500" />
              {t('filter_type_error')}
            </div>
          </SelectItem>
        </FloatingLabelSelect>

        {/* Status filter */}
        <FloatingLabelSelect
          label={t('filterByStatus')}
          value={filters.status}
          onValueChange={(v) => onFilterChange({ ...filters, status: v as NotificationFilterState['status'] })}
          className="w-auto min-w-[150px]"
          triggerClassName="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
        >
          <SelectItem value="all">{t('filter_all_status')}</SelectItem>
          <SelectItem value="unread">
            <div className="flex items-center gap-2">
              <Bell className="size-4 text-blue-500" />
              {t('filter_status_unread')}
            </div>
          </SelectItem>
          <SelectItem value="read">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-slate-400" />
              {t('filter_status_read')}
            </div>
          </SelectItem>
        </FloatingLabelSelect>

        {/* Date Range */}
        <DatePickerRange
          label={t('filterByDate')}
          placeholder={t('filterByDatePlaceholder')}
          startDate={filters.startDate}
          endDate={filters.endDate}
          onChangeValue={(v) =>
            onFilterChange({ ...filters, startDate: v.startDate, endDate: v.endDate })
          }
        />

        {/* Clear */}
        {hasActiveFilters && (
          <>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-9 rounded-full text-slate-600 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-950/50 transition-all text-sm"
            >
              <X className="size-4 mr-1.5" />
              {t('clearFilters')}
            </Button>
          </>
        )}
      </div>

      {/* Active filter pills */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {t('activeFilters')}
          </span>

          {filters.searchQuery && (
            <Badge
              variant="outline"
              className="text-xs gap-1.5 px-2.5 py-1 bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-300 cursor-pointer"
              onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
            >
              <Search className="size-3" />
              {filters.searchQuery}
              <X className="size-3 ml-0.5" />
            </Badge>
          )}

          {filters.type !== 'all' && (
            <Badge
              variant="outline"
              className={cn(
                'text-xs gap-1.5 px-2.5 py-1 cursor-pointer',
                filters.type === 'info'    && 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-300',
                filters.type === 'success' && 'bg-green-50 border-green-200 text-green-700 dark:bg-green-950/30 dark:border-green-800 dark:text-green-300',
                filters.type === 'warning' && 'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-950/30 dark:border-yellow-800 dark:text-yellow-300',
                filters.type === 'error'   && 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/30 dark:border-red-800 dark:text-red-300',
              )}
              onClick={() => onFilterChange({ ...filters, type: 'all' })}
            >
              {TYPE_ICON[filters.type]}
              {t(`filter_type_${filters.type}` as Parameters<typeof t>[0])}
              <X className="size-3 ml-0.5" />
            </Badge>
          )}

          {filters.status !== 'all' && (
            <Badge
              variant="outline"
              className={cn(
                'text-xs gap-1.5 px-2.5 py-1 cursor-pointer',
                filters.status === 'unread'
                  ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-300'
                  : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-900/30 dark:border-slate-700 dark:text-slate-400',
              )}
              onClick={() => onFilterChange({ ...filters, status: 'all' })}
            >
              {filters.status === 'unread' ? <Bell className="size-3" /> : <CheckCircle2 className="size-3" />}
              {t(`filter_status_${filters.status}` as Parameters<typeof t>[0])}
              <X className="size-3 ml-0.5" />
            </Badge>
          )}

          {(filters.startDate || filters.endDate) && (
            <Badge
              variant="outline"
              className="text-xs gap-1.5 px-2.5 py-1 bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-950/30 dark:border-purple-800 dark:text-purple-300 cursor-pointer"
              onClick={() => onFilterChange({ ...filters, startDate: undefined, endDate: undefined })}
            >
              <Calendar className="size-3" />
              {filters.startDate && filters.endDate
                ? t('dateFilter_range', { start: filters.startDate, end: filters.endDate })
                : filters.startDate
                ? t('dateFilter_from', { date: filters.startDate })
                : t('dateFilter_to', { date: filters.endDate ?? '' })}
              <X className="size-3 ml-0.5" />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

