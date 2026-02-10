/**
 * Centralized Query Keys for TanStack Query
 * 
 * Cấu trúc:
 * - Mỗi module có một object riêng
 * - Mỗi query key là một function để dễ dàng truyền params
 * - Có helper functions để invalidate queries
 */

type TimePeriod = '3months' | '6months' | '12months';

export const queryKeys = {
  // Dashboard queries
  dashboard: {
    all: ['dashboard'] as const,
    stats: () => ['dashboard', 'stats'] as const,
    revenueData: (period: TimePeriod) => ['dashboard', 'revenue-data', period] as const,
    studentsWithUnpaidFees: () => ['dashboard', 'students-with-unpaid-fees'] as const,
  },

  // Student queries
  students: {
    all: ['students'] as const,
    lists: () => ['students', 'list'] as const,
    list: (filters?: Record<string, unknown>) => ['students', 'list', filters] as const,
    details: () => ['students', 'detail'] as const,
    detail: (id: string) => ['students', 'detail', id] as const,
    byClass: (classId: string) => ['students', 'class', classId] as const,
    byClassShift: (classShiftId: string) => ['students', 'class-shift', classShiftId] as const,
    classHistory: (studentId: string) => ['students', 'class-history', studentId] as const,
    debtByClass: (classId: string) => ['students', 'debt', 'class', classId] as const,
    debtByClasses: (classIds: string[]) => ['students', 'debt', 'classes', classIds.sort().join(',')] as const,
  },

  // Class queries
  classes: {
    all: ['classes'] as const,
    lists: () => ['classes', 'list'] as const,
    list: () => ['classes', 'list'] as const,
    details: () => ['classes', 'detail'] as const,
    detail: (id: string) => ['classes', 'detail', id] as const,
    byTeacher: (teacherId: string) => ['classes', 'teacher', teacherId] as const,
    revenueData: (period: TimePeriod) => ['classes', 'revenue-data', period] as const,
    classRevenueData: (classId: string, period: TimePeriod) =>
      ['classes', 'revenue-data', classId, period] as const,
    top3ByRevenue: () => ['classes', 'top-3-revenue'] as const,
  },

  // Teacher queries
  teachers: {
    all: ['teachers'] as const,
    lists: () => ['teachers', 'list'] as const,
    list: () => ['teachers', 'list'] as const,
    details: () => ['teachers', 'detail'] as const,
    detail: (id: string) => ['teachers', 'detail', id] as const,
  },

  // Payment queries
  payments: {
    all: ['payments'] as const,
    lists: () => ['payments', 'list'] as const,
    list: () => ['payments', 'list'] as const,
    byStudent: (studentId: string) => ['payments', 'student', studentId] as const,
    byTeacher: (teacherId: string) => ['payments', 'teacher', teacherId] as const,
  },

  // Class Shift queries
  classShifts: {
    all: ['class-shifts'] as const,
    lists: () => ['class-shifts', 'list'] as const,
    byClass: (classId: string) => ['class-shifts', 'class', classId] as const,
  },

  // Profile queries
  profile: {
    all: ['profile'] as const,
    me: () => ['profile', 'me'] as const,
  },

  // Attendance queries
  attendance: {
    all: ['attendance'] as const,
    byStudent: (studentId: string, classId?: string) => ['attendance', 'student', studentId, classId] as const,
    byClass: (classId: string) => ['attendance', 'class', classId] as const,
  },
} as const;

/**
 * Helper function để invalidate tất cả queries của một module
 * 
 * @example
 * // Invalidate tất cả student queries
 * queryClient.invalidateQueries({ queryKey: queryKeys.students.all })
 * 
 * // Invalidate tất cả student list queries
 * queryClient.invalidateQueries({ queryKey: queryKeys.students.lists() })
 * 
 * // Invalidate một student cụ thể
 * queryClient.invalidateQueries({ queryKey: queryKeys.students.detail(studentId) })
 */
export type QueryKeys = typeof queryKeys;

