import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useFactories } from "../hooks/useFactories";

export const AdminUsersPage = () => {
  const { factories } = useFactories();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "operator",
    factoryIds: []
  });
  const [error, setError] = useState("");

  const load = async () => {
    const { data } = await api.get("/users");
    setUsers(data.users);
  };

  useEffect(() => {
    load();
  }, []);

  const createUser = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/users", form);
      setForm({ name: "", email: "", password: "", role: "operator", factoryIds: [] });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user");
    }
  };

  return (
    <section>
      <h2>User management</h2>
      <form className="inline-form wrap" onSubmit={createUser}>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="super_admin">super_admin</option>
          <option value="factory_admin">factory_admin</option>
          <option value="supervisor">supervisor</option>
          <option value="operator">operator</option>
        </select>
        <select
          multiple
          value={form.factoryIds}
          onChange={(e) =>
            setForm({
              ...form,
              factoryIds: Array.from(e.target.selectedOptions).map((opt) => opt.value)
            })
          }
        >
          {factories.map((factory) => (
            <option key={factory._id} value={factory._id}>
              {factory.name}
            </option>
          ))}
        </select>
        <button type="submit">Create user</button>
      </form>
      {error && <p className="error">{error}</p>}

      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Factories</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id || user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td className="mono">{(user.factoryIds || []).join(", ") || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};
