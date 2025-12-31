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