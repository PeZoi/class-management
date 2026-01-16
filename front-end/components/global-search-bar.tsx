'use client';

import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';
import { studentService, teacherService } from '@/services';
import { StudentType, TeacherType } from '@/types';
import { GraduationCap, Loader2, Search, User, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface SearchResult {
  id: string;
  name: string;
  email: string;
  type: 'student' | 'teacher';
  avatar?: string;
}

export function GlobalSearchBar() {
  const t = useTranslations('common');
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
        const query = debouncedSearchQuery.toLowerCase().trim();
        const [studentsResponse, teachersResponse] = await Promise.all([
          studentService.getStudents(),
          teacherService.getAllTeachers(),
        ]);

        const allResults: SearchResult[] = [];

        // Filter students
        if (studentsResponse.status === 200 && studentsResponse.data) {
          const filteredStudents = studentsResponse.data.filter(
            (student: StudentType) =>
              student.fullName.toLowerCase().includes(query) ||
              student.email.toLowerCase().includes(query) ||
              student.phoneNumber.includes(query),
          );

          filteredStudents.forEach((student: StudentType) => {
            allResults.push({
              id: student.id,
              name: student.fullName,
              email: student.email,
              type: 'student',
            });
          });
        }

        // Filter teachers
        if (teachersResponse.status === 200 && teachersResponse.data) {
          const filteredTeachers = teachersResponse.data.filter(
            (teacher: TeacherType) =>
              teacher.fullName.toLowerCase().includes(query) ||
              teacher.email.toLowerCase().includes(query) ||
              teacher.phoneNumber.includes(query),
          );

          filteredTeachers.forEach((teacher: TeacherType) => {
            allResults.push({
              id: teacher.id,
              name: teacher.fullName,
              email: teacher.email,
              type: 'teacher',
              avatar: teacher.avatar,
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
                    <div className="text-xs text-muted-foreground shrink-0 px-2 py-0.5 rounded bg-muted">
                      {result.type === 'student' ? t('student') || 'Học sinh' : t('teacher') || 'Giáo viên'}
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

