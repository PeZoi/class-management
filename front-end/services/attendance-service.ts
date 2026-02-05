import http from '@/lib/http';
import { ResponseType, Attendance, CreateAttendanceData, UpdateAttendanceData } from '@/types';

export const attendanceService = {
  createAttendance: (data: CreateAttendanceData) => {
    return http.post<ResponseType<Attendance, Attendance>>('/api/attendance/create', data);
  },

  getAttendanceByStudent: (studentId: string, classId: string) => {
    return http.get<ResponseType<Attendance[], Attendance[]>>(
      `/api/attendance/student/${studentId}?classId=${classId}`
    );
  },

  getAttendanceByClass: (classId: string) => {
    return http.get<ResponseType<Attendance[], Attendance[]>>(`/api/attendance/class/${classId}`);
  },

  getAttendanceById: (id: string) => {
    return http.get<ResponseType<Attendance, Attendance>>(`/api/attendance/${id}`);
  },

  updateAttendance: (id: string, data: UpdateAttendanceData) => {
    return http.put<ResponseType<Attendance, Attendance>>(`/api/attendance/${id}`, data);
  },

  deleteAttendance: (id: string) => {
    return http.delete<ResponseType<void, void>>(`/api/attendance/${id}`);
  },

  countAttendedSessions: (studentId: string, classId: string) => {
    return http.get<ResponseType<number, number>>(
      `/api/attendance/student/${studentId}/count?classId=${classId}`
    );
  },

  getNextSessionNumber: (studentId: string, classId: string) => {
    return http.get<ResponseType<number, number>>(
      `/api/attendance/student/${studentId}/next-session?classId=${classId}`
    );
  },
};

