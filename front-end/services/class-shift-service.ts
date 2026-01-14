import http from '@/lib/http';
import { ResponseType } from '@/types/response-type';
import { ClassShiftType } from '@/types/class-type';

export interface ClassShiftRequest {
  id?: string;
  name: string;
  classId: string;
}

export const classShiftService = {
  getByClassId: (classId: string) =>
    http.get<ResponseType<ClassShiftType[], ClassShiftType[]>>(`/api/class-shift/by-class/${classId}`),
  create: (data: ClassShiftRequest) =>
    http.post<ResponseType<ClassShiftType, ClassShiftType>>('/api/class-shift/create', data),
  update: (id: string, data: ClassShiftRequest) =>
    http.put<ResponseType<ClassShiftType, ClassShiftType>>(`/api/class-shift/update/${id}`, data),
};


