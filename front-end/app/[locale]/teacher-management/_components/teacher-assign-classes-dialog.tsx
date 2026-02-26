'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ClassType, ClassShiftType } from '@/types/class-type';
import { TeacherType } from '@/types';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { BookOpen, Clock, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/utils/helper';
import { Badge } from '@/components/ui/badge';
import { useTeacherClasses, useUnassignedClasses } from '@/hooks/use-teachers';

interface TeacherAssignClassesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: TeacherType | null;
  onSave: (teacherId: string, classIds: string[]) => void;
  isSubmitting?: boolean;
}

export function TeacherAssignClassesDialog({
  open,
  onOpenChange,
  teacher,
  onSave,
  isSubmitting,
}: TeacherAssignClassesDialogProps) {
  const t = useTranslations('teacher-management');
  const tCommon = useTranslations('common');

  // Lưu các override so với danh sách lớp hiện tại của teacher:
  // - không có entry: dùng mặc định (đang dạy hoặc chưa dạy)
  // - true: luôn được chọn
  // - false: luôn bỏ chọn
  const [selectionOverrides, setSelectionOverrides] = useState<Map<string, boolean>>(new Map());

  const teacherId = teacher?.id as string | undefined;

  // TanStack Query: fetch classes của teacher
  const {
    data: currentClasses = [],
    isLoading: isLoadingCurrent,
  } = useTeacherClasses(teacherId || '', open && !!teacherId);

  const {
    data: unassignedClasses = [],
    isLoading: isLoadingUnassigned,
  } = useUnassignedClasses(open);

  const isLoading = isLoadingCurrent || isLoadingUnassigned;

  // Tập ID các lớp mà teacher đang dạy (base selection)
  const baseSelectedIds = useMemo(
    () => new Set(currentClasses.map((c) => c.id)),
    [currentClasses],
  );

  const isClassSelected = (classId: string) => {
    const override = selectionOverrides.get(classId);
    if (override !== undefined) return override;
    return baseSelectedIds.has(classId);
  };

  const getFinalSelectedIds = () => {
    const ids: string[] = [];
    const seen = new Set<string>();

    [...currentClasses, ...unassignedClasses].forEach((c) => {
      if (seen.has(c.id)) return;
      seen.add(c.id);
      if (isClassSelected(c.id)) {
        ids.push(c.id);
      }
    });

    return ids;
  };

  const handleToggleClass = (classId: string) => {
    setSelectionOverrides((prev) => {
      const next = new Map(prev);
      const baseSelected = baseSelectedIds.has(classId);
      const current = next.has(classId) ? !!next.get(classId) : baseSelected;
      const newSelected = !current;

      // Nếu quay lại giống với base thì không cần override
      if (newSelected === baseSelected) {
        next.delete(classId);
      } else {
        next.set(classId, newSelected);
      }

      return next;
    });
  };

  const handleSelectAll = (classes: ClassType[]) => {
    setSelectionOverrides((prev) => {
      const next = new Map(prev);
      classes.forEach((c) => {
        const id = c.id;
        const baseSelected = baseSelectedIds.has(id);
        // Muốn chắc chắn lớp này được chọn
        if (!baseSelected) {
          next.set(id, true);
        } else {
          // Đã được chọn từ base, không cần override
          next.delete(id);
        }
      });
      return next;
    });
  };

  const handleDeselectAll = (classes: ClassType[]) => {
    setSelectionOverrides((prev) => {
      const next = new Map(prev);
      classes.forEach((c) => {
        const id = c.id;
        const baseSelected = baseSelectedIds.has(id);
        // Muốn chắc chắn lớp này bị bỏ chọn
        if (baseSelected) {
          next.set(id, false);
        } else {
          // Nếu base vốn đã không chọn, bỏ override (nếu có)
          next.delete(id);
        }
      });
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (teacher) {
      onSave(teacher.id as string, getFinalSelectedIds());
    }
  };

  const renderClassItem = (classItem: ClassType, isCurrent: boolean) => {
    const isSelected = isClassSelected(classItem.id);
    const shifts = classItem.classShifts || [];

    return (
      <div
        key={classItem.id}
        className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
          isSelected
            ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
            : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900'
        }`}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => handleToggleClass(classItem.id)}
          className="mt-1"
        />
        {/* Click vùng nội dung để toggle checkbox */}
        <div
          className="flex-1 min-w-0"
          onClick={() => handleToggleClass(classItem.id)}
        >
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="size-4 text-slate-500" />
            <span className="font-semibold text-slate-900 dark:text-slate-100">{classItem.name}</span>
            {isCurrent && (
              <Badge variant="outline" className="text-xs">
                {t('currentClass')}
              </Badge>
            )}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
            {t('monthlyFee')}: {formatCurrency(classItem.monthlyFee)} • {t('students')}: {classItem.studentCount}
          </div>
          {shifts.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {shifts.map((shift: ClassShiftType) => (
                <div
                  key={shift.id}
                  className="flex items-center gap-1 px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded text-xs"
                >
                  <Clock className="size-3" />
                  <span>{shift.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!teacher) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{t('assignClasses')}</DialogTitle>
          <DialogDescription>
            {t('assignClassesDescription', { teacherName: teacher.fullName })}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin text-slate-500" />
            <span className="ml-2 text-sm text-slate-500">{tCommon('loading')}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-6">
                {/* Current Classes Section */}
                {currentClasses.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {t('currentClasses')}
                      </h3>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleSelectAll(currentClasses)}
                        >
                          {t('selectAll')}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeselectAll(currentClasses)}
                        >
                          {t('deselectAll')}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {currentClasses.map((classItem) => renderClassItem(classItem, true))}
                    </div>
                  </div>
                )}

                {/* Unassigned Classes Section */}
                {unassignedClasses.length > 0 && (
                  <div>
                    {currentClasses.length > 0 && <Separator className="my-4" />}
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {t('unassignedClasses')}
                      </h3>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleSelectAll(unassignedClasses)}
                        >
                          {t('selectAll')}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeselectAll(unassignedClasses)}
                        >
                          {t('deselectAll')}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {unassignedClasses.map((classItem) => renderClassItem(classItem, false))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {currentClasses.length === 0 && unassignedClasses.length === 0 && (
                  <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                    <BookOpen className="size-12 mx-auto mb-4 opacity-50" />
                    <p>{t('noClassesAvailable')}</p>
                  </div>
                )}
              </div>
            </ScrollArea>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {tCommon('cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    {tCommon('saving')}
                  </>
                ) : (
                  t('saveAssignments')
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

