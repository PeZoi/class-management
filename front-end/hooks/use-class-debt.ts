import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { studentService } from '@/services/student-service';
import { StudentType } from '@/types';
import { ClassDebtInfo } from '@/types/student-type';

/**
 * Hook để tính tổng số gói nợ và tổng số tiền nợ cho một class
 * Chỉ tính các gói từ đầu đến gói hiện tại của mỗi học viên
 */
export function useClassDebt(classId: string) {
  return useQuery<ClassDebtInfo>({
    queryKey: queryKeys.students.debtByClass(classId),
    queryFn: async () => {
      const response = await studentService.getStudentsByClass(classId);
      if (response.status === 200 && response.data) {
        const students: StudentType[] = response.data;
        
        let totalUnpaidPackages = 0;
        let totalDebtAmount = 0;

        students.forEach((student) => {
          const sessionPaymentStatuses = student.sessionPaymentStatuses || [];
          
          // Tìm gói hiện tại (isCurrent = true)
          const currentPackage = sessionPaymentStatuses.find((pkg) => pkg.isCurrent === true);
          
          if (currentPackage) {
            const currentPackageNumber = currentPackage.packageNumber;
            
            // Lọc các gói từ đầu đến gói hiện tại (<= currentPackageNumber)
            const packagesUpToCurrent = sessionPaymentStatuses.filter(
              (pkg) => (pkg.packageNumber ?? 0) <= currentPackageNumber
            );
            
            // Đếm số gói nợ (UNPAID hoặc PARTIAL)
            const unpaidPackages = packagesUpToCurrent.filter(
              (pkg) => pkg.status === 'UNPAID' || pkg.status === 'PARTIAL'
            );
            totalUnpaidPackages += unpaidPackages.length;
            
            // Tính tổng số tiền nợ (remainingAmount)
            const debtAmount = packagesUpToCurrent.reduce(
              (sum, pkg) => sum + (pkg.remainingAmount || 0),
              0
            );
            totalDebtAmount += debtAmount;
          } else {
            // Nếu không có gói hiện tại, tính tất cả các gói
            const unpaidPackages = sessionPaymentStatuses.filter(
              (pkg) => pkg.status === 'UNPAID' || pkg.status === 'PARTIAL'
            );
            totalUnpaidPackages += unpaidPackages.length;
            
            const debtAmount = sessionPaymentStatuses.reduce(
              (sum, pkg) => sum + (pkg.remainingAmount || 0),
              0
            );
            totalDebtAmount += debtAmount;
          }
        });

        return {
          totalUnpaidPackages,
          totalDebtAmount,
        };
      }
      throw new Error('Failed to fetch students by class');
    },
    enabled: !!classId,
  });
}

/**
 * Hook để tính tổng số gói nợ và tổng số tiền nợ cho nhiều classes
 * Fetch students cho tất cả các class cùng lúc
 */
export function useClassesDebt(classIds: string[]) {
  return useQuery<Record<string, ClassDebtInfo>>({
    queryKey: queryKeys.students.debtByClasses(classIds),
    queryFn: async () => {
      // Fetch students cho tất cả các class cùng lúc
      const promises = classIds.map(async (classId) => {
        const response = await studentService.getStudentsByClass(classId);
        if (response.status === 200 && response.data) {
          return { classId, students: response.data };
        }
        return { classId, students: [] };
      });

      const results = await Promise.all(promises);
      const debtMap: Record<string, ClassDebtInfo> = {};

      results.forEach(({ classId, students }) => {
        let totalUnpaidPackages = 0;
        let totalDebtAmount = 0;

        students.forEach((student) => {
          const sessionPaymentStatuses = student.sessionPaymentStatuses || [];
          
          // Tìm gói hiện tại (isCurrent = true)
          const currentPackage = sessionPaymentStatuses.find((pkg) => pkg.isCurrent === true);
          
          if (currentPackage) {
            const currentPackageNumber = currentPackage.packageNumber;
            
            // Lọc các gói từ đầu đến gói hiện tại (<= currentPackageNumber)
            const packagesUpToCurrent = sessionPaymentStatuses.filter(
              (pkg) => (pkg.packageNumber ?? 0) <= currentPackageNumber
            );
            
            // Đếm số gói nợ (UNPAID hoặc PARTIAL)
            const unpaidPackages = packagesUpToCurrent.filter(
              (pkg) => pkg.status === 'UNPAID' || pkg.status === 'PARTIAL'
            );
            totalUnpaidPackages += unpaidPackages.length;
            
            // Tính tổng số tiền nợ (remainingAmount)
            const debtAmount = packagesUpToCurrent.reduce(
              (sum, pkg) => sum + (pkg.remainingAmount || 0),
              0
            );
            totalDebtAmount += debtAmount;
          } else {
            // Nếu không có gói hiện tại, tính tất cả các gói
            const unpaidPackages = sessionPaymentStatuses.filter(
              (pkg) => pkg.status === 'UNPAID' || pkg.status === 'PARTIAL'
            );
            totalUnpaidPackages += unpaidPackages.length;
            
            const debtAmount = sessionPaymentStatuses.reduce(
              (sum, pkg) => sum + (pkg.remainingAmount || 0),
              0
            );
            totalDebtAmount += debtAmount;
          }
        });

        debtMap[classId] = {
          totalUnpaidPackages,
          totalDebtAmount,
        };
      });

      return debtMap;
    },
    enabled: classIds.length > 0,
  });
}

