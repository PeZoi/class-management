import http from "@/lib/http";
import { ResponseType, StudentRequest, StudentType, ClassHistoryResponse, UpdateStudentShiftRequest, BulkUpdateStudentShiftRequest, RemoveStudentsFromClassRequest, PageResponse } from "@/types";

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
  getStudents: (
    page: number, 
    size: number, 
    search: string,
    filters?: {
      gender?: 'MALE' | 'FEMALE' | 'OTHER';
      status?: 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'DELETED';
      className?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ) => {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('size', String(size));
    if (search) params.append('search', search);
    if (filters?.gender) params.append('gender', filters.gender);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.className) params.append('className', filters.className);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
    
    return http.get<ResponseType<PageResponse<StudentType>, PageResponse<StudentType>>>(
      `/api/student/get-all?${params.toString()}`
    );
  },
  getStudentsByClass: (classId: string) => http.get<ResponseType<StudentType[], StudentType[]>>(`/api/student/get-students-by-class/${classId}`),
  getStudentsByClassShift: (classShiftId: string) =>
    http.get<ResponseType<StudentType[], StudentType[]>>(`/api/student/get-students-by-class-shift/${classShiftId}`),
  getStudentById: (studentId: string) => http.get<ResponseType<StudentType, StudentType>>(`/api/student/get/${studentId}`),
  getClassHistory: (studentId: string) =>
    http.get<ResponseType<ClassHistoryResponse[], ClassHistoryResponse[]>>(`/api/student/class-history/${studentId}`),
  restoreStudent: (studentId: string) =>
    http.post<ResponseType<StudentType, StudentType>>(`/api/student/restore/${studentId}`, {}),
  deleteStudents: (studentIds: string[]) =>
    http.post<ResponseType<StudentType[], StudentType[]>>('/api/student/delete', { studentIds }),
};