import { ClassType } from "./class-type";

export interface TeacherRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  idCard: string;
  dob: string;
  avatar: string;
  gender: string;
}

export interface TeacherType {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  idCard: string;
  dob: string;
  avatar: string;
  gender: string;
  classList: ClassType[];
  createdAt: string;
  updatedAt: string;
}

export interface SalaryPayment {
  id: string;
  invoiceId: string;
  paymentDate: string;
  period: string;
  baseSalary: number;
  bonus: number;
  deduction: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'bank_transfer';
  status: 'paid' | 'partial';
  notes?: string;
}

export interface SalaryMonthStatus {
  month: number; // 1-12
  year: number;
  status: 'paid' | 'unpaid' | 'partial';
  baseSalary?: number;
  bonus?: number;
  deduction?: number;
  totalAmount?: number;
  paidAmount?: number;
}