'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, SortableHeader } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClassShiftsByClass } from '@/hooks/use-classes';
import { useBulkRemoveStudentsFromClass, useBulkUpdateStudentShift } from '@/hooks/use-students';
import { cn } from '@/lib/utils';
import { StudentType } from '@/types';
import { formatCurrency, formatDate } from '@/utils/helper';
import { ColumnDef } from '@tanstack/react-table';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Calendar,
  Check,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Edit,
  Eye,
  Filter,
  Mail,
  MoreHorizontal,
  Phone,
  RotateCcw,
  Search,
  User,
  UserMinus,
  Users,
  X,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';

interface ClassroomStudentsListProps {
  students: StudentType[];
  classId?: string;
  onEditStudent?: (student: StudentType) => void;
  onPayment?: (student: StudentType) => void;
  onStudentsUpdate?: () => void;
}

interface ClassroomStudentItem extends StudentType {
  paymentStatus: 'paid' | 'unpaid' | 'partial';
  monthlyFee: number;
  amountPaid: number;
  currentMonthPaidAmount?: number;
}

const getCurrentMonthPaymentStatus = (
  monthPaymentStatuses?: Array<{
    month: string;
    expectedAmount: number;
    paidAmount: number;
    remainingAmount: number;
    status: 'PAID' | 'PARTIAL' | 'UNPAID';
  }>,
  monthlyFee?: number,
): {
  paymentStatus: 'paid' | 'unpaid' | 'partial';
  paidAmount: number;
  expectedAmount: number;
} => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  if (monthPaymentStatuses && monthPaymentStatuses.length > 0) {
    for (const paymentStatus of monthPaymentStatuses) {
      const paymentDate = new Date(paymentStatus.month);
      const paymentYear = paymentDate.getFullYear();
      const paymentMonth = paymentDate.getMonth() + 1;

      if (paymentYear === currentYear && paymentMonth === currentMonth) {
        const statusMap: Record<'PAID' | 'PARTIAL' | 'UNPAID', 'paid' | 'unpaid' | 'partial'> = {
          PAID: 'paid',
          PARTIAL: 'partial',
          UNPAID: 'unpaid',
        };

        return {
          paymentStatus: statusMap[paymentStatus.status] || 'unpaid',
          paidAmount: paymentStatus.paidAmount || 0,
          expectedAmount: paymentStatus.expectedAmount || monthlyFee || 0,
        };
      }
    }
  }

  return {
    paymentStatus: 'unpaid',
    paidAmount: 0,
    expectedAmount: monthlyFee || 0,
  };
};

export function ClassroomStudentsList({ students, classId, onEditStudent, onPayment, onStudentsUpdate }: ClassroomStudentsListProps) {
  const t = useTranslations('classroom-detail');
  const tCommon = useTranslations('common');
  const tNotif = useTranslations('notifications');
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterShift, setFilterShift] = useState<string>('all');
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [isShiftDialogOpen, setIsShiftDialogOpen] = useState(false);
  const [selectedShiftId, setSelectedShiftId] = useState<string>('__none__');
  const [isUpdatingShift, setIsUpdatingShift] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const { data: shifts = [] } = useClassShiftsByClass(classId || '');
  const bulkUpdateStudentShift = useBulkUpdateStudentShift();
  const bulkRemoveStudentsFromClass = useBulkRemoveStudentsFromClass();

  const mappedStudents: ClassroomStudentItem[] = students.map((student) => {
    const monthlyFee = student.class?.monthlyFee || 0;
    const currentMonthPayment = getCurrentMonthPaymentStatus(student.monthPaymentStatuses, monthlyFee);

    return {
      ...student,
      paymentStatus: currentMonthPayment.paymentStatus,
      monthlyFee,
      amountPaid: currentMonthPayment.paidAmount,
      currentMonthPaidAmount: currentMonthPayment.paidAmount,
    };
  });

  // Filter students by search query and shift
  const filteredStudents = useMemo(() => {
    let filtered = mappedStudents;

    // Filter by search query (search in name, email, phone, parent name)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((student) => {
        const fullName = student.fullName?.toLowerCase() || '';
        const email = student.email?.toLowerCase() || '';
        const phoneNumber = student.phoneNumber?.toLowerCase() || '';
        const parentName = student.fullNameParent?.toLowerCase() || '';
        const parentPhone = student.phoneNumberParent?.toLowerCase() || '';

        return (
          fullName.includes(query) ||
          email.includes(query) ||
          phoneNumber.includes(query) ||
          parentName.includes(query) ||
          parentPhone.includes(query)
        );
      });
    }

    // Filter by shift if selected
    if (filterShift !== 'all') {
      filtered = filtered.filter((student) => {
        return student.class?.shiftId === filterShift;
      });
    }

    return filtered;
  }, [mappedStudents, searchQuery, filterShift]);

  const getPaymentBadge = (paymentStatus: ClassroomStudentItem['paymentStatus']) => {
    const paymentConfig = {
      paid: {
        label: t('payment_paid'),
        className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        icon: CheckCircle,
      },
      partial: {
        label: t('payment_partial'),
        className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        icon: Clock,
      },
      unpaid: {
        label: t('payment_unpaid'),
        className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        icon: Clock,
      },
    } as const;

    const config = paymentConfig[paymentStatus];
    const Icon = config.icon;

    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
          config.className,
        )}
      >
        <Icon className="size-3" />
        {config.label}
      </span>
    );
  };

  // Handle select/deselect all
  const handleSelectAll = () => {
    const filteredIds = new Set(filteredStudents.map(s => s.id));
    const allFilteredSelected = filteredStudents.length > 0 && filteredStudents.every(s => selectedStudentIds.has(s.id));
    
    if (allFilteredSelected) {
      // Deselect all filtered students, but keep others selected
      const newSelected = new Set(selectedStudentIds);
      filteredIds.forEach(id => newSelected.delete(id));
      setSelectedStudentIds(newSelected);
    } else {
      // Select all filtered students
      const newSelected = new Set(selectedStudentIds);
      filteredIds.forEach(id => newSelected.add(id));
      setSelectedStudentIds(newSelected);
    }
  };

  // Check if all filtered students are selected
  const allFilteredSelected = filteredStudents.length > 0 && filteredStudents.every(s => selectedStudentIds.has(s.id));

  // Handle toggle single student selection
  const handleToggleStudent = (studentId: string) => {
    const newSelected = new Set(selectedStudentIds);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudentIds(newSelected);
  };

  // Handle remove students from class
  const handleRemoveFromClass = async () => {
    if (selectedStudentIds.size === 0) {
      toast.warning(tNotif('warningSelectStudents'));
      return;
    }

    if (!classId) {
      toast.error(tNotif('errorGetClassInfo'));
      return;
    }

    try {
      setIsRemoving(true);
      const studentIds = Array.from(selectedStudentIds);
      const { successCount, errorCount, failedIds } = await bulkRemoveStudentsFromClass.mutateAsync({
        classId,
        studentIds,
      });

      if (successCount > 0) {
        toast.success(tNotif('successRemoveStudents', { count: successCount }));
        setSelectedStudentIds(new Set());
        setIsRemoveDialogOpen(false);
        if (onStudentsUpdate) onStudentsUpdate();
      }

      if (errorCount > 0) {
        console.error('Failed to remove students for studentIds:', failedIds);
        toast.error(tNotif('errorRemoveStudentsFail', { count: errorCount }));
      }
    } catch (error) {
      console.error('Error removing students from class', error);
      toast.error(tNotif('errorRemoveStudents'));
    } finally {
      setIsRemoving(false);
    }
  };

  // Handle update shift for multiple students
  const handleUpdateShift = async () => {
    if (selectedStudentIds.size === 0) {
      toast.warning(tNotif('warningSelectStudents'));
      return;
    }

    if (!classId) {
      toast.error(tNotif('errorGetClassInfo'));
      return;
    }

    try {
      setIsUpdatingShift(true);
      const studentIds = Array.from(selectedStudentIds);
      const classShiftId = selectedShiftId === '__none__' ? undefined : (selectedShiftId || undefined);

      const { successCount, errorCount, failedIds } = await bulkUpdateStudentShift.mutateAsync({
        classId,
        studentIds,
        classShiftId,
      });

      if (successCount > 0) {
        toast.success(tNotif('successUpdateShift', { count: successCount }));
        setSelectedStudentIds(new Set());
        setSelectedShiftId('__none__');
        setIsShiftDialogOpen(false);

        // Hook `useBulkUpdateStudentShift` đã invalidate các query liên quan để UI tự refresh
        if (onStudentsUpdate) {
          onStudentsUpdate();
        }
      }

      if (errorCount > 0) {
        console.error('Failed to update shift for studentIds:', failedIds);
        toast.error(tNotif('errorUpdateShiftFail', { count: errorCount }));
      }
    } catch (error) {
      console.error('Error updating shifts', error);
      toast.error(tNotif('errorUpdateShift'));
    } finally {
      setIsUpdatingShift(false);
    }
  };

  const columns: ColumnDef<ClassroomStudentItem>[] = [
    {
      id: 'select',
      header: () => (
        <div className="flex justify-center">
          <input
            type="checkbox"
            checked={allFilteredSelected}
            onChange={handleSelectAll}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center">
          <input
            type="checkbox"
            checked={selectedStudentIds.has(row.original.id)}
            onChange={() => handleToggleStudent(row.original.id)}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'fullName',
      header: ({ column }) => (
        <SortableHeader column={column}>
          <div className="flex items-center gap-2">
            <User className="size-4" />
            {t('studentName')}
          </div>
        </SortableHeader>
      ),
      cell: ({ row }) => {
        return (
          <div className="font-medium text-slate-900 dark:text-slate-100">
            <div className="space-y-0.5">
              <Link href={`/student-management/${row.original.id}`} className="hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">{row.original.fullName}</Link>
              <div className="text-xs text-slate-500">
                {t(`gender_${row.original.gender.toLowerCase()}`)}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      id: 'contact',
      header: () => (
        <div className="flex items-center gap-2">
          <Mail className="size-4" />
          {t('contact')}
        </div>
      ),
      cell: ({ row }) => {
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <Mail className="size-3.5 text-slate-500" />
              <span className="text-xs">{row.original.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <Phone className="size-3.5 text-slate-500" />
              <span className="text-xs">{row.original.phoneNumber}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'fullNameParent',
      header: ({ column }) => (
        <SortableHeader column={column}>
          <div className="flex items-center gap-2">
            <Users className="size-4" />
            {t('parent')}
          </div>
        </SortableHeader>
      ),
      cell: ({ row }) => {
        return (
          <div className="space-y-1">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {row.original.fullNameParent}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Phone className="size-3 text-slate-500" />
              {row.original.phoneNumberParent}
            </div>
          </div>
        );
      },
    },
    {
      id: 'class',
      header: () => (
        <div className="flex items-center justify-center gap-2">
          <BookOpen className="size-4" />
          {t('class')}
        </div>
      ),
      cell: ({ row }) => {
        return (
          <div className="text-center">
            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-xs font-medium">
              {row.original.class?.name || t('noClass')}
            </span>
          </div>
        );
      },
    },
    {
      id: 'shift',
      header: () => (
        <div className="flex items-center justify-center gap-2">
          <Clock className="size-4" />
          <span>{t('shift')}</span>
        </div>
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-center">
            <Badge
              variant="outline"
              className="text-xs font-medium px-2 py-0.5 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/30"
            >
              <Clock className="size-3 mr-1" />
              {row.original.class?.shiftName || '-'}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: 'dob',
      header: ({ column }) => (
        <SortableHeader column={column} className="justify-center">
          <div className="flex items-center justify-center gap-2">
            <Calendar className="size-4" />
            {t('dob')}
          </div>
        </SortableHeader>
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-center gap-2 text-center text-slate-600 dark:text-slate-400 text-sm">
            <Calendar className="size-4" />
            {formatDate(row.original.dob)}
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const dateA = new Date(rowA.original.dob).getTime();
        const dateB = new Date(rowB.original.dob).getTime();
        return dateA - dateB;
      },
    },
    {
      id: 'payment',
      header: () => (
        <div className="flex items-center justify-end gap-2">
          <DollarSign className="size-4" />
          {t('payment')}
        </div>
      ),
      cell: ({ row }) => {
        // Calculate total debt from all unpaid months
        const totalDebt = row.original.monthPaymentStatuses?.reduce((sum, status) => {
          return sum + (status.remainingAmount || 0);
        }, 0) || 0;

        return (
          <div className="text-right space-y-1">
            {getPaymentBadge(row.original.paymentStatus)}
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {formatCurrency(row.original.currentMonthPaidAmount ?? row.original.amountPaid)} /{' '}
              {formatCurrency(row.original.monthlyFee)}
            </div>
            {totalDebt > 0 && (
              <div className="text-xs font-bold text-red-600 dark:text-red-400">
                {t('debt')}: {formatCurrency(totalDebt)}
              </div>
            )}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: () => (
        <div className="text-center">
          {t('actions')}
        </div>
      ),
      cell: ({ row }) => {
        const student = row.original;
        return (
          <div className="flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="size-8 p-0">
                  <span className="sr-only">{t('openMenu')}</span>
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" asChild>
                  <Link
                    href={`/${locale}/student-management/${student.id}`}
                    className="flex items-center"
                  >
                    <Eye className="size-4 mr-2" />
                    {t('viewDetail')}
                  </Link>
                </DropdownMenuItem>
                {onPayment && (
                  <DropdownMenuItem className="cursor-pointer" onClick={() => onPayment(student)}>
                    <CreditCard className="size-4 mr-2" />
                    {t('payment')}
                  </DropdownMenuItem>
                )}
                {onEditStudent && (
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => onEditStudent(student)}
                  >
                    <Edit className="size-4 mr-2" />
                    {t('editInfo')}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                  onClick={() => {
                    setSelectedStudentIds(new Set([student.id]));
                    setIsRemoveDialogOpen(true);
                  }}
                >
                  <UserMinus className="size-4 mr-2" />
                  {tCommon('removeFromClass')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterShift('all');
  };

  const hasActiveFilters = searchQuery.trim() !== '' || filterShift !== 'all';

  return (
    <Card className="hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-900 border-0 shadow-lg">
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-xl md:text-2xl font-bold flex items-center gap-2">
                <Users className="size-5 md:size-6 text-blue-600 dark:text-blue-400" />
                {t('studentsList')}
                <span className="text-sm md:text-base font-normal text-slate-500 dark:text-slate-400">
                  ({hasActiveFilters ? filteredStudents.length : students.length})
                  {hasActiveFilters && filteredStudents.length !== students.length && (
                    <span className="text-slate-400"> / {students.length}</span>
                  )}
                </span>
              </CardTitle>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {t('studentsListDescription')}
              </p>
            </div>
            {classId && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => setIsShiftDialogOpen(true)}
                  disabled={selectedStudentIds.size === 0}
                  className="text-xs"
                >
                  <ArrowRight className="size-3 mr-1" />
                  {tCommon('changeShift')}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setIsRemoveDialogOpen(true)}
                  disabled={selectedStudentIds.size === 0}
                  className="text-xs"
                >
                  <UserMinus className="size-3 mr-1" />
                  {tCommon('removeFromClass')}
                </Button>
              </div>
            )}
          </div>
          
          {/* Search Bar and Filters */}
          <div className="space-y-3">
            {/* Main Filters Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 md:size-5 text-slate-400 z-10" />
                <Input
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11 md:h-12 pl-10 md:pl-12 pr-10 md:pr-12 text-sm md:text-base bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md focus-visible:shadow-md focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-400 transition-all"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClearSearch}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 size-8 h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X className="size-4 text-slate-400" />
                    <span className="sr-only">{t('clearSearch')}</span>
                  </Button>
                )}
              </div>

              {/* Filters Group */}
              <div className="flex items-center gap-2.5">
                {/* Shift Filter */}
                {shifts && shifts.length > 0 && (
                  <div className="min-w-[180px]">
                    <Select value={filterShift} onValueChange={setFilterShift}>
                      <SelectTrigger className="h-11 md:h-12 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl shadow-sm hover:shadow-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all">
                        <div className="flex items-center gap-2.5">
                          <Filter className="size-4 text-blue-500 dark:text-blue-400" />
                          <SelectValue placeholder={t('allShifts')} />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('allShifts')}</SelectItem>
                        {shifts.map((shift) => (
                          <SelectItem key={shift.id} value={shift.id}>
                            {shift.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearFilters}
                    className="h-11 md:h-12 px-4 text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all"
                    title={t('clearFilter')}
                  >
                    <RotateCcw className="size-4 mr-2" />
                    <span className="text-xs font-medium hidden sm:inline">{t('clearFilter')}</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Active Filters Pills */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mr-1">
                  {t('activeFilters')}:
                </span>
                {searchQuery && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 text-xs font-medium border border-blue-200 dark:border-blue-800 shadow-sm">
                    <Search className="size-3" />
                    <span className="max-w-[200px] truncate">{searchQuery}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleClearSearch}
                      className="h-4 w-4 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-full"
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                )}
                {filterShift !== 'all' && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 text-xs font-medium border border-indigo-200 dark:border-indigo-800 shadow-sm">
                    <Clock className="size-3" />
                    <span>{shifts.find(s => s.id === filterShift)?.name || filterShift}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setFilterShift('all')}
                      className="h-4 w-4 p-0 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-full"
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Selection Toolbar */}
          {selectedStudentIds.size > 0 && (
            <div className="flex items-center justify-between gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                <Check className="size-4" />
                <span className="font-medium">
                  {tCommon('selectedCount', { count: selectedStudentIds.size })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedStudentIds(new Set())}
                  className="text-xs"
                >
                  {tCommon('deselect')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {mappedStudents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('noStudentsInClass')}</p>
          </div>
        ) : filteredStudents.length === 0 && hasActiveFilters ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {searchQuery 
                ? `${t('noSearchResults')} "${searchQuery}"`
                : filterShift !== 'all'
                ? t('noStudentsInShift')
                : t('noSearchResults')}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="mt-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <X className="size-4 mr-1" />
              {t('clearFilter')}
            </Button>
          </div>
        ) : (
          <DataTable columns={columns} data={filteredStudents} />
        )}
      </CardContent>

      {/* Dialog chọn ca học */}
      <Dialog open={isShiftDialogOpen} onOpenChange={setIsShiftDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="size-5" />
              {tCommon('shiftTitle', { count: selectedStudentIds.size })}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {tCommon('selectShift')}
              </label>
              <Select value={selectedShiftId} onValueChange={setSelectedShiftId}>
                <SelectTrigger>
                  <SelectValue placeholder={tCommon('selectShiftPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">
                    <span className="text-slate-500 italic">{tCommon('noShift')}</span>
                  </SelectItem>
                  {shifts.map((shift) => (
                    <SelectItem key={shift.id} value={shift.id}>
                      {shift.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {shifts.length === 0 && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {tCommon('noShiftsForClass')}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsShiftDialogOpen(false);
                setSelectedShiftId('__none__');
              }}
              disabled={isUpdatingShift}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              type="button"
              onClick={handleUpdateShift}
              disabled={isUpdatingShift || shifts.length === 0}
            >
              {isUpdatingShift ? tCommon('updating') : tCommon('confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog xác nhận loại bỏ học sinh */}
      <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="size-5" />
              {tCommon('confirmRemoveTitle')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {(() => {
                const pluralText = selectedStudentIds.size === 1 
                  ? tCommon('confirmRemoveMessageSingle') 
                  : tCommon('confirmRemoveMessagePlural');
                
                const count = selectedStudentIds.size;
                const message = tCommon('confirmRemoveMessage', {
                  count: count,
                  plural: pluralText
                });
                
                // Find the position of count number in the message and wrap it with strong tag
                const countStr = String(count);
                const index = message.indexOf(countStr);
                
                if (index !== -1) {
                  const before = message.substring(0, index);
                  const after = message.substring(index + countStr.length);
                  return (
                    <>
                      {before}
                      <strong>{count}</strong>
                      {after}
                    </>
                  );
                }
                
                // Fallback: render message as is if count not found
                return message;
              })()}
            </p>
            {selectedStudentIds.size <= 5 && (
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 space-y-1">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                  {tCommon('listToRemove')}
                </p>
                <ul className="space-y-1">
                  {Array.from(selectedStudentIds).map((studentId) => {
                    const student = students.find((s) => s.id === studentId);
                    return (
                      <li key={studentId} className="text-xs text-slate-700 dark:text-slate-300">
                        • {student?.fullName || studentId}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {tCommon('removeWarning')}
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRemoveDialogOpen(false)}
              disabled={isRemoving}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleRemoveFromClass}
              disabled={isRemoving}
            >
              {isRemoving ? tCommon('processing') : tCommon('confirmRemove')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

