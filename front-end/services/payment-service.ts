import http from '@/lib/http';
import { ResponseType, PaymentRequest, PaymentResponse, CreateStudentPaymentData, CreateTeacherPaymentData, CreateSessionPaymentData, PageResponse } from '@/types';

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

// Helper function to convert CreateSessionPaymentData to PaymentRequest (new - session-based)
const convertToSessionPaymentRequest = (data: CreateSessionPaymentData, monthlyFee: number): PaymentRequest => {
  // Map payment method from FE format to BE format
  const paymentMethodMap: Record<'cash' | 'bank_transfer', 'CASH' | 'BANK_TRANSFER'> = {
    cash: 'CASH',
    bank_transfer: 'BANK_TRANSFER',
  };

  // Convert paymentDate to billingMonth (first day of the month in UTC)
  // paymentDate format: YYYY-MM-DD (e.g., "2025-01-15")
  const paymentDate = new Date(data.paymentDate);
  const year = paymentDate.getFullYear();
  const month = String(paymentDate.getMonth() + 1).padStart(2, '0');
  const billingMonth = `${year}-${month}-01T00:00:00.000Z`;

  return {
    amount: 0, // Will be calculated by backend (remaining amount)
    paid: data.amount, // The amount being paid now
    billingMonth, // Required by backend - use first day of payment month
    feeSnapshot: monthlyFee, // Total expected fee for the package (same as monthlyFee)
    paymentMethod: paymentMethodMap[data.paymentMethod] || 'BANK_TRANSFER',
    paymentType: 'STUDENT_FEE',
    direction: 'INCOME',
    studentId: data.studentId,
    note: data.notes || undefined,
    // Session-based fields
    packageNumber: data.packageNumber,
    sessionStartNumber: data.startSessionNumber,
    sessionEndNumber: data.endSessionNumber,
  };
};

// Helper function to convert CreateTeacherPaymentData to PaymentRequest
const convertToTeacherPaymentRequest = (data: CreateTeacherPaymentData): PaymentRequest => {
  // Convert month/year to billingMonth (first day of the month in UTC)
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
    paid: data.totalAmount, // Total amount to pay
    billingMonth,
    feeSnapshot: data.baseSalary, // Base salary
    bonus: data.bonus,
    deduction: data.deduction,
    paymentMethod: paymentMethodMap[data.paymentMethod] || 'BANK_TRANSFER',
    paymentType: 'TEACHER_SALARY',
    direction: 'EXPENSE',
    teacherId: data.teacherId,
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

  createSessionPayment: (data: CreateSessionPaymentData, monthlyFee: number) => {
    const paymentRequest = convertToSessionPaymentRequest(data, monthlyFee);
    return paymentService.createPayment(paymentRequest);
  },

  createTeacherPayment: (data: CreateTeacherPaymentData) => {
    const paymentRequest = convertToTeacherPaymentRequest(data);
    return paymentService.createPayment(paymentRequest);
  },
  
  getPaymentsByStudentId: (studentId: string) => {
    return http.get<ResponseType<PaymentResponse[], PaymentResponse[]>>(`/api/payment/student/${studentId}`);
  },

  getPaymentsByTeacherId: (teacherId: string) => {
    return http.get<ResponseType<PaymentResponse[], PaymentResponse[]>>(`/api/payment/teacher/${teacherId}`);
  },

  getAllPayments: () => {
    // Note: Backend now returns PageResponse, but this method kept for backward compatibility
    // If you need paginated data, use getPaymentsPaginated instead
    return http.get<ResponseType<PageResponse<PaymentResponse>, PageResponse<PaymentResponse>>>('/api/payment?page=0&size=10');
  },

  /**
   * Get payments with pagination and filtering - OPTIMIZED
   * @param page Page number (0-based)
   * @param size Number of items per page
   * @param search Search term for paymentId, student/teacher/class name
   * @param filters Object containing optional filters
   * @returns PageResponse with payments and pagination metadata
   */
  getPaymentsPaginated: async (
    page: number,
    size: number,
    search: string,
    filters: {
      direction?: 'INCOME' | 'EXPENSE';
      paymentType?: 'STUDENT_FEE' | 'TEACHER_SALARY' | 'REFUND';
      paymentStatus?: 'COMPLETED' | 'INCOMPLETE' | 'CANCELLED';
      paymentMethod?: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'E_WALLET';
      startDate?: string;
      endDate?: string;
    } = {},
  ) => {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('size', String(size));
    if (search) params.append('search', search);
    if (filters.direction) params.append('direction', filters.direction);
    if (filters.paymentType) params.append('paymentType', filters.paymentType);
    if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
    if (filters.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    return await http.get<ResponseType<PageResponse<PaymentResponse>, PageResponse<PaymentResponse>>>(
      `/api/payment?${params.toString()}`,
    );
  },

  /**
   * Download invoice PDF
   * @param paymentId - Payment ID or paymentId
   * @returns Promise<Blob> - PDF file as blob
   */
  downloadInvoice: async (paymentId: string): Promise<Blob> => {
    const { API_URL } = await import('@/constants/env');
    const token = localStorage.getItem('accessToken') || localStorage.getItem('access_token') || '';
    const url = `${API_URL}/api/payment/${paymentId}/invoice`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to download invoice: ${response.status} - ${errorText}`);
    }
    
    const blob = await response.blob();
    
    // Validate PDF
    if (!blob.type.includes('pdf') && blob.size === 0) {
      throw new Error('Invalid or empty PDF file');
    }
    
    return blob;
  },

  /**
   * Download invoice PDF and automatically save to disk
   * @param paymentId - Payment ID or paymentId
   * @param fileName - Optional custom file name (default: invoice_{paymentId}.pdf)
   * @returns Promise<void>
   */
  downloadInvoiceAndSave: async (paymentId: string, fileName?: string): Promise<void> => {
    try {
      const blob = await paymentService.downloadInvoice(paymentId);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName || `invoice_${paymentId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      throw error;
    }
  },
};

