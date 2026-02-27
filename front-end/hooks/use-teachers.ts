import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { queryKeys } from '@/lib/queryKeys';
import {
  invalidateClassLists,
  invalidateClassesByTeacher,
  invalidateDashboard,
  invalidateTeacher,
  invalidateTeacherLists,
} from '@/lib/queryHelpers';
import { teacherService } from '@/services/teacher-service';
import { TeacherRequest, TeacherType, PageResponse } from '@/types';
import { ClassType } from '@/types/class-type';
import { useDebounce } from './use-debounce';

/**
 * Hook để lấy tất cả teachers với pagination và filtering
 * Hỗ trợ cả infinite scroll và paginated query:
 * - Nếu không truyền page/size → dùng useInfiniteQuery (infinite scroll)
 * - Nếu truyền page/size → dùng useQuery (paginated query cho DataTable)
 * 
 * LƯU Ý: Phải gọi cả 2 hooks (useQuery và useInfiniteQuery) để tuân thủ React Hooks Rules:
 * - React Hooks phải được gọi trong cùng một thứ tự ở mọi lần render
 * - Không thể gọi hooks có điều kiện (if/else)
 * - Giải pháp: gọi cả 2 hooks nhưng chỉ enable một trong hai bằng `enabled` option
 * 
 * @param search Search term (debounced automatically)
 * @param filters Object containing optional filters (gender, status)
 * @param page Optional page number (0-based). Nếu có → dùng paginated query
 * @param size Optional page size. Nếu có → dùng paginated query
 * @returns Infinite query result (nếu không có page/size) hoặc Query result (nếu có page/size)
 */
export function useTeachers(
  search: string = '',
  filters: {
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    status?: 'ACTIVE' | 'DELETED' | 'BLOCKED';
  } = {},
  page?: number,
  size?: number,
) {
  const debouncedSearch = useDebounce(search, 500);
  
  const usePaginated = typeof page === 'number' && typeof size === 'number';
  
  // PHẢI gọi cả 2 hooks để tuân thủ React Hooks Rules
  // Hook bị disabled sẽ không thực thi query, chỉ tốn một chút memory cho state
  const paginatedQuery = useQuery<PageResponse<TeacherType>>({
    queryKey: queryKeys.teachers.listPaginated(debouncedSearch, { ...filters, page, size }),
    queryFn: async () => {
      const response = await teacherService.getAllTeachers(
        page!,
        size!,
        debouncedSearch,
        filters,
      );
      if (response.status === 200 && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch teachers');
    },
    enabled: usePaginated, // Chỉ chạy khi usePaginated = true
  });
  
  const infiniteQuery = useInfiniteQuery<PageResponse<TeacherType>>({
    queryKey: queryKeys.teachers.listPaginated(debouncedSearch, filters),
    queryFn: async ({ pageParam = 0 }) => {
      const response = await teacherService.getAllTeachers(
        pageParam as number,
        10,
        debouncedSearch,
        filters
      );
      if (response.status === 200 && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch teachers');
    },
    getNextPageParam: (lastPage) => lastPage.hasNext ? lastPage.page + 1 : undefined,
    initialPageParam: 0,
    enabled: !usePaginated, // Chỉ chạy khi usePaginated = false
  });
  
  // Return query tương ứng với mode được chọn
  return usePaginated ? paginatedQuery : infiniteQuery;
}

/**
 * Hook để lấy tất cả teachers đơn giản (cho dropdowns/selects)
 * Backward compatibility cho components cần list teachers
 */
export function useTeachersSimple({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery<TeacherType[]>({
    queryKey: queryKeys.teachers.list(),
    queryFn: async () => {
      const response = await teacherService.getAllTeachersSimple();
      if (response.status === 200 && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch teachers');
    },
    enabled: enabled,
  });
}

/**
 * Hook để lấy teacher theo ID
 */
export function useTeacher(teacherId: string) {
  return useQuery<TeacherType>({
    queryKey: queryKeys.teachers.detail(teacherId),
    queryFn: async () => {
      const response = await teacherService.getTeacherById(teacherId);
      if (response.status === 200 && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch teacher');
    },
    enabled: !!teacherId,
  });
}

/**
 * Hook để tạo teacher mới
 */
export function useCreateTeacher() {
  const queryClient = useQueryClient();
  const tNotif = useTranslations('notifications');

  return useMutation({
    mutationFn: (data: TeacherRequest) => teacherService.createTeacher(data),
    onSuccess: (response) => {
      if (response.status === 201 && response.data) {
        invalidateTeacherLists(queryClient);
        invalidateDashboard(queryClient);
        toast.success(tNotif('successCreateTeacher'));
      }
    },
    onError: (error) => {
      console.error('Error creating teacher:', error);
      toast.error(tNotif('errorCreateTeacher'));
    },
  });
}

/**
 * Hook để cập nhật teacher
 */
export function useUpdateTeacher() {
  const queryClient = useQueryClient();
  const tNotif = useTranslations('notifications');

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TeacherRequest }) =>
      teacherService.updateTeacher(id, data),
    onSuccess: (response, variables) => {
      if (response.status === 200 && response.data) {
        invalidateTeacherLists(queryClient);
        invalidateTeacher(queryClient, variables.id);
        // Classes lists can depend on teacher name/etc.
        invalidateClassesByTeacher(queryClient, variables.id);
        invalidateClassLists(queryClient);
        invalidateDashboard(queryClient);
        toast.success(tNotif('successUpdateTeacher'));
      }
    },
    onError: (error) => {
      console.error('Error updating teacher:', error);
      toast.error(tNotif('errorUpdateTeacher'));
    },
  });
}

/**
 * Hook để reset password teacher
 */
export function useResetTeacherPassword() {
  const tNotif = useTranslations('notifications');

  return useMutation({
    mutationFn: (teacherId: string) => teacherService.resetPassword(teacherId),
    onSuccess: (response) => {
      if (response.status === 200) {
        toast.success(tNotif('successResetPassword'));
      }
    },
    onError: (error) => {
      console.error('Error resetting password:', error);
      toast.error(tNotif('errorResetPassword'));
    },
  });
}

/**
 * Hook để xoá (mềm) teacher
 */
export function useDeleteTeacher() {
  const queryClient = useQueryClient();
  const tNotif = useTranslations('notifications');

  return useMutation({
    mutationFn: (teacherId: string) => teacherService.deleteTeacher(teacherId),
    onSuccess: (response, teacherId) => {
      if (response.status === 204 || response.status === 200) {
        invalidateTeacherLists(queryClient);
        invalidateTeacher(queryClient, teacherId);
        invalidateClassesByTeacher(queryClient, teacherId);
        invalidateClassLists(queryClient);
        invalidateDashboard(queryClient);
        toast.success(tNotif('successDeleteTeacher'));
      }
    },
    onError: (error) => {
      console.error('Error deleting teacher:', error);
      toast.error(tNotif('errorDeleteTeacher'));
    },
  });
}

/**
 * Hook để khôi phục teacher đã bị xoá
 */
export function useRestoreTeacher() {
  const queryClient = useQueryClient();
  const tNotif = useTranslations('notifications');

  return useMutation({
    mutationFn: async (teacherId: string) => {
      const response = await teacherService.restoreTeacher(teacherId);
      if (response.status !== 200 || !response.data) {
        throw new Error('Failed to restore teacher');
      }
      return response.data;
    },
    onSuccess: (teacher, teacherId) => {
      // Invalidate teacher detail & lists
      invalidateTeacher(queryClient, teacherId);
      invalidateTeacherLists(queryClient);
      invalidateDashboard(queryClient);

      // Invalidate class-related data if teacher has classes
      if (teacher.classList && teacher.classList.length > 0) {
        invalidateClassesByTeacher(queryClient, teacherId);
        invalidateClassLists(queryClient);
      }

      toast.success(tNotif('successRestoreTeacher'));
    },
    onError: (error) => {
      console.error('Error restoring teacher:', error);
      toast.error(tNotif('errorRestoreTeacher'));
    },
  });
}

/**
 * Hook để lấy classes của teacher
 */
export function useTeacherClasses(teacherId: string, enabled: boolean = true) {
  return useQuery<ClassType[]>({
    queryKey: queryKeys.teachers.classes(teacherId),
    queryFn: async () => {
      const response = await teacherService.getTeacherClasses(teacherId);
      if (response.status === 200 && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch teacher classes');
    },
    enabled: enabled && !!teacherId,
  });
}

/**
 * Hook để lấy unassigned classes
 */
export function useUnassignedClasses(enabled: boolean = true) {
  return useQuery<ClassType[]>({
    queryKey: ['unassigned-classes'],
    queryFn: async () => {
      const response = await teacherService.getUnassignedClasses();
      if (response.status === 200 && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch unassigned classes');
    },
    enabled: enabled,
  });
}

/**
 * Hook để assign classes cho teacher
 */
export function useAssignClassesToTeacher() {
  const queryClient = useQueryClient();
  const tNotif = useTranslations('notifications');

  return useMutation({
    mutationFn: async ({ teacherId, classIds }: { teacherId: string; classIds: string[] }) => {
      const response = await teacherService.assignClassesToTeacher(teacherId, classIds);
      if (response.status !== 200 || !response.data) {
        throw new Error('Failed to assign classes');
      }
      return response.data;
    },
    onSuccess: (classes, variables) => {
      // Invalidate teacher classes
      queryClient.invalidateQueries({ queryKey: queryKeys.teachers.classes(variables.teacherId) });
      // Invalidate unassigned classes
      queryClient.invalidateQueries({ queryKey: ['unassigned-classes'] });
      // Invalidate teacher lists
      invalidateTeacherLists(queryClient);
      // Invalidate teacher detail
      invalidateTeacher(queryClient, variables.teacherId);
      // Invalidate class lists
      invalidateClassLists(queryClient);
      // Invalidate dashboard
      invalidateDashboard(queryClient);

      toast.success(tNotif('successAssignClasses'));
    },
    onError: (error) => {
      console.error('Error assigning classes:', error);
      toast.error(tNotif('errorAssignClasses'));
    },
  });
}