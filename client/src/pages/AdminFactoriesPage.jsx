import { useEffect, useState } from "react";
import { api } from "../api/client";

export const AdminFactoriesPage = () => {
  const [factories, setFactories] = useState([]);
  const [form, setForm] = useState({ name: "", code: "", timezone: "UTC" });
  const [error, setError] = useState("");

  const load = async () => {
    const { data } = await api.get("/factories");
    setFactories(data.factories);
  };

  useEffect(() => {
    load();
  }, []);

  const createFactory = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/factories", form);
      setForm({ name: "", code: "", timezone: "UTC" });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create factory");
    }
  };

  return (
    <section>
      <h2>Factories</h2>
      <form className="inline-form" onSubmit={createFactory}>
        <input
          placeholder="Factory name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          placeholder="Code"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
          required
        />
        <input
          placeholder="Timezone"
          value={form.timezone}
          onChange={(e) => setForm({ ...form, timezone: e.target.value })}
          required
        />
        <button type="submit">Create factory</button>
      </form>
      {error && <p className="error">{error}</p>}

      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Code</th>
            <th>Timezone</th>
            <th>Active</th>
          </tr>
        </thead>
        <tbody>
          {factories.map((factory) => (
            <tr key={factory._id}>
              <td>{factory.name}</td>
              <td className="mono">{factory.code}</td>
              <td>{factory.timezone}</td>
              <td>{factory.isActive ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};
