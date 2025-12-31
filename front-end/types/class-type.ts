import { TeacherType } from "@/types/teacher-type";

export interface ClassRequest {
  name: string;
  teacherId: string;
  schedule: string;
  monthlyFee: number;
}

export interface ClassResponse {
  id: string;
  name: string;
  teacherId: string;
  schedule: string;
  monthlyFee: number;
  teacher: TeacherType;
}