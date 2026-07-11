export const env = {
  api_url: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1",
  use_mock_api: process.env.NEXT_PUBLIC_USE_MOCK_API === "true",
};
