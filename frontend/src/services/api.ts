import axios from "axios";

import { env } from "@/lib/env";

export const api = axios.create({
  baseURL: env.api_url,
  headers: {
    "Content-Type": "application/json",
  },
});
