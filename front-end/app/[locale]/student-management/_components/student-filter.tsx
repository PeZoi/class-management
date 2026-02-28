import { NO_CLASS_FILTER_VALUE } from '@/app/[locale]/student-management/student-management-page';
import { Button } from '@/components/ui/button';
import { FloatingLabelSelect } from '@/components/ui/floating-label-select';
import { Input } from '@/components/ui/input';
import { SelectItem } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { FilterState } from '@/types/student-type';
import {
  Ban,
  CheckCircle,
  Clock,
  GraduationCap,
  Search,
  SortAsc,
  Timer,
  User,
  UserCheck,
  X,
  XCircle
} from 'lucide-react';
import { useTranslations } from 'next-intl';

interface StudentFilterProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  availableClasses: Array<{ value: string; label: string }>;
  className?: string;
}

export function StudentFilter({
  filters,
  onFilterChange,
  availableClasses,
  className,
}: StudentFilterProps) {
  const t = useTranslations('student-management');

  const handleSearchChange = (value: string) => {
    onFilterChange({ ...filters, searchQuery: value });
  };

  const handlePaymentStatusChange = (value: string) => {
    onFilterChange({ ...filters, paymentStatus: value as FilterState['paymentStatus'] });
  };

  const handleStudentStatusChange = (value: string) => {
    onFilterChange({ ...filters, studentStatus: value as FilterState['studentStatus'] });
  };

  const handleClassChange = (value: string) => {
    onFilterChange({ ...filters, className: value });
  };

  const handleGenderChange = (value: string) => {
    onFilterChange({ ...filters, gender: value as FilterState['gender'] });
  };

  const handleSortByChange = (value: string) => {
    onFilterChange({ ...filters, sortBy: value as FilterState['sortBy'] });
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
      paymentStatus: 'all',
      studentStatus: 'ACTIVE',
      className: 'all',
      gender: 'all',
      sortBy: 'name',
      sortOrder: 'asc',
    });
  };

  // Config for active filter pills (matching select colors/icons)
  const paymentFilterConfig: Record<
    Exclude<FilterState['paymentStatus'], 'all'>,
    { icon: React.ElementType; className: string; label: string }
  > = {
    paid: {
      icon: CheckCircle,
      className: 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400',
      label: t('payment_paid'),
    },
    partial: {
      icon: Clock,
      className: 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400',
      label: t('payment_partial'),
    },
    unpaid: {
      icon: XCircle,
      className: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400',
      label: t('payment_unpaid'),
    },
  };

  const studentStatusFilterConfig: Record<
    Exclude<FilterState['studentStatus'], 'all'>,
    { icon: React.ElementType; className: string; label: string }
  > = {
    ACTIVE: {
      icon: UserCheck,
      className: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
      label: t('status_ACTIVE'),
    },
    INACTIVE: {
      icon: Timer,
      className: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400',
      label: t('status_INACTIVE'),
    },
    GRADUATED: {
      icon: GraduationCap,
      className: 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400',
      label: t('status_GRADUATED'),
    },
    DELETED: {
      icon: Ban,
      className: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400',
      label: t('status_DELETED'),
    },
  };

  const genderFilterConfig: Record<
    Exclude<FilterState['gender'], 'all'>,
    { className: string; label: string }
  > = {
    male: {
      className: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
      label: t('gender_male'),
    },
    female: {
      className: 'bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300',
      label: t('gender_female'),
    },
    other: {
      className: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300',
      label: t('gender_other'),
    },
  };

  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.paymentStatus !== 'all' ||
    (filters.studentStatus && filters.studentStatus !== 'ACTIVE') ||
    filters.className !== 'all' ||
    filters.gender !== 'all';

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
        {/* Payment Status Filter */}
        <FloatingLabelSelect
          label={t('filterByPayment')}
          value={filters.paymentStatus}
          onValueChange={handlePaymentStatusChange}
          className="w-auto min-w-[160px]"
          triggerClassName="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
        >
          <SelectItem value="all">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 dark:text-slate-200">
              {t('filter_all_payment')}
            </span>
          </SelectItem>
          <SelectItem value="paid">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 dark:text-green-400">
              <CheckCircle className="size-3" />
              {t('payment_paid')}
            </span>
          </SelectItem>
          <SelectItem value="partial">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-700 dark:text-orange-400">
              <Clock className="size-3" />
              {t('payment_partial')}
            </span>
          </SelectItem>
          <SelectItem value="unpaid">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 dark:text-red-400">
              <XCircle className="size-3" />
              {t('payment_unpaid')}
            </span>
          </SelectItem>
        </FloatingLabelSelect>

        {/* Student Status Filter */}
        <FloatingLabelSelect
          label={t('filterByStatus')}
          value={filters.studentStatus || 'all'}
          onValueChange={handleStudentStatusChange}
          className="w-auto min-w-[160px]"
          triggerClassName="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
        >
          <SelectItem value="all">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 dark:text-slate-200">
              {t('filter_all_status')}
            </span>
          </SelectItem>
          <SelectItem value="ACTIVE">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 dark:text-blue-400">
              <UserCheck className="size-3" />
              {t('status_ACTIVE')}
            </span>
          </SelectItem>
          <SelectItem value="INACTIVE">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-700 dark:text-yellow-400">
              <Timer className="size-3" />
              {t('status_INACTIVE')}
            </span>
          </SelectItem>
          <SelectItem value="GRADUATED">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 dark:text-green-400">
              <GraduationCap className="size-3" />
              {t('status_GRADUATED')}
            </span>
          </SelectItem>
          <SelectItem value="DELETED">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 dark:text-red-400">
              <Ban className="size-3" />
              {t('status_DELETED')}
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
            <SelectItem key={cls.value} value={cls.value}>
              {cls.label}
            </SelectItem>
          ))}
        </FloatingLabelSelect>

        {/* Gender Filter */}
        <FloatingLabelSelect
          label={t('filterByGender')}
          value={filters.gender}
          onValueChange={handleGenderChange}
          className="w-auto min-w-[140px]"
          triggerClassName="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
        >
          <SelectItem value="all">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 dark:text-slate-200">
              {t('filter_all_genders')}
            </span>
          </SelectItem>
          <SelectItem value="male">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 dark:text-blue-400">
              <User className="size-3" />
              {t('gender_male')}
            </span>
          </SelectItem>
          <SelectItem value="female">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-pink-700 dark:text-pink-400">
              <User className="size-3" />
              {t('gender_female')}
            </span>
          </SelectItem>
          <SelectItem value="other">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-700 dark:text-purple-400">
              <User className="size-3" />
              {t('gender_other')}
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
          className="w-auto min-w-[120px]"
          triggerClassName="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
        >
          <SelectItem value="name">{t('sort_by_name')}</SelectItem>
          <SelectItem value="joinedDate">{t('sort_by_date')}</SelectItem>
          <SelectItem value="unpaidPackages">{t('sort_by_unpaid_packages')}</SelectItem>
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

          {/* Search pill */}
          {filters.searchQuery && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 text-xs font-medium">
              <Search className="size-3" />
              <span>{filters.searchQuery}</span>
            </div>
          )}

          {/* Payment status pill (match select colors/icons) */}
          {filters.paymentStatus !== 'all' && (() => {
            const cfg = paymentFilterConfig[filters.paymentStatus as Exclude<FilterState['paymentStatus'], 'all'>];
            if (!cfg) return null;
            const Icon = cfg.icon;
            return (
              <div className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', cfg.className)}>
                <Icon className="size-3" />
                <span>{cfg.label}</span>
              </div>
            );
          })()}

          {/* Student status pill (match select colors/icons) */}
          {filters.studentStatus && filters.studentStatus !== 'ACTIVE' && (() => {
            const cfg = studentStatusFilterConfig[filters.studentStatus as Exclude<FilterState['studentStatus'], 'all'>];
            if (!cfg) return null;
            const Icon = cfg.icon;
            return (
              <div className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', cfg.className)}>
                <Icon className="size-3" />
                <span>{cfg.label}</span>
              </div>
            );
          })()}

          {/* Class pill (keep neutral purple) */}
          {filters.className !== 'all' && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 text-xs font-medium">
              {filters.className === NO_CLASS_FILTER_VALUE ? "Chưa có lớp" : filters.className}
            </div>
          )}

          {/* Gender pill (match select colors) */}
          {filters.gender !== 'all' && (() => {
            const cfg = genderFilterConfig[filters.gender as Exclude<FilterState['gender'], 'all'>];
            if (!cfg) return null;
            return (
              <div className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', cfg.className)}>
                <User className="size-3" />
                <span>{cfg.label}</span>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

