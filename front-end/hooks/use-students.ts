import {
  invalidateDashboard,
  invalidateStudent,
  invalidateStudentClassHistory,
  invalidateStudentLists,
  invalidateStudentsByClass,
  invalidateStudentsByClassShift,
  invalidateClass,
  invalidateClassLists
} from '@/lib/queryHelpers';
import { queryKeys } from '@/lib/queryKeys';
import { studentService } from '@/services/student-service';
import { ClassHistoryResponse, StudentRequest, StudentType, PageResponse } from '@/types';
import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';
import { useDebounce } from './use-debounce';

/**
 * Hook để lấy tất cả students với pagination, filtering và infinite scroll
 * Sử dụng useInfiniteQuery để load thêm data khi scroll
 * 
 * @param search Search term (debounced automatically)
 * @param filters Object containing optional filters (gender, status, classId)
 * @returns Infinite query result với pages data
 */
export function useStudents(
  search: string = '',
  filters: {
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    status?: 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'DELETED';
    classId?: string;
  } = {}
) {
  const debouncedSearch = useDebounce(search, 500);
  
  return useInfiniteQuery<PageResponse<StudentType>>({
    queryKey: queryKeys.students.listPaginated(debouncedSearch, filters),
    queryFn: async ({ pageParam = 0 }) => {
      const response = await studentService.getStudents(
        pageParam as number, 
        10, 
        debouncedSearch,
        filters
      );
      if (response.status === 200 && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch students');
    },
    getNextPageParam: (lastPage) => lastPage.hasNext ? lastPage.page + 1 : undefined,
    initialPageParam: 0,
  });
}

/**
 * Hook để lấy student theo ID
 */
export function useStudent(studentId: string) {
  return useQuery<StudentType>({
    queryKey: queryKeys.students.detail(studentId),
    queryFn: async () => {
      const response = await studentService.getStudentById(studentId);
      if (response.status === 200 && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch student');
    },
    enabled: !!studentId,
  });
}

/**
 * Hook để lấy students theo class ID
 */
export function useStudentsByClass(classId: string) {
  return useQuery<StudentType[]>({
    queryKey: queryKeys.students.byClass(classId),
    queryFn: async () => {
      const response = await studentService.getStudentsByClass(classId);
      if (response.status === 200 && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch students by class');
    },
    enabled: !!classId,
  });
}

/**
 * Hook để lấy students theo class shift ID
 */
export function useStudentsByClassShift(
  classShiftId: string,
  options?: { enabled?: boolean }
) {
  return useQuery<StudentType[]>({
    queryKey: queryKeys.students.byClassShift(classShiftId),
    queryFn: async () => {
      const response = await studentService.getStudentsByClassShift(classShiftId);
      if (response.status === 200 && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch students by class shift');
    },
    enabled: options?.enabled !== undefined ? options.enabled : !!classShiftId,
  });
}

/**
 * Hook để lấy class history của student
 */
export function useStudentClassHistory(studentId: string) {
  return useQuery<ClassHistoryResponse[]>({
    queryKey: queryKeys.students.classHistory(studentId),
    queryFn: async () => {
      const response = await studentService.getClassHistory(studentId);
      if (response.status === 200 && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch student class history');
    },
    enabled: !!studentId,
  });
}

/**
 * Hook để tạo student mới
 */
export function useCreateStudent() {
  const queryClient = useQueryClient();
  const tNotif = useTranslations('notifications');

  return useMutation({
    mutationFn: (data: StudentRequest) => studentService.createStudent(data),
    onSuccess: (response, variables) => {
      if (response.status === 201 && response.data) {
        // Invalidate student lists và các queries liên quan
        invalidateStudentLists(queryClient);
        invalidateDashboard(queryClient);
        
        // Nếu có classId, invalidate students by class
        if (variables.classId) {
          invalidateStudentsByClass(queryClient, variables.classId);
        }
        
        toast.success(tNotif('successCreateStudent'));
      }
    },
    onError: (error) => {
      console.error('Error creating student:', error);
      toast.error(tNotif('errorCreateStudent'));
    },
  });
}

/**
 * Hook để cập nhật student
 */
export function useUpdateStudent() {
  const queryClient = useQueryClient();
  const tNotif = useTranslations('notifications');

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: StudentRequest }) =>
      studentService.updateStudent(data, id),
    onSuccess: (response, variables) => {
      if (response.status === 200 && response.data) {
        // Invalidate student queries
        invalidateStudentLists(queryClient);
        invalidateStudent(queryClient, variables.id);
        invalidateDashboard(queryClient);
        
        // Invalidate students by class (old và new class)
        if (variables.data.classId) {
          invalidateStudentsByClass(queryClient, variables.data.classId);
        }
        
        // Invalidate class history
        invalidateStudentClassHistory(queryClient, variables.id);
        
        toast.success(tNotif('successUpdateStudent'));
      }
    },
    onError: (error) => {
      console.error('Error updating student:', error);
      toast.error(tNotif('errorUpdateStudent'));
    },
  });
}

/**
 * Hook để update ca học (classShift) cho 1 học viên
 * - Invalidate student detail + lists + students-by-class (+ students-by-shift) + dashboard
 */
export function useUpdateStudentShift() {
  const queryClient = useQueryClient();
  const tNotif = useTranslations('notifications');

  return useMutation({
    mutationFn: async (params: {
      studentId: string;
      classId: string;
      classShiftId?: string;
      prevClassShiftId?: string;
    }) => {
      const response = await studentService.updateStudentShift({
        studentId: params.studentId,
        classId: params.classId,
        classShiftId: params.classShiftId,
      });

      if (response.status !== 200 || !response.data) {
        throw new Error('Failed to update student shift');
      }
      return response.data;
    },
    onSuccess: async (_student, variables) => {
      toast.success(tNotif('successUpdateShiftDialog'));

      invalidateStudent(queryClient, variables.studentId);
      invalidateStudentLists(queryClient);
      invalidateStudentsByClass(queryClient, variables.classId);
      invalidateDashboard(queryClient);

      // If there are "students by shift" views, refresh both old & new shift lists
      if (variables.prevClassShiftId) {
        invalidateStudentsByClassShift(queryClient, variables.prevClassShiftId);
      }
      if (variables.classShiftId) {
        invalidateStudentsByClassShift(queryClient, variables.classShiftId);
      }

      // Safe: make sure any derived student views refresh
      await queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
    },
    onError: (error) => {
      console.error('Error updating student shift:', error);
      toast.error(tNotif('errorUpdateShift'));
    },
  });
}

/**
 * Hook để update ca học (classShift) cho nhiều học viên trong cùng 1 lớp
 * - Dùng TanStack mutation để dễ quản lý loading/error
 * - Sau khi update xong sẽ invalidate các query liên quan để UI tự refresh
 */
export function useBulkUpdateStudentShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      classId: string;
      studentIds: string[];
      classShiftId?: string;
    }) => {
      const { classId, studentIds, classShiftId } = params;
      const response = await studentService.bulkUpdateStudentShift({
        classId,
        studentIds,
        classShiftId,
      });

      if (response.status !== 200) {
        throw new Error('Failed to bulk update student shift');
      }

      return {
        successCount: studentIds.length,
        errorCount: 0,
        failedIds: [] as string[],
      };
    },
    onSuccess: async (_result, variables) => {
      // Invalidate tối thiểu những thứ liên quan để refresh UI đúng chỗ
      // 1) Danh sách học viên theo lớp (class detail)
      invalidateStudentsByClass(queryClient, variables.classId);
      // 2) Danh sách học viên tổng (student management) + các list khác
      invalidateStudentLists(queryClient);
      // 3) Dashboard (stats + unpaid list phụ thuộc payment statuses)
      invalidateDashboard(queryClient);

      // 4) Chi tiết từng học viên (nếu có trang detail đang mở ở tab khác)
      await Promise.all(
        variables.studentIds.map(async (id) => {
          invalidateStudent(queryClient, id);
          invalidateStudentClassHistory(queryClient, id);
        }),
      );

      // 5) An toàn: invalidate tất cả student queries để đảm bảo các view theo shift refresh
      await queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
    },
  });
}

/**
 * Hook để remove nhiều học viên khỏi lớp (set classId = '' và classShiftId = undefined)
 * - Dùng TanStack mutation để quản lý loading/error
 * - Sau khi update xong sẽ invalidate các query liên quan để UI tự refresh
 */
export function useBulkRemoveStudentsFromClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { classId: string; studentIds: string[] }) => {
      const { classId, studentIds } = params;

      const response = await studentService.removeStudentsFromClass({
        classId,
        studentIds,
      });

      if (response.status !== 200) {
        throw new Error('Failed to remove students from class');
      }

      return {
        successCount: studentIds.length,
        errorCount: 0,
        failedIds: [] as string[],
      };
    },
    onSuccess: async (_result, variables) => {
      // Refresh đúng các view liên quan
      invalidateStudentsByClass(queryClient, variables.classId);
      invalidateStudentLists(queryClient);
      invalidateDashboard(queryClient);

      // Class info (student count, etc.)
      invalidateClass(queryClient, variables.classId);
      invalidateClassLists(queryClient);

      // Student detail + history
      await Promise.all(
        variables.studentIds.map(async (id) => {
          invalidateStudent(queryClient, id);
          invalidateStudentClassHistory(queryClient, id);
        }),
      );

      // Safe: invalidate all students queries
      await queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
    },
  });
}

/**
 * Hook để xóa students (soft delete) - hỗ trợ xóa nhiều học viên cùng lúc
 * - Set status = DELETED, deletedAt và deletedBy
 * - Invalidate tất cả queries liên quan
 * @param studentIds Array of student IDs hoặc single student ID (sẽ tự convert sang array)
 */
export function useDeleteStudents() {
  const queryClient = useQueryClient();
  const tNotif = useTranslations('notifications');

  return useMutation({
    mutationFn: (studentIds: string | string[]) => {
      // Support both single ID and array of IDs
      const ids = Array.isArray(studentIds) ? studentIds : [studentIds];
      return studentService.deleteStudents(ids);
    },
    onSuccess: (response, studentIds) => {
      if (response.status === 200 && response.data) {
        const ids = Array.isArray(studentIds) ? studentIds : [studentIds];
        const count = ids.length;
        
        // Invalidate all student queries
        invalidateStudentLists(queryClient);
        invalidateDashboard(queryClient);
        
        // Invalidate each student's queries
        const classIds = new Set<string>();
        ids.forEach((id) => {
          invalidateStudent(queryClient, id);
          invalidateStudentClassHistory(queryClient, id);
        });
        
        // Collect unique class IDs and invalidate
        response.data.forEach((student) => {
          if (student.class?.id) {
            classIds.add(student.class.id);
          }
        });
        
        classIds.forEach((classId) => {
          invalidateStudentsByClass(queryClient, classId);
          invalidateClass(queryClient, classId);
        });
        
        // Safe: invalidate all student queries
        queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
        
        // Show success message with count
        const message = count === 1 
          ? tNotif('successDeleteStudent')
          : tNotif('successDeleteStudents', { count });
        toast.success(message);
      }
    },
    onError: (error) => {
      console.error('Error deleting students:', error);
      toast.error(tNotif('errorDeleteStudent'));
    },
  });
}

/**
 * Hook để khôi phục 1 học viên (từ DELETED -> INACTIVE)
 * - Invalidate tất cả queries liên quan
 */
export function useRestoreStudent() {
  const queryClient = useQueryClient();
  const tNotif = useTranslations('notifications');

  return useMutation({
    mutationFn: async (studentId: string) => {
      const response = await studentService.restoreStudent(studentId);
      if (response.status !== 200 || !response.data) {
        throw new Error('Failed to restore student');
      }
      return response.data;
    },
    onSuccess: (student, studentId) => {
      // Invalidate student detail & lists
      invalidateStudent(queryClient, studentId);
      invalidateStudentLists(queryClient);
      invalidateDashboard(queryClient);

      // Invalidate class-related data nếu học viên vẫn còn class
      if (student.class?.id) {
        invalidateStudentsByClass(queryClient, student.class.id);
        invalidateClass(queryClient, student.class.id);
      }

      toast.success(tNotif('successRestoreStudent'));
    },
    onError: (error) => {
      console.error('Error restoring student:', error);
      toast.error(tNotif('errorRestoreStudent'));
    },
  });
}
