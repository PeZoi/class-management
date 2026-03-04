export interface AuditLogType {
  id: number;
  username: string | null;
  action: string | null;
  method: string | null;
  path: string | null;
  apiDescriptionKey?: string | null;
  ipAddress: string | null;
  success: boolean | null;
  statusCode: number | null;
  details: string | null;
  createdAt: string;
}

export interface AuditLogFilterState {
  searchQuery: string;
  username: string;
  method: 'all' | 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  status: 'all' | 'success' | 'failed';
  startDate?: string;
  endDate?: string;
}


