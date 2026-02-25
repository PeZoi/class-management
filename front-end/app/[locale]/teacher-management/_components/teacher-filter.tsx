'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SelectItem } from '@/components/ui/select';
import { FloatingLabelSelect } from '@/components/ui/floating-label-select';
import { cn } from '@/lib/utils';
import { Search, SortAsc, X, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { TeacherFilterState } from '@/types/teacher-type';

interface TeacherFilterProps {
  filters: TeacherFilterState;
  onFilterChange: (filters: TeacherFilterState) => void;
  className?: string;
}

export function TeacherFilter({ filters, onFilterChange, className }: TeacherFilterProps) {
  const t = useTranslations('teacher-management');

  const handleSearchChange = (value: string) => {
    onFilterChange({ ...filters, searchQuery: value });
  };

  const handleGenderChange = (value: string) => {
    onFilterChange({ ...filters, gender: value as TeacherFilterState['gender'] });
  };

  const handleSortByChange = (value: string) => {
    onFilterChange({ ...filters, sortBy: value as TeacherFilterState['sortBy'] });
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
      gender: 'all',
      sortBy: 'name',
      sortOrder: 'asc',
    });
  };

  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.gender !== 'all' ||
    filters.sortBy !== 'name' ||
    filters.sortOrder !== 'asc';

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
        <Input
          placeholder={t('searchPlaceholder') || 'Tìm theo tên, email, SĐT...'}
          value={filters.searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="h-12 pl-12 pr-4 text-base bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md focus-visible:shadow-md focus-visible:ring-2 focus-visible:ring-blue-500/20 transition-all"
        />
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Gender Filter */}
        <FloatingLabelSelect
          label={t('gender')}
          value={filters.gender}
          onValueChange={handleGenderChange}
          className="w-auto min-w-[160px]"
          triggerClassName="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
        >
          <SelectItem value="all">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 dark:text-slate-200">
              {t('filter_all_genders') || 'Tất cả giới tính'}
            </span>
          </SelectItem>
          <SelectItem value="male">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 dark:text-blue-400">
              <User className="size-3" />
              {t('male')}
            </span>
          </SelectItem>
          <SelectItem value="female">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-pink-700 dark:text-pink-400">
              <User className="size-3" />
              {t('female')}
            </span>
          </SelectItem>
          <SelectItem value="other">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-700 dark:text-purple-400">
              <User className="size-3" />
              {t('other')}
            </span>
          </SelectItem>
        </FloatingLabelSelect>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

        {/* Sort By */}
        <FloatingLabelSelect
          label={t('sortBy') || 'Sắp xếp theo'}
          value={filters.sortBy}
          onValueChange={handleSortByChange}
          className="w-auto min-w-[160px]"
          triggerClassName="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
        >
          <SelectItem value="name">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 dark:text-slate-200">
              {t('sort_by_name') || 'Tên'}
            </span>
          </SelectItem>
          <SelectItem value="joinedDate">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 dark:text-slate-200">
              {t('sort_by_date') || 'Ngày tham gia'}
            </span>
          </SelectItem>
          <SelectItem value="totalClasses">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 dark:text-slate-200">
              {t('totalClasses')}
            </span>
          </SelectItem>
        </FloatingLabelSelect>

        {/* Sort Order Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleSortOrderToggle}
          title={filters.sortOrder === 'asc' ? t('sort_ascending') || 'Tăng dần' : t('sort_descending') || 'Giảm dần'}
          className="h-9 w-9 rounded-full border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
        >
          <SortAsc
            className={cn(
              'size-4 transition-transform duration-300',
              filters.sortOrder === 'desc' && 'rotate-180',
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
              {t('clearFilters') || 'Xóa bộ lọc'}
            </Button>
          </>
        )}
      </div>

      {/* Active Filters Pills */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {t('activeFilters') || 'Bộ lọc đang áp dụng:'}
          </span>
          {filters.searchQuery && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 text-xs font-medium">
              <Search className="size-3" />
              <span>{filters.searchQuery}</span>
            </div>
          )}
          {filters.gender !== 'all' && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 text-xs font-medium">
              <User className="size-3" />
              <span>{t(filters.gender)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


