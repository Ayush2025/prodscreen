import { useEffect, useState } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { api } from "../api/client";
import { useFactories } from "../hooks/useFactories";
import dayjs from "dayjs";

export const DashboardPage = () => {
  const { factories, selectedFactoryId, setSelectedFactoryId } = useFactories();
  const [summary, setSummary] = useState(null);
  const [insights, setInsights] = useState([]);
  const [aiError, setAiError] = useState("");
  const [from, setFrom] = useState(dayjs().subtract(7, "day").format("YYYY-MM-DD"));
  const [to, setTo] = useState(dayjs().format("YYYY-MM-DD"));

  const load = async () => {
    if (!selectedFactoryId) return;
    const { data } = await api.post("/analytics/query", {
      factoryId: selectedFactoryId,
      dateRange: { from, to },
      processIds: []
    });
    setSummary(data.summary);
    setInsights(data.insights?.insights || []);
    setAiError(data.aiError || "");
  };

  useEffect(() => {
    load();
  }, [selectedFactoryId, from, to]);

  if (!summary) return <p>Loading dashboard...</p>;

  return (
    <div>
      <div className="inline-form wrap">
        <label>Factory</label>
        <select value={selectedFactoryId} onChange={(e) => setSelectedFactoryId(e.target.value)}>
          {factories.map((factory) => (
            <option key={factory._id} value={factory._id}>{factory.name}</option>
          ))}
        </select>
        <label>From</label>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <label>To</label>
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>

      <div className="kpi-row">
        <div className="kpi">Total target <span className="mono">{summary.totalTarget}</span></div>
        <div className="kpi">Total actual <span className="mono">{summary.totalActual}</span></div>
        <div className="kpi">Total gap <span className="mono">{summary.totalGap}</span></div>
        <div className="kpi">Attainment <span className="mono">{summary.attainmentPct}%</span></div>
      </div>

      <section className="chart-card">
        <h3>Target vs actual by process</h3>
        <div style={{ width: "100%", height: 240 }}>
          <ResponsiveContainer>
            <BarChart data={summary.byProcess || []}>
              <CartesianGrid strokeDasharray="2 2" />
              <XAxis dataKey="processId" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="target" fill="#2C6E8C" />
              <Bar dataKey="actual" fill="#1B2A4A" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="chart-card">
        <h3>Gap trend</h3>
        <div style={{ width: "100%", height: 240 }}>
          <ResponsiveContainer>
            <LineChart data={summary.trend}>
              <CartesianGrid strokeDasharray="2 2" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="gap" stroke="#A23B3B" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="chart-card">
        <h3>Defects by category</h3>
        <div style={{ width: "100%", height: 240 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={summary.defectsByCategory || []}
                dataKey="quantity"
                nameKey="category"
                outerRadius={80}
              >
                {(summary.defectsByCategory || []).map((_, index) => (
                  <Cell key={index} fill={["#A23B3B", "#C77D26", "#3B7A57", "#2C6E8C", "#1B2A4A"][index % 5]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="chart-card">
        <h3>Insights <span className="muted">AI-generated</span></h3>
        {aiError && <p className="muted">{aiError}</p>}
        <ul>
          {insights.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
};
