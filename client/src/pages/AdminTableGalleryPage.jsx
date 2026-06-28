import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useFactories } from "../hooks/useFactories";

export const AdminTableGalleryPage = () => {
  const { factories, selectedFactoryId, setSelectedFactoryId } = useFactories();
  const [templates, setTemplates] = useState([]);
  const [config, setConfig] = useState(null);
  const [newProcess, setNewProcess] = useState("");

  const loadTemplates = async () => {
    const { data } = await api.get("/templates/tables");
    setTemplates(data.templates);
  };

  const loadConfig = async (factoryId) => {
    if (!factoryId) return;
    const { data } = await api.get(`/factories/${factoryId}/config`);
    setConfig(data.config);
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    loadConfig(selectedFactoryId);
  }, [selectedFactoryId]);

  const cloneTemplate = async (templateId) => {
    await api.post(`/factories/${selectedFactoryId}/config/clone-template/${templateId}`);
    await loadConfig(selectedFactoryId);
  };

  const saveConfig = async (nextConfig) => {
    const payload = {
      columns: nextConfig.columns,
      processes: nextConfig.processes,
      shifts: nextConfig.shifts
    };
    const { data } = await api.patch(`/factories/${selectedFactoryId}/config`, payload);
    setConfig(data.config);
  };

  return (
    <section>
      <h2>Table gallery</h2>
      <div className="inline-form">
        <label>Factory</label>
        <select value={selectedFactoryId} onChange={(e) => setSelectedFactoryId(e.target.value)}>
          <option value="">Select factory</option>
          {factories.map((factory) => (
            <option key={factory._id} value={factory._id}>
              {factory.name}
            </option>
          ))}
        </select>
      </div>

      {!config && (
        <div className="cards">
          {templates.map((template) => (
            <article key={template._id} className="card">
              <h3>{template.name}</h3>
              <p>{template.description}</p>
              <div className="chips">
                {template.columns.map((col) => (
                  <span className="chip" key={`${template._id}-${col.key}`}>{col.label}</span>
                ))}
              </div>
              <button disabled={!selectedFactoryId} onClick={() => cloneTemplate(template._id)}>
                Use this template
              </button>
            </article>
          ))}
        </div>
      )}

      {config && (
        <>
          <h3>Factory-specific columns</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Key</th>
                <th>Label</th>
                <th>Type</th>
                <th>Width</th>
              </tr>
            </thead>
            <tbody>
              {config.columns
                .sort((a, b) => a.order - b.order)
                .map((col, idx) => (
                  <tr key={col._id || `${col.key}-${idx}`}>
                    <td className="mono">{col.order}</td>
                    <td className="mono">{col.key}</td>
                    <td>
                      <input
                        value={col.label}
                        onChange={(e) => {
                          const columns = [...config.columns];
                          columns[idx] = { ...columns[idx], label: e.target.value };
                          setConfig({ ...config, columns });
                        }}
                        onBlur={() => saveConfig(config)}
                      />
                    </td>
                    <td>{col.dataType}</td>
                    <td>
                      <input
                        className="mono"
                        type="number"
                        value={col.width}
                        onChange={(e) => {
                          const columns = [...config.columns];
                          columns[idx] = { ...columns[idx], width: Number(e.target.value) };
                          setConfig({ ...config, columns });
                        }}
                        onBlur={() => saveConfig(config)}
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          <h3>Processes</h3>
          <div className="inline-form">
            <input value={newProcess} onChange={(e) => setNewProcess(e.target.value)} placeholder="Process name" />
            <button
              onClick={() => {
                if (!newProcess) return;
                const processes = [
                  ...(config.processes || []),
                  { name: newProcess, order: (config.processes || []).length, isActive: true }
                ];
                const next = { ...config, processes };
                setConfig(next);
                setNewProcess("");
                saveConfig(next);
              }}
            >
              Add process
            </button>
          </div>
        </>
      )}
    </section>
  );
};
