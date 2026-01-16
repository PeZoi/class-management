import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, BookOpen, Clock, Edit } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { StudentType } from '@/types/student-type';
import { formatDate } from '@/utils/helper';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { classShiftService, studentService } from '@/services';
import { ClassShiftType } from '@/types/class-type';
import { toast } from 'react-toastify';
import { Badge } from '@/components/ui/badge';

interface StudentClassInfoProps {
  student: StudentType;
  onUpdate?: () => void;
}

export function StudentClassInfo({ student, onUpdate }: StudentClassInfoProps) {
  const t = useTranslations('student-detail');
  const tNotif = useTranslations('notifications');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [shifts, setShifts] = useState<ClassShiftType[]>([]);
  const [selectedShiftId, setSelectedShiftId] = useState<string>('NONE');
  const [updating, setUpdating] = useState(false);
  const [loadingShifts, setLoadingShifts] = useState(false);

  // Fetch shifts when dialog opens
  useEffect(() => {
    const fetchShifts = async () => {
      if (!isDialogOpen || !student.class?.id) {
        setShifts([]);
        setSelectedShiftId('NONE');
        return;
      }

      setLoadingShifts(true);
      try {
        const response = await classShiftService.getByClassId(student.class.id);
        if (response.status === 200 && response.data) {
          setShifts(response.data);
          // Set current shift as selected, or 'NONE' if no shift
          setSelectedShiftId(student.class.shiftId || 'NONE');
        } else {
          setShifts([]);
          setSelectedShiftId('NONE');
        }
      } catch (error) {
        console.error('Error fetching class shifts:', error);
        toast.error(tNotif('errorLoadShifts'));
        setShifts([]);
        setSelectedShiftId('NONE');
      } finally {
        setLoadingShifts(false);
      }
    };

    fetchShifts();
  }, [isDialogOpen, student.class.id, student.class.shiftId, tNotif]);

  const handleUpdateShift = async () => {
    if (!student.class?.id || !student.id) {
      toast.error(tNotif('errorInvalidInfo'));
      return;
    }

    // Convert 'NONE' to undefined for API
    const shiftIdToUpdate = selectedShiftId === 'NONE' ? undefined : selectedShiftId;

    // If no change, just close dialog
    const currentShiftId = student.class.shiftId || undefined;
    if (shiftIdToUpdate === currentShiftId) {
      setIsDialogOpen(false);
      return;
    }

    setUpdating(true);
    try {
      const response = await studentService.updateStudentShift({
        studentId: student.id,
        classId: student.class.id,
        classShiftId: shiftIdToUpdate,
      });

      if (response.status === 200 && response.data) {
        toast.success(tNotif('successUpdateShiftDialog'));
        setIsDialogOpen(false);
        if (onUpdate) {
          onUpdate();
        }
      } else {
        toast.error(tNotif('errorUpdateShift'));
      }
    } catch (error) {
      console.error('Error updating student shift:', error);
      toast.error(tNotif('errorUpdateShift'));
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="size-5 text-green-600 dark:text-green-400" />
            {t('classInfo')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {student.class ? (
            <>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{t('className')}</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{student.class.name}</p>
              </div>
              {student.class.shiftName && (
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-slate-500" />
                    <span className="text-sm text-slate-500 dark:text-slate-400">{tCommon('shiftLabel')}</span>
                    <Badge
                      variant="outline"
                      className="text-xs font-medium px-2 py-0.5 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/30"
                    >
                      <Clock className="size-3 mr-1" />
                      {student.class.shiftName}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setIsDialogOpen(true)} className="h-7 px-2 text-xs">
                    <Edit className="size-3 mr-1" />
                    {tCommon('updateShift')}
                  </Button>
                </div>
              )}
              {!student.class.shiftName && student.class.id && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-slate-500 dark:text-slate-400">{tCommon('noShift')}</span>
                  <Button variant="ghost" size="sm" onClick={() => setIsDialogOpen(true)} className="h-7 px-2 text-xs">
                    <Edit className="size-3 mr-1" />
                    {tCommon('addShift')}
                  </Button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-slate-500" />
                <span className="text-sm text-slate-500 dark:text-slate-400">{t('joinedDate')}: </span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {student.class.joinAt ? formatDate(student.class.joinAt) : t('noData')}
                </span>
              </div>
              {student.class.id && (
                <Link href={`/${locale}/classroom-management/${student.class.id}`}>
                  <Button variant="outline" size="sm" className="mt-2">
                    {t('viewClass')}
                  </Button>
                </Link>
              )}
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('noClass')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Update Shift Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{tCommon('updateShift')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="shift">{tCommon('selectShift')}</Label>
              {loadingShifts ? (
                <div className="flex items-center justify-center py-4">
                  <p className="text-sm text-slate-500 dark:text-slate-400">{tCommon('loadingShifts')}</p>
                </div>
              ) : (
                <>
                  <Select value={selectedShiftId} onValueChange={setSelectedShiftId} disabled={updating}>
                    <SelectTrigger>
                      <SelectValue placeholder={tCommon('selectShiftPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">{tCommon('noShift')}</SelectItem>
                      {shifts.map((shift) => (
                        <SelectItem key={shift.id} value={shift.id}>
                          {shift.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {shifts.length === 0 && !loadingShifts && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{tCommon('noShiftsForClass')}</p>
                  )}
                </>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={updating}>
              {tCommon('cancel')}
            </Button>
            <Button type="button" onClick={handleUpdateShift} disabled={updating || loadingShifts}>
              {updating ? tCommon('updating') : tCommon('update')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
