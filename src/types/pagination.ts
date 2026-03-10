export interface Pagination {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}
