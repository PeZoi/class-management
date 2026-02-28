import {
  invalidateClass,
  invalidateClassLists,
  invalidateDashboard,
  invalidateTop3ClassesByRevenue
} from '@/lib/queryHelpers';
import { queryKeys } from '@/lib/queryKeys';
import { classService } from '@/services/class-service';
import { classShiftService } from '@/services/class-shift-service';
import { ClassRequest, ClassRevenueDataResponse, ClassShiftType, ClassType } from '@/types/class-type';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { TimePeriod } from '@/types/common-type';

/**
 * Hook để lấy tất cả classes
 */
export function useClasses() {
  return useQuery<ClassType[]>({
    queryKey: queryKeys.classes.list(),
    queryFn: async () => {
      const response = await classService.getAllClasses();
      if (response.status === 200 && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch classes');
    },
  });
}

/**
 * Hook để lấy class theo ID
 */
export function useClass(classId: string) {
  return useQuery<ClassType>({
    queryKey: queryKeys.classes.detail(classId),
    queryFn: async () => {
      const response = await classService.getClassById(classId);
      if (response.status === 200 && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch class');
    },
    enabled: !!classId,
  });
}

/**
 * Hook để lấy classes theo teacher ID
 */
export function useClassesByTeacher(teacherId: string) {
  return useQuery<ClassType[]>({
    queryKey: queryKeys.classes.byTeacher(teacherId),
    queryFn: async () => {
      const response = await classService.getClassesByTeacherId(teacherId);
      if (response.status === 200 && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch classes by teacher');
    },
    enabled: !!teacherId,
  });
}

/**
 * Hook để lấy classes của teacher hiện tại
 */
export function useMyClasses() {
  return useQuery<ClassType[]>({
    queryKey: queryKeys.classes.myClasses(),
    queryFn: async () => {
      const response = await classService.getMyClasses();
      if (response.status === 200 && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch my classes');
    },
  });
}

/**
 * Hook để lấy revenue data theo period (tất cả classes)
 */
export function useClassRevenueData(period: TimePeriod) {
  return useQuery<ClassRevenueDataResponse[]>({
    queryKey: queryKeys.classes.revenueData(period),
    queryFn: async () => {
      const response = await classService.getRevenueDataByPeriod(period);
      if (response.status === 200 && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch class revenue data');
    },
  });
}

/**
 * Hook để lấy revenue data của một class cụ thể theo period
 */
export function useClassRevenueDataByClassId(classId: string, period: TimePeriod) {
  return useQuery({
    queryKey: queryKeys.classes.classRevenueData(classId, period),
    queryFn: async () => {
      const response = await classService.getRevenueDataByClassIdAndPeriod(classId, period);
      if (response.status === 200 && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch class revenue data');
    },
    enabled: !!classId,
  });
}

/**
 * Hook để lấy top 3 classes by revenue
 */
export function useTop3ClassesByRevenue() {
  return useQuery<ClassType[]>({
    queryKey: queryKeys.classes.top3ByRevenue(),
    queryFn: async () => {
      const response = await classService.getTop3ClassesByRevenue();
      if (response.status === 200 && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch top 3 classes');
    },
  });
}

/**
 * Hook để tạo class mới
 */
export function useCreateClass() {
  const queryClient = useQueryClient();
  const tNotif = useTranslations('notifications');

  return useMutation({
    mutationFn: (data: ClassRequest) => classService.createClass(data),
    onSuccess: (response) => {
      if (response.status === 201 && response.data) {
        // Invalidate class lists và dashboard
        invalidateClassLists(queryClient);
        invalidateTop3ClassesByRevenue(queryClient);
        invalidateDashboard(queryClient);
        toast.success(tNotif('successCreateClass'));
      }
    },
    onError: (error) => {
      console.error('Error creating class:', error);
      toast.error(tNotif('errorCreateClass'));
    },
  });
}

/**
 * Hook để cập nhật class
 */
export function useUpdateClass() {
  const queryClient = useQueryClient();
  const tNotif = useTranslations('notifications');

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ClassRequest }) =>
      classService.updateClass(id, data),
    onSuccess: (response, variables) => {
      if (response.status === 200 && response.data) {
        // Invalidate class lists, specific class, và dashboard
        invalidateClassLists(queryClient);
        invalidateClass(queryClient, variables.id);
        invalidateTop3ClassesByRevenue(queryClient);
        invalidateDashboard(queryClient);
        toast.success(tNotif('successUpdateClass'));
      }
    },
    onError: (error) => {
      console.error('Error updating class:', error);
      toast.error(tNotif('errorUpdateClass'));
    },
  });
}

/**
 * Hook để xoá class (soft delete)
 */
export function useDeleteClass() {
  const queryClient = useQueryClient();
  const tNotif = useTranslations('notifications');

  return useMutation({
    mutationFn: (id: string) => classService.deleteClass(id),
    onSuccess: (response) => {
      if (response.status === 200 || response.status === 204) {
        invalidateClassLists(queryClient);
        invalidateTop3ClassesByRevenue(queryClient);
        invalidateDashboard(queryClient);
        toast.success(tNotif('successDeleteClass'));
      }
    },
    onError: (error) => {
      console.error('Error deleting class:', error);
      toast.error(tNotif('errorDeleteClassFail'));
    },
  });
}

/**
 * Hook để lấy class shifts theo class ID
 */
export function useClassShiftsByClass(
  classId: string,
  options?: { enabled?: boolean }
) {
  return useQuery<ClassShiftType[]>({
    queryKey: queryKeys.classShifts.byClass(classId),
    queryFn: async () => {
      const response = await classShiftService.getByClassId(classId);
      if (response.status === 200 && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch class shifts');
    },
    enabled: options?.enabled !== undefined ? options.enabled : !!classId,
  });
}

/**
 * Hook để tạo class shift
 */
export function useCreateClassShift() {
  const queryClient = useQueryClient();
  const tNotif = useTranslations('notifications');

  return useMutation({
    mutationFn: (data: { name: string; classId: string }) => classShiftService.create(data),
    onSuccess: (response, variables) => {
      if (response.status === 201 && response.data) {
        // Invalidate class shifts của class này
        queryClient.invalidateQueries({
          queryKey: queryKeys.classShifts.byClass(variables.classId),
        });
        toast.success(tNotif('successCreateShift'));
      }
    },
    onError: (error) => {
      console.error('Error creating class shift:', error);
      toast.error(tNotif('errorSaveShift'));
    },
  });
}

/**
 * Hook để cập nhật class shift
 */
export function useUpdateClassShift() {
  const queryClient = useQueryClient();
  const tNotif = useTranslations('notifications');

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string; classId: string } }) =>
      classShiftService.update(id, data),
    onSuccess: (response, variables) => {
      if (response.status === 200 && response.data) {
        // Invalidate class shifts của class này
        queryClient.invalidateQueries({
          queryKey: queryKeys.classShifts.byClass(variables.data.classId),
        });
        toast.success(tNotif('successUpdateShiftDialog'));
      }
    },
    onError: (error) => {
      console.error('Error updating class shift:', error);
      toast.error(tNotif('errorSaveShift'));
    },
  });
}

/**
 * Hook để xóa class shift
 */
export function useDeleteClassShift() {
  const queryClient = useQueryClient();
  const tNotif = useTranslations('notifications');

  return useMutation({
    mutationFn: (id: string) => classShiftService.delete(id),
    onSuccess: (response, shiftId) => {
      if (response.status === 200 || response.status === 204) {
        // Invalidate tất cả class shifts (vì không biết classId từ response)
        queryClient.invalidateQueries({ queryKey: queryKeys.classShifts.all });
        toast.success(tNotif('successDeleteShift'));
      }
    },
    onError: (error) => {
      console.error('Error deleting class shift:', error);
      toast.error(tNotif('errorDeleteShiftFail'));
    },
  });
}

/**
 * Hook để prefetch class shifts cho nhiều classes và tính toán summary
 * @param classes - Danh sách classes cần prefetch shifts
 * @returns Summary map với key là classId và value là string summary của shifts
 */
export function useClassShiftsSummary(classes: ClassType[]) {
  const queryClient = useQueryClient();

  // Prefetch shifts cho tất cả classes
  useEffect(() => {
    if (!classes || classes.length === 0) {
      return;
    }

    // Prefetch shifts cho tất cả classes (không block UI)
    classes.forEach((cls) => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.classShifts.byClass(cls.id),
        queryFn: async () => {
          const res = await classShiftService.getByClassId(cls.id);
          if (res.status === 200 && res.data) {
            return res.data;
          }
          throw new Error('Failed to fetch class shifts');
        },
      });
    });
    // Chỉ chạy khi class IDs thay đổi, không phải khi classes array reference thay đổi
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classes.map((c) => c.id).join(','), queryClient]);

  // Tính toán summary từ cached data
  const summary = useMemo(() => {
    if (!classes || classes.length === 0) {
      return {};
    }

    const summaryMap: Record<string, string> = {};

    classes.forEach((cls) => {
      // Lấy cached data từ queryClient
      const cachedShifts = queryClient.getQueryData<Array<{ name: string }>>(
        queryKeys.classShifts.byClass(cls.id)
      );

      if (cachedShifts && cachedShifts.length > 0) {
        // Ghép tên các ca lại, giới hạn để không quá dài
        const names = cachedShifts.map((s) => s.name);
        const preview = names.slice(0, 2).join('\n');
        const moreCount = names.length - 2;

        summaryMap[cls.id] = moreCount > 0 ? `${preview} (+${moreCount} ca khác)` : preview;
      }
    });

    return summaryMap;
  }, [classes, queryClient]);

  return summary;
}

