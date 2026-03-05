'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { useAuditLogsPaginated } from '@/hooks/use-logs';
import { useDebounce } from '@/hooks/use-debounce';
import { AuditLogFilterState, AuditLogType, PageResponse } from '@/types';
import { DataTable, SortableHeader } from '@/components/ui/data-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { LogsFilter } from './_components/logs-filter';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ColumnDef } from '@tanstack/react-table';
import { cn } from '@/lib/utils';
import {
  Calendar,
  CheckCircle2,
  CircleOff,
  Clock,
  Copy,
  FileText,
  Network,
  ShieldCheck,
  User,
  Loader2,
  FileX,
} from 'lucide-react';

// Helper: parse URL params -> filter state
const parseFiltersFromURL = (searchParams: URLSearchParams): AuditLogFilterState => {
  return {
    searchQuery: searchParams.get('search') || '',
    username: '', // Deprecated: username is now part of searchQuery
    method: (searchParams.get('method') as AuditLogFilterState['method']) || 'all',
    status: (searchParams.get('status') as AuditLogFilterState['status']) || 'all',
    startDate: searchParams.get('from') || undefined,
    endDate: searchParams.get('to') || undefined,
  };
};

// Helper: filter state -> URL params
const filtersToURLParams = (filters: AuditLogFilterState): URLSearchParams => {
  const params = new URLSearchParams();

  if (filters.searchQuery) params.set('search', filters.searchQuery);
  if (filters.method !== 'all') params.set('method', filters.method);
  if (filters.status !== 'all') params.set('status', filters.status);
  if (filters.startDate) params.set('from', filters.startDate);
  if (filters.endDate) params.set('to', filters.endDate);

  return params;
};

// Helper: UI date (dd/MM/yyyy) -> ISO string for backend Instant
const toIsoDateTime = (dateStr?: string, isEndOfDay: boolean = false): string | undefined => {
  if (!dateStr) return undefined;

  const [day, month, year] = dateStr.split('/');
  if (!day || !month || !year) return undefined;

  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    isEndOfDay ? 23 : 0,
    isEndOfDay ? 59 : 0,
    isEndOfDay ? 59 : 0,
    isEndOfDay ? 999 : 0,
  );

  if (Number.isNaN(date.getTime())) return undefined;

  return date.toISOString();
};

// Helper: Format JSON với syntax highlighting dùng react-syntax-highlighter
const formatJsonWithColors = (
  jsonStr: string | null | undefined,
  isDarkMode: boolean = false,
): React.ReactNode => {
  if (!jsonStr) return <span className="text-slate-400 italic">No details</span>;

  try {
    const parsed = JSON.parse(jsonStr);
    const formatted = JSON.stringify(parsed, null, 2);
    
    // Chọn theme dựa trên dark mode
    const theme = isDarkMode ? vscDarkPlus : oneLight;
    
    return (
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <SyntaxHighlighter
          language="json"
          style={theme}
          customStyle={{
            margin: 0,
            padding: '1rem',
            fontSize: '0.875rem',
            lineHeight: '1.6',
            borderRadius: '0.5rem',
            background: isDarkMode ? '#1e1e1e' : '#fafafa',
          }}
          wrapLines={true}
          wrapLongLines={true}
        >
          {formatted}
        </SyntaxHighlighter>
      </div>
    );
  } catch {
    // Nếu không phải JSON hợp lệ, hiển thị raw text
    return (
      <pre className="text-sm font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap wrap-break-word bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
        <code className="block">{jsonStr}</code>
      </pre>
    );
  }
};

export default function LogsManagementPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('logs-management');
  const tApi = useTranslations('logs-api');
  const tCommon = useTranslations('common');

  const [filters, setFilters] = useState<AuditLogFilterState>(() =>
    parseFiltersFromURL(searchParams),
  );
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const isUpdatingFromURL = useRef(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  // Lưu trạng thái copy path theo id của log, không dùng theo path string
  // để tránh trường hợp nhiều row có cùng path thì tất cả cùng hiển thị "đã copy".
  const [copiedPathLogId, setCopiedPathLogId] = useState<number | null>(null);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    // Check initial state
    checkDarkMode();

    // Watch for changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  // Debounce search query
  const debouncedSearchQuery = useDebounce(filters.searchQuery, 500);

  // Build filters for backend
  const paginationFilters = useMemo(
    () => ({
      method: filters.method === 'all' ? undefined : filters.method,
      status: filters.status === 'all' ? undefined : filters.status,
      startDate: toIsoDateTime(filters.startDate, false),
      endDate: toIsoDateTime(filters.endDate, true),
    }),
    [filters.method, filters.status, filters.startDate, filters.endDate],
  );

  const logsQuery = useAuditLogsPaginated(
    debouncedSearchQuery,
    paginationFilters,
    pageIndex,
    pageSize,
  );

  const logsPage = logsQuery.data as PageResponse<AuditLogType> | undefined;
  const logsData = useMemo(() => logsPage?.content ?? [], [logsPage]);

  const handleFilterChange = (newFilters: AuditLogFilterState) => {
    setFilters(newFilters);
    setPageIndex(0);
    setPageSize(10);
  };

  // Sync filters -> URL
  useEffect(() => {
    if (isUpdatingFromURL.current) {
      isUpdatingFromURL.current = false;
      return;
    }

    const urlParams = filtersToURLParams(filters);
    const currentURLParams = searchParams.toString();

    if (currentURLParams !== urlParams.toString()) {
      const newURL = urlParams.toString() ? `${pathname}?${urlParams.toString()}` : pathname;
      router.replace(newURL, { scroll: false });
    }
  }, [filters, pathname, router, searchParams]);

  // Sync URL -> filters (back/forward)
  useEffect(() => {
    const urlFilters = parseFiltersFromURL(searchParams);
    const currentFiltersStr = JSON.stringify(filters);
    const urlFiltersStr = JSON.stringify(urlFilters);

    if (currentFiltersStr !== urlFiltersStr) {
      isUpdatingFromURL.current = true;
      setFilters(urlFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  const columns: ColumnDef<AuditLogType>[] = useMemo(
    () => [
      {
        accessorKey: 'apiDescriptionKey',
        header: ({ column }) => (
          <SortableHeader column={column}>
            <div className="flex items-center gap-2">
              <Clock className="size-4" />
              {t('apiDescription')}
            </div>
          </SortableHeader>
        ),
        cell: ({ row }) => {
          const key = row.original.apiDescriptionKey;
          const actionFallback = row.original.action || '';

          let display = actionFallback;

          // Chỉ cố gắng translate nếu key ở dạng "symbolic" (VIẾT HOA + GẠCH DƯỚI),
          // ví dụ: AUTH_LOGIN, STUDENT_CREATE,...
          // Các key fallback kiểu "POST /api/..." sẽ không gọi i18n để
          // tránh lỗi MISSING_MESSAGE và hiển thị luôn chuỗi mặc định.
          const isSymbolicKey = !!key && /^[A-Z0-9_]+$/.test(key);

          if (isSymbolicKey && key) {
            try {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              display = tApi(key as any);
            } catch {
              // Nếu thiếu key trong file i18n, fallback lần cuối về action hoặc chính key
              display = actionFallback || key;
            }
          } else if (!display && key) {
            // Trường hợp không có action nhưng có key, dùng luôn key
            display = key;
          }

          return (
            <div className="text-sm text-slate-800 dark:text-slate-200">
              {display || '-'}
            </div>
          );
        },
      },
      {
        accessorKey: 'username',
        header: ({ column }) => (
          <SortableHeader column={column}>
            <div className="flex items-center gap-2">
              <User className="size-4" />
              {t('username')}
            </div>
          </SortableHeader>
        ),
        cell: ({ row }) => (
          <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {row.original.username || '-'}
          </div>
        ),
      },
      {
        accessorKey: 'method',
        header: ({ column }) => (
          <SortableHeader column={column} className="justify-center">
            <div className="flex items-center gap-2 justify-center">
              <ShieldCheck className="size-4" />
              {t('method')}
            </div>
          </SortableHeader>
        ),
        cell: ({ row }) => {
          const method = (row.original.method || '').toUpperCase();
          const colorMap: Record<string, string> = {
            GET: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
            POST: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
            PUT: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
            PATCH: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
            DELETE: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
          };
          const cls = colorMap[method] ?? 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300';
          return (
            <div className="text-center">
              <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold', cls)}>
                {method || '-'}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'path',
        header: ({ column }) => (
          <SortableHeader column={column}>
            <div className="flex items-center gap-2">
              <Network className="size-4" />
              {t('path')}
            </div>
          </SortableHeader>
        ),
        cell: ({ row }) => {
          const path = row.original.path ?? '';
          const logId = row.original.id;
          return (
            <div className="flex items-start gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      'font-mono text-xs px-2.5 py-1.5 rounded-lg border',
                      'bg-slate-50 text-slate-800 border-slate-200',
                      'dark:bg-slate-900/40 dark:text-slate-200 dark:border-slate-700',
                      'max-w-[420px] truncate',
                    )}
                    title={path}
                  >
                    {path || '-'}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[520px]">
                  <div className="font-mono break-all">{path || '-'}</div>
                </TooltipContent>
              </Tooltip>

              {!!path && (
                <div className="relative shrink-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className={cn(
                          'h-8 w-8 shrink-0 transition-all duration-200',
                          copiedPathLogId === logId &&
                            'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-400 dark:text-emerald-300',
                        )}
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(path);
                            setCopiedPathLogId(logId);
                            setTimeout(() => setCopiedPathLogId(null), 2000);
                          } catch (e) {
                            console.error('Copy failed', e);
                          }
                        }}
                      >
                        {copiedPathLogId === logId ? (
                          <CheckCircle2 className="size-4" />
                        ) : (
                          <Copy className="size-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      {copiedPathLogId === logId ? t('copyDetailsSuccess') : t('copyPath')}
                    </TooltipContent>
                  </Tooltip>
                  {copiedPathLogId === logId && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-emerald-600 dark:bg-emerald-500 text-white text-xs rounded-md whitespace-nowrap animate-in fade-in-0 zoom-in-95 duration-200 z-50">
                      {t('copyDetailsSuccess')}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-emerald-600 dark:bg-emerald-500 rotate-45"></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'details',
        header: () => (
          <div className="flex items-center gap-2">
            <FileText className="size-4" />
            {t('details')}
          </div>
        ),
        cell: ({ row }) => {
          const details = row.original.details;
          const hasDetails = details && details.trim().length > 0;
          
          if (!hasDetails) {
            return (
              <div className="text-xs text-slate-400 dark:text-slate-500 italic">
                {t('noDetails')}
              </div>
            );
          }
          
          return (
            <div
              onClick={() => {
                setSelectedDetails(details);
                setDetailsDialogOpen(true);
              }}
              className={cn(
                'text-xs text-slate-700 dark:text-slate-300 cursor-pointer',
                'hover:text-blue-600 dark:hover:text-blue-400 transition-colors',
                'max-w-[300px] truncate',
              )}
              title={details.length > 50 ? details : undefined}
            >
              {details.length > 50 ? `${details.substring(0, 50)}...` : details}
            </div>
          );
        },
      },
      {
        accessorKey: 'success',
        header: ({ column }) => (
          <SortableHeader column={column} className="justify-center">
            <div className="flex items-center justify-center gap-2">
              <ShieldCheck className="size-4" />
              {t('status')}
            </div>
          </SortableHeader>
        ),
        cell: ({ row }) => {
          const success = row.original.success;
          if (success === null || success === undefined) {
            return (
              <div className="text-center">
                <Badge variant="outline" className="text-xs text-slate-500">
                  {t('unknown')}
                </Badge>
              </div>
            );
          }
          return (
            <div className="text-center">
              {success ? (
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 text-xs gap-1">
                  <CheckCircle2 className="size-3" />
                  {t('success')}
                </Badge>
              ) : (
                <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 text-xs gap-1">
                  <CircleOff className="size-3" />
                  {t('failed')}
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'statusCode',
        header: ({ column }) => (
          <SortableHeader column={column} className="justify-center">
            <div className="flex items-center justify-center gap-2">
              <Network className="size-4" />
              {t('statusCode')}
            </div>
          </SortableHeader>
        ),
        cell: ({ row }) => {
          const statusCode = row.original.statusCode;
          if (statusCode === null || statusCode === undefined) {
            return (
              <div className="text-center">
                <span className="text-xs text-slate-400 dark:text-slate-500">-</span>
              </div>
            );
          }
          
          // Xác định màu sắc dựa trên status code
          let badgeClass = '';
          if (statusCode >= 200 && statusCode < 300) {
            badgeClass = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
          } else if (statusCode >= 300 && statusCode < 400) {
            badgeClass = 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
          } else if (statusCode >= 400 && statusCode < 500) {
            badgeClass = 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
          } else if (statusCode >= 500) {
            badgeClass = 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300';
          } else {
            badgeClass = 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300';
          }
          
          return (
            <div className="text-center">
              <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold font-mono', badgeClass)}>
                {statusCode}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'ipAddress',
        header: () => (
          <div className="flex items-center gap-2">
            <Network className="size-4" />
            {t('ipAddress')}
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-xs text-slate-700 dark:text-slate-300">
            {row.original.ipAddress || '-'}
          </div>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => (
          <SortableHeader column={column}>
            <div className="flex items-center gap-2">
              <Calendar className="size-4" />
              {t('createdAt')}
            </div>
          </SortableHeader>
        ),
        cell: ({ row }) => {
          const date = new Date(row.original.createdAt);
          return (
            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <Clock className="size-4 text-slate-500 dark:text-slate-400 shrink-0" />
              <span>
                {date.toLocaleString('vi-VN', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false,
                })}
              </span>
            </div>
          );
        },
      },
    ],
    [t, tApi, copiedPathLogId],
  );

  const errorMessage = logsQuery.isError ? tCommon('errorLoadData') : null;

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 min-h-screen">
      {/* Filter and Search - Always visible */}
      <LogsFilter filters={filters} onFilterChange={handleFilterChange} />

      {/* Logs Table */}
      <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="size-6 text-emerald-500" />
            {t('title')}
          </CardTitle>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('description')}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Table */}
          <div>
            {logsQuery.isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="size-4 animate-spin mx-auto mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {tCommon('loading')}
                </p>
              </div>
            ) : errorMessage ? (
              <div className="py-8 text-center text-sm text-red-500">{errorMessage}</div>
            ) : logsData.length === 0 ? (
              <div className="text-center py-8">
                <FileX className="size-8 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t('noLogs')}
                </p>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={logsData}
                pageSize={pageSize}
                manualPagination={true}
                pageIndex={pageIndex}
                totalItems={logsPage?.totalElements}
                onPageChange={(newPage) => setPageIndex(newPage)}
                onPageSizeChange={(newSize) => {
                  setPageIndex(0);
                  setPageSize(newSize);
                }}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="size-5 text-blue-600 dark:text-blue-400" />
              {t('detailsTitle')}
            </DialogTitle>
            <DialogDescription>{t('detailsDescription')}</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto py-4">
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4">
              {formatJsonWithColors(selectedDetails, isDarkMode)}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  if (selectedDetails) {
                    try {
                      await navigator.clipboard.writeText(selectedDetails);
                      setCopySuccess(true);
                      setTimeout(() => setCopySuccess(false), 2000);
                    } catch (e) {
                      console.error('Copy failed', e);
                    }
                  }
                }}
                className={cn(
                  'transition-all duration-200',
                  copySuccess && 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-400 dark:text-emerald-300',
                )}
              >
                {copySuccess ? (
                  <>
                    <CheckCircle2 className="size-4 mr-2" />
                    {t('copyDetailsSuccess')}
                  </>
                ) : (
                  <>
                    <Copy className="size-4 mr-2" />
                    {t('copyDetails')}
                  </>
                )}
              </Button>
              {copySuccess && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-emerald-600 dark:bg-emerald-500 text-white text-xs rounded-md whitespace-nowrap animate-in fade-in-0 zoom-in-95 duration-200">
                  {t('copyDetailsSuccess')}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-emerald-600 dark:bg-emerald-500 rotate-45"></div>
                </div>
              )}
            </div>
            <Button variant="default" size="sm" onClick={() => setDetailsDialogOpen(false)}>
              {tCommon('close')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


