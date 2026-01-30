import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import { TeacherRequest, TeacherType } from '@/types';

/**
 * Hook để lấy tất cả teachers
 */
export function useTeachers({ enabled = true }: { enabled?: boolean }) {
  return useQuery<TeacherType[]>({
    queryKey: queryKeys.teachers.list(),
    queryFn: async () => {
      const response = await teacherService.getAllTeachers();
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


