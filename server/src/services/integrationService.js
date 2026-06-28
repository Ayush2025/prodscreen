import axios from "axios";
import { env } from "../config/env.js";

export const pushToKpiPlus = async (record) => {
  if (!env.KPI_PLUS_BASE_URL || !env.KPI_PLUS_API_KEY) {
    return {
      status: "skipped",
      message: "KPI+ integration is not configured."
    };
  }

  await axios.post(
    `${env.KPI_PLUS_BASE_URL}/production-records`,
    record,
    {
      headers: {
        Authorization: `Bearer ${env.KPI_PLUS_API_KEY}`
      },
      timeout: 15000
    }
  );

  return {
    status: "ok",
    message: "Record synced to KPI+"
  };
};
