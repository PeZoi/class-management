'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 15 * 60 * 1000, // 15 phút - data được coi là fresh
            gcTime: 30 * 60 * 1000, // 30 phút - cache time
            refetchOnWindowFocus: false, // Không refetch khi focus window
            retry: 1, // Retry 1 lần nếu fail
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

