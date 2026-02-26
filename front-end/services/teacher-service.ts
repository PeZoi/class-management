import http from "@/lib/http";
import { TeacherRequest, TeacherType, PageResponse } from "@/types";
import { ResponseType } from "@/types/response-type";
import { ClassType } from "@/types/class-type";

export const teacherService = {
  getAllTeachers: (
    page: number,
    size: number,
    search: string,
    filters?: {
      gender?: 'MALE' | 'FEMALE' | 'OTHER';
      status?: 'ACTIVE' | 'DELETED' | 'BLOCKED';
    }
  ) => {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('size', String(size));
    if (search) params.append('search', search);
    if (filters?.gender) params.append('gender', filters.gender);
    if (filters?.status) params.append('status', filters.status);
    
    return http.get<ResponseType<PageResponse<TeacherType>, PageResponse<TeacherType>>>(
      `/api/teacher/get-all?${params.toString()}`
    );
  },
  
  // Simple method to get all teachers for dropdowns/selects (backward compatibility)
  getAllTeachersSimple: async (): Promise<ResponseType<TeacherType[], TeacherType[]>> => {
    const response = await teacherService.getAllTeachers(0, 1000, '', undefined);
    if (response.status === 200 && response.data) {
      return {
        status: response.status,
        data: response.data.content, // Extract content array
        message: response.message,
      } as ResponseType<TeacherType[], TeacherType[]>;
    }
    return {
      status: response.status,
      data: [] as TeacherType[],
      message: response.message,
    } as ResponseType<TeacherType[], TeacherType[]>;
  },
  
  getTeacherById: (id: string) => http.get<ResponseType<TeacherType, TeacherType>>(`/api/teacher/get/${id}`),
  createTeacher: (data: TeacherRequest) => {
    const payload: unknown = {
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      idCard: data.idCard,
      dob: new Date(data.dob),
      avatar: data.avatar,
      gender: data.gender,
    };
    return http.post<ResponseType<TeacherType, TeacherType>>('/api/teacher/create', payload);
  },
  updateTeacher: (id: string, data: TeacherRequest) => {
    const payload: unknown = {
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      idCard: data.idCard,
      dob: new Date(data.dob),
      avatar: data.avatar,
      gender: data.gender,
    };
    return http.put<ResponseType<TeacherType, TeacherType>>(`/api/teacher/update/${id}`, payload);
  },
  resetPassword: (id: string) => {
    return http.put<ResponseType<TeacherType, TeacherType>>(`/api/teacher/reset-password/${id}`, { id });
  },
  deleteTeacher: (id: string) => {
    return http.delete<ResponseType<TeacherType, TeacherType>>(`/api/teacher/delete/${id}`);
  },
  restoreTeacher: (id: string) => {
    return http.post<ResponseType<TeacherType, TeacherType>>(`/api/teacher/restore/${id}`, {});
  },
  getTeacherClasses: (id: string) => {
    return http.get<ResponseType<ClassType[], ClassType[]>>(`/api/teacher/${id}/classes`);
  },
  getUnassignedClasses: () => {
    return http.get<ResponseType<ClassType[], ClassType[]>>(`/api/teacher/unassigned-classes`);
  },
  assignClassesToTeacher: (id: string, classIds: string[]) => {
    return http.post<ResponseType<ClassType[], ClassType[]>>(`/api/teacher/${id}/assign-classes`, classIds);
  },
};