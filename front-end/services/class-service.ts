import http from "@/lib/http";
import { ClassRequest, ClassResponse } from "@/types/class-type";
import { ResponseType } from "@/types/response-type";

export const classService = {
  createClass: (data: ClassRequest) => http.post<ResponseType<ClassResponse, ClassResponse>>('/api/class/create', data),
};