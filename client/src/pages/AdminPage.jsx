import { useEffect, useState } from "react";
import { api } from "../api/client";

const baseColumns = [
  { key: "timeRange", label: "Hour Slot", type: "time-range", required: true },
  { key: "target", label: "Target", type: "numeric", required: true },
  { key: "actual", label: "Actual", type: "numeric", required: true },
  { key: "gap", label: "Gap", type: "numeric", required: false },
  { key: "comments", label: "Comments", type: "text", required: false }
];

export const AdminPage = () => {
  const [processName, setProcessName] = useState("");
  const [processes, setProcesses] = useState([]);
  const [users, setUsers] = useState([]);
  const [shiftConfig, setShiftConfig] = useState({
    shifts: [
      { name: "Shift 1", start: "07:00", end: "15:00", lunch: { name: "Lunch", start: "12:00", end: "12:30" }, breaks: [] }
    ]
  });
  const [notice, setNotice] = useState("");

  const refresh = async () => {
    const [p, u, s] = await Promise.all([
      api.get("/admin/processes"),
      api.get("/admin/users"),
      api.get("/admin/shift-config")
    ]);
    setProcesses(p.data.processes);
    setUsers(u.data.users);
    if (s.data.shiftConfig) setShiftConfig(s.data.shiftConfig);
  };

  useEffect(() => {
    refresh();
  }, []);

  const saveAll = async () => {
    await Promise.all([
      api.put("/admin/shift-config", shiftConfig),
      api.put("/admin/templates", { name: "default-production-template", columns: baseColumns })
    ]);
    setNotice("Shift config and template saved");
  };

  return (
    <div className="grid">
      <section className="card">
        <h3>Add process</h3>
        <div className="inline">
          <input value={processName} onChange={(e) => setProcessName(e.target.value)} placeholder="Process name" />
          <button
            onClick={async () => {
              await api.post("/admin/processes", { name: processName, description: "" });
              setProcessName("");
              await refresh();
            }}
          >
            Add
          </button>
        </div>
        <ul>
          {processes.map((process) => (
            <li key={process._id}>{process.name}</li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h3>Shift configuration</h3>
        {shiftConfig.shifts.map((shift, idx) => (
          <div className="inline" key={idx}>
            <input value={shift.name} onChange={(e) => {
              const shifts = [...shiftConfig.shifts];
              shifts[idx].name = e.target.value;
              setShiftConfig({ ...shiftConfig, shifts });
            }} />
            <input value={shift.start} onChange={(e) => {
              const shifts = [...shiftConfig.shifts];
              shifts[idx].start = e.target.value;
              setShiftConfig({ ...shiftConfig, shifts });
            }} />
            <input value={shift.end} onChange={(e) => {
              const shifts = [...shiftConfig.shifts];
              shifts[idx].end = e.target.value;
              setShiftConfig({ ...shiftConfig, shifts });
            }} />
          </div>
        ))}
        <button
          className="ghost"
          onClick={() =>
            setShiftConfig({
              ...shiftConfig,
              shifts: [...shiftConfig.shifts, { name: `Shift ${shiftConfig.shifts.length + 1}`, start: "15:00", end: "23:00", breaks: [] }]
            })
          }
        >
          Add shift
        </button>
      </section>

      <section className="card wide">
        <h3>User management</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <select
                    defaultValue={user.role}
                    onChange={async (e) => {
                      await api.patch(`/admin/users/${user._id}/role`, { role: e.target.value });
                      await refresh();
                    }}
                  >
                    <option value="admin">admin</option>
                    <option value="supervisor">supervisor</option>
                    <option value="operator">operator</option>
                    <option value="viewer">viewer</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <button onClick={saveAll}>Save admin setup</button>
      {notice && <p>{notice}</p>}
    </div>
  );
};
