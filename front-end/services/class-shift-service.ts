import http from '@/lib/http';
import { ResponseType } from '@/types/response-type';
import { ClassShiftType, ClassShiftRequest } from '@/types/class-type';

export const classShiftService = {
  getByClassId: (classId: string) =>
    http.get<ResponseType<ClassShiftType[], ClassShiftType[]>>(`/api/class-shift/by-class/${classId}`),
  create: (data: ClassShiftRequest) =>
    http.post<ResponseType<ClassShiftType, ClassShiftType>>('/api/class-shift/create', data),
  update: (id: string, data: ClassShiftRequest) =>
    http.put<ResponseType<ClassShiftType, ClassShiftType>>(`/api/class-shift/update/${id}`, data),
  delete: (id: string) => http.delete<ResponseType<null, null>>(`/api/class-shift/${id}`),
};


