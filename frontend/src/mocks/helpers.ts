import type { ApiResponse, PaginatedData } from "@/types/common";

const mockDelayMs = 350;

export function shouldFailMock(operation: string) {
  if (process.env.NODE_ENV !== "development") {
    return false;
  }

  return process.env.NEXT_PUBLIC_MOCK_API_FAIL === operation;
}

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), mockDelayMs);
  });
}

export function mockResponse<T>(message: string, data: T): Promise<ApiResponse<T>> {
  return delay({
    success: true,
    message,
    data,
  });
}

export function mockPaginatedResponse<T>(
  message: string,
  items: T[],
): Promise<ApiResponse<PaginatedData<T>>> {
  return mockResponse(message, {
    items,
    pagination: {
      page: 1,
      limit: items.length,
      total: items.length,
      total_pages: 1,
    },
  });
}
