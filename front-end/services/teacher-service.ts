import http from "@/lib/http";
import { TeacherType } from "@/types";
import { ResponseType } from "@/types/response-type";

export const teacherService = {
  getAllTeachers: () => http.get<ResponseType<TeacherType[], TeacherType[]>>('/api/teacher'),
};