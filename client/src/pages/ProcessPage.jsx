import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import { api } from "../api/client";
import { useFactories } from "../hooks/useFactories";

export const ProcessPage = () => {
  const { processId } = useParams();
  const { factories, selectedFactoryId, setSelectedFactoryId } = useFactories();
  const [config, setConfig] = useState(null);
  const [selectedProcessId, setSelectedProcessId] = useState("");
  const [shiftName, setShiftName] = useState("");
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [entries, setEntries] = useState([]);
  const [columns, setColumns] = useState([]);
  const [defectCodes, setDefectCodes] = useState([]);
  const [error, setError] = useState("");

  const activeProcessId = useMemo(() => {
    if (selectedProcessId) return selectedProcessId;
    if (processId !== "default") return processId;
    return config?.processes?.[0]?._id || "";
  }, [processId, config, selectedProcessId]);

  useEffect(() => {
    const load = async () => {
      if (!selectedFactoryId) return;
      const [cfg, codes] = await Promise.all([
        api.get(`/factories/${selectedFactoryId}/config`),
        api.get(`/defect-codes?factoryId=${selectedFactoryId}`)
      ]);
      setConfig(cfg.data.config);
      setDefectCodes(codes.data.codes);
      if (cfg.data.config?.shifts?.length > 0 && !shiftName) {
        setShiftName(cfg.data.config.shifts[0].shiftName);
      }
    };
    load();
  }, [selectedFactoryId, shiftName]);

  const loadEntries = async () => {
    if (!selectedFactoryId || !activeProcessId || !shiftName) return;
    const { data } = await api.get(
      `/factories/${selectedFactoryId}/entries?processId=${activeProcessId}&date=${date}&shiftName=${encodeURIComponent(shiftName)}`
    );
    setEntries(data.entries);
    setColumns(data.columns);
  };

  useEffect(() => {
    loadEntries();
  }, [selectedFactoryId, activeProcessId, date, shiftName]);

  const upsertEntry = async (entry, key, value) => {
    const nextValues = { ...(entry.values || {}), [key]: value };
    await api.post(`/factories/${selectedFactoryId}/entries`, {
      processId: activeProcessId,
      shiftName,
      date,
      hourBucket: entry.hourBucket,
      values: nextValues,
      source: "manual"
    });
    await loadEntries();
  };

  const addDefect = async (entryId, defectCodeId) => {
    if (!entryId || !defectCodeId) return;
    await api.post(`/entries/${entryId}/defects`, { defectCodeId, quantity: 1, countermeasure: "", recovery: "" });
  };

  const totals = entries.reduce(
    (acc, row) => {
      acc.target += Number(row.values?.target || 0);
      acc.actual += Number(row.values?.actual || 0);
      acc.gap += Number(row.values?.gap || 0);
      return acc;
    },
    { target: 0, actual: 0, gap: 0 }
  );

  if (!config) return <section><h2>Process entry</h2><p>Select a factory with cloned template/config.</p></section>;

  return (
    <section>
      <h2>Process entry</h2>
      <div className="inline-form wrap">
        <label>Factory</label>
        <select value={selectedFactoryId} onChange={(e) => setSelectedFactoryId(e.target.value)}>
          {factories.map((factory) => (
            <option key={factory._id} value={factory._id}>{factory.name}</option>
          ))}
        </select>
        <label>Process</label>
        <select value={activeProcessId} onChange={(e) => setSelectedProcessId(e.target.value)}>
          {config.processes.map((proc) => (
            <option key={proc._id} value={proc._id}>{proc.name}</option>
          ))}
        </select>
        <label>Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <label>Shift</label>
        <select value={shiftName} onChange={(e) => setShiftName(e.target.value)}>
          {config.shifts.map((shift) => (
            <option key={shift.shiftName} value={shift.shiftName}>{shift.shiftName}</option>
          ))}
        </select>
      </div>

      <div className="kpi-row">
        <div className="kpi">Target <span className="mono">{totals.target}</span></div>
        <div className="kpi">Actual <span className="mono">{totals.actual}</span></div>
        <div className="kpi">Gap <span className="mono">{totals.gap}</span></div>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Hour</th>
            {columns
              .sort((a, b) => a.order - b.order)
              .map((col) => (
                <th key={col._id || col.key}>{col.label}</th>
              ))}
            <th>Source</th>
            <th>Defect</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={`${entry.hourBucket.start}-${entry._id || "new"}`}>
              <td className="mono">{entry.hourBucket.start} - {entry.hourBucket.end}</td>
              {columns
                .sort((a, b) => a.order - b.order)
                .map((col) => (
                  <td key={`${entry.hourBucket.start}-${col.key}`}>
                    {col.dataType === "number" || col.dataType === "computed" ? (
                      <input
                        className="mono"
                        type="number"
                        value={entry.values?.[col.key] ?? 0}
                        onChange={(e) => {
                          const newVal = Number(e.target.value);
                          setEntries((prev) =>
                            prev.map((item) =>
                              item.hourBucket.start === entry.hourBucket.start
                                ? { ...item, values: { ...(item.values || {}), [col.key]: newVal } }
                                : item
                            )
                          );
                        }}
                        onBlur={(e) => upsertEntry(entry, col.key, Number(e.target.value))}
                        readOnly={col.dataType === "computed"}
                      />
                    ) : col.dataType === "dropdown" ? (
                      <select
                        value={entry.values?.[col.key] || ""}
                        onChange={(e) => upsertEntry(entry, col.key, e.target.value)}
                      >
                        <option value="">Select</option>
                        {(col.dropdownOptions || []).map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        value={entry.values?.[col.key] || ""}
                        onChange={(e) => {
                          const newVal = e.target.value;
                          setEntries((prev) =>
                            prev.map((item) =>
                              item.hourBucket.start === entry.hourBucket.start
                                ? { ...item, values: { ...(item.values || {}), [col.key]: newVal } }
                                : item
                            )
                          );
                        }}
                        onBlur={(e) => upsertEntry(entry, col.key, e.target.value)}
                      />
                    )}
                  </td>
                ))}
              <td>{entry.source === "hardware" ? "Hardware" : "Manual"}</td>
              <td>
                <select onChange={(e) => addDefect(entry._id, e.target.value)} defaultValue="">
                  <option value="">-</option>
                  {defectCodes.map((code) => (
                    <option key={code._id} value={code._id}>{code.code}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {error && <p className="error">{error}</p>}
    </section>
  );
};
