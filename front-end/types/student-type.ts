export interface StudentClassResponse {
  id: string;
  name: string;
  monthlyFee: number;
  joinAt: string;
  // Thông tin ca học hiện tại của học sinh (nếu có)
  shiftId?: string;
  shiftName?: string;
}

export interface MonthPaymentStatus {
  month: string; // ISO date string (e.g., "2025-09-01T00:00:00Z")
  expectedAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'PAID' | 'PARTIAL' | 'UNPAID';
}

export interface StudentType {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  dob: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  fullNameParent: string;
  phoneNumberParent: string;
  class?: StudentClassResponse | null;
  monthPaymentStatuses?: MonthPaymentStatus[];
}

export interface StudentRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  dob: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  fullNameParent: string;
  phoneNumberParent: string;
  classId: string;
  // Id ca học trong lớp (tùy chọn)
  classShiftId?: string;
}

export interface ClassHistoryResponse {
  id: number;
  className: string;
  classId: string;
  joinedAt: string;
  leftAt?: string;
  status: 'STUDYING' | 'COMPLETED' | 'CHANGING' | 'DROPPED';
  reason?: string;
}

export interface UpdateStudentShiftRequest {
  studentId: string;
  classId: string;
  classShiftId?: string;
}

export interface BulkUpdateStudentShiftRequest {
  studentIds: string[];
  classId: string;
  classShiftId?: string;
}

// One API for both single & bulk remove: send 1 id or many in studentIds
export interface RemoveStudentsFromClassRequest {
  classId?: string;
  studentIds: string[];
}