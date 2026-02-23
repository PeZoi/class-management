'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 phút - data được coi là fresh (optimized)
            gcTime: 10 * 60 * 1000, // 10 phút - cache time (optimized, renamed from cacheTime)
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

