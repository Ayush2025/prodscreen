import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProcessPage } from "./pages/ProcessPage";
import { AdminFactoriesPage } from "./pages/AdminFactoriesPage";
import { AdminTableGalleryPage } from "./pages/AdminTableGalleryPage";
import { AdminShiftConfigPage } from "./pages/AdminShiftConfigPage";
import { AdminUsersPage } from "./pages/AdminUsersPage";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/process/:processId" element={<ProcessPage />} />
            <Route path="/admin/factories" element={<AdminFactoriesPage />} />
            <Route path="/admin/table-gallery" element={<AdminTableGalleryPage />} />
            <Route path="/admin/shift-config" element={<AdminShiftConfigPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
