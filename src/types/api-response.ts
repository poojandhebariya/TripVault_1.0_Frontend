export interface ApiResponse<T> {
  message: string;
  success: boolean;
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  totalPages: number;
  total: number;
}
