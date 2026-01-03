import http from "@/lib/http";
import { TeacherRequest, TeacherType } from "@/types";
import { ResponseType } from "@/types/response-type";

export const teacherService = {
  getAllTeachers: () => http.get<ResponseType<TeacherType[], TeacherType[]>>('/api/teacher/get-all'),
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
};