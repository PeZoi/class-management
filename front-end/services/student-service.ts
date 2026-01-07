import http from "@/lib/http";
import { ResponseType, StudentRequest, StudentType } from "@/types";

export const studentService = {
  createStudent: (studentData: StudentRequest) => {
    const payload: unknown = {
      ...studentData,
      dob: new Date(studentData.dob),
    }
    return http.post<ResponseType<StudentType, StudentType>>('/api/student/create', payload);
  },
  updateStudent: (studentData: StudentRequest, studentId: string) => {
      const payload: unknown = {
        ...studentData,
        dob: new Date(studentData.dob),
      }
    return http.put<ResponseType<StudentType, StudentType>>(`/api/student/update/${studentId}`, payload);
  },
  getStudents: () => http.get<ResponseType<StudentType[], StudentType[]>>('/api/student/get-all'),
  getStudentsByClass: (classId: string) => http.get<ResponseType<StudentType[], StudentType[]>>(`/api/student/get-students-by-class/${classId}`),
  getStudentById: (studentId: string) => http.get<ResponseType<StudentType, StudentType>>(`/api/student/get/${studentId}`),
};