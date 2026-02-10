import { TeacherType } from "@/types/teacher-type";

export interface ClassRequest {
  name: string;
  teacherId: string;
  monthlyFee: number;
}

export interface ClassShiftType {
  id: string;
  name: string;
  classId: string;
  className: string;
}

export interface ClassType {
  id: string;
  name: string;
  teacherId: string;
  monthlyFee: number;
  studentCount: number;
  revenue: number;
  collected: number;
  total: number;
  teacher: TeacherType;
  // Danh sách ca học trả luôn trong response lớp để tránh gọi /api/class-shift/by-class cho từng lớp
  classShifts?: ClassShiftType[];
}

export interface ClassRevenueDataResponse {
  month: string; // "T1", "T2", etc.
  label: string; // "Tháng 1", "Tháng 2", etc.
  classRevenues: Record<string, number>; // { "class_1": revenue, "class_2": revenue, ... }
}

export interface ClassSingleRevenueDataResponse {
  month: string; // "T1", "T2", etc.
  label: string; // "Tháng 1", "Tháng 2", etc.
  revenue: number; // Revenue cho class này trong tháng này
}

export interface ClassShiftRequest {
  id?: string;
  name: string;
  classId: string;
}