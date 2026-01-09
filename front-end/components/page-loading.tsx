import { Loader2 } from 'lucide-react';

interface PageLoadingProps {
  message?: string;
}

export function PageLoading({ message }: PageLoadingProps) {
  return (
    <div className="relative flex h-screen items-center justify-center overflow-hidden bg-linear-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-4 text-center">
        {/* Logo / avatar circle */}
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/80 shadow-lg shadow-slate-400/30 ring-1 ring-slate-200/80 backdrop-blur-sm dark:bg-slate-900/70 dark:shadow-black/40 dark:ring-slate-700">
          <Loader2 className="size-8 animate-spin text-sky-600 dark:text-sky-400" />
        </div>

        {/* Main text */}
        <h2 className="mb-2 text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Đang tải dữ liệu
        </h2>

        <p className="mb-6 max-w-md text-sm text-slate-600 dark:text-slate-400">
          {message ?? 'Vui lòng đợi trong giây lát, hệ thống đang đồng bộ thông tin mới nhất cho bạn.'}
        </p>

        {/* Skeleton lines */}
        <div className="flex w-full max-w-md flex-col gap-2.5">
          <div className="h-2.5 w-28 animate-pulse rounded-full bg-slate-300/80 dark:bg-slate-700/80" />
          <div className="h-2.5 w-full animate-pulse rounded-full bg-slate-300/80 dark:bg-slate-700/80" />
          <div className="h-2.5 w-5/6 animate-pulse rounded-full bg-slate-300/70 dark:bg-slate-700/70" />
          <div className="h-2.5 w-3/4 animate-pulse rounded-full bg-slate-300/60 dark:bg-slate-700/60" />
        </div>
      </div>
    </div>
  );
}
