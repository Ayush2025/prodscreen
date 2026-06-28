import axios from "axios";
import { env } from "../config/env.js";

const computeTrend = (records) => {
  const normalized = records.map((record) => ({
    date: record.date,
    target: record.totals.target,
    actual: record.totals.actual,
    gap: record.totals.gap
  }));
  return normalized.sort((a, b) => a.date.localeCompare(b.date));
};

export const buildSummary = (records) => {
  const totalTarget = records.reduce((acc, rec) => acc + rec.totals.target, 0);
  const totalActual = records.reduce((acc, rec) => acc + rec.totals.actual, 0);
  const totalGap = totalActual - totalTarget;
  const attainmentPct = totalTarget === 0 ? 0 : Number(((totalActual / totalTarget) * 100).toFixed(2));

  return {
    totalTarget,
    totalActual,
    totalGap,
    attainmentPct,
    trend: computeTrend(records)
  };
};

export const generateClaudeInsights = async (payload) => {
  if (!env.CLAUDE_API_KEY) {
    return {
      provider: "claude",
      status: "skipped",
      insight: "Claude API key is not configured. Add CLAUDE_API_KEY to enable AI analysis."
    };
  }

  const prompt = `Analyze the production KPI data and return concise operational insights:\n${JSON.stringify(payload)}`;

  const response = await axios.post(
    "https://api.anthropic.com/v1/messages",
    {
      model: "claude-sonnet-4-20250514",
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }]
    },
    {
      headers: {
        "x-api-key": env.CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      timeout: 20000
    }
  );

  const output = response.data?.content?.[0]?.text ?? "No insight returned";
  return {
    provider: "claude",
    status: "ok",
    insight: output
  };
};
