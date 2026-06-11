export interface PagedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export const pageResponseMapper = <T>(payload: {
  data: T[];
  page: number;
  limit: number;
  total: number;
}): PagedResponse<T> => ({
  data: payload.data,
  pagination: {
    page: payload.page,
    limit: payload.limit,
    total: payload.total,
    totalPages: Math.ceil(payload.total / payload.limit),
    hasNextPage: payload.page * payload.limit < payload.total,
    hasPreviousPage: payload.page > 1,
  },
});


export interface ZodErrorResponse {
  error: 'ValidationError';
  issues: {
    path: string;
    message: string;
  }[];
}

export interface ApiErrorResponse {
  error: string;
  message: string;
}

export * from './constants';
