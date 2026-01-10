import http from "@/lib/http";
import { ClassRequest, ClassType, ClassRevenueDataResponse, ClassSingleRevenueDataResponse } from "@/types/class-type";
import { ResponseType } from "@/types/response-type";

export const classService = {
  getAllClasses: () => http.get<ResponseType<ClassType[], ClassType[]>>('/api/class/get-all'),
  createClass: (data: ClassRequest) => http.post<ResponseType<ClassType, ClassType>>('/api/class/create', data),
  updateClass: (id: string, data: ClassRequest) => http.put<ResponseType<ClassType, ClassType>>(`/api/class/update/${id}`, data),
  getClassesByTeacherId: (teacherId: string) => http.get<ResponseType<ClassType[], ClassType[]>>(`/api/class/get-class-by-teacher-id/${teacherId}`),
  getClassById: (id: string) => http.get<ResponseType<ClassType, ClassType>>(`/api/class/get/${id}`),
  getRevenueDataByPeriod: (period: '3months' | '6months' | '12months') => 
    http.get<ResponseType<ClassRevenueDataResponse[], ClassRevenueDataResponse[]>>(`/api/class/revenue-data/${period}`),
  getRevenueDataByClassIdAndPeriod: (classId: string, period: '3months' | '6months' | '12months') =>
    http.get<ResponseType<ClassSingleRevenueDataResponse[], ClassSingleRevenueDataResponse[]>>(`/api/class/${classId}/revenue-data/${period}`),
  getTop3ClassesByRevenue: () =>
    http.get<ResponseType<ClassType[], ClassType[]>>('/api/class/top-3-revenue'),
};