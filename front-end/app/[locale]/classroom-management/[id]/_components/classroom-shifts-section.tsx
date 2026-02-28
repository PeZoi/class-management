'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ClassShiftType } from '@/types/class-type';
import { toast } from 'react-toastify';
import { Plus, RefreshCw, Users, Mail, Calendar, DollarSign, Phone, CheckCircle, Clock, Pencil, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useTranslations } from 'next-intl';
import { formatCurrency, formatDate } from '@/utils/helper';
import { useCreateClassShift, useDeleteClassShift, useUpdateClassShift } from '@/hooks/use-classes';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { useStudentsByClassShift } from '@/hooks/use-students';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface ClassroomShiftsSectionProps {
  classId: string;
  shifts: ClassShiftType[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function ClassroomShiftsSection({ classId, shifts, isLoading, onRefresh }: ClassroomShiftsSectionProps) {
  const tClassDetail = useTranslations('classroom-detail');
  const tCommon = useTranslations('common');
  const tNotif = useTranslations('notifications');

  const [creating, setCreating] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<ClassShiftType | null>(null);
  const [openShiftId, setOpenShiftId] = useState<string | null>(null);
  const [confirmDeleteShiftId, setConfirmDeleteShiftId] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const createShiftMutation = useCreateClassShift();
  const updateShiftMutation = useUpdateClassShift();
  const deleteShiftMutation = useDeleteClassShift();

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

  type ShiftType = 'MORNING' | 'EVENING';

  const [shiftType, setShiftType] = useState<ShiftType>('MORNING');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const dayOptions: { key: string; label: string; order: number }[] = useMemo(() => {
  const getDayLabel = (key: string): string => {
    const labels: Record<string, string> = {
        MON: tCommon('dayMonday'),
        TUE: tCommon('dayTuesday'),
        WED: tCommon('dayWednesday'),
        THU: tCommon('dayThursday'),
        FRI: tCommon('dayFriday'),
        SAT: tCommon('daySaturday'),
        SUN: tCommon('daySunday'),
    };
    return labels[key] || key;
  };

    return [
    { key: 'MON', label: getDayLabel('MON'), order: 1 },
    { key: 'TUE', label: getDayLabel('TUE'), order: 2 },
    { key: 'WED', label: getDayLabel('WED'), order: 3 },
    { key: 'THU', label: getDayLabel('THU'), order: 4 },
    { key: 'FRI', label: getDayLabel('FRI'), order: 5 },
    { key: 'SAT', label: getDayLabel('SAT'), order: 6 },
    { key: 'SUN', label: getDayLabel('SUN'), order: 7 },
    ];
  }, [tCommon]);

  // Component con để render mỗi shift item với hook riêng
  function ShiftItem({ shift, isOpen, onOpenChange, onEdit, onDelete }: {
    shift: ClassShiftType;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit: (shift: ClassShiftType) => void;
    onDelete: (shiftId: string) => void;
  }) {
    // Dùng hook để fetch students khi shift được mở
    const { data: students = [], isLoading: isLoadingStudents } = useStudentsByClassShift(
      shift.id,
      { enabled: isOpen } // Chỉ fetch khi mở
    );

    return (
      <li>
        <Collapsible
          open={isOpen}
          onOpenChange={onOpenChange}
          className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40"
        >
          <div className="flex items-center justify-between px-3 py-2 gap-2">
            <CollapsibleTrigger asChild>
              <button className="flex flex-1 items-center justify-between text-sm font-medium text-slate-800 dark:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-900/60 rounded-md px-2 py-1 transition-colors cursor-pointer">
                <div className="flex items-center gap-2 text-left">
                  <Users className="size-4 text-blue-500" />
                  <span>{shift.name}</span>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {students.length > 0 ? tCommon('studentsCount', { count: students.length }) : tCommon('clickToViewStudents')}
                </span>
              </button>
            </CollapsibleTrigger>
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="size-7 text-slate-500 hover:text-slate-800 dark:hover:text-slate-100"
                onClick={() => onEdit(shift)}
                type="button"
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="size-7 text-red-500 hover:text-red-700 dark:hover:text-red-400"
                onClick={() => onDelete(shift.id)}
                type="button"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
          <CollapsibleContent className="border-t border-slate-200 dark:border-slate-800 px-3 py-2 bg-white/60 dark:bg-slate-950/40">
            {isLoadingStudents ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {tCommon('loadingStudentList')}
              </p>
            ) : students.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {tCommon('noStudentsInShift')}
              </p>
            ) : (
              <div className="overflow-x-auto rounded-md border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950/60">
                <Table className="min-w-full text-xs">
                  <TableHeader className="bg-slate-100/80 dark:bg-slate-900/80">
                    <TableRow className="text-left text-slate-600 dark:text-slate-300">
                      <TableHead className="px-3 py-2 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <Users className="size-3.5" />
                          {tClassDetail('studentName')}
                        </div>
                      </TableHead>
                      <TableHead className="px-3 py-2 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <Mail className="size-3.5" />
                          {tClassDetail('contact')}
                        </div>
                      </TableHead>
                      <TableHead className="px-3 py-2 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <Users className="size-3.5" />
                          {tClassDetail('parent')}
                        </div>
                      </TableHead>
                      <TableHead className="px-3 py-2 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-3.5" />
                          {tClassDetail('dob')}
                        </div>
                      </TableHead>
                      <TableHead className="px-3 py-2 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-3.5" />
                          {tClassDetail('joinedAt')}
                        </div>
                      </TableHead>
                      <TableHead className="px-3 py-2 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-3.5" />
                          {tClassDetail('unpaidMonths')}
                        </div>
                      </TableHead>
                      <TableHead className="px-3 py-2 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="size-3.5" />
                          {tClassDetail('payment')}
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow
                        key={student.id}
                        className="border-t border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/70 transition-colors"
                      >
                        {(() => {
                          const monthlyFee = student.class?.monthlyFee || 0;
                          const currentPayment = getCurrentMonthPaymentStatus(
                            student.monthPaymentStatuses,
                            monthlyFee,
                          );
                          const unpaidMonths =
                            student.monthPaymentStatuses?.filter((m) => m.remainingAmount > 0).length ?? 0;

                          const paymentStatus = currentPayment.paymentStatus;
                          const paymentConfig = {
                            paid: {
                              label: tClassDetail('payment_paid'),
                              className:
                                'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                              icon: CheckCircle,
                            },
                            partial: {
                              label: tClassDetail('payment_partial'),
                              className:
                                'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
                              icon: Clock,
                            },
                            unpaid: {
                              label: tClassDetail('payment_unpaid'),
                              className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                              icon: Clock,
                            },
                          } as const;
                          const paymentCfg = paymentConfig[paymentStatus];
                          const PaymentIcon = paymentCfg.icon;

                          const genderKey = `gender_${student.gender.toLowerCase()}` as
                            | 'gender_male'
                            | 'gender_female'
                            | 'gender_other';
                          return (
                            <>
                              <TableCell className="px-3 py-2 font-medium">
                                <div className="flex flex-col">
                                  <span>{student.fullName}</span>
                                  <span className="text-[10px] text-slate-500">
                                    {tClassDetail(genderKey)}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="px-3 py-2">
                                <div className="flex flex-col gap-0.5">
                                  <span className="inline-flex items-center gap-1">
                                    <Mail className="size-3 text-slate-500" />
                                    <span>{student.email}</span>
                                  </span>
                                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300">
                                    <Phone className="size-3 text-slate-500" />
                                    <span>{student.phoneNumber}</span>
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="px-3 py-2">
                                <div className="flex flex-col gap-0.5">
                                  <span>{student.fullNameParent}</span>
                                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300">
                                    <Phone className="size-3 text-slate-500" />
                                    <span>{student.phoneNumberParent}</span>
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="px-3 py-2 whitespace-nowrap">
                                {formatDate(student.dob)}
                              </TableCell>
                              <TableCell className="px-3 py-2 whitespace-nowrap">
                                {student.class?.joinAt ? formatDate(student.class.joinAt) : '-'}
                              </TableCell>
                              <TableCell className="px-3 py-2 whitespace-nowrap">
                                <p className='pl-12'>{unpaidMonths}</p>
                              </TableCell>
                              <TableCell className="px-3 py-2 whitespace-nowrap">
                                <div className="flex flex-col items-start gap-1">
                                  <span
                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium ${paymentCfg.className}`}
                                  >
                                    <PaymentIcon className="size-3" />
                                    {paymentCfg.label}
                                  </span>
                                  <span className="text-[11px] text-slate-600 dark:text-slate-300">
                                    {formatCurrency(currentPayment.paidAmount)}{' '}
                                    <span className="text-[10px] text-slate-500">
                                      / {formatCurrency(currentPayment.expectedAmount)}
                                    </span>
                                  </span>
                                </div>
                              </TableCell>
                            </>
                          );
                        })()}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </li>
    );
  }

  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!shiftType) {
      toast.warning(tNotif('warningSelectShiftType'));
      return;
    }

    if (selectedDays.length === 0) {
      toast.warning(tNotif('warningSelectDays'));
      return;
    }

    if (!startTime || !endTime) {
      toast.warning(tNotif('warningSelectTime'));
      return;
    }

    const typeLabel = shiftType === 'MORNING' ? tCommon('morningShift') : tCommon('eveningShift');

    const orderedDays = [...selectedDays].sort((a, b) => {
      const da = dayOptions.find((d) => d.key === a)?.order ?? 0;
      const db = dayOptions.find((d) => d.key === b)?.order ?? 0;
      return da - db;
    });

    const dayLabel = orderedDays
      .map((key) => dayOptions.find((d) => d.key === key)?.label ?? '')
      .filter(Boolean)
      .join(', ');

    const timeLabel = `${startTime} - ${endTime}`;
    const name = `${typeLabel} - ${dayLabel} - ${timeLabel}`;

    try {
      setCreating(true);
      // Nếu đang chỉnh sửa thì gọi update, ngược lại gọi create
      if (editingShift) {
        await updateShiftMutation.mutateAsync({
          id: editingShift.id,
          data: { name, classId },
        });
      } else {
        await createShiftMutation.mutateAsync({ name, classId });
      }

      // Refresh list shifts ở component cha
      onRefresh();

      // reset form
      setShiftType('MORNING');
      setSelectedDays([]);
      setStartTime('');
      setEndTime('');
      setEditingShift(null);
      setOpen(false);
    } catch (error) {
      console.error('Error creating/updating class shift', error);
      toast.error(tNotif('errorSaveShift'));
    } finally {
      setCreating(false);
    }
  };

  const handleEditShift = (shift: ClassShiftType) => {
    // name format: "Ca sáng - T2, T4, T6 - 08:00 - 10:00"
    const parts = shift.name.split(' - ');

    // Loại ca
    const typeLabel = parts[0] || '';
    if (typeLabel.toLowerCase().includes('sáng')) {
      setShiftType('MORNING');
    } else if (typeLabel.toLowerCase().includes('tối')) {
      setShiftType('EVENING');
    } else {
      setShiftType('MORNING');
    }

    // Thứ trong tuần
    const daysLabel = parts[1] || '';
    if (daysLabel) {
      const labels = daysLabel.split(',').map((s) => s.trim());
      const keys = labels
        .map((label) => dayOptions.find((d) => d.label === label)?.key)
        .filter((k): k is string => !!k);
      setSelectedDays(keys);
    } else {
      setSelectedDays([]);
    }

    // Khung giờ
    // Với format hiện tại khi tạo: `${typeLabel} - ${dayLabel} - ${startTime} - ${endTime}`
    // => mảng parts: [typeLabel, dayLabel, startTime, endTime]
    const timeParts = parts.slice(-2); // lấy 2 phần cuối
    const timeRegex = /^\d{2}:\d{2}$/;

    if (timeParts.length === 2 && timeRegex.test(timeParts[0]) && timeRegex.test(timeParts[1])) {
      setStartTime(timeParts[0]);
      setEndTime(timeParts[1]);
    } else {
      setStartTime('');
      setEndTime('');
    }

    setEditingShift(shift);
    setOpen(true);
  };

  const handleDeleteShift = async (shiftId: string) => {
    try {
      await deleteShiftMutation.mutateAsync(shiftId);

      // Refresh list shifts ở component cha
      onRefresh();

      // Xóa cache học sinh của ca đó trên FE (backend đã set classShift = null)
      queryClient.removeQueries({ queryKey: queryKeys.students.byClassShift(shiftId) });

        // Nếu ca đang mở là ca vừa xóa thì đóng lại
        if (openShiftId === shiftId) {
          setOpenShiftId(null);
      }
    } catch (error) {
      console.error('Error deleting class shift', error);
      toast.error(tNotif('errorDeleteShiftFail'));
    }
  };

  return (
    <>
      <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Clock className="size-5 md:size-6 text-blue-600 dark:text-blue-400" />
            {tCommon('shiftsTitle')}
          </CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              {tCommon('shiftsDescription')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={onRefresh}
              disabled={isLoading}
              title={tCommon('refreshShifts')}
            >
              <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              onClick={() => {
                setEditingShift(null);
                setShiftType('MORNING');
                setSelectedDays([]);
                setStartTime('');
                setEndTime('');
                setOpen(true);
              }}
            >
              <Plus className="size-4 mr-1" />
              {tCommon('addShift')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Danh sách ca học (collapse + danh sách học sinh) */}
          <div className="space-y-2">
            {isLoading ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">{tCommon('loadingShifts')}</p>
            ) : shifts.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {tCommon('noShifts')}
              </p>
            ) : (
              <ul className="space-y-2">
                {shifts.map((shift) => (
                  <ShiftItem
                    key={shift.id}
                    shift={shift}
                    isOpen={openShiftId === shift.id}
                    onOpenChange={(isOpen) => {
                      setOpenShiftId(isOpen ? shift.id : (openShiftId === shift.id ? null : openShiftId));
                    }}
                    onEdit={handleEditShift}
                    onDelete={(shiftId) => setConfirmDeleteShiftId(shiftId)}
                  />
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog tạo / sửa ca học */}
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) {
            setEditingShift(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingShift ? tCommon('updateShift') : tCommon('createShift')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateShift} className="space-y-4">
            {/* Loại ca */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{tCommon('shiftType')}</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={shiftType === 'MORNING' ? 'default' : 'outline'}
                  onClick={() => setShiftType('MORNING')}
                  className="flex-1"
                >
                  {tCommon('morningShift')}
                </Button>
                <Button
                  type="button"
                  variant={shiftType === 'EVENING' ? 'default' : 'outline'}
                  onClick={() => setShiftType('EVENING')}
                  className="flex-1"
                >
                  {tCommon('eveningShift')}
                </Button>
              </div>
            </div>

            {/* Chọn thứ */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{tCommon('selectDays')}</p>
              <div className="flex flex-wrap gap-2">
                {dayOptions.map((day) => {
                  const isSelected = selectedDays.includes(day.key);
                  return (
                    <Button
                      key={day.key}
                      type="button"
                      size="sm"
                      variant={isSelected ? 'default' : 'outline'}
                      className="px-3"
                      onClick={() => {
                        setSelectedDays((prev) =>
                          prev.includes(day.key)
                            ? prev.filter((k) => k !== day.key)
                            : [...prev, day.key],
                        );
                      }}
                    >
                      {day.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Thời gian */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{tCommon('timeRange')}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400">{tCommon('startTime')}</p>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400">{tCommon('endTime')}</p>
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {tCommon('cancel')}
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? tCommon('saving') : tCommon('saveShift')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {confirmDeleteShiftId && (
        <ConfirmDialog
          open={!!confirmDeleteShiftId}
          title={tNotif('confirmDeleteShift')}
          confirmText={tCommon('confirmRemove')}
          cancelText={tCommon('cancel')}
          variant="destructive"
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setConfirmDeleteShiftId(null);
            }
          }}
          onConfirm={async () => {
            if (!confirmDeleteShiftId) return;
            await handleDeleteShift(confirmDeleteShiftId);
            setConfirmDeleteShiftId(null);
          }}
        />
      )}

    </>
  );
}


