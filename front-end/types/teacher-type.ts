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
  status: 'ACTIVE' | 'DELETED' | 'BLOCKED';
  classList: ClassType[];
  createdAt: string;
  updatedAt: string;
}

// Filter state for teacher management page
export interface TeacherFilterState {
  searchQuery: string;
  gender: 'all' | 'male' | 'female' | 'other';
  status: 'all' | 'active' | 'deleted' | 'blocked';
  sortBy: 'name' | 'joinedDate' | 'totalClasses';
  sortOrder: 'asc' | 'desc';
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