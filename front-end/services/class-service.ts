import http from "@/lib/http";
import { ClassRequest, ClassType } from "@/types/class-type";
import { ResponseType } from "@/types/response-type";

export const classService = {
  getAllClasses: () => http.get<ResponseType<ClassType[], ClassType[]>>('/api/class/get-all'),
  createClass: (data: ClassRequest) => http.post<ResponseType<ClassType, ClassType>>('/api/class/create', data),
  updateClass: (id: string, data: ClassRequest) => http.put<ResponseType<ClassType, ClassType>>(`/api/class/update/${id}`, data),
  getClassesByTeacherId: (teacherId: string) => http.get<ResponseType<ClassType[], ClassType[]>>(`/api/class/get-class-by-teacher-id/${teacherId}`),
};