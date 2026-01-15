import http from "@/lib/http";
import { ResponseType, StudentRequest, StudentType, ClassHistoryResponse } from "@/types";

export interface UpdateStudentShiftRequest {
  studentId: string;
  classId: string;
  classShiftId?: string;
}

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
    // First get current student data
    const studentResponse = await http.get<ResponseType<StudentType, StudentType>>(`/api/student/get/${request.studentId}`);
    if (studentResponse.status !== 200 || !studentResponse.data) {
      throw new Error('Không thể lấy thông tin học viên');
    }

    const student = studentResponse.data;
    const updateData: StudentRequest = {
      fullName: student.fullName,
      email: student.email,
      phoneNumber: student.phoneNumber,
      dob: student.dob,
      gender: student.gender,
      fullNameParent: student.fullNameParent,
      phoneNumberParent: student.phoneNumberParent,
      classId: request.classId,
      classShiftId: request.classShiftId,
    };

    return studentService.updateStudent(updateData, request.studentId);
  },
  getStudents: () => http.get<ResponseType<StudentType[], StudentType[]>>('/api/student/get-all'),
  getStudentsByClass: (classId: string) => http.get<ResponseType<StudentType[], StudentType[]>>(`/api/student/get-students-by-class/${classId}`),
  getStudentsByClassShift: (classShiftId: string) =>
    http.get<ResponseType<StudentType[], StudentType[]>>(`/api/student/get-students-by-class-shift/${classShiftId}`),
  getStudentById: (studentId: string) => http.get<ResponseType<StudentType, StudentType>>(`/api/student/get/${studentId}`),
  getClassHistory: (studentId: string) => http.get<ResponseType<ClassHistoryResponse[], ClassHistoryResponse[]>>(`/api/student/class-history/${studentId}`),
};