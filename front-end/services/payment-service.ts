import http from '@/lib/http';
import { ResponseType, PaymentRequest, PaymentResponse, CreateStudentPaymentData } from '@/types';

// Helper function to convert CreateStudentPaymentData to PaymentRequest
const convertToPaymentRequest = (data: CreateStudentPaymentData, monthlyFee: number): PaymentRequest => {
  // Convert month/year to billingMonth (first day of the month in UTC)
  // Format: YYYY-MM-DDTHH:mm:ss.sssZ (always UTC, e.g., 2025-10-01T00:00:00.000Z)
  const year = data.year;
  const month = String(data.month).padStart(2, '0');
  const billingMonth = `${year}-${month}-01T00:00:00.000Z`;
  
  // Map payment method from FE format to BE format
  const paymentMethodMap: Record<'cash' | 'bank_transfer', 'CASH' | 'BANK_TRANSFER'> = {
    cash: 'CASH',
    bank_transfer: 'BANK_TRANSFER',
  };

  return {
    amount: 0, // Will be calculated by backend (remaining amount)
    paid: data.amount, // The amount being paid now
    billingMonth,
    feeSnapshot: monthlyFee, // Total expected fee for the month
    paymentMethod: paymentMethodMap[data.paymentMethod] || 'BANK_TRANSFER',
    paymentType: 'STUDENT_FEE',
    direction: 'INCOME',
    studentId: data.studentId,
    note: data.notes || undefined,
  };
};

export const paymentService = {
  createPayment: (paymentRequest: PaymentRequest) => {
    return http.post<ResponseType<PaymentResponse, PaymentResponse>>('/api/payment/create', paymentRequest);
  },
  
  createStudentPayment: (data: CreateStudentPaymentData, monthlyFee: number) => {
    const paymentRequest = convertToPaymentRequest(data, monthlyFee);
    return paymentService.createPayment(paymentRequest);
  },
  
  getPaymentsByStudentId: (studentId: string) => {
    return http.get<ResponseType<PaymentResponse[], PaymentResponse[]>>(`/api/payment/student/${studentId}`);
  },

  getAllPayments: () => {
    return http.get<ResponseType<PaymentResponse[], PaymentResponse[]>>('/api/payment');
  },
};

