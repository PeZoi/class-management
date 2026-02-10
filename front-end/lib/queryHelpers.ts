import { QueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import { TimePeriod } from '@/types/common-type';

/**
 * Helper functions để invalidate queries dễ dàng hơn
 * 
 * @example
 * // Invalidate tất cả student queries
 * invalidateStudents(queryClient)
 * 
 * // Invalidate một student cụ thể
 * invalidateStudent(queryClient, studentId)
 * 
 * // Invalidate students by class
 * invalidateStudentsByClass(queryClient, classId)
 */

/**
 * Invalidate tất cả dashboard queries
 */
export function invalidateDashboard(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
}

/**
 * Invalidate dashboard stats
 */
export function invalidateDashboardStats(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() });
}

/**
 * Invalidate dashboard revenue data
 */
export function invalidateDashboardRevenueData(
  queryClient: QueryClient,
  period?: TimePeriod
) {
  if (period) {
    return queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.revenueData(period) });
  }
  // Invalidate tất cả revenue data queries
  return queryClient.invalidateQueries({ queryKey: ['dashboard', 'revenue-data'] });
}

/**
 * Invalidate top 3 classes
 */
export function invalidateTop3Classes(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: queryKeys.classes.top3ByRevenue() });
}

/**
 * Invalidate students with unpaid fees
 */
export function invalidateStudentsWithUnpaidFees(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.studentsWithUnpaidFees() });
}

/**
 * Invalidate tất cả student queries
 */
export function invalidateStudents(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
}

/**
 * Invalidate tất cả student list queries
 */
export function invalidateStudentLists(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: queryKeys.students.lists() });
}

/**
 * Invalidate một student cụ thể
 */
export function invalidateStudent(queryClient: QueryClient, studentId: string) {
  return queryClient.invalidateQueries({ queryKey: queryKeys.students.detail(studentId) });
}

/**
 * Invalidate students by class
 */
export function invalidateStudentsByClass(queryClient: QueryClient, classId: string) {
  return queryClient.invalidateQueries({ queryKey: queryKeys.students.byClass(classId) });
}

/**
 * Invalidate students by class shift
 */
export function invalidateStudentsByClassShift(queryClient: QueryClient, classShiftId: string) {
  return queryClient.invalidateQueries({ queryKey: queryKeys.students.byClassShift(classShiftId) });
}

/**
 * Invalidate student class history
 */
export function invalidateStudentClassHistory(queryClient: QueryClient, studentId: string) {
  return queryClient.invalidateQueries({ queryKey: queryKeys.students.classHistory(studentId) });
}

/**
 * Invalidate tất cả class queries
 */
export function invalidateClasses(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: queryKeys.classes.all });
}

/**
 * Invalidate tất cả class list queries
 */
export function invalidateClassLists(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: queryKeys.classes.lists() });
}

/**
 * Invalidate một class cụ thể
 */
export function invalidateClass(queryClient: QueryClient, classId: string) {
  return queryClient.invalidateQueries({ queryKey: queryKeys.classes.detail(classId) });
}

/**
 * Invalidate classes by teacher
 */
export function invalidateClassesByTeacher(queryClient: QueryClient, teacherId: string) {
  return queryClient.invalidateQueries({ queryKey: queryKeys.classes.byTeacher(teacherId) });
}

/**
 * Invalidate class revenue data
 */
export function invalidateClassRevenueData(
  queryClient: QueryClient,
  classId?: string,
  period?: TimePeriod
) {
  if (classId && period) {
    return queryClient.invalidateQueries({
      queryKey: queryKeys.classes.classRevenueData(classId, period),
    });
  }
  if (classId) {
    // Invalidate tất cả revenue data của class này
    return queryClient.invalidateQueries({ queryKey: ['classes', 'revenue-data', classId] });
  }
  // Invalidate tất cả class revenue data
  return queryClient.invalidateQueries({ queryKey: ['classes', 'revenue-data'] });
}

/**
 * Invalidate top 3 classes by revenue
 */
export function invalidateTop3ClassesByRevenue(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: queryKeys.classes.top3ByRevenue() });
}

/**
 * Invalidate tất cả teacher queries
 */
export function invalidateTeachers(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: queryKeys.teachers.all });
}

/**
 * Invalidate tất cả teacher list queries
 */
export function invalidateTeacherLists(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: queryKeys.teachers.lists() });
}

/**
 * Invalidate một teacher cụ thể
 */
export function invalidateTeacher(queryClient: QueryClient, teacherId: string) {
  return queryClient.invalidateQueries({ queryKey: queryKeys.teachers.detail(teacherId) });
}

/**
 * Invalidate tất cả payment queries
 */
export function invalidatePayments(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
}

/**
 * Invalidate tất cả payment list queries
 */
export function invalidatePaymentLists(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: queryKeys.payments.lists() });
}

/**
 * Invalidate payments by student
 */
export function invalidatePaymentsByStudent(queryClient: QueryClient, studentId: string) {
  return queryClient.invalidateQueries({ queryKey: queryKeys.payments.byStudent(studentId) });
}

/**
 * Invalidate payments by teacher
 */
export function invalidatePaymentsByTeacher(queryClient: QueryClient, teacherId: string) {
  return queryClient.invalidateQueries({ queryKey: queryKeys.payments.byTeacher(teacherId) });
}

/**
 * Invalidate tất cả class shift queries
 */
export function invalidateClassShifts(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: queryKeys.classShifts.all });
}

/**
 * Invalidate class shifts by class
 */
export function invalidateClassShiftsByClass(queryClient: QueryClient, classId: string) {
  return queryClient.invalidateQueries({ queryKey: queryKeys.classShifts.byClass(classId) });
}

/**
 * Invalidate profile queries
 */
export function invalidateProfile(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
}

/**
 * Invalidate current user profile
 */
export function invalidateProfileMe(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: queryKeys.profile.me() });
}

