import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { api } from "../api/client";

export const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [insight, setInsight] = useState("");

  useEffect(() => {
    const load = async () => {
      const [{ data: sum }, { data: ai }] = await Promise.all([
        api.get("/analytics/summary"),
        api.get("/analytics/insights")
      ]);
      setSummary(sum.summary);
      setInsight(ai.insights?.insight || "");
    };
    load();
  }, []);

  if (!summary) return <p>Loading dashboard...</p>;

  return (
    <div className="grid">
      <section className="card">
        <h3>Plant summary</h3>
        <p>Target: {summary.totalTarget}</p>
        <p>Actual: {summary.totalActual}</p>
        <p>Gap: {summary.totalGap}</p>
        <p>Attainment: {summary.attainmentPct}%</p>
      </section>
      <section className="card wide">
        <h3>Trend</h3>
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <LineChart data={summary.trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="target" stroke="#1d4ed8" />
              <Line type="monotone" dataKey="actual" stroke="#059669" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="card wide">
        <h3>AI insights (Claude)</h3>
        <p>{insight}</p>
      </section>
    </div>
  );
};
