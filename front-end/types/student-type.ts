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
  status: StudentStatus;
  deletedAt?: string;
  deletedBy?: string;
  class?: StudentClassResponse | null;
  monthPaymentStatuses?: MonthPaymentStatus[]; // DEPRECATED: Giữ lại để backward compatibility
  sessionPaymentStatuses?: import('./payment-type').SessionPaymentStatus[]; // Mới: session-based payment
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

// Class history item for student class history display
export interface ClassHistoryItem {
  id: string | number;
  className: string;
  classId: string;
  joinedAt: string;
  leftAt?: string;
  status: 'studying' | 'completed' | 'transferred' | 'changing' | 'dropped';
  reason?: string;
}

// Filter state for student management page
export interface FilterState {
  searchQuery: string;
  paymentStatus: 'all' | 'paid' | 'unpaid' | 'partial';
  studentStatus: 'all' | 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'DROPPED_OUT' | 'DELETED';
  className: string;
  gender: 'all' | 'male' | 'female' | 'other';
  sortBy: 'name' | 'joinedDate' | 'monthlyFee';
  sortOrder: 'asc' | 'desc';
}

// Student item for student management page (extends StudentType with UI-specific fields)
export interface StudentItem extends StudentType {
  idCard?: string; // ID card number (optional, not in API)
  paymentStatus: 'paid' | 'unpaid' | 'partial';
  monthlyFee: number;
  amountPaid: number;
  currentMonthPaidAmount?: number; // Số tiền đã đóng tháng hiện tại
}

// Class debt information
export interface ClassDebtInfo {
  totalUnpaidPackages: number;
  totalDebtAmount: number;
}

// Overdue student item for dashboard display (extends StudentType with payment info)
export interface OverdueStudentItem extends StudentType {
  paymentStatus: 'paid' | 'unpaid' | 'partial';
  monthlyFee: number;
  amountPaid: number;
  currentMonthPaidAmount?: number;
  unpaidMonthsCount: number;
  totalRemainingAmount: number;
}

// Student status type (matching backend enum)
export type StudentStatus = 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'DROPPED_OUT' | 'DELETED';