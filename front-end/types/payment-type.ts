// Payment enums matching backend
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'E_WALLET';
export type PaymentType = 'STUDENT_FEE' | 'TEACHER_SALARY' | 'REFUND';
export type PaymentDirection = 'INCOME' | 'EXPENSE';
export type PaymentStatus = 'COMPLETED' | 'INCOMPLETE';

// Payment request (to send to backend)
export interface PaymentRequest {
  amount: number;
  paid: number;
  billingMonth: string; // ISO date string for the first day of the month
  feeSnapshot: number;
  bonus?: number; // Thưởng (chỉ dùng cho teacher salary)
  deduction?: number; // Khấu trừ (chỉ dùng cho teacher salary)
  paymentMethod: PaymentMethod;
  paymentType: PaymentType;
  direction: PaymentDirection;
  studentId?: string;
  teacherId?: string;
  classId?: string;
  note?: string;
}

// Nested types for PaymentResponse
export interface StudentPayment {
  id: string;
  fullName: string;
  gender?: string;
}

export interface TeacherPayment {
  id: string;
  fullName: string;
  gender?: string;
}

export interface ClassPayment {
  id: string;
  name: string;
}

// Payment response (from backend)
export interface PaymentResponse {
  id: string;
  paymentId: string;
  amount: number;
  feeSnapshot: number;
  paid: number;
  bonus?: number; // Thưởng (chỉ dùng cho teacher salary)
  deduction?: number; // Khấu trừ (chỉ dùng cho teacher salary)
  billingMonth: string; // ISO date string
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentType: PaymentType;
  direction: PaymentDirection;
  studentId?: string;
  teacherId?: string;
  classId?: string;
  student?: StudentPayment;
  teacher?: TeacherPayment;
  class?: ClassPayment;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

// Helper type for creating student fee payment (simplified)
export interface CreateStudentPaymentData {
  studentId: string;
  month: number;
  year: number;
  amount: number;
  paymentMethod: 'cash' | 'bank_transfer';
  paymentDate: string;
  notes: string;
}

// Helper type for creating teacher salary payment
export interface CreateTeacherPaymentData {
  teacherId: string;
  month: number;
  year: number;
  baseSalary: number;
  bonus: number;
  deduction: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'bank_transfer';
  paymentDate: string;
  notes: string;
}

// Payment item for UI (transformed from PaymentResponse)
export interface PaymentItem {
  id: number;
  invoiceId: string;
  type: 'income' | 'expense'; // Thu (học phí) hoặc Chi (lương)
  studentId?: string; // For fetching student detail
  teacherId?: string; // For fetching teacher detail
  studentName?: string; // For income
  teacherName?: string; // For expense
  studentGender?: string; // For income
  teacherGender?: string; // For expense
  className?: string;
  period?: string; // Kỳ thanh toán (VD: "Tháng 12/2024", "Học kỳ 1/2024")
  totalAmount: number; // Tổng số tiền cần thanh toán
  paidAmount: number; // Số tiền đã thanh toán (có thể thanh toán nhiều lần)
  createdDate: string; // ISO datetime string
  paymentMethod: 'cash' | 'bank_transfer' | 'credit_card' | 'e_wallet';
  status: 'paid' | 'partial'; // paid: đã đủ, partial: chưa đủ
  note?: string;
}

