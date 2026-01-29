import http from "@/lib/http";
import { ResponseType, StudentRequest, StudentType, ClassHistoryResponse, UpdateStudentShiftRequest, BulkUpdateStudentShiftRequest, RemoveStudentsFromClassRequest } from "@/types";

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
  updateStudentShift: async (request: UpdateStudentShiftRequest): Promise<ResponseType<StudentType, StudentType>> => {
    return http.put<ResponseType<StudentType, StudentType>>('/api/student/update-shift', request);
  },
  bulkUpdateStudentShift: async (request: BulkUpdateStudentShiftRequest): Promise<ResponseType<StudentType[], StudentType[]>> => {
    return http.put<ResponseType<StudentType[], StudentType[]>>('/api/student/update-shifts', request);
  },
  removeStudentsFromClass: async (request: RemoveStudentsFromClassRequest): Promise<ResponseType<StudentType[], StudentType[]>> => {
    return http.put<ResponseType<StudentType[], StudentType[]>>('/api/student/remove-from-class', request);
  },
  getStudents: () => http.get<ResponseType<StudentType[], StudentType[]>>('/api/student/get-all'),
  getStudentsByClass: (classId: string) => http.get<ResponseType<StudentType[], StudentType[]>>(`/api/student/get-students-by-class/${classId}`),
  getStudentsByClassShift: (classShiftId: string) =>
    http.get<ResponseType<StudentType[], StudentType[]>>(`/api/student/get-students-by-class-shift/${classShiftId}`),
  getStudentById: (studentId: string) => http.get<ResponseType<StudentType, StudentType>>(`/api/student/get/${studentId}`),
  getClassHistory: (studentId: string) => http.get<ResponseType<ClassHistoryResponse[], ClassHistoryResponse[]>>(`/api/student/class-history/${studentId}`),
};