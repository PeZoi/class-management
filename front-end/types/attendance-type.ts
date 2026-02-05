// Attendance types matching backend

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export interface Attendance {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  sessionDate: string; // ISO date string
  sessionNumber: number;
  status: AttendanceStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAttendanceData {
  studentId: string;
  classId: string;
  sessionDate: string; // ISO date string
  status: AttendanceStatus;
  notes?: string;
}

export interface UpdateAttendanceData extends CreateAttendanceData {
  id: string;
}

