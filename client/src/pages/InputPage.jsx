import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { api } from "../api/client";

const defaultRows = [
  { timeRange: "07:00 to 08:00", target: 100, actual: 0, qualityDefects: 0, scrap: 0, comments: "" },
  { timeRange: "08:00 to 09:00", target: 100, actual: 0, qualityDefects: 0, scrap: 0, comments: "" },
  { timeRange: "09:00 to 10:00", target: 100, actual: 0, qualityDefects: 0, scrap: 0, comments: "" }
];

export const InputPage = () => {
  const [processes, setProcesses] = useState([]);
  const [shiftConfig, setShiftConfig] = useState(null);
  const [form, setForm] = useState({
    processId: "",
    date: dayjs().format("YYYY-MM-DD"),
    shiftName: "",
    rows: defaultRows
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      const [p, s] = await Promise.all([api.get("/admin/processes"), api.get("/admin/shift-config")]);
      setProcesses(p.data.processes);
      setShiftConfig(s.data.shiftConfig);
      setForm((prev) => ({
        ...prev,
        processId: p.data.processes[0]?._id || "",
        shiftName: s.data.shiftConfig?.shifts?.[0]?.name || ""
      }));
    };
    load();
  }, []);

  const totals = useMemo(() => {
    const target = form.rows.reduce((acc, row) => acc + Number(row.target || 0), 0);
    const actual = form.rows.reduce((acc, row) => acc + Number(row.actual || 0), 0);
    return { target, actual, gap: actual - target };
  }, [form.rows]);

  const save = async () => {
    const payload = {
      ...form,
      rows: form.rows.map((row) => ({ ...row, gap: Number(row.actual || 0) - Number(row.target || 0) }))
    };
    const { data } = await api.put("/production/records", payload);
    setMessage(`Saved. KPI+ sync status: ${data.sync.status}`);
  };

  return (
    <section className="card wide">
      <h2>Production input</h2>
      <div className="inline">
        <select value={form.processId} onChange={(e) => setForm({ ...form, processId: e.target.value })}>
          {processes.map((process) => (
            <option value={process._id} key={process._id}>
              {process.name}
            </option>
          ))}
        </select>
        <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        <select value={form.shiftName} onChange={(e) => setForm({ ...form, shiftName: e.target.value })}>
          {(shiftConfig?.shifts || []).map((shift) => (
            <option value={shift.name} key={shift.name}>
              {shift.name}
            </option>
          ))}
        </select>
      </div>
      <table>
        <thead>
          <tr>
            <th>Hour</th>
            <th>Target</th>
            <th>Actual</th>
            <th>Gap</th>
            <th>Defects</th>
            <th>Scrap</th>
            <th>Comments</th>
          </tr>
        </thead>
        <tbody>
          {form.rows.map((row, idx) => (
            <tr key={row.timeRange}>
              <td>{row.timeRange}</td>
              <td><input type="number" value={row.target} onChange={(e) => {
                const rows = [...form.rows];
                rows[idx].target = Number(e.target.value);
                setForm({ ...form, rows });
              }} /></td>
              <td><input type="number" value={row.actual} onChange={(e) => {
                const rows = [...form.rows];
                rows[idx].actual = Number(e.target.value);
                setForm({ ...form, rows });
              }} /></td>
              <td>{Number(row.actual || 0) - Number(row.target || 0)}</td>
              <td><input type="number" value={row.qualityDefects} onChange={(e) => {
                const rows = [...form.rows];
                rows[idx].qualityDefects = Number(e.target.value);
                setForm({ ...form, rows });
              }} /></td>
              <td><input type="number" value={row.scrap} onChange={(e) => {
                const rows = [...form.rows];
                rows[idx].scrap = Number(e.target.value);
                setForm({ ...form, rows });
              }} /></td>
              <td><input value={row.comments} onChange={(e) => {
                const rows = [...form.rows];
                rows[idx].comments = e.target.value;
                setForm({ ...form, rows });
              }} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>Shift Total - Target: {totals.target}, Actual: {totals.actual}, Gap: {totals.gap}</p>
      <button onClick={save}>Save record</button>
      {message && <p>{message}</p>}
    </section>
  );
};
