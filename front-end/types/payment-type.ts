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
  paymentMethod: PaymentMethod;
  paymentType: PaymentType;
  direction: PaymentDirection;
  studentId?: string;
  teacherId?: string;
  classId?: string;
  note?: string;
}

// Payment response (from backend)
export interface PaymentResponse {
  id: string;
  paymentId: string;
  amount: number;
  feeSnapshot: number;
  paid: number;
  billingMonth: string; // ISO date string
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentType: PaymentType;
  direction: PaymentDirection;
  studentId?: string;
  teacherId?: string;
  classId?: string;
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

