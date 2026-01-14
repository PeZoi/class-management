import { TeacherType } from "@/types/teacher-type";

export interface ClassRequest {
  name: string;
  teacherId: string;
  schedule: string;
  monthlyFee: number;
}

export interface ClassType {
  id: string;
  name: string;
  teacherId: string;
  schedule: string;
  monthlyFee: number;
  studentCount: number;
  revenue: number;
  collected: number;
  total: number;
  teacher: TeacherType;
}

export interface ClassShiftType {
  id: string;
  name: string;
  classId: string;
  className: string;
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