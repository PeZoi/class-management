import http from "@/lib/http";
import { ResponseType, StudentRequest, StudentType } from "@/types";

export const studentService = {
  createStudent: async (studentData: StudentRequest) => {
    const payload: unknown = {
      ...studentData,
      dob: new Date(studentData.dob),
    }
    return http.post<ResponseType<StudentType, StudentType>>('/api/student/create', payload);
  },
};