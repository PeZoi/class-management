'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Clock, Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useClassShiftsByClass, useCreateClassShift, useUpdateClassShift, useDeleteClassShift } from '@/hooks/use-classes';
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { ClassShiftType } from '@/types/class-type';

interface ClassroomScheduleInfoProps {
  classId: string;
}

export function ClassroomScheduleInfo({ classId }: ClassroomScheduleInfoProps) {
  const t = useTranslations('classroom-detail');
  const tCommon = useTranslations('common');
  const tNotif = useTranslations('notifications');
  
  const { data: shifts = [], isLoading: loading } = useClassShiftsByClass(classId);
  const createShiftMutation = useCreateClassShift();
  const updateShiftMutation = useUpdateClassShift();
  const deleteShiftMutation = useDeleteClassShift();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<ClassShiftType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
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

  const handleOpenCreateDialog = () => {
    setEditingShift(null);
    setShiftType('MORNING');
    setSelectedDays([]);
    setStartTime('');
    setEndTime('');
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (shift: ClassShiftType) => {
    // Parse shift name: "Ca sáng - T2, T4, T6 - 08:00 - 10:00"
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
    const timeParts = parts.slice(-2);
    const timeRegex = /^\d{2}:\d{2}$/;

    if (timeParts.length === 2 && timeRegex.test(timeParts[0]) && timeRegex.test(timeParts[1])) {
      setStartTime(timeParts[0]);
      setEndTime(timeParts[1]);
    } else {
      setStartTime('');
      setEndTime('');
    }

    setEditingShift(shift);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingShift(null);
    setShiftType('MORNING');
    setSelectedDays([]);
    setStartTime('');
    setEndTime('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      setIsSubmitting(true);
      
      if (editingShift) {
        await updateShiftMutation.mutateAsync({
          id: editingShift.id,
          data: { name, classId },
        });
      } else {
        await createShiftMutation.mutateAsync({ name, classId });
      }

      handleCloseDialog();
    } catch (error) {
      console.error('Error saving shift:', error);
      // Error toast is handled by the mutation hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (shiftId: string) => {
    if (!window.confirm(tNotif('confirmDeleteShift'))) {
      return;
    }

    try {
      await deleteShiftMutation.mutateAsync(shiftId);
      // Success toast is handled by the mutation hook
    } catch (error) {
      console.error('Error deleting shift:', error);
      // Error toast is handled by the mutation hook
    }
  };

  return (
    <>
      <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="size-5 text-purple-600 dark:text-purple-400" />
              {t('schedule')}
            </CardTitle>
            <Button
              onClick={handleOpenCreateDialog}
              size="sm"
              className="gap-2"
            >
              <Plus className="size-4" />
              {tCommon('addShift')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="size-6 animate-spin text-purple-500" />
                <p className="text-sm text-slate-500 dark:text-slate-400">{tCommon('loadingShifts')}</p>
              </div>
            </div>
          ) : shifts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-3 mb-3">
                <Clock className="size-6 text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{tCommon('noShift')}</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">{tCommon('noShiftsForClass')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {shifts.map((shift, index) => (
                <div
                  key={shift.id}
                  className="group relative flex items-center gap-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 p-3 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-200"
                >
                  {/* Left accent bar */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg bg-purple-500 group-hover:bg-purple-600 transition-colors" />
                  
                  {/* Number badge */}
                  <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-semibold text-sm group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                    {index + 1}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Clock className="size-4 text-purple-600 dark:text-purple-400 shrink-0" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                        {shift.name}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7 text-slate-500 hover:text-slate-800 dark:hover:text-slate-100"
                      onClick={() => handleOpenEditDialog(shift)}
                      type="button"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7 text-red-500 hover:text-red-700 dark:hover:text-red-400"
                      onClick={() => handleDelete(shift.id)}
                      type="button"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingShift ? tCommon('updateShift') : tCommon('createShift')}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                    required
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400">{tCommon('endTime')}</p>
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                {tCommon('cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? tCommon('saving') : tCommon('saveShift')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
