import { Navigate, Route, Routes } from "react-router-dom";

function App() {
  const Placeholder = ({ route }) => <main>{route} — Not yet implemented</main>;

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Placeholder route="/login" />} />
      <Route path="/dashboard" element={<Placeholder route="/dashboard" />} />
      <Route path="/process/:processId" element={<Placeholder route="/process/:processId" />} />
      <Route path="/admin/factories" element={<Placeholder route="/admin/factories" />} />
      <Route path="/admin/table-gallery" element={<Placeholder route="/admin/table-gallery" />} />
      <Route path="/admin/shift-config" element={<Placeholder route="/admin/shift-config" />} />
      <Route path="/admin/users" element={<Placeholder route="/admin/users" />} />
    </Routes>
  );
}

export default App;
