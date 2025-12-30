// Generic D cho phép override toàn bộ data type khi cần
// Mặc định D sẽ là { result: T } để giữ backward compatibility
// Nhưng có thể override D thành bất kỳ type nào (ví dụ: { accessToken: string, user: UserType })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ResponseType<T = any, D = { result: T }> {
  status: number;
  error: null;
  message: string;
  data: D | null;
}

// Helper type để tạo response type với các trường bổ sung
export type ResponseTypeWithExtraFields<T, ExtraFields extends Record<string, unknown> = Record<string, never>
> = ResponseType<T, { result: T } & ExtraFields>;

// Type riêng cho pagination response với totalItems và totalPages
export type PaginationResponseType<T> = ResponseType<T, { result: T; totalItems: number; totalPages: number }>;