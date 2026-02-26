'use client';

import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  className?: string;
  pageSize?: number;
  pageSizeOptions?: number[];
  getRowClassName?: (row: TData) => string;
  /**
   * Enable manual/server-side pagination. When true, the table will use the
   * provided pageIndex/pageSize/totalItems and call callbacks on change.
   */
  manualPagination?: boolean;
  pageIndex?: number;
  totalItems?: number;
  onPageChange?: (pageIndex: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export function DataTable<TData, TValue>({ 
  columns, 
  data, 
  className,
  pageSize = 10,
  pageSizeOptions = [5, 10, 20, 30, 50, 100],
  getRowClassName,
  manualPagination = false,
  pageIndex,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: DataTableProps<TData, TValue>) {
  const t = useTranslations('common');
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [internalPagination, setInternalPagination] = React.useState({
    pageIndex: 0,
    pageSize,
  });

  const isManual = manualPagination && typeof pageIndex === 'number';

  const pagination = isManual
    ? {
        pageIndex: pageIndex ?? 0,
        pageSize: pageSize,
      }
    : internalPagination;

  const handlePaginationChange = (updater: unknown) => {
    // Updater is PaginationState | ((old: PaginationState) => PaginationState)
    const current = pagination;
    const next =
      typeof updater === 'function'
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? (updater as any)(current)
        : (updater as { pageIndex: number; pageSize: number });

    if (isManual) {
      if (next.pageIndex !== current.pageIndex) {
        onPageChange?.(next.pageIndex);
      }
      if (next.pageSize !== current.pageSize) {
        onPageSizeChange?.(next.pageSize);
      }
    } else {
      setInternalPagination(next);
    }
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: isManual,
    pageCount:
      isManual && typeof totalItems === 'number'
        ? Math.max(1, Math.ceil(totalItems / pagination.pageSize))
        : undefined,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: handlePaginationChange,
    initialState: {
      pagination: {
        pageSize: pageSize,
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });

  const totalCount =
    isManual && typeof totalItems === 'number'
      ? totalItems
      : table.getFilteredRowModel().rows.length;

  const currentPageIndex = table.getState().pagination.pageIndex;
  const currentPageSize = table.getState().pagination.pageSize;
  const currentPageRowCount = table.getRowModel().rows.length;

  const startItem =
    totalCount === 0 ? 0 : currentPageIndex * currentPageSize + 1;
  const endItem =
    totalCount === 0
      ? 0
      : Math.min(currentPageIndex * currentPageSize + currentPageRowCount, totalCount);

  return (
    <div className={cn('w-full space-y-4', className)}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-slate-200 dark:border-slate-700">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="font-semibold text-slate-700 dark:text-slate-300"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const customClassName = getRowClassName ? getRowClassName(row.original) : '';
                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className={cn(
                      'transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50',
                      customClassName
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {t('noResults')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t('showing')}{' '}
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {startItem}
            </span>{' '}
            {t('to')}{' '}
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {endItem}
            </span>{' '}
            {t('of')}{' '}
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {totalCount}
            </span>{' '}
            {t('results')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm text-slate-600 dark:text-slate-400">{t('rowsPerPage')}</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pagination Buttons */}
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
          className="h-8"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="h-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-1">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t('page')}{' '}
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {table.getState().pagination.pageIndex + 1}
            </span>{' '}
            /{' '}
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {table.getPageCount()}
            </span>
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="h-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
          className="h-8"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Helper component for sortable column headers
export function SortableHeader({
  column,
  children,
  className,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  column: any;
  children: React.ReactNode;
  className?: string;
}) {
  const sortDirection = column.getIsSorted();
  
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      className={cn('h-auto p-0 font-semibold hover:bg-transparent', className)}
    >
      {children}
      <span className="ml-2">
        {sortDirection === 'asc' ? (
          <ArrowUp className="h-4 w-4" />
        ) : sortDirection === 'desc' ? (
          <ArrowDown className="h-4 w-4" />
        ) : (
          <ArrowUpDown className="h-4 w-4 opacity-50" />
        )}
      </span>
    </Button>
  );
}

