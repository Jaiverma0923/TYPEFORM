import axios from "axios";

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | {
          message?: string;
          errors?: Array<{ field?: string; message: string }>;
        }
      | undefined;

    if (data?.errors?.length) {
      return data.errors.map((e) => e.message).join("\n");
    }

    if (data?.message) {
      return data.message;
    }

    return error.message;
  }

  return error instanceof Error
    ? error.message
    : "Something went wrong.";
}