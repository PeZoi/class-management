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

interface StudentClassInfoProps {
  student: StudentType;
  onUpdate?: () => void;
}

export function StudentClassInfo({ student, onUpdate }: StudentClassInfoProps) {
  const t = useTranslations('student-detail');
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
        toast.error('Không thể tải danh sách ca học');
        setShifts([]);
        setSelectedShiftId('NONE');
      } finally {
        setLoadingShifts(false);
      }
    };

    fetchShifts();
  }, [isDialogOpen, student.class?.id, student.class?.shiftId]);

  const handleUpdateShift = async () => {
    if (!student.class?.id || !student.id) {
      toast.error('Thông tin không hợp lệ');
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
        toast.success('Cập nhật ca học thành công');
        setIsDialogOpen(false);
        if (onUpdate) {
          onUpdate();
        }
      } else {
        toast.error('Cập nhật ca học thất bại');
      }
    } catch (error) {
      console.error('Error updating student shift:', error);
      toast.error('Cập nhật ca học thất bại');
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
                    <span className="text-sm text-slate-500 dark:text-slate-400">Ca học:</span>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {student.class.shiftName}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsDialogOpen(true)}
                    className="h-7 px-2 text-xs"
                  >
                    <Edit className="size-3 mr-1" />
                    Cập nhật
                  </Button>
                </div>
              )}
              {!student.class.shiftName && student.class.id && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Chưa có ca học</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsDialogOpen(true)}
                    className="h-7 px-2 text-xs"
                  >
                    <Edit className="size-3 mr-1" />
                    Thêm ca học
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
            <DialogTitle>Cập nhật ca học</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="shift">Chọn ca học</Label>
              {loadingShifts ? (
                <div className="flex items-center justify-center py-4">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Đang tải danh sách ca học...</p>
                </div>
              ) : (
                <>
                  <Select value={selectedShiftId} onValueChange={setSelectedShiftId} disabled={updating}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn ca học" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">Không có ca học</SelectItem>
                      {shifts.map((shift) => (
                        <SelectItem key={shift.id} value={shift.id}>
                          {shift.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {shifts.length === 0 && !loadingShifts && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Lớp học này chưa có ca học nào
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={updating}
            >
              Hủy
            </Button>
            <Button type="button" onClick={handleUpdateShift} disabled={updating || loadingShifts}>
              {updating ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
