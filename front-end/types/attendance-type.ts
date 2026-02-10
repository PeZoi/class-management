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

// Attendance session for UI display
export interface AttendanceSession {
  id: string;
  date: string;
  sessionNumber: number; // 1..N within selected month
  status: 'present' | 'absent' | 'late' | 'excused' | 'no_data';
  checkInTime?: string;
  notes?: string;
}

// Student attendance record for classroom attendance display
export interface StudentAttendanceRecord {
  studentId: string;
  studentName: string;
  sessions: AttendanceSession[];
}

// Teacher attendance record for teacher attendance display
export interface AttendanceRecord {
  id: string;
  date: string;
  className: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: 'present' | 'absent' | 'late' | 'early_leave';
  notes?: string;
}

