import http from '@/lib/http';
import { AuditLogType, PageResponse } from '@/types';
import { ResponseType } from '@/types/response-type';

export const logService = {
  getAuditLogs: (params: {
    page: number;
    size: number;
    search?: string;
    username?: string;
    method?: string;
    success?: boolean;
    from?: string;
    to?: string;
  }) => {
    const searchParams = new URLSearchParams();
    searchParams.append('page', String(params.page));
    searchParams.append('size', String(params.size));

    if (params.search) searchParams.append('search', params.search);
    if (params.username) searchParams.append('username', params.username);
    if (params.method) searchParams.append('method', params.method);
    if (typeof params.success === 'boolean') searchParams.append('success', String(params.success));
    if (params.from) searchParams.append('from', params.from);
    if (params.to) searchParams.append('to', params.to);

    return http.get<ResponseType<PageResponse<AuditLogType>, PageResponse<AuditLogType>>>(
      `/api/audit-logs?${searchParams.toString()}`,
    );
  },
};


