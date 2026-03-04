import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/use-debounce';
import { logService } from '@/services/log-service';
import { AuditLogType, PageResponse } from '@/types';
import { queryKeys } from '@/lib/queryKeys';

export function useAuditLogsPaginated(
  search: string = '',
  filters: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    status?: 'success' | 'failed';
    startDate?: string;
    endDate?: string;
  } = {},
  page: number = 0,
  size: number = 10,
) {
  const debouncedSearch = useDebounce(search, 500);

  return useQuery<PageResponse<AuditLogType>>({
    queryKey: queryKeys.logs.listPaginated({
      ...filters,
      search: debouncedSearch,
      page,
      size,
    }),
    queryFn: async () => {
      const response = await logService.getAuditLogs({
        page,
        size,
        search: debouncedSearch || undefined,
        method: filters.method || undefined,
        success:
          filters.status === 'success'
            ? true
            : filters.status === 'failed'
            ? false
            : undefined,
        from: filters.startDate,
        to: filters.endDate,
      });

      if (response.status === 200 && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch audit logs');
    },
  });
}


