import Groq from "groq-sdk";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

const groqClient = env.GROQ_API_KEY ? new Groq({ apiKey: env.GROQ_API_KEY }) : null;

const parseJson = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    throw new ApiError(502, "Malformed Groq JSON response");
  }
};

export const buildSummaryMetrics = ({ totals, byProcess, trend, defectsByCategory }) => {
  const totalTarget = totals?.target || 0;
  const totalActual = totals?.actual || 0;
  const totalGap = totals?.gap || 0;
  return {
    totalTarget,
    totalActual,
    totalGap,
    attainmentPct: totalTarget > 0 ? Number(((totalActual / totalTarget) * 100).toFixed(2)) : 0,
    byProcess,
    trend,
    defectsByCategory
  };
};

export const generateGroqInsights = async (summary) => {
  if (!groqClient) {
    throw new ApiError(400, "GROQ_API_KEY is not configured on server");
  }

  const completion = await groqClient.chat.completions.create({
    model: "llama-3.1-8b-instant",
    temperature: 0.1,
    messages: [
      {
        role: "system",
        content:
          "You are an operations analyst. Return strict JSON only with shape: {\"insights\": string[], \"chartSuggestions\": string[]}. Use only provided numbers."
      },
      {
        role: "user",
        content: `Analyze this production summary JSON and produce 3-5 concise factual insights:\n${JSON.stringify(summary)}`
      }
    ]
  });

  const text = completion.choices?.[0]?.message?.content || "{}";
  const parsed = parseJson(text);
  if (!Array.isArray(parsed.insights)) {
    throw new ApiError(502, "Groq response missing insights array");
  }
  return parsed;
};
