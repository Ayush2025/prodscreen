import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useFactories } from "../hooks/useFactories";

const blankShift = (index) => ({
  shiftName: `Shift ${index + 1}`,
  startTime: "07:00",
  endTime: "15:00",
  lunch: { start: "12:00", duration_min: 30 },
  breaks: []
});

export const AdminShiftConfigPage = () => {
  const { factories, selectedFactoryId, setSelectedFactoryId } = useFactories();
  const [config, setConfig] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!selectedFactoryId) return;
      const { data } = await api.get(`/factories/${selectedFactoryId}/config`);
      setConfig(data.config);
    };
    load();
  }, [selectedFactoryId]);

  const save = async (nextConfig) => {
    setError("");
    try {
      const { data } = await api.patch(`/factories/${selectedFactoryId}/config`, { shifts: nextConfig.shifts });
      setConfig(data.config);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save shifts");
    }
  };

  if (!config) {
    return <section><h2>Shift configuration</h2><p>Select a factory with an existing cloned config.</p></section>;
  }

  return (
    <section>
      <h2>Shift configuration</h2>
      <div className="inline-form">
        <label>Factory</label>
        <select value={selectedFactoryId} onChange={(e) => setSelectedFactoryId(e.target.value)}>
          {factories.map((factory) => (
            <option key={factory._id} value={factory._id}>{factory.name}</option>
          ))}
        </select>
      </div>

      {config.shifts.map((shift, idx) => (
        <div className="card" key={`${shift.shiftName}-${idx}`}>
          <h3>{shift.shiftName}</h3>
          <div className="inline-form">
            <label>Start</label>
            <input
              value={shift.startTime}
              onChange={(e) => {
                const shifts = [...config.shifts];
                shifts[idx] = { ...shift, startTime: e.target.value };
                setConfig({ ...config, shifts });
              }}
              onBlur={() => save(config)}
            />
            <label>End</label>
            <input
              value={shift.endTime}
              onChange={(e) => {
                const shifts = [...config.shifts];
                shifts[idx] = { ...shift, endTime: e.target.value };
                setConfig({ ...config, shifts });
              }}
              onBlur={() => save(config)}
            />
            <label>Lunch start</label>
            <input
              value={shift.lunch?.start || ""}
              onChange={(e) => {
                const shifts = [...config.shifts];
                shifts[idx] = { ...shift, lunch: { ...(shift.lunch || {}), start: e.target.value } };
                setConfig({ ...config, shifts });
              }}
              onBlur={() => save(config)}
            />
            <label>Lunch min</label>
            <input
              type="number"
              className="mono"
              value={shift.lunch?.duration_min || 0}
              onChange={(e) => {
                const shifts = [...config.shifts];
                shifts[idx] = {
                  ...shift,
                  lunch: { ...(shift.lunch || {}), duration_min: Number(e.target.value) }
                };
                setConfig({ ...config, shifts });
              }}
              onBlur={() => save(config)}
            />
          </div>
        </div>
      ))}

      <button
        disabled={config.shifts.length >= 3}
        onClick={() => {
          const next = { ...config, shifts: [...config.shifts, blankShift(config.shifts.length)] };
          setConfig(next);
          save(next);
        }}
      >
        Add shift
      </button>
      {error && <p className="error">{error}</p>}
    </section>
  );
};
