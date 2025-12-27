import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Search, X, SortAsc } from 'lucide-react';
import { useTranslations } from 'next-intl';

export interface FilterState {
  searchQuery: string;
  paymentStatus: 'all' | 'paid' | 'unpaid' | 'partial';
  className: string;
  gender: 'all' | 'male' | 'female' | 'other';
  sortBy: 'name' | 'joinedDate' | 'tuitionFee';
  sortOrder: 'asc' | 'desc';
}

interface StudentFilterProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  availableClasses: string[];
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
      className: 'all',
      gender: 'all',
      sortBy: 'name',
      sortOrder: 'asc',
    });
  };

  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.paymentStatus !== 'all' ||
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
        <Select value={filters.paymentStatus} onValueChange={handlePaymentStatusChange}>
          <SelectTrigger className="h-9 w-auto min-w-[140px] rounded-full border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm">
            <SelectValue placeholder={t('filterByPayment')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filter_all_payment')}</SelectItem>
            <SelectItem value="paid">{t('payment_paid')}</SelectItem>
            <SelectItem value="partial">{t('payment_partial')}</SelectItem>
            <SelectItem value="unpaid">{t('payment_unpaid')}</SelectItem>
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

        {/* Gender Filter */}
        <Select value={filters.gender} onValueChange={handleGenderChange}>
          <SelectTrigger className="h-9 w-auto min-w-[140px] rounded-full border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm">
            <SelectValue placeholder={t('filterByGender')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filter_all_genders')}</SelectItem>
            <SelectItem value="male">{t('gender_male')}</SelectItem>
            <SelectItem value="female">{t('gender_female')}</SelectItem>
            <SelectItem value="other">{t('gender_other')}</SelectItem>
          </SelectContent>
        </Select>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

        {/* Sort By */}
        <Select value={filters.sortBy} onValueChange={handleSortByChange}>
          <SelectTrigger className="h-9 w-auto min-w-[120px] rounded-full border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm">
            <SelectValue placeholder={t('sortBy')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">{t('sort_by_name')}</SelectItem>
            <SelectItem value="joinedDate">{t('sort_by_date')}</SelectItem>
            <SelectItem value="tuitionFee">{t('sort_by_fee')}</SelectItem>
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
          {filters.paymentStatus !== 'all' && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-300 text-xs font-medium">
              {t(`payment_${filters.paymentStatus}`)}
            </div>
          )}
          {filters.className !== 'all' && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 text-xs font-medium">
              {filters.className}
            </div>
          )}
          {filters.gender !== 'all' && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 text-xs font-medium">
              {t(`gender_${filters.gender}`)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

