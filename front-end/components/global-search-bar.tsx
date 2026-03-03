'use client';

import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';
import { studentService, teacherService } from '@/services';
import { StudentType, TeacherType, StudentStatus } from '@/types';
import { GraduationCap, Loader2, Search, User, X, UserCheck, Timer, Ban, CheckCircle2, XCircle } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface SearchResult {
  id: string;
  name: string;
  email: string;
  type: 'student' | 'teacher';
  avatar?: string;
  status?: StudentStatus | 'ACTIVE' | 'DELETED' | 'BLOCKED';
}

export function GlobalSearchBar() {
  const t = useTranslations('common');
  const tStudent = useTranslations('student-management');
  const tTeacher = useTranslations('teacher-management');
  const locale = useLocale();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch search results
  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedSearchQuery.trim()) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      setIsOpen(true);

      try {
        const query = debouncedSearchQuery.trim();
        
        // Backend handles all search filtering, only fetch top results
        const [studentsResponse, teachersResponse] = await Promise.all([
          studentService.getStudents(0, 100, query, undefined), // Backend filters students
          teacherService.getAllTeachers(0, 100, query, undefined), // Backend filters teachers
        ]);

        const allResults: SearchResult[] = [];

        // Map students (already filtered by backend)
        if (studentsResponse.status === 200 && studentsResponse.data) {
          studentsResponse.data.content.forEach((student: StudentType) => {
            allResults.push({
              id: student.id,
              name: student.fullName,
              email: student.email,
              type: 'student',
              status: student.status,
            });
          });
        }

        // Map teachers (already filtered by backend)
        if (teachersResponse.status === 200 && teachersResponse.data) {
          teachersResponse.data.content.forEach((teacher: TeacherType) => {
            allResults.push({
              id: teacher.id,
              name: teacher.fullName,
              email: teacher.email,
              type: 'teacher',
              avatar: teacher.avatar,
              status: teacher.status,
            });
          });
        }

        // Limit to 8 results
        setResults(allResults.slice(0, 8));
      } catch (error) {
        console.error('Error searching:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedSearchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClear = () => {
    setSearchQuery('');
    setIsOpen(false);
    setResults([]);
    inputRef.current?.focus();
  };

  const handleResultClick = (result: SearchResult) => {
    setSearchQuery('');
    setIsOpen(false);
    setResults([]);
    const path =
      result.type === 'student'
        ? `/${locale}/student-management/${result.id}`
        : `/${locale}/teacher-management/${result.id}`;
    router.push(path);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Get student status badge
  const getStudentStatusBadge = (status?: StudentStatus) => {
    const statusConfig = {
      ACTIVE: {
        label: tStudent('status_ACTIVE') || 'Đang Học',
        className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        icon: UserCheck,
      },
      INACTIVE: {
        label: tStudent('status_INACTIVE') || 'Tạm Nghỉ',
        className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        icon: Timer,
      },
      GRADUATED: {
        label: tStudent('status_GRADUATED') || 'Đã Tốt Nghiệp',
        className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        icon: GraduationCap,
      },
      DELETED: {
        label: tStudent('status_DELETED') || 'Đã Xóa',
        className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        icon: Ban,
      },
    } as const;

    if (!status || !statusConfig[status]) {
      return null;
    }

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', config.className)}>
        <Icon className="size-3" />
        {config.label}
      </span>
    );
  };

  // Get teacher status badge
  const getTeacherStatusBadge = (status?: 'ACTIVE' | 'DELETED' | 'BLOCKED') => {
    const statusConfig = {
      ACTIVE: {
        label: tTeacher('statusActive') || 'Hoạt Động',
        className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        icon: CheckCircle2,
      },
      DELETED: {
        label: tTeacher('statusDeleted') || 'Đã Xóa',
        className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        icon: XCircle,
      },
      BLOCKED: {
        label: tTeacher('statusBlocked') || 'Đã Khóa',
        className: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
        icon: Ban,
      },
    } as const;

    if (!status || !statusConfig[status]) {
      return null;
    }

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', config.className)}>
        <Icon className="size-3" />
        {config.label}
      </span>
    );
  };

  return (
    <div ref={searchContainerRef} className="relative flex-1 max-w-lg mx-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={t('searchPlaceholder') || 'Tìm kiếm học sinh, giáo viên...'}
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0 || isLoading) {
              setIsOpen(true);
            }
          }}
          className="pl-9 pr-9 h-9 bg-background/50 border-border/50 focus:bg-background focus:border-border transition-colors"
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (results.length > 0 || isLoading || (debouncedSearchQuery && !isLoading)) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-hidden animate-in fade-in-0 zoom-in-95">
          <div className="p-2 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">
                  {t('searching') || 'Đang tìm kiếm...'}
                </span>
              </div>
            ) : results.length > 0 ? (
              <>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase">
                  {t('searchResults') || 'Kết quả tìm kiếm'}
                </div>
                {results.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-left group cursor-pointer"
                  >
                    <div
                      className={cn(
                        'flex items-center justify-center size-10 rounded-full shrink-0',
                        result.type === 'student'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
                      )}
                    >
                      {result.type === 'student' ? (
                        <GraduationCap className="size-5" />
                      ) : (
                        <User className="size-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                        {result.name}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{result.email}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-xs text-muted-foreground px-2 py-0.5 rounded bg-muted">
                        {result.type === 'student' ? t('student') || 'Học sinh' : t('teacher') || 'Giáo viên'}
                      </div>
                      {result.type === 'student' 
                        ? getStudentStatusBadge(result.status as StudentStatus)
                        : getTeacherStatusBadge(result.status as 'ACTIVE' | 'DELETED' | 'BLOCKED')
                      }
                    </div>
                  </button>
                ))}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Search className="size-8 text-muted-foreground mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">
                  {t('noResults') || 'Không tìm thấy kết quả'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

