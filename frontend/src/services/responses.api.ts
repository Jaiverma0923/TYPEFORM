import { env } from "@/lib/env";
import { responsesMockApi } from "@/mocks/responses.mock";
import type { ApiResponse } from "@/types/common";
import type { CsvExportResult, FormResponseDetail, FormResponsesData } from "@/types/response";

import { api } from "./api";

const responsesAxiosApi = {
  async getResponses(form_id: number): Promise<ApiResponse<FormResponsesData>> {
    const response = await api.get<ApiResponse<FormResponsesData>>(
      `/forms/${form_id}/responses`,
    );
    return response.data;
  },
  async getResponse(response_id: number): Promise<ApiResponse<FormResponseDetail>> {
    const response = await api.get<ApiResponse<FormResponseDetail>>(
      `/responses/${response_id}`,
    );
    return response.data;
  },
  async exportResponsesCsv(form_id: number): Promise<CsvExportResult> {
    const response = await api.get<Blob>(`/forms/${form_id}/responses/export`, {
      responseType: "blob",
    });
    const disposition = response.headers["content-disposition"];
    const fallbackFilename = `responses_${new Date().toISOString().slice(0, 10)}.csv`;
    const filenameMatch =
      typeof disposition === "string"
        ? /filename\*?=(?:UTF-8''|")?([^";]+)/i.exec(disposition)
        : null;

    return {
      blob: response.data,
      filename: filenameMatch?.[1] ? decodeURIComponent(filenameMatch[1]) : fallbackFilename,
    };
  },
};

const responsesApi = env.use_mock_api ? responsesMockApi : responsesAxiosApi;

export const { exportResponsesCsv, getResponses, getResponse } = responsesApi;

export function downloadCsvExport({ blob, filename }: CsvExportResult) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
