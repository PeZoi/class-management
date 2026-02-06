import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { attendanceService } from '@/services/attendance-service';
import { Attendance, CreateAttendanceData } from '@/types';
import { toast } from 'react-toastify';

/**
 * Hook để lấy attendance theo studentId và classId
 */
export function useAttendanceByStudent(studentId: string, classId?: string) {
  return useQuery<Attendance[]>({
    queryKey: queryKeys.attendance.byStudent(studentId, classId),
    queryFn: async () => {
      if (!classId) {
        return [];
      }
      const response = await attendanceService.getAttendanceByStudent(studentId, classId);
      if (response.status === 200 && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch attendance by student');
    },
    enabled: !!studentId && !!classId,
  });
}

/**
 * Hook để lấy attendance theo classId
 */
export function useAttendanceByClass(classId: string) {
  return useQuery<Attendance[]>({
    queryKey: queryKeys.attendance.byClass(classId),
    queryFn: async () => {
      const response = await attendanceService.getAttendanceByClass(classId);
      if (response.status === 200 && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch attendance by class');
    },
    enabled: !!classId,
  });
}

/**
 * Hook để tạo attendance record
 */
export function useCreateAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAttendanceData) => attendanceService.createAttendance(data),
    onSuccess: (response) => {
      if (response.status === 200 || response.status === 201) {
        toast.success('Điểm danh thành công');
        // Invalidate các queries liên quan
        queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
      }
    },
    onError: (error: Error) => {
      toast.error(`Điểm danh thất bại: ${error.message}`);
    },
  });
}

/**
 * Hook để tạo nhiều attendance records cùng lúc
 */
export function useCreateBulkAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dataList: CreateAttendanceData[]) => {
      const promises = dataList.map(data => attendanceService.createAttendance(data));
      return Promise.all(promises);
    },
    onSuccess: () => {
      toast.success('Điểm danh thành công');
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
    },
    onError: (error: Error) => {
      toast.error(`Điểm danh thất bại: ${error.message}`);
    },
  });
}

/**
 * Hook để update attendance record
 */
export function useUpdateAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateAttendanceData }) => 
      attendanceService.updateAttendance(id, { id, ...data }),
    onSuccess: () => {
      toast.success('Cập nhật điểm danh thành công');
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
    },
    onError: (error: Error) => {
      toast.error(`Cập nhật điểm danh thất bại: ${error.message}`);
    },
  });
}

/**
 * Hook để tạo hoặc cập nhật nhiều attendance records
 * Tự động phát hiện record đã tồn tại hay chưa
 */
export function useUpsertBulkAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      dataList, 
      existingRecords 
    }: { 
      dataList: CreateAttendanceData[]; 
      existingRecords: Attendance[] 
    }) => {
      // Tạo map để tra cứu nhanh existing records
      const existingMap = new Map(
        existingRecords.map(record => [record.studentId, record])
      );

      const promises = dataList.map(data => {
        const existingRecord = existingMap.get(data.studentId);
        
        if (existingRecord) {
          // Update nếu đã tồn tại
          return attendanceService.updateAttendance(existingRecord.id, {
            id: existingRecord.id,
            ...data
          });
        } else {
          // Create mới nếu chưa tồn tại
          return attendanceService.createAttendance(data);
        }
      });

      return Promise.all(promises);
    },
    onSuccess: (_, variables) => {
      const hasExisting = variables.existingRecords.length > 0;
      toast.success(hasExisting ? 'Cập nhật điểm danh thành công' : 'Điểm danh thành công');
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
    },
    onError: (error: Error) => {
      toast.error(`Thao tác thất bại: ${error.message}`);
    },
  });
}

