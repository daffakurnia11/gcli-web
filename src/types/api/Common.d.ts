declare global {
  type ApiPaginationMeta = {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
  };

  type ApiStandardMetadata = {
    page: number;
    limit: number;
    count: number;
    total: number;
  };

  type ApiStandardSuccessResponse<T> = {
    success: true;
    code: number;
    message: string;
    metadata?: ApiStandardMetadata;
    data: T;
  };

  type ApiStandardErrorResponse = {
    success: false;
    code: number;
    message: string;
    data?: unknown;
  };

  type ApiStandardResponse<T> =
    | ApiStandardSuccessResponse<T>
    | ApiStandardErrorResponse;
}

export {};
